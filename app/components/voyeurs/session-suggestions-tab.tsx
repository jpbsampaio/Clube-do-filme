'use client'

import { Film, LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import type { FormEvent } from 'react'

import type { AppMovie, MovieSuggestion } from '@/app/components/voyeurs/voyeurs-types'

type SessionSuggestionsTabProps = {
  addMovie: (event: FormEvent<HTMLFormElement>) => Promise<void>
  movieQuery: string
  onMovieQueryChange: (value: string) => void
  alreadyAddedMovie: boolean
  isEditingSuggestion: boolean
  isAddingMovie: boolean
  isSearching: boolean
  suggestions: MovieSuggestion[]
  selectedSuggestion: MovieSuggestion | null
  onSelectSuggestion: (suggestion: MovieSuggestion) => void
  canReplaceOwnSuggestion: boolean
  ownMovie: AppMovie | null
  startEditingSuggestion: (movie: AppMovie) => void
  cancelEditingSuggestion: () => void
}

export default function SessionSuggestionsTab({
  addMovie,
  movieQuery,
  onMovieQueryChange,
  alreadyAddedMovie,
  isEditingSuggestion,
  isAddingMovie,
  isSearching,
  suggestions,
  selectedSuggestion,
  onSelectSuggestion,
  canReplaceOwnSuggestion,
  ownMovie,
  startEditingSuggestion,
  cancelEditingSuggestion,
}: SessionSuggestionsTabProps) {
  return (
    <div className="space-y-4">
      <form onSubmit={addMovie} className="space-y-3">
        <div className="relative">
          <input
            value={movieQuery}
            onChange={(event) => onMovieQueryChange(event.target.value)}
            placeholder="Digite o nome do filme"
            disabled={(alreadyAddedMovie && !isEditingSuggestion) || isAddingMovie}
            className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/25 disabled:opacity-50"
          />

          {(isSearching || suggestions.length > 0) && !selectedSuggestion && (
            <div className="absolute top-full z-10 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              {isSearching && <div className="p-3 text-xs text-zinc-400">Buscando...</div>}

              {!isSearching &&
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion.externalId}
                    type="button"
                    onClick={() => onSelectSuggestion(suggestion)}
                    className="w-full border-b border-white/5 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-voyeur-gray/70 active:bg-voyeur-gray/60"
                  >
                    <span className="block text-sm text-white">{suggestion.title}</span>
                    <span className="text-xs text-zinc-500">{suggestion.year ?? 'Ano não informado'}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={(alreadyAddedMovie && !isEditingSuggestion) || !selectedSuggestion || isAddingMovie}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition-transform active:scale-[0.99] disabled:opacity-50"
        >
          {isAddingMovie ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin" size={15} />
              Salvando...
            </span>
          ) : (
            isEditingSuggestion ? 'Salvar nova sugestão' : 'Adicionar filme'
          )}
        </button>
      </form>

      {canReplaceOwnSuggestion && !isEditingSuggestion && ownMovie && (
        <button
          type="button"
          onClick={() => startEditingSuggestion(ownMovie)}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-black/35 text-sm font-medium text-white transition-colors hover:bg-black/45 active:scale-[0.99]"
        >
          Alterar filme indicado
        </button>
      )}

      {isEditingSuggestion && (
        <div className="flex">
          <button
            type="button"
            onClick={cancelEditingSuggestion}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#d70f19] text-sm font-semibold text-white transition-transform active:scale-[0.99]"
          >
            Cancelar troca
          </button>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Sua sugestão</p>

        {ownMovie ? (
          <div className="flex items-start gap-3 rounded-2xl border border-white/7 bg-black/25 p-3">
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
              {ownMovie.posterUrl ? (
                <Image
                  src={ownMovie.posterUrl}
                  alt={`Capa de ${ownMovie.title}`}
                  fill
                  sizes="48px"
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
                <h3 className="text-sm font-semibold text-white">{ownMovie.title}</h3>
                {ownMovie.year && <span className="text-xs text-zinc-500">({ownMovie.year})</span>}
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                Sugerido por <span className="text-zinc-200">{ownMovie.addedBy}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/7 bg-black/25 p-4 text-sm text-zinc-500">
            Você ainda não indicou um filme nesta rodada.
          </div>
        )}
      </div>
    </div>
  )
}
