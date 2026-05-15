import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const app = express();

const translations = {
  en: require('./translations/en.json'),
  de: require('./translations/de.json')
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const renderPage = (req, res, page) => {
  const lang = req.params.lang || 'en';
  const t = translations[lang] || translations.en;
  const path = req.path.replace(/^\/(en|de)/, '');
  const otherLang = lang === 'en' ? 'de' : 'en';
  const currentPath = path === '/' ? '' : path.replace(/^\//, '');
  const template = lang === 'de' ? `${page}_de` : page;
  res.render(template, { lang, t, currentPath, otherLang });
};

app.get('/', (req, res) => {
  res.redirect('/en/');
});

app.get('/:lang', (req, res) => {
  renderPage(req, res, 'index');
});

app.get('/:lang/how-it-works', (req, res) => {
  renderPage(req, res, 'how-it-works');
});

app.get('/:lang/about', (req, res) => {
  renderPage(req, res, 'about');
});

app.get('/:lang/prices', (req, res) => {
  renderPage(req, res, 'prices');
});

app.get('/:lang/gallery', (req, res) => {
  renderPage(req, res, 'gallery');
});

app.get('/:lang/contact', (req, res) => {
  renderPage(req, res, 'contact');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
