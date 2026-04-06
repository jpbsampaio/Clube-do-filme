export type AppMovie = {
  id: string
  title: string
  year: number | null
  addedBy: string
  posterUrl: string | null
}

export type AppWinner = {
  id: string
  title: string
  year: number | null
  sessionName: string
  suggestedBy: string
  posterUrl: string | null
  votes: number
  finishedAt: string
  roundNumber: number
  voterNames: string[]
  roundMovies: Array<{
    title: string
    suggestedBy: string
  }>
}

export type HistorySession = {
  sessionName: string
  currentRound: number
  winners: AppWinner[]
}

export type HistoryPayload = {
  sessions: HistorySession[]
}

export type SessionPayload = {
  sessionName: string
  currentRound: number
  ownerName: string | null
  participants: string[]
  movies: AppMovie[]
  votes: Record<string, string>
  winners: AppWinner[]
}

export type ActiveSessionResponse = {
  activeSession: SessionPayload | null
}

export type ConfirmationDialog = {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<void> | void
}

export type MovieSuggestion = {
  externalId: string
  title: string
  year: number | null
  posterUrl: string | null
}

export type VoyeursAppProps = {
  view: 'main' | 'history' | 'photos'
}
