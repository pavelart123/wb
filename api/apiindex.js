export default async function handler(req, res) {
  try {
    const serverModule = await import('../dist/server/server.mjs');
    const app = serverModule.app;  // если в server.mjs export { app }
    // или const app = serverModule.default; — если export default app
    return app(req, res);
  } catch (err) {
    console.error('Server import error:', err);
    res.status(500).json({ error: 'Server failed to start', details: err.message });
  }
}