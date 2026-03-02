import { NextRequest, NextResponse } from 'next/server'
import { getSessionState, joinSession } from '@/lib/session-service'

export async function GET(request: NextRequest) {
  try {
    const sessionName = request.nextUrl.searchParams.get('sessionName') ?? 'Sessão Voyeurs'
    const state = await getSessionState(sessionName)
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionName = String(body.sessionName ?? 'Sessão Voyeurs')
    const userName = String(body.userName ?? '').trim()

    if (!userName) {
      return NextResponse.json({ error: 'Nome do usuário é obrigatório' }, { status: 400 })
    }

    const state = await joinSession(sessionName, userName)
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
