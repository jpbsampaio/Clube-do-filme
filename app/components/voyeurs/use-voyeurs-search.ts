'use client'

import { useEffect, useState } from 'react'

import type { MovieSuggestion, VoyeursAppProps } from '@/app/components/voyeurs/voyeurs-types'
import { requestJson } from '@/app/components/voyeurs/voyeurs-utils'

type UseVoyeursSearchProps = {
  hasJoinedSession: boolean
  view: VoyeursAppProps['view']
}

export default function useVoyeursSearch({ hasJoinedSession, view }: UseVoyeursSearchProps) {
  const [movieQuery, setMovieQuery] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<MovieSuggestion | null>(null)
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (view !== 'main' || !hasJoinedSession) {
      setSuggestions([])
      return
    }

    const query = movieQuery.trim()

    if (query.length < 2 || selectedSuggestion) {
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
  }, [hasJoinedSession, movieQuery, selectedSuggestion, view])

  return {
    movieQuery,
    setMovieQuery,
    selectedSuggestion,
    setSelectedSuggestion,
    suggestions,
    setSuggestions,
    isSearching,
  }
}
