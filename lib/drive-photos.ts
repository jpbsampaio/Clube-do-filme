export type DrivePhoto = {
  id: string
  name: string
  thumbnailUrl: string
  fullUrl: string
}

const DRIVE_FILE_PATTERN = /\["([A-Za-z0-9_-]{20,})",\["([A-Za-z0-9_-]{20,})"\],"([^"]+)","(image\\\/[^"]+)"/g

function extractDriveFolderId(rawUrl: string) {
  const url = new URL(rawUrl)
  const folderMatch = url.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  const folderId = folderMatch?.[1] ?? url.searchParams.get('id')

  if (!folderId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_DRIVE_URL não aponta para uma pasta válida')
  }

  return folderId
}

function decodeDrivePayload(rawPayload: string) {
  return rawPayload.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  )
}

function unescapeDriveText(value: string) {
  return value
    .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/\\\\/g, '\\')
}

function buildPhotoUrls(fileId: string) {
  return {
    thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w900`,
    fullUrl: `https://lh3.googleusercontent.com/d/${fileId}=w2400`,
  }
}

export async function listDrivePhotos(): Promise<DrivePhoto[]> {
  const folderUrl = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_URL?.trim()

  if (!folderUrl) {
    throw new Error('NEXT_PUBLIC_GOOGLE_DRIVE_URL não configurada')
  }

  const folderId = extractDriveFolderId(folderUrl)
  const response = await fetch(folderUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Google Drive retornou status ${response.status}`)
  }

  const html = await response.text()
  const payloadMatch = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'([^']+)'/)

  if (!payloadMatch) {
    throw new Error('Não foi possível ler a lista de imagens do Google Drive')
  }

  const payload = decodeDrivePayload(payloadMatch[1])
  const seen = new Set<string>()
  const photos: DrivePhoto[] = []

  for (const match of payload.matchAll(DRIVE_FILE_PATTERN)) {
    const fileId = match[1]
    const parentFolderId = match[2]

    if (parentFolderId !== folderId || seen.has(fileId)) {
      continue
    }

    seen.add(fileId)
    photos.push({
      id: fileId,
      name: unescapeDriveText(match[3]),
      ...buildPhotoUrls(fileId),
    })
  }

  return photos
}
