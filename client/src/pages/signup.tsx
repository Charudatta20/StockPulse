import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'github'>('email');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          authMethod: 'email'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Use the login function from useAuth
        login(data.user, data.token);
        
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        
        setLocation('/dashboard');
      } else {
        toast({
          title: "Error",
          description: data.message || "Signup failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      // For now, we'll simulate social auth
      // In a real app, you'd redirect to OAuth provider
      toast({
        title: "Coming Soon",
        description: `${provider} authentication will be available soon!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Social authentication failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join StockPulse to start trading and managing your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="github">GitHub</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="google" className="space-y-4">
              <Button 
                onClick={() => handleSocialAuth('google')} 
                className="w-full" 
                variant="outline"
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </TabsContent>
            
            <TabsContent value="github" className="space-y-4">
              <Button 
                onClick={() => handleSocialAuth('github')} 
                className="w-full" 
                variant="outline"
                disabled={isLoading}
              >
                <FaGithub className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold"
              onClick={() => setLocation('/login')}
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 