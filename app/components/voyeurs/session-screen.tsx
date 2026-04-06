'use client'

import { Film, Vote } from 'lucide-react'
import type { FormEvent } from 'react'

import SessionControlCard from '@/app/components/voyeurs/session-control-card'
import SessionStatusCard from '@/app/components/voyeurs/session-status-card'
import SessionSuggestionsTab from '@/app/components/voyeurs/session-suggestions-tab'
import SessionVotingTab from '@/app/components/voyeurs/session-voting-tab'
import type { AppMovie, MovieSuggestion, SessionPayload } from '@/app/components/voyeurs/voyeurs-types'

type SessionScreenProps = {
  hasJoinedSession: boolean
  hasActiveSession: boolean
  session: SessionPayload | null
  sessionInput: string
  currentUser: string
  isJoining: boolean
  onSessionInputChange: (value: string) => void
  handleJoinSession: (event: FormEvent<HTMLFormElement>) => void
  isEndingSession: boolean
  isSessionOwner: boolean
  requestCloseSession: () => void
  requestCancelSession: () => void
  activeTab: 'suggestions' | 'voting'
  onActiveTabChange: (tab: 'suggestions' | 'voting') => void
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
  userVote: string | undefined
  votingMovieId: string | null
  movies: AppMovie[]
  voteCountByMovie: Record<string, number>
  voteForMovie: (movieId: string) => Promise<void>
  requestCancelVote: () => void
  requestCloseCurrentRound: () => void
  requestCancelRound: () => void
  isClosingRound: boolean
}

export default function SessionScreen({
  hasJoinedSession,
  hasActiveSession,
  session,
  sessionInput,
  currentUser,
  isJoining,
  onSessionInputChange,
  handleJoinSession,
  isEndingSession,
  isSessionOwner,
  requestCloseSession,
  requestCancelSession,
  activeTab,
  onActiveTabChange,
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
  userVote,
  votingMovieId,
  movies,
  voteCountByMovie,
  voteForMovie,
  requestCancelVote,
  requestCloseCurrentRound,
  requestCancelRound,
  isClosingRound,
}: SessionScreenProps) {
  return !hasJoinedSession ? (
    <SessionControlCard
      hasActiveSession={hasActiveSession}
      session={session}
      sessionInput={sessionInput}
      currentUser={currentUser}
      isJoining={isJoining}
      onSessionInputChange={onSessionInputChange}
      handleJoinSession={handleJoinSession}
    />
  ) : (
    <>
      <SessionStatusCard
        session={session}
        currentUser={currentUser}
        requestCloseSession={requestCloseSession}
        requestCancelSession={requestCancelSession}
        isEndingSession={isEndingSession}
        isSessionOwner={isSessionOwner}
      />

      <section className="space-y-4 rounded-2xl border border-white/6 bg-voyeur-gray p-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Ações da rodada</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Sugestões e votação</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/7 bg-black/25 p-1">
          <button
            type="button"
            onClick={() => onActiveTabChange('suggestions')}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Film size={16} />
            Sugestões
          </button>
          <button
            type="button"
            onClick={() => onActiveTabChange('voting')}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'voting'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Vote size={16} />
            Votação
          </button>
        </div>

        {activeTab === 'suggestions' ? (
          <SessionSuggestionsTab
            addMovie={addMovie}
            movieQuery={movieQuery}
            onMovieQueryChange={onMovieQueryChange}
            alreadyAddedMovie={alreadyAddedMovie}
            isEditingSuggestion={isEditingSuggestion}
            isAddingMovie={isAddingMovie}
            isSearching={isSearching}
            suggestions={suggestions}
            selectedSuggestion={selectedSuggestion}
            onSelectSuggestion={onSelectSuggestion}
            canReplaceOwnSuggestion={canReplaceOwnSuggestion}
            ownMovie={ownMovie}
            startEditingSuggestion={startEditingSuggestion}
            cancelEditingSuggestion={cancelEditingSuggestion}
          />
        ) : (
          <SessionVotingTab
            userVote={userVote}
            session={session}
            requestCancelVote={requestCancelVote}
            votingMovieId={votingMovieId}
            movies={movies}
            currentUser={currentUser}
            voteCountByMovie={voteCountByMovie}
            voteForMovie={voteForMovie}
            requestCloseCurrentRound={requestCloseCurrentRound}
            requestCancelRound={requestCancelRound}
            isClosingRound={isClosingRound}
            isSessionOwner={isSessionOwner}
          />
        )}
      </section>
    </>
  )
}
