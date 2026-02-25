import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const segments = pathname.split('/').filter(Boolean);
  let query = '';

  const searchIndex = segments.indexOf('search');
  if (searchIndex !== -1 && searchIndex + 1 < segments.length) {
    query = decodeURIComponent(segments[searchIndex + 1]);
  }

  if (!query) {
    query = url.searchParams.get('query') || '';
  }

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'поле query должно быть задано', code: 400 },
      { status: 400 }
    );
  }

  const wbParams = new URLSearchParams({
    appType: '1',
    curr: 'rub',
    dest: '-1257786',
    lang: 'ru',
    page: url.searchParams.get('page') || '1',
    query: query,
    resultset: 'catalog',
    sort: 'popular',
    spp: '30',
    suppressSpellcheck: 'false',
  });

  const targetUrl = `https://u-search.wb.ru/exactmatch/ru/common/v18/search?${wbParams.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://www.wildberries.ru/',
        'Accept': 'application/json',
      },
    });

    const data = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `WB API error ${response.status}`, details: data.substring(0, 500) },
        { status: response.status }
      );
    }

    return new NextResponse(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
