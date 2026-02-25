import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;               // встроенный объект URLSearchParams

  const query = searchParams.get('query');             // ?query=Трусики (если фронт так передаёт)
  // или если query в пути: const query = pathname.split('/').pop(); // последний сегмент пути

  if (!query) {
    return NextResponse.json({ error: 'поле query должно быть задано' }, { status: 400 });
  }

  // Формируем полный URL для WB
  const wbSearchParams = new URLSearchParams({
    appType: '1',
    curr: 'rub',
    dest: '-1257786',
    lang: 'ru',
    page: searchParams.get('page') || '1',
    query: query,                                      // ← здесь главное исправление
    resultset: 'catalog',
    sort: 'popular',
    spp: '30',
    suppressSpellcheck: 'false',
  });

  const targetUrl = `https://search.wb.ru/exactmatch/ru/common/v18/search?${wbSearchParams.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://www.wildberries.ru/',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `WB error ${res.status}` }, { status: res.status });
    }

    const data = await res.text();
    return new NextResponse(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
