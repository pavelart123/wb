export default async function handler(req, res) {
  try {
    // Импорт твоего сервера (проверь путь после билда локально!)
    const serverModule = await import('../dist/server/server.mjs');
    const app = serverModule.app || serverModule.default; // app или default — зависит от экспорта в server.ts
    console.log('Vercel handler: app loaded');
    return app(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err.message, err.stack);
    res.status(500).send('Server failed: ' + err.message);
  }
}
