import { NextRequest, NextResponse } from 'next/server'

import { cancelVote, registerVote } from '@/lib/session-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const sessionName = String(body.sessionName ?? 'Sess\u00e3o Voyeurs')
    const userName = String(body.userName ?? '').trim()
    const movieId = String(body.movieId ?? '').trim()

    if (!userName || !movieId) {
      return NextResponse.json({ error: 'Usuário e filme são obrigatórios' }, { status: 400 })
    }

    const state = await registerVote({ sessionName, userName, movieId })
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    const status = message.includes('próprio filme') || message.includes('proprio filme') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const sessionName = String(body.sessionName ?? 'Sess\u00e3o Voyeurs')
    const userName = String(body.userName ?? '').trim()

    if (!userName) {
      return NextResponse.json({ error: 'Usuário é obrigatório' }, { status: 400 })
    }

    const state = await cancelVote({ sessionName, userName })
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
