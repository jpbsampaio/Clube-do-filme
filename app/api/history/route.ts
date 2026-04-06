import { NextResponse } from 'next/server'

import { getHistoryState } from '@/lib/session-service'

export async function GET() {
  try {
    const state = await getHistoryState()
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
