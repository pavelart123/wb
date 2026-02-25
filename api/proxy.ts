import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Логирование для отладки (посмотрите в Vercel Functions Logs)
  console.log('Requested path:', pathname);

  const segments = pathname.split('/').filter(Boolean);
  console.log('Segments:', segments);

  let query = '';

  const searchIdx = segments.indexOf('search');
  if (searchIdx !== -1 && searchIdx + 1 < segments.length) {
    query = decodeURIComponent(segments[searchIdx + 1]);
  }

  if (!query) {
    query = url.searchParams.get('query') || '';
  }

  console.log('Extracted query:', query);

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'поле query должно быть задано', code: 400 },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
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

  const target = `https://search.wb.ru/exactmatch/ru/common/v18/search?${params}`;

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.wildberries.ru/',
      },
    });

    const data = await res.text();
    return new NextResponse(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }
}
