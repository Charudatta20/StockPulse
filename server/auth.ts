import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { z } from 'zod';

// Validation schemas
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  authMethod: z.enum(['email', 'google', 'github']).default('email')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  authMethod: z.enum(['email', 'google', 'github']).default('email')
});

export const socialAuthSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  authMethod: z.enum(['google', 'github']),
  socialId: z.string(),
  profileImageUrl: z.string().optional()
});

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT token generation
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

// Authentication functions
export async function signupUser(data: z.infer<typeof signupSchema>) {
  const { email, password, firstName, lastName, authMethod } = data;

  // Check if user already exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password if using email auth
  const hashedPassword = authMethod === 'email' ? await hashPassword(password) : null;

  // Create user
  const user = await storage.upsertUser({
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    firstName,
    lastName,
    authMethod,
    hashedPassword,
    socialId: authMethod !== 'email' ? `social_${authMethod}_${Date.now()}` : null
  });

  // Generate token
  const token = generateToken(user.id);

  return { user, token };
}

export async function loginUser(data: z.infer<typeof loginSchema>) {
  const { email, password, authMethod } = data;

  // Find user
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password for email auth
  if (authMethod === 'email') {
    if (!user.hashedPassword) {
      throw new Error('Invalid email or password');
    }
    
    const isValidPassword = await comparePassword(password, user.hashedPassword);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
  }

  // Generate token
  const token = generateToken(user.id);

  return { user, token };
}

export async function socialAuth(data: z.infer<typeof socialAuthSchema>) {
  const { email, firstName, lastName, authMethod, socialId, profileImageUrl } = data;

  // Check if user exists
  let user = await storage.getUserByEmail(email);

  if (!user) {
    // Create new user for social auth
    user = await storage.upsertUser({
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      firstName,
      lastName,
      authMethod,
      socialId,
      profileImageUrl
    });
  } else {
    // Update existing user's social auth info
    user = await storage.upsertUser({
      ...user,
      authMethod,
      socialId,
      profileImageUrl
    });
  }

  // Generate token
  const token = generateToken(user.id);

  return { user, token };
}

// Middleware to verify JWT token
export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
} 