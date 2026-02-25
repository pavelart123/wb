// Файл: /api/1/search/[[...path]].ts  (или аналогичный)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  // Извлечение query из пути (последний сегмент после /search/)
  const pathname = url.pathname;  // /api/1/search/%D0%A2%D1%80%D1%83%D1%81%D0%B8%D0%BA%D0%B8
  const pathParts = pathname.split('/').filter(Boolean);
  
  // Находим позицию 'search' и берём следующий сегмент как query
  const searchIndex = pathParts.indexOf('search');
  let query = '';
  if (searchIndex !== -1 && searchIndex + 1 < pathParts.length) {
    query = decodeURIComponent(pathParts[searchIndex + 1]);  // → "Трусики"
  }

  // Запасной вариант: если query передан как ?query=...
  if (!query) {
    query = url.searchParams.get('query') || '';
  }

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'поле query должно быть задано', code: 400 },
      { status: 400 }
    );
  }

  // Формируем параметры для поиска Wildberries
  const wbParams = new URLSearchParams({
    appType: '1',
    curr: 'rub',
    dest: '-1257786',              // регион по умолчанию (Москва и область)
    lang: 'ru',
    page: url.searchParams.get('page') || '1',
    query: query,
    resultset: 'catalog',
    sort: 'popular',
    spp: '30',
    suppressSpellcheck: 'false',
  });

  const targetUrl = `https://search.wb.ru/exactmatch/ru/common/v18/search?${wbParams.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://www.wildberries.ru/',
        'Accept': 'application/json',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Ошибка WB API: ${response.status} - ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.text();
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Ошибка прокси:', error);
    return NextResponse.json({ error: 'Ошибка прокси-сервера' }, { status: 500 });
  }
}
