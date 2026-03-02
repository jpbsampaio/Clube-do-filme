import { NextRequest, NextResponse } from 'next/server'
import { registerVote } from '@/lib/session-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const sessionName = String(body.sessionName ?? 'Sessão Voyeurs')
    const userName = String(body.userName ?? '').trim()
    const movieId = String(body.movieId ?? '').trim()

    if (!userName || !movieId) {
      return NextResponse.json({ error: 'Usuário e filme são obrigatórios' }, { status: 400 })
    }

    const state = await registerVote({ sessionName, userName, movieId })
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    const status = message.includes('já votou') || message.includes('próprio filme') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
