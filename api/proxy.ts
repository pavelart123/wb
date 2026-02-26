import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  console.log('Invocation started:', request.headers.get('x-vercel-id') || 'no-id');
  console.log('Full URL:', request.url);
  console.log('Pathname:', url.pathname);
  console.log('Search:', url.search);
  console.log('Segments:', url.pathname.split('/').filter(Boolean));

  let query = '';

  try {
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length >= 4 && segments[2] === 'search') {
      query = decodeURIComponent(segments[3]);
    } else if (segments.length > 0) {
      query = decodeURIComponent(segments[segments.length - 1]);
    }
  } catch (e) {
    console.error('Ошибка разбора пути:', e);
  }

  if (!query) {
    query = url.searchParams.get('query') || '';
  }

  console.log('Query после извлечения:', query || '(пусто)');

  if (!query.trim()) {
    return NextResponse.json({ error: 'поле query должно быть задано', code: 400 }, { status: 400 });
  }

  const wbParams = new URLSearchParams({
    appType: '1',
    curr: 'rub',
    dest: '-1257786',
    lang: 'ru',
    page: url.searchParams.get('page') || '1',
    query,
    resultset: 'catalog',
    sort: 'popular',
    spp: '30',
    suppressSpellcheck: 'false',
  });

  const targetUrl = `https://u-search.wb.ru/exactmatch/ru/common/v18/search?${wbParams.toString()}`;
  console.log('Target URL:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://www.wildberries.ru/',
        'Accept': 'application/json',
      },
    });

    console.log('WB response status:', response.status);

    const data = await response.text();

    if (!response.ok) {
      console.log('WB error body preview:', data.substring(0, 400));
      return NextResponse.json({ error: `WB API ${response.status}`, details: data.substring(0, 300) }, { status: response.status });
    }

    return new NextResponse(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
    });
  } catch (error) {
    console.error('Fetch failed:', error);
    return NextResponse.json({ error: 'Ошибка при запросе к WB', details: String(error) }, { status: 502 });
  }
}
