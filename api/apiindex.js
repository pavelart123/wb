export default async function handler(req, res) {
  try {
    // Попробуй разные варианты импорта — один из них сработает
    // Вариант 1: стандартный Angular SSR
    const serverModule = await import('../dist/server/server.mjs');
    // Вариант 2: если файл main.mjs
    // const serverModule = await import('../dist/server/main.mjs');
    // Вариант 3: если dist/my-project/server/server.mjs
    // const serverModule = await import('../dist/my-project/server/server.mjs');

    const app = serverModule.app || serverModule.default || serverModule.reqHandler;
    if (!app) {
      throw new Error('No app exported from server module');
    }

    console.log('Vercel handler: app loaded successfully');
    return app(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err.message, err.stack);
    res.status(500).json({
      error: 'Server failed to start on Vercel',
      details: err.message,
      stack: err.stack
    });
  }
}
