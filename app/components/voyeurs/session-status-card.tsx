'use client'

import { LoaderCircle } from 'lucide-react'

import type { SessionPayload } from '@/app/components/voyeurs/voyeurs-types'

type SessionStatusCardProps = {
  session: SessionPayload | null
  currentUser: string
  requestCloseSession: () => void
  requestCancelSession: () => void
  isEndingSession: boolean
  isSessionOwner: boolean
}

export default function SessionStatusCard({
  session,
  currentUser,
  requestCloseSession,
  requestCancelSession,
  isEndingSession,
  isSessionOwner,
}: SessionStatusCardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/6 bg-voyeur-gray p-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Status da sessão</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{session?.sessionName}</h2>
        </div>
        <span className="rounded-full border border-[#1662b8]/35 bg-[#1662b8]/10 px-3 py-1 text-[11px] font-medium text-[#9fc2ec]">
          Rodada {session?.currentRound ?? 1}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/7 bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Sessão</p>
          <p className="mt-2 text-sm font-medium text-white">{session?.sessionName}</p>
        </div>
        <div className="rounded-2xl border border-white/7 bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Rodada atual</p>
          <p className="mt-2 text-sm font-medium text-white">{session?.currentRound ?? 1}</p>
        </div>
        <div className="rounded-2xl border border-white/7 bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Participantes</p>
          <p className="mt-2 text-sm font-medium text-white">{session?.participants.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-white/7 bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Usuário atual</p>
          <p className="mt-2 text-sm font-medium text-white">{currentUser}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 text-sm text-zinc-400">
        Criada por <span className="text-zinc-200">{session?.ownerName ?? 'não definido'}</span>
      </div>

      <button
        type="button"
        onClick={requestCloseSession}
        disabled={isEndingSession || !isSessionOwner}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#d70f19] text-sm font-semibold text-white transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isEndingSession ? (
          <span className="flex items-center gap-2">
            <LoaderCircle className="animate-spin" size={15} />
            Encerrando sessão...
          </span>
        ) : (
          'Encerrar sessão'
        )}
      </button>

      <button
        type="button"
        onClick={requestCancelSession}
        disabled={isEndingSession || !isSessionOwner}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#d70f19]/35 bg-[#d70f19]/10 text-sm font-medium text-[#f8b8bc] transition-colors hover:bg-[#d70f19]/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Cancelar sessão
      </button>

      {!isSessionOwner && (
        <p className="text-sm text-zinc-500">
          Somente <span className="text-zinc-300">{session?.ownerName ?? 'o criador'}</span> pode encerrar a sessão.
        </p>
      )}
    </section>
  )
}
