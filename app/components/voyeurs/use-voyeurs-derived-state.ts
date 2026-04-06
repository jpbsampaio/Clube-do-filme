'use client'

import { useMemo } from 'react'

import type { HistorySession, SessionPayload } from '@/app/components/voyeurs/voyeurs-types'

type UseVoyeursDerivedStateProps = {
  currentUser: string
  editingSuggestionId: string | null
  historySessions: HistorySession[] | null
  session: SessionPayload | null
  sessionInput: string
  defaultSession: string
}

export default function useVoyeursDerivedState({
  currentUser,
  editingSuggestionId,
  historySessions,
  session,
  sessionInput,
  defaultSession,
}: UseVoyeursDerivedStateProps) {
  const sessionName = session?.sessionName ?? (sessionInput.trim() || defaultSession)
  const hasActiveSession = Boolean(session)
  const hasJoinedSession = Boolean(session && currentUser && session.participants.includes(currentUser))
  const isSessionOwner = Boolean(session && currentUser && session.ownerName === currentUser)
  const userVote = session?.votes[currentUser]
  const movies = session?.movies ?? []
  const ownMovie = session?.movies.find((movie) => movie.addedBy === currentUser) ?? null
  const roundVoteCount = session ? Object.keys(session.votes).length : 0
  const canReplaceOwnSuggestion = Boolean(ownMovie && roundVoteCount === 0)
  const isEditingSuggestion = Boolean(editingSuggestionId)

  const alreadyAddedMovie = useMemo(() => {
    if (!session || !currentUser) {
      return false
    }

    return session.movies.some((movie) => movie.addedBy === currentUser)
  }, [session, currentUser])

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

  const allHistoryWinners = useMemo(() => {
    return (historySessions ?? [])
      .flatMap((historySession) => historySession.winners)
      .sort((left, right) => new Date(right.finishedAt).getTime() - new Date(left.finishedAt).getTime())
  }, [historySessions])

  return {
    alreadyAddedMovie,
    allHistoryWinners,
    canReplaceOwnSuggestion,
    hasActiveSession,
    hasJoinedSession,
    isEditingSuggestion,
    isSessionOwner,
    movies,
    ownMovie,
    roundVoteCount,
    sessionName,
    userVote,
    voteCountByMovie,
  }
}
