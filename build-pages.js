import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = './dist';
const viewsDir = './views';
const publicDir = './public';
const translationsDir = './translations';

// Create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Load translations
const en = JSON.parse(fs.readFileSync(path.join(translationsDir, 'en.json'), 'utf-8'));
const de = JSON.parse(fs.readFileSync(path.join(translationsDir, 'de.json'), 'utf-8'));
const translations = { en, de };

// Pages to render
const pages = [
  { name: 'index', path: '' },
  { name: 'about', path: 'about' },
  { name: 'prices', path: 'prices' },
  { name: 'gallery', path: 'gallery' },
  { name: 'contact', path: 'contact' },
  { name: 'how-it-works', path: 'how-it-works' }
];

// Render all pages for both languages
pages.forEach(page => {
  ['en', 'de'].forEach(lang => {
    const t = translations[lang];
    const otherLang = lang === 'en' ? 'de' : 'en';
    const currentPath = page.path ? `/${page.path}` : '';

    // Determine template filename
    const templateFilename = lang === 'de' ? `${page.name}_de.ejs` : `${page.name}.ejs`;
    const templatePath = path.join(viewsDir, templateFilename);

    // Render EJS template
    const template = fs.readFileSync(templatePath, 'utf-8');
    const html = ejs.render(template, {
      lang,
      t,
      currentPath,
      otherLang
    }, {
      filename: templatePath,
      views: [viewsDir]
    });

    // Create output directory structure
    const outputDir = page.path
      ? path.join(distDir, lang, page.path)
      : path.join(distDir, lang);

    fs.mkdirSync(outputDir, { recursive: true });

    // Write HTML file
    const outputFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputFile, html);
    console.log(`✓ Rendered ${lang}${currentPath || '/'}`);
  });
});

// Copy public assets
if (fs.existsSync(publicDir)) {
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };

  copyDir(publicDir, path.join(distDir, 'public'));
  console.log('✓ Copied public assets');
}

// Create _redirects file
const redirectsContent = `/            /en/              301\n`;
fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent);
console.log('✓ Created _redirects file');

console.log('\n✨ Build complete for Cloudflare Pages!');
console.log(`Output directory: ${distDir}`);
