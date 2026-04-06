'use client'

import { Dispatch, SetStateAction, useState } from 'react'

import type { HistoryPayload, HistorySession } from '@/app/components/voyeurs/voyeurs-types'
import { requestJson } from '@/app/components/voyeurs/voyeurs-utils'

type UseVoyeursHistoryProps = {
  setError: Dispatch<SetStateAction<string | null>>
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export default function useVoyeursHistory({
  setError,
  setIsLoading,
}: UseVoyeursHistoryProps) {
  const [historySessions, setHistorySessions] = useState<HistorySession[] | null>(null)

  async function loadHistory() {
    setIsLoading(true)
    setError(null)

    try {
      const data = await requestJson<HistoryPayload>('/api/history')
      setHistorySessions(data.sessions)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar histórico')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    historySessions,
    loadHistory,
  }
}
