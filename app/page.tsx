'use client'

import { Check, Film, LoaderCircle, Lock, Trophy, UserRound, Vote } from 'lucide-react'
import Image from 'next/image'
import { FormEvent, useEffect, useMemo, useState } from 'react'

type AppMovie = {
  id: string
  title: string
  year: number | null
  addedBy: string
  posterUrl: string | null
}

type AppWinner = {
  id: string
  title: string
  year: number | null
  suggestedBy: string
  votes: number
  finishedAt: string
}

type SessionPayload = {
  sessionName: string
  currentRound: number
  participants: string[]
  movies: AppMovie[]
  votes: Record<string, string>
  winners: AppWinner[]
}

type MovieSuggestion = {
  externalId: string
  title: string
  year: number | null
  posterUrl: string | null
}

const DEFAULT_SESSION = 'Sessão Voyeurs'

function toDriveEmbedUrl(rawUrl: string | undefined) {
  if (!rawUrl) {
    return null
  }

  try {
    const url = new URL(rawUrl)

    if (url.pathname.includes('/embeddedfolderview')) {
      return rawUrl
    }

    const folderMatch = url.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/)
    const folderId = folderMatch?.[1] ?? url.searchParams.get('id')

    if (!folderId) {
      return null
    }

    return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`
  } catch {
    return null
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(body.error ?? 'Erro inesperado')
  }

  return body
}

export default function VotePage() {
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [currentUser, setCurrentUser] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [sessionInput, setSessionInput] = useState(DEFAULT_SESSION)
  const [movieQuery, setMovieQuery] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<MovieSuggestion | null>(null)
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const driveEmbedUrl = toDriveEmbedUrl(process.env.NEXT_PUBLIC_GOOGLE_DRIVE_URL)

  const sessionName = session?.sessionName ?? (sessionInput.trim() || DEFAULT_SESSION)

  async function loadSession(targetSession: string) {
    setIsLoading(true)
    setError(null)

    try {
      const data = await requestJson<SessionPayload>(`/api/session?sessionName=${encodeURIComponent(targetSession)}`)
      setSession(data)
      setSessionInput(data.sessionName)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar sessão')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSession(DEFAULT_SESSION)
  }, [])

  useEffect(() => {
    const query = movieQuery.trim()

    if (query.length < 2 || selectedSuggestion?.title === query) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      setIsSearching(true)

      try {
        const payload = await requestJson<{ results: MovieSuggestion[] }>(
          `/api/movies/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        )

        setSuggestions(payload.results)
      } catch (searchError) {
        if (searchError instanceof Error && searchError.name === 'AbortError') {
          return
        }
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [movieQuery, selectedSuggestion])

  const alreadyAddedMovie = useMemo(() => {
    if (!session || !currentUser) {
      return false
    }

    return session.movies.some((movie) => movie.addedBy === currentUser)
  }, [session, currentUser])

  const userVote = session?.votes[currentUser]

  const voteCountByMovie = useMemo(() => {
    if (!session) {
      return {} as Record<string, number>
    }

    return session.movies.reduce<Record<string, number>>((acc, movie) => {
      const count = Object.values(session.votes).filter((movieId) => movieId === movie.id).length
      acc[movie.id] = count
      return acc
    }, {})
  }, [session])

  async function joinSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const userName = nameInput.trim()
    const targetSession = sessionInput.trim() || DEFAULT_SESSION

    if (!userName) {
      setError('Informe seu nome para entrar')
      return
    }

    setError(null)

    try {
      const state = await requestJson<SessionPayload>('/api/session', {
        method: 'POST',
        body: JSON.stringify({
          sessionName: targetSession,
          userName,
        }),
      })

      setCurrentUser(userName)
      setSession(state)
      setSessionInput(state.sessionName)
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Erro ao entrar na sessão')
    }
  }

  async function addMovie(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!currentUser) {
      setError('Entre na sessão para sugerir um filme')
      return
    }

    if (!selectedSuggestion) {
      setError('Selecione um filme da lista de sugestões')
      return
    }

    setError(null)

    try {
      const state = await requestJson<SessionPayload>('/api/movies', {
        method: 'POST',
        body: JSON.stringify({
          sessionName,
          userName: currentUser,
          title: selectedSuggestion.title,
          year: selectedSuggestion.year,
          externalId: selectedSuggestion.externalId,
          posterUrl: selectedSuggestion.posterUrl,
        }),
      })

      setSession(state)
      setMovieQuery('')
      setSelectedSuggestion(null)
      setSuggestions([])
    } catch (movieError) {
      setError(movieError instanceof Error ? movieError.message : 'Erro ao sugerir filme')
    }
  }

  async function voteForMovie(movieId: string) {
    if (!currentUser) {
      setError('Entre na sessão para votar')
      return
    }

    setError(null)

    try {
      const state = await requestJson<SessionPayload>('/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          sessionName,
          userName: currentUser,
          movieId,
        }),
      })

      setSession(state)
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : 'Erro ao registrar voto')
    }
  }

  async function closeCurrentRound() {
    setError(null)

    try {
      const state = await requestJson<SessionPayload>('/api/round/close', {
        method: 'POST',
        body: JSON.stringify({ sessionName }),
      })

      setSession(state)
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : 'Erro ao fechar rodada')
    }
  }

  if (isLoading && !session) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-zinc-400">
        <LoaderCircle className="animate-spin" size={22} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-3">
      <section id="sessao" className="bg-voyeur-gray border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <UserRound size={17} className="text-zinc-300" />
          <h2 className="text-sm uppercase tracking-tight text-zinc-300">Sessão</h2>
        </div>

        <form onSubmit={joinSession} className="space-y-3">
          <input
            value={sessionInput}
            onChange={(event) => setSessionInput(event.target.value)}
            placeholder="Nome da sessão"
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-white/30"
          />
          <div className="flex gap-2">
            <input
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="Seu nome"
              className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-white/30"
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-white text-black text-sm font-bold">
              Entrar
            </button>
          </div>
        </form>

        <div className="text-xs text-zinc-400 space-y-1">
          <p>
            Sessão ativa: <span className="text-white">{session?.sessionName ?? sessionName}</span>
          </p>
          <p>
            Participantes: <span className="text-white">{session?.participants.length ?? 0}</span>
          </p>
          <p>
            Usuário atual: <span className="text-white">{currentUser || 'não definido'}</span>
          </p>
          <p>
            Rodada: <span className="text-white">{session?.currentRound ?? 1}</span>
          </p>
        </div>
      </section>

      <section id="filmes" className="bg-voyeur-gray border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Film size={17} className="text-zinc-300" />
          <h2 className="text-sm uppercase tracking-tight text-zinc-300">Sugestões de filmes</h2>
        </div>

        <form onSubmit={addMovie} className="space-y-2">
          <div className="relative">
            <input
              value={movieQuery}
              onChange={(event) => {
                setMovieQuery(event.target.value)
                setSelectedSuggestion(null)
              }}
              placeholder="Digite o nome do filme"
              disabled={!currentUser || alreadyAddedMovie}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-white/30 disabled:opacity-50"
            />

            {(isSearching || suggestions.length > 0) && !selectedSuggestion && (
              <div className="absolute top-full mt-2 w-full bg-black border border-white/10 rounded-xl overflow-hidden z-10">
                {isSearching && (
                  <div className="p-3 text-xs text-zinc-400">Buscando...</div>
                )}

                {!isSearching && suggestions.map((suggestion) => (
                  <button
                    key={suggestion.externalId}
                    type="button"
                    onClick={() => {
                      setSelectedSuggestion(suggestion)
                      setMovieQuery(`${suggestion.title}${suggestion.year ? ` (${suggestion.year})` : ''}`)
                      setSuggestions([])
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-voyeur-gray/70 border-b last:border-b-0 border-white/5"
                  >
                    <span className="text-sm block">{suggestion.title}</span>
                    <span className="text-xs text-zinc-500">{suggestion.year ?? 'Ano não informado'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!currentUser || alreadyAddedMovie || !selectedSuggestion}
            className="w-full px-4 py-2 rounded-xl bg-white text-black text-sm font-bold disabled:opacity-50"
          >
            Adicionar da sugestão
          </button>
        </form>

        {alreadyAddedMovie && (
          <p className="text-xs text-zinc-400">Você já sugeriu um filme nesta rodada.</p>
        )}

        <div className="flex justify-between items-center text-xs">
          <span className="uppercase tracking-tight text-zinc-500">Filmes na rodada</span>
          <span className="bg-white text-black px-2 py-0.5 rounded-full font-bold">{session?.movies.length ?? 0} ativos</span>
        </div>
      </section>

      <section id="votacao" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Vote size={17} className="text-zinc-300" />
          <h2 className="text-sm uppercase tracking-tight text-zinc-300">Votação</h2>
        </div>

        {(session?.movies ?? []).map((movie) => {
          const isOwner = movie.addedBy === currentUser
          const hasVoted = Boolean(userVote)
          const votes = voteCountByMovie[movie.id] ?? 0

          return (
            <div key={movie.id} className="bg-voyeur-gray border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-16 bg-black/50 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  {movie.posterUrl ? (
                    <Image src={movie.posterUrl} alt={movie.title} width={48} height={64} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-zinc-500 mb-1 truncate">Enviado por {movie.addedBy}</span>
                  <h3 className="font-bold text-base truncate">{movie.title}</h3>
                  <span className="text-zinc-500 text-xs">{movie.year ?? 'Ano não informado'}</span>
                  <span className="text-zinc-400 text-xs mt-1">{votes} voto(s)</span>
                </div>
              </div>

              <button
                disabled={isOwner || hasVoted || !currentUser}
                onClick={() => voteForMovie(movie.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isOwner || hasVoted || !currentUser
                    ? 'bg-zinc-900 text-zinc-700 border border-zinc-800'
                    : 'bg-white text-black hover:scale-110 active:scale-95'
                }`}
              >
                {isOwner ? <Lock size={18} /> : <Check size={20} strokeWidth={3} />}
              </button>
            </div>
          )
        })}

        {(session?.movies.length ?? 0) === 0 && (
          <p className="text-center text-sm text-zinc-500 bg-voyeur-gray border border-white/5 p-4 rounded-2xl">
            Nenhum filme adicionado ainda.
          </p>
        )}

        <div className="bg-voyeur-gray border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-400">
            <p>
              Seu voto: <span className="text-white">{userVote ? 'registrado' : 'pendente'}</span>
            </p>
            <p>
              Total de votos: <span className="text-white">{session ? Object.keys(session.votes).length : 0}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={closeCurrentRound}
            disabled={(session?.movies.length ?? 0) === 0}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold disabled:opacity-40"
          >
            Fechar rodada
          </button>
        </div>
      </section>

      <section id="historico" className="bg-voyeur-gray border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy size={17} className="text-zinc-300" />
          <h2 className="text-sm uppercase tracking-tight text-zinc-300">Histórico de vencedores</h2>
        </div>

        {(session?.winners ?? []).map((winner) => (
          <div key={winner.id} className="border border-white/10 rounded-xl p-3 bg-black/40">
            <p className="font-semibold text-sm">
              {winner.title} {winner.year ? `(${winner.year})` : ''}
            </p>
            <p className="text-xs text-zinc-400">
              Sugerido por {winner.suggestedBy} • {winner.votes} voto(s)
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">{new Date(winner.finishedAt).toLocaleString('pt-BR')}</p>
          </div>
        ))}

        {(session?.winners.length ?? 0) === 0 && (
          <p className="text-sm text-zinc-500">Nenhuma rodada finalizada ainda.</p>
        )}
      </section>

      <section id="fotos" className="bg-voyeur-gray border border-white/5 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm uppercase tracking-tight text-zinc-300">Fotos do evento</h2>

        {driveEmbedUrl ? (
          <iframe
            src={driveEmbedUrl}
            title="Fotos do Google Drive"
            className="w-full h-105 rounded-xl border border-white/10 bg-black"
            loading="lazy"
          />
        ) : (
          <p className="text-sm text-zinc-500">
            Defina uma URL válida de pasta do Drive em <span className="text-zinc-300">NEXT_PUBLIC_GOOGLE_DRIVE_URL</span>.
          </p>
        )}
      </section>

      {error && (
        <div className="text-xs text-red-300 bg-red-900/30 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
    </div>
  )
}
