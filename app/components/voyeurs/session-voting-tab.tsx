'use client'

import { Check, Film, LoaderCircle, Lock } from 'lucide-react'
import Image from 'next/image'

import type { AppMovie, SessionPayload } from '@/app/components/voyeurs/voyeurs-types'

type SessionVotingTabProps = {
  userVote: string | undefined
  session: SessionPayload | null
  requestCancelVote: () => void
  votingMovieId: string | null
  movies: AppMovie[]
  currentUser: string
  voteCountByMovie: Record<string, number>
  voteForMovie: (movieId: string) => Promise<void>
  requestCloseCurrentRound: () => void
  requestCancelRound: () => void
  isClosingRound: boolean
  isSessionOwner: boolean
}

export default function SessionVotingTab({
  userVote,
  session,
  requestCancelVote,
  votingMovieId,
  movies,
  currentUser,
  voteCountByMovie,
  voteForMovie,
  requestCloseCurrentRound,
  requestCancelRound,
  isClosingRound,
  isSessionOwner,
}: SessionVotingTabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/7 bg-black/25 p-3 text-sm text-zinc-400">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p>
              Seu voto: <span className="text-white">{userVote ? 'registrado' : 'pendente'}</span>
            </p>
            <p>
              Total: <span className="text-white">{session ? Object.keys(session.votes).length : 0}</span>
            </p>
          </div>

          {userVote && (
            <button
              type="button"
              onClick={requestCancelVote}
              disabled={Boolean(votingMovieId)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-xs font-medium text-white transition-colors hover:bg-white/[0.04] disabled:opacity-50"
            >
              {votingMovieId === 'cancel' ? 'Cancelando...' : 'Cancelar voto'}
            </button>
          )}
        </div>
      </div>

      {movies.length > 0 ? (
        <div className="space-y-3">
          {movies.map((movie) => {
            const isOwner = movie.addedBy === currentUser
            const isVotedMovie = userVote === movie.id
            const hasVoted = Boolean(userVote)
            const votes = voteCountByMovie[movie.id] ?? 0
            const isDisabled = isOwner || isVotedMovie || Boolean(votingMovieId)

            return (
              <div
                key={movie.id}
                className={`rounded-2xl border p-3 transition-colors ${
                  isVotedMovie
                    ? 'border-[#1662b8]/45 bg-[#1662b8]/10'
                    : 'border-white/7 bg-black/25'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-[72px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={`Capa de ${movie.title}`}
                        fill
                        sizes="52px"
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
                      <h3 className="text-sm font-semibold text-white">{movie.title}</h3>
                      {movie.year && <span className="text-xs text-zinc-500">({movie.year})</span>}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">Sugerido por {movie.addedBy}</p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {votes} voto{votes === 1 ? '' : 's'}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => voteForMovie(movie.id)}
                    className={`inline-flex h-11 min-w-[92px] items-center justify-center rounded-xl px-3 text-sm font-medium transition-all ${
                      isVotedMovie
                        ? 'border border-[#1662b8]/35 bg-[#1662b8]/15 text-[#c7dcf5]'
                        : isOwner
                          ? 'border border-zinc-800 bg-zinc-900 text-zinc-600'
                          : isDisabled
                            ? 'border border-zinc-800 bg-zinc-900 text-zinc-600'
                            : 'bg-white text-black active:scale-[0.98]'
                    }`}
                  >
                    {votingMovieId === movie.id ? (
                      <LoaderCircle className="animate-spin" size={16} />
                    ) : isOwner ? (
                      <span className="flex items-center gap-2">
                        <Lock size={14} />
                        Seu filme
                      </span>
                    ) : isVotedMovie ? (
                      <span className="flex items-center gap-2">
                        <Check size={15} />
                        Votado
                      </span>
                    ) : (
                      hasVoted ? 'Mudar voto' : 'Votar'
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/7 bg-black/25 p-4 text-sm text-zinc-500">
          Nenhum filme adicionado ainda.
        </div>
      )}

      <button
        type="button"
        onClick={requestCloseCurrentRound}
        disabled={movies.length === 0 || isClosingRound || !isSessionOwner}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#d70f19] text-sm font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-40"
      >
        {isClosingRound ? (
          <span className="flex items-center gap-2">
            <LoaderCircle className="animate-spin" size={15} />
            Fechando rodada...
          </span>
        ) : (
          'Fechar rodada'
        )}
      </button>

      <button
        type="button"
        onClick={requestCancelRound}
        disabled={movies.length === 0 || isClosingRound || !isSessionOwner}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#d70f19]/35 bg-[#d70f19]/10 text-sm font-medium text-[#f8b8bc] transition-colors hover:bg-[#d70f19]/15 active:scale-[0.99] disabled:opacity-40"
      >
        Cancelar rodada
      </button>

      {!isSessionOwner && (
        <p className="text-sm text-zinc-500">
          Somente <span className="text-zinc-300">{session?.ownerName ?? 'o criador'}</span> pode fechar ou cancelar a rodada.
        </p>
      )}
    </div>
  )
}
