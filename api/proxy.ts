// /api/proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Разбиваем путь и ищем сегмент после 'search'
  const segments = pathname.split('/').filter(Boolean);
  let query = '';

  const searchPos = segments.indexOf('search');
  if (searchPos !== -1 && searchPos + 1 < segments.length) {
    query = decodeURIComponent(segments[searchPos + 1]);
  }

  // Если не нашли в пути — проверяем ?query=... (запасной вариант)
  if (!query) {
    query = url.searchParams.get('query') || '';
  }

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'поле query должно быть задано', code: 400 },
      { status: 400 }
    );
  }

  // Параметры для Wildberries API
  const params = new URLSearchParams({
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

  const targetUrl = `https://search.wb.ru/exactmatch/ru/common/v18/search?${params.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://www.wildberries.ru/',
        'Accept': 'application/json',
      },
    });

    const data = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: `Wildberries вернул ошибку ${res.status}`, details: data },
        { status: res.status }
      );
    }

    return new NextResponse(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Ошибка при обращении к API Wildberries' },
      { status: 500 }
    );
  }
}
