  const url = new URL(request.url);
  const pathname = url.pathname;

  // Разбиваем путь на сегменты и удаляем пустые
  const segments = pathname.split('/').filter(Boolean);

  let query = '';

  // Находим индекс 'search' и берём следующий элемент как query
  const searchIndex = segments.indexOf('search');
  if (searchIndex !== -1 && searchIndex + 1 < segments.length) {
    query = decodeURIComponent(segments[searchIndex + 1]);
  }

  // Запасной вариант: если query пришёл как параметр ?query=
  if (!query) {
    query = url.searchParams.get('query') || '';
  }

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'поле query должно быть задано', code: 400 },
      { status: 400 }
    );
  }

  // Формируем параметры для Wildberries
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

  // Используем u-search.wb.ru — он чаще работает без блокировок в 2026 году
  const targetUrl = `https://u-search.wb.ru/exactmatch/ru/common/v18/search?${wbParams.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://www.wildberries.ru/',
        'Accept': 'application/json',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    });

    const data = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Wildberries API error ${response.status}`, details: data.substring(0, 500) },
        { status: response.status }
      );
    }

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json({ error: 'Ошибка прокси' }, { status: 500 });
  }
