'use client'

import type { Dispatch, FormEvent, SetStateAction } from 'react'

import type {
  ActiveSessionResponse,
  AppMovie,
  ConfirmationDialog,
  MovieSuggestion,
  SessionPayload,
} from '@/app/components/voyeurs/voyeurs-types'
import { getConfirmationDescription, requestJson } from '@/app/components/voyeurs/voyeurs-utils'

type UseVoyeursActionsProps = {
  currentUser: string
  session: SessionPayload | null
  sessionInput: string
  sessionName: string
  hasActiveSession: boolean
  editingSuggestionId: string | null
  selectedSuggestion: MovieSuggestion | null
  setError: Dispatch<SetStateAction<string | null>>
  setIsJoining: Dispatch<SetStateAction<boolean>>
  setSession: Dispatch<SetStateAction<SessionPayload | null>>
  setSessionInput: Dispatch<SetStateAction<string>>
  setEditingSuggestionId: Dispatch<SetStateAction<string | null>>
  setActiveTab: Dispatch<SetStateAction<'suggestions' | 'voting'>>
  setMovieQuery: Dispatch<SetStateAction<string>>
  setSelectedSuggestion: Dispatch<SetStateAction<MovieSuggestion | null>>
  setSuggestions: Dispatch<SetStateAction<MovieSuggestion[]>>
  setIsAddingMovie: Dispatch<SetStateAction<boolean>>
  setVotingMovieId: Dispatch<SetStateAction<string | null>>
  setIsClosingRound: Dispatch<SetStateAction<boolean>>
  setIsEndingSession: Dispatch<SetStateAction<boolean>>
  openConfirmation: (dialog: ConfirmationDialog) => void
  defaultSession: string
}

export default function useVoyeursActions({
  currentUser,
  session,
  sessionInput,
  sessionName,
  hasActiveSession,
  editingSuggestionId,
  selectedSuggestion,
  setError,
  setIsJoining,
  setSession,
  setSessionInput,
  setEditingSuggestionId,
  setActiveTab,
  setMovieQuery,
  setSelectedSuggestion,
  setSuggestions,
  setIsAddingMovie,
  setVotingMovieId,
  setIsClosingRound,
  setIsEndingSession,
  openConfirmation,
  defaultSession,
}: UseVoyeursActionsProps) {
  function startEditingSuggestion(movie: AppMovie) {
    setEditingSuggestionId(movie.id)
    setMovieQuery('')
    setSelectedSuggestion(null)
    setSuggestions([])
    setActiveTab('suggestions')
    setError(null)
  }

  function cancelEditingSuggestion() {
    setEditingSuggestionId(null)
    setMovieQuery('')
    setSelectedSuggestion(null)
    setSuggestions([])
  }

  async function submitJoinSession() {
    const userName = currentUser.trim()
    const targetSession = hasActiveSession ? session?.sessionName ?? sessionInput : sessionInput.trim() || defaultSession

    if (!userName) {
      setError('Informe seu nome para entrar')
      return
    }

    setError(null)
    setIsJoining(true)

    try {
      const state = await requestJson<SessionPayload>('/api/session', {
        method: 'POST',
        body: JSON.stringify({
          sessionName: targetSession,
          userName,
        }),
      })

      setSession(state)
      setSessionInput(state.sessionName)
      setEditingSuggestionId(null)
      setActiveTab('suggestions')
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Erro ao entrar na sessão')
    } finally {
      setIsJoining(false)
    }
  }

  function handleJoinSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasActiveSession) {
      openConfirmation({
        title: 'Criar sessão',
        description: getConfirmationDescription(
          'criar a sessão',
          'vai iniciar uma nova sessão ativa para o grupo',
        ),
        confirmLabel: 'Criar sessão',
        onConfirm: submitJoinSession,
      })
      return
    }

    void submitJoinSession()
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
    setIsAddingMovie(true)

    try {
      const state = await requestJson<SessionPayload>('/api/movies', {
        method: editingSuggestionId ? 'PATCH' : 'POST',
        body: JSON.stringify({
          sessionName,
          userName: currentUser,
          movieId: editingSuggestionId,
          title: selectedSuggestion.title,
          year: selectedSuggestion.year,
          externalId: selectedSuggestion.externalId,
          posterUrl: selectedSuggestion.posterUrl,
        }),
      })

      setSession(state)
      setEditingSuggestionId(null)
      setMovieQuery('')
      setSelectedSuggestion(null)
      setSuggestions([])
    } catch (movieError) {
      setError(movieError instanceof Error ? movieError.message : 'Erro ao salvar sugestão')
    } finally {
      setIsAddingMovie(false)
    }
  }

  async function voteForMovie(movieId: string) {
    if (!currentUser) {
      setError('Entre na sessão para votar')
      return
    }

    setError(null)
    setVotingMovieId(movieId)

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
      setActiveTab('voting')
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : 'Erro ao registrar voto')
    } finally {
      setVotingMovieId(null)
    }
  }

  async function performCloseCurrentRound() {
    if (!session || !currentUser) {
      setError('Entre na sessão para fechar a rodada')
      return
    }

    if (session.ownerName !== currentUser) {
      setError(
        session.ownerName
          ? `Somente ${session.ownerName} pode fechar a rodada`
          : 'Somente o criador da sessão pode fechar a rodada',
      )
      return
    }

    setError(null)
    setIsClosingRound(true)

    try {
      const state = await requestJson<SessionPayload>('/api/round/close', {
        method: 'POST',
        body: JSON.stringify({
          sessionName,
          userName: currentUser,
        }),
      })

      setSession(state)
      setMovieQuery('')
      setSelectedSuggestion(null)
      setSuggestions([])
      setEditingSuggestionId(null)
      setActiveTab('suggestions')
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : 'Erro ao fechar rodada')
    } finally {
      setIsClosingRound(false)
    }
  }

  async function performCancelRound() {
    if (!session || !currentUser) {
      setError('Entre na sessão para cancelar a rodada')
      return
    }

    if (session.ownerName !== currentUser) {
      setError(
        session.ownerName
          ? `Somente ${session.ownerName} pode cancelar a rodada`
          : 'Somente o criador da sessão pode cancelar a rodada',
      )
      return
    }

    setError(null)
    setIsClosingRound(true)

    try {
      const state = await requestJson<SessionPayload>('/api/round/cancel', {
        method: 'POST',
        body: JSON.stringify({
          sessionName,
          userName: currentUser,
        }),
      })

      setSession(state)
      setMovieQuery('')
      setSelectedSuggestion(null)
      setSuggestions([])
      setEditingSuggestionId(null)
      setActiveTab('suggestions')
    } catch (roundError) {
      setError(roundError instanceof Error ? roundError.message : 'Erro ao cancelar rodada')
    } finally {
      setIsClosingRound(false)
    }
  }

  async function performCloseSession() {
    if (!session || !currentUser) {
      setError('Entre na sessão para encerrá-la')
      return
    }

    if (session.ownerName !== currentUser) {
      setError(
        session.ownerName
          ? `Somente ${session.ownerName} pode encerrar a sessão`
          : 'Somente o criador da sessão pode encerrá-la',
      )
      return
    }

    setError(null)
    setIsEndingSession(true)

    try {
      await requestJson<ActiveSessionResponse>('/api/session/close', {
        method: 'POST',
        body: JSON.stringify({
          sessionName: session.sessionName,
          userName: currentUser,
        }),
      })

      setSession(null)
      setSessionInput(defaultSession)
      setMovieQuery('')
      setSelectedSuggestion(null)
      setSuggestions([])
      setEditingSuggestionId(null)
      setActiveTab('suggestions')
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : 'Erro ao encerrar sessão')
    } finally {
      setIsEndingSession(false)
    }
  }

  async function performCancelSession() {
    if (!session || !currentUser) {
      setError('Entre na sessão para cancelá-la')
      return
    }

    if (session.ownerName !== currentUser) {
      setError(
        session.ownerName
          ? `Somente ${session.ownerName} pode cancelar a sessão`
          : 'Somente o criador da sessão pode cancelar a sessão',
      )
      return
    }

    setError(null)
    setIsEndingSession(true)

    try {
      await requestJson<ActiveSessionResponse>('/api/session/cancel', {
        method: 'POST',
        body: JSON.stringify({
          sessionName: session.sessionName,
          userName: currentUser,
        }),
      })

      setSession(null)
      setSessionInput(defaultSession)
      setMovieQuery('')
      setSelectedSuggestion(null)
      setSuggestions([])
      setEditingSuggestionId(null)
      setActiveTab('suggestions')
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : 'Erro ao cancelar sessão')
    } finally {
      setIsEndingSession(false)
    }
  }

  async function performCancelVote() {
    if (!session || !currentUser) {
      setError('Entre na sessão para cancelar seu voto')
      return
    }

    setError(null)
    setVotingMovieId('cancel')

    try {
      const state = await requestJson<SessionPayload>('/api/votes', {
        method: 'DELETE',
        body: JSON.stringify({
          sessionName,
          userName: currentUser,
        }),
      })

      setSession(state)
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : 'Erro ao cancelar voto')
    } finally {
      setVotingMovieId(null)
    }
  }

  function requestCloseCurrentRound() {
    openConfirmation({
      title: 'Fechar rodada',
      description: getConfirmationDescription(
        'fechar a rodada',
        'vai definir o vencedor atual e iniciar a próxima rodada',
      ),
      confirmLabel: 'Fechar rodada',
      onConfirm: performCloseCurrentRound,
    })
  }

  function requestCancelRound() {
    openConfirmation({
      title: 'Cancelar rodada',
      description: getConfirmationDescription(
        'cancelar a rodada',
        'vai apagar os filmes e votos da rodada atual',
      ),
      confirmLabel: 'Cancelar rodada',
      onConfirm: performCancelRound,
    })
  }

  function requestCloseSession() {
    openConfirmation({
      title: 'Encerrar sessão',
      description: getConfirmationDescription(
        'encerrar a sessão',
        'vai finalizar a sessão atual e preservar o histórico dela',
      ),
      confirmLabel: 'Encerrar sessão',
      onConfirm: performCloseSession,
    })
  }

  function requestCancelSession() {
    openConfirmation({
      title: 'Cancelar sessão',
      description: getConfirmationDescription(
        'cancelar a sessão',
        'vai apagar toda a sessão atual, incluindo participantes, filmes, votos e histórico dela',
      ),
      confirmLabel: 'Cancelar sessão',
      onConfirm: performCancelSession,
    })
  }

  function requestCancelVote() {
    openConfirmation({
      title: 'Cancelar voto',
      description: getConfirmationDescription(
        'cancelar seu voto',
        'vai remover seu voto atual da rodada',
      ),
      confirmLabel: 'Cancelar voto',
      onConfirm: performCancelVote,
    })
  }

  return {
    addMovie,
    cancelEditingSuggestion,
    handleJoinSession,
    performCancelRound,
    performCancelSession,
    performCancelVote,
    performCloseCurrentRound,
    performCloseSession,
    requestCancelRound,
    requestCancelSession,
    requestCancelVote,
    requestCloseCurrentRound,
    requestCloseSession,
    startEditingSuggestion,
    submitJoinSession,
    voteForMovie,
  }
}
