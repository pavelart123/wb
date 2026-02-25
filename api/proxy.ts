// /api/proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.search;  // ?page=1&...
  const pathname = url.pathname.replace('/api/', '');  // 1/search/Трусики

  // Базовый URL WB (актуальный на 2026 год: часто u-search или search.wb.ru + v18/v19)
  const targetBase = 'https://u-search.wb.ru/exactmatch/ru/common/v18/search';
  // или попробуйте 'https://search.wb.ru/exactmatch/ru/common/v18/search'

  const targetUrl = `${targetBase}?${searchParams}&appType=1&curr=rub&dest=-1257786&lang=ru&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://www.wildberries.ru/',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json({ error: `WB API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.text();  // или .json(), если уверены в формате
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}
