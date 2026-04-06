'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import PhotosSkeleton from '@/app/components/skeletons/photos-skeleton'

type DrivePhoto = {
  id: string
  name: string
  thumbnailUrl: string
  fullUrl: string
}

async function fetchPhotos(signal?: AbortSignal) {
  const response = await fetch('/api/photos', { signal })
  const body = (await response.json()) as { photos?: DrivePhoto[]; error?: string }

  if (!response.ok) {
    throw new Error(body.error ?? 'Erro ao carregar fotos')
  }

  return body.photos ?? []
}

export default function PhotosGallery() {
  const [photos, setPhotos] = useState<DrivePhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const canUsePortal = typeof document !== 'undefined'

  const selectedPhoto = useMemo(() => {
    if (selectedIndex === null) {
      return null
    }

    return photos[selectedIndex] ?? null
  }, [photos, selectedIndex])

  useEffect(() => {
    const controller = new AbortController()

    void fetchPhotos(controller.signal)
      .then((items) => {
        setPhotos(items)
      })
      .catch((loadError) => {
        if (loadError instanceof Error && loadError.name === 'AbortError') {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar fotos')
      })
      .finally(() => {
        setIsLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (selectedPhoto === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedIndex(null)
        return
      }

      if (event.key === 'ArrowLeft') {
        setSelectedIndex((current) => {
          if (current === null) {
            return current
          }

          return current === 0 ? photos.length - 1 : current - 1
        })
      }

      if (event.key === 'ArrowRight') {
        setSelectedIndex((current) => {
          if (current === null) {
            return current
          }

          return current === photos.length - 1 ? 0 : current + 1
        })
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [photos.length, selectedPhoto])

  function showPrevious() {
    setSelectedIndex((current) => {
      if (current === null) {
        return current
      }

      return current === 0 ? photos.length - 1 : current - 1
    })
  }

  function showNext() {
    setSelectedIndex((current) => {
      if (current === null) {
        return current
      }

      return current === photos.length - 1 ? 0 : current + 1
    })
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (!touchStart) {
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    if (Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      if (deltaX < 0) {
        showNext()
      } else {
        showPrevious()
      }
    }

    setTouchStart(null)
  }

  if (isLoading) {
    return <PhotosSkeleton />
  }

  if (error) {
    return (
      <p className="text-sm text-zinc-500">{error}</p>
    )
  }

  if (photos.length === 0) {
    return (
      <p className="text-sm text-zinc-500">Nenhuma foto encontrada na pasta configurada.</p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-black/40 text-left"
          >
            <Image
              src={photo.thumbnailUrl}
              alt={photo.name}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 ease-out group-active:scale-[0.98] sm:group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {selectedPhoto && canUsePortal && createPortal(
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center overscroll-contain bg-black/92 px-4 py-6"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="absolute inset-x-0 top-0 flex justify-end p-4 pt-5">
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/15"
              aria-label="Fechar visualização"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="relative z-10 flex w-full max-w-md items-center justify-center"
            style={{ touchAction: 'none' }}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {photos.length > 1 && (
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/15 sm:flex"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div className="relative h-[72vh] max-h-[560px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-black/40 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <Image
                src={selectedPhoto.fullUrl}
                alt={selectedPhoto.name}
                fill
                unoptimized
                priority
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-contain"
              />
            </div>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/15 sm:flex"
                aria-label="Próxima foto"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
