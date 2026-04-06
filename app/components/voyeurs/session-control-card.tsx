'use client'

import { LoaderCircle, UserRound } from 'lucide-react'
import type { FormEvent } from 'react'

import type { SessionPayload } from '@/app/components/voyeurs/voyeurs-types'

type SessionControlCardProps = {
  hasActiveSession: boolean
  session: SessionPayload | null
  sessionInput: string
  currentUser: string
  isJoining: boolean
  onSessionInputChange: (value: string) => void
  handleJoinSession: (event: FormEvent<HTMLFormElement>) => void
}

export default function SessionControlCard({
  hasActiveSession,
  session,
  sessionInput,
  currentUser,
  isJoining,
  onSessionInputChange,
  handleJoinSession,
}: SessionControlCardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/6 bg-voyeur-gray p-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
      <div className="flex items-center gap-2">
        <UserRound size={17} className="text-zinc-300" />
        <h2 className="text-sm uppercase tracking-[0.16em] text-zinc-300">Controle de sessão</h2>
      </div>

      <form onSubmit={handleJoinSession} className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Nome da sessão</p>
          <input
            value={hasActiveSession ? session?.sessionName ?? sessionInput : sessionInput}
            onChange={(event) => onSessionInputChange(event.target.value)}
            placeholder="Nome da sessão"
            readOnly={hasActiveSession}
            className="h-12 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none transition-colors focus:border-white/25 read-only:cursor-default read-only:border-white/8 read-only:text-zinc-300"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Usuário</p>
          <div className="flex min-h-12 items-center rounded-xl border border-white/8 bg-black/40 px-3 text-sm font-medium text-white">
            {currentUser || 'Usuário não identificado'}
          </div>
        </div>

        {hasActiveSession ? (
          <div className="rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 text-sm text-zinc-300">
            <p className="font-medium text-white">Já existe uma sessão ativa em andamento</p>
            <p className="mt-1 text-zinc-400">
              Entre em <span className="text-zinc-200">{session?.sessionName}</span> para continuar a rodada atual.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 text-sm text-zinc-400">
            Nenhuma sessão ativa no momento. Defina o nome e crie uma nova sessão.
          </div>
        )}

        <button
          type="submit"
          disabled={isJoining}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition-transform active:scale-[0.99] disabled:opacity-60"
        >
          {isJoining ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin" size={15} />
              Processando...
            </span>
          ) : hasActiveSession ? (
            'Entrar na sessão'
          ) : (
            'Criar sessão'
          )}
        </button>
      </form>
    </section>
  )
}
