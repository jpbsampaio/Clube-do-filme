'use client'

import { Film } from 'lucide-react'
import Image from 'next/image'

import type { AppWinner } from '@/app/components/voyeurs/voyeurs-types'

type HistoryScreenProps = {
  allHistoryWinners: AppWinner[]
  getAdaptiveFontSize: (text: string, maxRem: number, minRem: number, threshold: number, step: number) => string
  formatDateTime: (value: string) => string
  openWinnerSheet: (winner: AppWinner) => void
}

export default function HistoryScreen({
  allHistoryWinners,
  getAdaptiveFontSize,
  formatDateTime,
  openWinnerSheet,
}: HistoryScreenProps) {
  return allHistoryWinners.length > 0 ? (
    <div className="space-y-5">
      {allHistoryWinners.map((winner, index, winners) => {
        const isLatest = index === 0
        const isLast = index === winners.length - 1

        return (
          <article key={winner.id} className="grid grid-cols-[22px_minmax(0,1fr)] gap-4">
            <div className="relative flex justify-center">
              {isLatest && (
                <span
                  aria-hidden="true"
                  className="absolute top-[-18px] h-[29px] w-[2px] -translate-x-1/2 bg-white"
                />
              )}
              {!isLatest && (
                <span
                  aria-hidden="true"
                  className="absolute top-[-20px] h-[31px] w-[2px] -translate-x-1/2 bg-white"
                />
              )}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-20px] top-[11px] w-[2px] -translate-x-1/2 bg-white"
                />
              )}
              <span
                aria-hidden="true"
                className="relative z-10 h-[22px] w-[22px] rounded-full border-4 border-white"
                style={{ backgroundColor: isLatest ? '#39bd1d' : '#1662b8' }}
              />
            </div>

            <div
              className={`rounded-2xl border p-[clamp(0.875rem,3.4vw,1rem)] transition-all duration-200 ${
                isLatest
                  ? 'border-[#39bd1d]/30 bg-zinc-950/95 shadow-[0_14px_34px_rgba(0,0,0,0.22)]'
                  : 'border-white/7 bg-black/40 shadow-[0_10px_24px_rgba(0,0,0,0.14)]'
              }`}
            >
              <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
                <div className="flex items-start gap-[clamp(0.75rem,3vw,0.875rem)]">
                  <div className="relative h-[clamp(88px,23vw,96px)] w-[clamp(64px,18vw,72px)] shrink-0 overflow-hidden rounded-xl border border-white/8 bg-zinc-950">
                    {winner.posterUrl ? (
                      <Image
                        src={winner.posterUrl}
                        alt={`Capa de ${winner.title}`}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        <Film size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex min-h-[clamp(88px,23vw,96px)] flex-1 flex-col justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1">
                        <h3
                          className="min-w-0 break-words font-semibold leading-tight text-white"
                          style={{ fontSize: getAdaptiveFontSize(winner.title, 1.08, 0.72, 12, 0.022) }}
                        >
                          {winner.title}
                        </h3>
                        {winner.year && (
                          <span
                            className="shrink-0 leading-none text-zinc-500"
                            style={{ fontSize: getAdaptiveFontSize(String(winner.year), 0.86, 0.72, 4, 0.01) }}
                          >
                            ({winner.year})
                          </span>
                        )}
                      </div>

                      <p
                        className="mt-1 whitespace-nowrap leading-none text-zinc-500"
                        style={{ fontSize: getAdaptiveFontSize(formatDateTime(winner.finishedAt), 0.76, 0.62, 18, 0.01) }}
                      >
                        {formatDateTime(winner.finishedAt)}
                      </p>
                    </div>

                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 leading-none">
                      <p
                        className="min-w-0 break-words text-zinc-200"
                        style={{ fontSize: getAdaptiveFontSize(winner.sessionName, 0.76, 0.56, 13, 0.016) }}
                      >
                        {winner.sessionName}
                      </p>
                      <span
                        className={`shrink-0 ${isLatest ? 'text-[#39bd1d]' : 'text-zinc-500'}`}
                        style={{ fontSize: getAdaptiveFontSize(isLatest ? 'Mais recente' : `Rodada ${winner.roundNumber}`, 0.76, 0.58, 12, 0.012) }}
                      >
                        {isLatest ? 'Mais recente' : `Rodada ${winner.roundNumber}`}
                      </span>
                    </div>

                    <div className="min-w-0 leading-none">
                      <p
                        className="break-words text-zinc-400"
                        style={{ fontSize: getAdaptiveFontSize(`Sugerido por ${winner.suggestedBy}`, 0.76, 0.56, 16, 0.014) }}
                      >
                        Sugerido por <span className="text-zinc-200">{winner.suggestedBy}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openWinnerSheet(winner)}
                  className="inline-flex h-[clamp(2.5rem,9vw,3rem)] w-full items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] px-4 text-[clamp(0.9rem,3.3vw,1rem)] font-medium text-white transition-colors hover:bg-white/[0.06] active:scale-[0.99]"
                >
                  Ver mais informações
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  ) : (
    <p className="text-sm text-zinc-500">Nenhum filme assistido ainda.</p>
  )
}
