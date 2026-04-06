'use client'

import { useState } from 'react'

import PhotosGallery from '@/app/components/photos-gallery'
import ConfirmationModal from '@/app/components/voyeurs/confirmation-modal'
import HistoryScreen from '@/app/components/voyeurs/history-screen'
import HistorySkeleton from '@/app/components/skeletons/history-skeleton'
import SessionSkeleton from '@/app/components/skeletons/session-skeleton'
import useVoyeursActions from '@/app/components/voyeurs/use-voyeurs-actions'
import SessionScreen from '@/app/components/voyeurs/session-screen'
import useVoyeursDerivedState from '@/app/components/voyeurs/use-voyeurs-derived-state'
import useVoyeursHistory from '@/app/components/voyeurs/use-voyeurs-history'
import useVoyeursOverlays from '@/app/components/voyeurs/use-voyeurs-overlays'
import useVoyeursSearch from '@/app/components/voyeurs/use-voyeurs-search'
import useVoyeursStorage from '@/app/components/voyeurs/use-voyeurs-storage'
import WinnerDetailsModal from '@/app/components/voyeurs/winner-details-modal'
import type {
  ActiveSessionResponse,
  SessionPayload,
  VoyeursAppProps,
} from '@/app/components/voyeurs/voyeurs-types'
import {
  formatDateTime,
  getAdaptiveFontSize,
  requestJson,
} from '@/app/components/voyeurs/voyeurs-utils'

const DEFAULT_SESSION = 'Sess\u00e3o Voyeurs'

export default function VoyeursApp({ view }: VoyeursAppProps) {
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'voting'>('suggestions')
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(view !== 'photos')
  const [isJoining, setIsJoining] = useState(false)
  const [isAddingMovie, setIsAddingMovie] = useState(false)
  const [isClosingRound, setIsClosingRound] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)
  const [votingMovieId, setVotingMovieId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadSession() {
    setIsLoading(true)
    setError(null)

    try {
      const data = await requestJson<ActiveSessionResponse>('/api/session')
      setSession(data.activeSession)
      setEditingSuggestionId(null)

      if (data.activeSession) {
        setSessionInput(data.activeSession.sessionName)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar sessão')
    } finally {
      setIsLoading(false)
    }
  }

  const { historySessions, loadHistory } = useVoyeursHistory({
    setError,
    setIsLoading,
  })

  const {
    closeConfirmation,
    closeWinnerSheet,
    confirmationDialog,
    handleConfirmAction,
    isConfirmingAction,
    openConfirmation,
    openWinnerSheet,
    selectedWinner,
  } = useVoyeursOverlays()

  const { currentUser, sessionInput, setSessionInput } = useVoyeursStorage({
    view,
    loadHistory,
    loadSession,
    setIsLoading,
  })

  const {
    alreadyAddedMovie,
    allHistoryWinners,
    canReplaceOwnSuggestion,
    hasActiveSession,
    hasJoinedSession,
    isEditingSuggestion,
    isSessionOwner,
    movies,
    ownMovie,
    sessionName,
    userVote,
    voteCountByMovie,
  } = useVoyeursDerivedState({
    currentUser,
    editingSuggestionId,
    historySessions,
    session,
    sessionInput,
    defaultSession: DEFAULT_SESSION,
  })

  const {
    movieQuery,
    setMovieQuery,
    selectedSuggestion,
    setSelectedSuggestion,
    suggestions,
    setSuggestions,
    isSearching,
  } = useVoyeursSearch({
    hasJoinedSession,
    view,
  })

  const {
    addMovie,
    cancelEditingSuggestion,
    handleJoinSession,
    requestCancelRound,
    requestCancelSession,
    requestCancelVote,
    requestCloseCurrentRound,
    requestCloseSession,
    startEditingSuggestion,
    voteForMovie,
  } = useVoyeursActions({
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
    defaultSession: DEFAULT_SESSION,
  })

  const isWaitingForMain = view === 'main' && isLoading && !session
  const isWaitingForHistory = view === 'history' && isLoading && historySessions === null

  if (isWaitingForMain || isWaitingForHistory) {
    return view === 'history' ? <HistorySkeleton /> : <SessionSkeleton />
  }

  return (
    <div className="space-y-6 pb-3">
      {view === 'main' && (
        <SessionScreen
          hasJoinedSession={hasJoinedSession}
          hasActiveSession={hasActiveSession}
          session={session}
          sessionInput={sessionInput}
          currentUser={currentUser}
          isJoining={isJoining}
          onSessionInputChange={setSessionInput}
          handleJoinSession={handleJoinSession}
          isEndingSession={isEndingSession}
          isSessionOwner={isSessionOwner}
          requestCloseSession={requestCloseSession}
          requestCancelSession={requestCancelSession}
          activeTab={activeTab}
          onActiveTabChange={(tab) => setActiveTab(tab)}
          addMovie={addMovie}
          movieQuery={movieQuery}
          onMovieQueryChange={(value) => {
            setMovieQuery(value)
            setSelectedSuggestion(null)
          }}
          alreadyAddedMovie={alreadyAddedMovie}
          isEditingSuggestion={isEditingSuggestion}
          isAddingMovie={isAddingMovie}
          isSearching={isSearching}
          suggestions={suggestions}
          selectedSuggestion={selectedSuggestion}
          onSelectSuggestion={(suggestion) => {
            setSelectedSuggestion(suggestion)
            setMovieQuery(`${suggestion.title}${suggestion.year ? ` (${suggestion.year})` : ''}`)
            setSuggestions([])
          }}
          canReplaceOwnSuggestion={canReplaceOwnSuggestion}
          ownMovie={ownMovie}
          startEditingSuggestion={startEditingSuggestion}
          cancelEditingSuggestion={cancelEditingSuggestion}
          userVote={userVote}
          votingMovieId={votingMovieId}
          movies={movies}
          voteCountByMovie={voteCountByMovie}
          voteForMovie={voteForMovie}
          requestCancelVote={requestCancelVote}
          requestCloseCurrentRound={requestCloseCurrentRound}
          requestCancelRound={requestCancelRound}
          isClosingRound={isClosingRound}
        />
      )}

      {view === 'history' && (
        <HistoryScreen
          allHistoryWinners={allHistoryWinners}
          getAdaptiveFontSize={getAdaptiveFontSize}
          formatDateTime={formatDateTime}
          openWinnerSheet={openWinnerSheet}
        />
      )}

      {view === 'photos' && (
        <section className="space-y-3 pt-2">
          <PhotosGallery />
        </section>
      )}

      <WinnerDetailsModal selectedWinner={selectedWinner} onClose={closeWinnerSheet} />

      <ConfirmationModal
        confirmationDialog={confirmationDialog}
        isConfirmingAction={isConfirmingAction}
        onClose={closeConfirmation}
        onConfirm={handleConfirmAction}
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-900/30 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}

