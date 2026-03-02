import { NextRequest, NextResponse } from 'next/server'
import { addMovieSuggestion } from '@/lib/session-service'

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
