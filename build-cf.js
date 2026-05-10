import fs from 'fs';
import path from 'path';

// Create dist directory if it doesn't exist
const distDir = './dist';
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy the main app file
fs.copyFileSync('./cf-index.js', path.join(distDir, 'index.js'));

// Copy views
if (fs.existsSync('./views')) {
  fs.cpSync('./views', path.join(distDir, 'views'), { recursive: true });
}

// Copy public assets
if (fs.existsSync('./public')) {
  fs.cpSync('./public', path.join(distDir, 'public'), { recursive: true });
}

// Copy translations
if (fs.existsSync('./translations')) {
  fs.cpSync('./translations', path.join(distDir, 'translations'), { recursive: true });
}

console.log('✓ Build complete for Cloudflare deployment');
