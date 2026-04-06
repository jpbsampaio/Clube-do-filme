import { NextRequest, NextResponse } from 'next/server'

import { closeSession } from '@/lib/session-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionName = String(body.sessionName ?? 'Sess\u00e3o Voyeurs')
    const userName = String(body.userName ?? '').trim()

    if (!userName) {
      return NextResponse.json({ error: 'Nome do usuário é obrigatório' }, { status: 400 })
    }

    const state = await closeSession(sessionName, userName)
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    const status = message.includes('Somente ') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
