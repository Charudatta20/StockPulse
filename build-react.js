const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building React app...');

try {
  // Check if client directory exists
  if (!fs.existsSync('client')) {
    console.error('❌ Client directory not found!');
    process.exit(1);
  }

  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found!');
    process.exit(1);
  }

  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Build the React app
  console.log('🔨 Building React app with Vite...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if build was successful
  const distPath = path.join(__dirname, 'dist', 'public');
  const indexPath = path.join(distPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    console.log('✅ React app built successfully!');
    console.log('📁 Build output:', distPath);
    console.log('📄 Index file:', indexPath);
  } else {
    console.error('❌ React app build failed - index.html not found!');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 