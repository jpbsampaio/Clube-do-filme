import { NextRequest, NextResponse } from 'next/server'
import { addMovieSuggestion, updateMovieSuggestion } from '@/lib/session-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const sessionName = String(body.sessionName ?? 'Sessão Voyeurs')
    const userName = String(body.userName ?? '').trim()
    const title = String(body.title ?? '').trim()
    const year = typeof body.year === 'number' ? body.year : null
    const externalId = body.externalId ? String(body.externalId) : null
    const posterUrl = body.posterUrl ? String(body.posterUrl) : null

    if (!userName || !title) {
      return NextResponse.json({ error: 'Usuário e título são obrigatórios' }, { status: 400 })
    }

    const state = await addMovieSuggestion({
      sessionName,
      userName,
      title,
      year,
      externalId,
      posterUrl,
    })

    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    const status = message.includes('já sugeriu') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const sessionName = String(body.sessionName ?? 'Sess\u00e3o Voyeurs')
    const userName = String(body.userName ?? '').trim()
    const movieId = String(body.movieId ?? '').trim()
    const title = String(body.title ?? '').trim()
    const year = typeof body.year === 'number' ? body.year : null
    const externalId = body.externalId ? String(body.externalId) : null
    const posterUrl = body.posterUrl ? String(body.posterUrl) : null

    if (!userName || !movieId || !title) {
      return NextResponse.json({ error: 'Usuário, filme e título são obrigatórios' }, { status: 400 })
    }

    const state = await updateMovieSuggestion({
      sessionName,
      userName,
      movieId,
      title,
      year,
      externalId,
      posterUrl,
    })

    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    const status =
      message.includes('antes do primeiro voto') ||
      message.includes('não foi encontrada') ||
      message.includes('nao foi encontrada')
        ? 409
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
