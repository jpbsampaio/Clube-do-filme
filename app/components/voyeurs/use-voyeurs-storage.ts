'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import type { VoyeursAppProps } from '@/app/components/voyeurs/voyeurs-types'
import {
  getStoredValue,
  removeStoredValue,
  setStoredValue,
} from '@/app/components/voyeurs/voyeurs-utils'

const DEFAULT_SESSION = 'Sess\u00e3o Voyeurs'
const SESSION_STORAGE_KEY = 'voyeurs.sessionName'
const USER_STORAGE_KEY = 'voyeurs.currentUser'

type UseVoyeursStorageProps = {
  view: VoyeursAppProps['view']
  loadHistory: () => Promise<void>
  loadSession: () => Promise<void>
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export default function useVoyeursStorage({
  view,
  loadHistory,
  loadSession,
  setIsLoading,
}: UseVoyeursStorageProps) {
  const [currentUser, setCurrentUser] = useState('')
  const [sessionInput, setSessionInput] = useState(DEFAULT_SESSION)
  const loadHistoryRef = useRef(loadHistory)
  const loadSessionRef = useRef(loadSession)
  const setIsLoadingRef = useRef(setIsLoading)

  useEffect(() => {
    loadHistoryRef.current = loadHistory
    loadSessionRef.current = loadSession
    setIsLoadingRef.current = setIsLoading
  }, [loadHistory, loadSession, setIsLoading])

  useEffect(() => {
    const storedSession = getStoredValue(SESSION_STORAGE_KEY)?.trim()
    const storedUser = getStoredValue(USER_STORAGE_KEY)?.trim()

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionInput(storedSession || DEFAULT_SESSION)

    if (storedUser) {
      setCurrentUser(storedUser)
    }

    if (view === 'photos') {
      setIsLoadingRef.current(false)
      return
    }

    if (view === 'history') {
      void loadHistoryRef.current()
      return
    }

    void loadSessionRef.current()
  }, [view])

  useEffect(() => {
    const cleanSession = sessionInput.trim() || DEFAULT_SESSION
    setStoredValue(SESSION_STORAGE_KEY, cleanSession)
  }, [sessionInput])

  useEffect(() => {
    if (currentUser.trim()) {
      setStoredValue(USER_STORAGE_KEY, currentUser.trim())
      return
    }

    removeStoredValue(USER_STORAGE_KEY)
  }, [currentUser])

  return {
    currentUser,
    setCurrentUser,
    sessionInput,
    setSessionInput,
  }
}
