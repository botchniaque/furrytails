import { Hono } from 'hono';

const app = new Hono();

const en = await import('./translations/en.json', { assert: { type: 'json' } });
const de = await import('./translations/de.json', { assert: { type: 'json' } });
const translations = { en: en.default, de: de.default };

app.get('/', (c) => {
  return c.redirect('/en/', 301);
});

app.get('/:lang', async (c) => {
  const lang = c.req.param('lang') || 'en';
  if (!['en', 'de'].includes(lang)) {
    return c.notFound();
  }

  try {
    const t = translations[lang] || translations.en;
    const html = await getPageContent('index', lang, t, '', lang === 'en' ? 'de' : 'en');
    return c.html(html);
  } catch (err) {
    return c.text('Error loading page: ' + err.message, 500);
  }
});

const pages = ['how-it-works', 'about', 'prices', 'gallery', 'contact'];

pages.forEach(page => {
  app.get(`/:lang/${page}`, async (c) => {
    const lang = c.req.param('lang') || 'en';
    if (!['en', 'de'].includes(lang)) {
      return c.notFound();
    }

    try {
      const t = translations[lang] || translations.en;
      const html = await getPageContent(page, lang, t, `/${page}`, lang === 'en' ? 'de' : 'en');
      return c.html(html);
    } catch (err) {
      return c.text('Error loading page: ' + err.message, 500);
    }
  });
});

async function getPageContent(page, lang, t, currentPath, otherLang) {
  const templateName = lang === 'de' ? `${page}_de` : page;
  try {
    const response = await fetch(`file:///opt/buildhome/repo/dist/views/${templateName}.ejs`);
    if (!response.ok) throw new Error(`Template not found: ${templateName}`);
    return await response.text();
  } catch (err) {
    return `<h1>Page not found: ${page}</h1><p>${err.message}</p>`;
  }
}

app.get('/public/*', async (c) => {
  const path = c.req.path.replace('/public/', '');
  try {
    const response = await fetch(`file:///opt/buildhome/repo/dist/public/${path}`);
    if (!response.ok) return c.notFound();
    const buffer = await response.arrayBuffer();
    const contentType = getContentType(path);
    return new Response(buffer, { headers: { 'Content-Type': contentType } });
  } catch (err) {
    return c.notFound();
  }
});

function getContentType(path) {
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.js')) return 'text/javascript';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  return 'text/plain';
}

export default app;
