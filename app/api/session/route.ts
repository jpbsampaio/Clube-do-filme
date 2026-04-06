import { NextRequest, NextResponse } from 'next/server'

import { getActiveSessionState, joinSession } from '@/lib/session-service'

export async function GET() {
  try {
    const state = await getActiveSessionState()
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionName = String(body.sessionName ?? 'Sess\u00e3o Voyeurs')
    const userName = String(body.userName ?? '').trim()

    if (!userName) {
      return NextResponse.json({ error: 'Nome do usu\u00e1rio \u00e9 obrigat\u00f3rio' }, { status: 400 })
    }

    const state = await joinSession(sessionName, userName)
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    const status = message.includes('J\u00e1 existe uma sess\u00e3o ativa') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
