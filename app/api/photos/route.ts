import { NextResponse } from 'next/server'

import { listDrivePhotos } from '@/lib/drive-photos'

export async function GET() {
  try {
    const photos = await listDrivePhotos()

    return NextResponse.json(
      { photos },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar fotos'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
