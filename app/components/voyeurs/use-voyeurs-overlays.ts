'use client'

import { useEffect, useState } from 'react'

import type { AppWinner, ConfirmationDialog } from '@/app/components/voyeurs/voyeurs-types'

export default function useVoyeursOverlays() {
  const [selectedWinner, setSelectedWinner] = useState<AppWinner | null>(null)
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialog | null>(null)
  const [isConfirmingAction, setIsConfirmingAction] = useState(false)

  useEffect(() => {
    if ((!selectedWinner && !confirmationDialog) || typeof document === 'undefined') {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [confirmationDialog, selectedWinner])

  function openWinnerSheet(winner: AppWinner) {
    setSelectedWinner(winner)
  }

  function closeWinnerSheet() {
    setSelectedWinner(null)
  }

  function openConfirmation(dialog: ConfirmationDialog) {
    setConfirmationDialog(dialog)
  }

  function closeConfirmation() {
    if (isConfirmingAction) {
      return
    }

    setConfirmationDialog(null)
  }

  async function handleConfirmAction() {
    if (!confirmationDialog) {
      return
    }

    setIsConfirmingAction(true)

    try {
      await confirmationDialog.onConfirm()
      setConfirmationDialog(null)
    } finally {
      setIsConfirmingAction(false)
    }
  }

  return {
    closeConfirmation,
    closeWinnerSheet,
    confirmationDialog,
    handleConfirmAction,
    isConfirmingAction,
    openConfirmation,
    openWinnerSheet,
    selectedWinner,
  }
}
