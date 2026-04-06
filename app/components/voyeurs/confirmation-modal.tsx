'use client'

import { LoaderCircle } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { ConfirmationDialog } from '@/app/components/voyeurs/voyeurs-types'

type ConfirmationModalProps = {
  confirmationDialog: ConfirmationDialog | null
  isConfirmingAction: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function ConfirmationModal({
  confirmationDialog,
  isConfirmingAction,
  onClose,
  onConfirm,
}: ConfirmationModalProps) {
  if (!confirmationDialog || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[145] flex items-center justify-center overscroll-contain px-4 py-6">
      <button
        type="button"
        aria-label="Fechar confirmação"
        onClick={onClose}
        className="absolute inset-0 bg-black/78 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-sm rounded-[28px] border border-white/10 bg-[#111111] px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.4)]">
        <div className="mx-auto flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d70f19]/25 bg-[#d70f19]/10">
            <span className="text-lg font-semibold text-[#f4b2b6]">!</span>
          </div>
          <p className="mt-4 text-center text-lg font-semibold text-white">{confirmationDialog.title}</p>
          <p className="mt-2 text-center text-sm leading-6 text-zinc-300">
            {confirmationDialog.description}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirmingAction}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-sm font-medium text-white transition-colors hover:bg-black/40 disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmingAction}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#d70f19] text-sm font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-50"
          >
            {isConfirmingAction ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="animate-spin" size={15} />
                Confirmando...
              </span>
            ) : (
              confirmationDialog.confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
