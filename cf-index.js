import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const renderPage = async (req, res, page) => {
  try {
    const lang = req.params.lang || 'en';
    const en = await import('./translations/en.json', { assert: { type: 'json' } });
    const de = await import('./translations/de.json', { assert: { type: 'json' } });
    const translations = { en: en.default, de: de.default };

    const t = translations[lang] || translations.en;
    const routePath = req.path.replace(/^\/(en|de)/, '');
    const otherLang = lang === 'en' ? 'de' : 'en';
    const currentPath = routePath === '/' ? '' : routePath;
    const template = lang === 'de' ? `${page}_de` : page;

    res.render(template, { lang, t, currentPath, otherLang });
  } catch (err) {
    res.status(500).send('Error rendering page: ' + err.message);
  }
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

export default app;
