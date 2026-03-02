import { NextRequest, NextResponse } from 'next/server'

type TmdbMovie = {
  id: number
  title: string
  release_date?: string
  poster_path?: string | null
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const configuredToken = process.env.TMDB_API_KEY?.trim()
  if (!configuredToken) {
    return NextResponse.json({ error: 'TMDB_API_KEY não configurada' }, { status: 500 })
  }

  const url = new URL('https://api.themoviedb.org/3/search/movie')

  url.searchParams.set('query', query)
  url.searchParams.set('language', 'pt-BR')
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('page', '1')

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${configuredToken}`,
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as { status_message?: string } | null
      const message = errorBody?.status_message ?? 'Falha ao buscar filmes'

      if (response.status === 401) {
        return NextResponse.json({ error: `TMDB não autorizou o token: ${message}` }, { status: 502 })
      }

      return NextResponse.json({ error: `TMDB retornou erro: ${message}` }, { status: 502 })
    }

    const data = (await response.json()) as { results?: TmdbMovie[] }

    const results = (data.results ?? []).slice(0, 8).map((movie) => ({
      externalId: String(movie.id),
      title: movie.title,
      year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : null,
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'Falha de rede ao buscar filmes na TMDB' }, { status: 502 })
  }
}
