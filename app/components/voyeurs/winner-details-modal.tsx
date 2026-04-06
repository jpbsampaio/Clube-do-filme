'use client'

import { Film, X } from 'lucide-react'
import Image from 'next/image'
import { createPortal } from 'react-dom'

import type { AppWinner } from '@/app/components/voyeurs/voyeurs-types'

type WinnerDetailsModalProps = {
  selectedWinner: AppWinner | null
  onClose: () => void
}

export default function WinnerDetailsModal({
  selectedWinner,
  onClose,
}: WinnerDetailsModalProps) {
  if (!selectedWinner || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center overscroll-contain px-4 py-6">
      <button
        type="button"
        aria-label="Fechar mais informações"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar mais informações"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-white/12"
        >
          <X size={18} />
        </button>

        <div className="max-h-[82vh] overflow-y-auto px-5 py-5 sm:max-h-[680px]">
          <p className="text-center text-[11px] uppercase tracking-[0.2em] text-zinc-500">Mais informações</p>

          <div className="mt-4 flex items-start gap-3">
            <div className="relative h-20 w-[60px] shrink-0 overflow-hidden rounded-xl border border-white/8 bg-zinc-950">
              {selectedWinner.posterUrl ? (
                <Image
                  src={selectedWinner.posterUrl}
                  alt={`Capa de ${selectedWinner.title}`}
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  <Film size={16} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className="text-lg font-semibold text-white">{selectedWinner.title}</h3>
                {selectedWinner.year && <span className="text-sm text-zinc-500">({selectedWinner.year})</span>}
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {selectedWinner.sessionName} • Rodada {selectedWinner.roundNumber}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {selectedWinner.votes} voto{selectedWinner.votes === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Quem votou</p>
              <p className="mt-3 text-sm leading-6 text-zinc-200">
                {selectedWinner.voterNames.length > 0
                  ? selectedWinner.voterNames.join(', ')
                  : 'Nenhum voto registrado.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Filmes indicados</p>

              <div className="mt-3 space-y-2">
                {selectedWinner.roundMovies.map((movie) => (
                  <div
                    key={`${selectedWinner.id}-${movie.title}-${movie.suggestedBy}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-sm text-zinc-200">{movie.title}</span>
                    <span className="shrink-0 text-xs text-zinc-500">{movie.suggestedBy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
