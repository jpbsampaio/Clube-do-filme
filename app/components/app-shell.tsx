'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FormEvent, startTransition, useEffect, useState } from 'react'

import BottomNav from '@/app/components/bottom-nav'
import HomeSkeleton from '@/app/components/skeletons/home-skeleton'

const USER_STORAGE_KEY = 'voyeurs.currentUser'
const USER_COOKIE_KEY = 'voyeurs.currentUser'
const ENTRY_TRANSITION_MS = 760

function readCookie(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const prefix = `${name}=`
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.slice(prefix.length))
}

function persistUser(userName: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${USER_COOKIE_KEY}=${encodeURIComponent(userName)}; Path=/; Max-Age=31536000; SameSite=Lax`
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, userName)
    } catch {
      // Ignore storage failures and keep cookie persistence working.
    }
  }
}

function clearPersistedUser() {
  if (typeof document !== 'undefined') {
    document.cookie = `${USER_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(USER_STORAGE_KEY)
    } catch {
      // Ignore storage failures and continue.
    }
  }
}

type AppShellProps = {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'intro' | 'transition' | 'app'>('checking')
  const [entryName, setEntryName] = useState('')
  const [entryError, setEntryError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAppVisible, setIsAppVisible] = useState(false)

  useEffect(() => {
    const storedUser = readCookie(USER_COOKIE_KEY)?.trim()

    const frameId = requestAnimationFrame(() => {
      if (storedUser) {
        persistUser(storedUser)
        setIsAppVisible(true)
        setStatus('app')
        return
      }

      clearPersistedUser()
      setStatus('intro')
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    if (status !== 'transition') {
      return
    }

    const frameId = requestAnimationFrame(() => {
      setIsAppVisible(true)
    })

    const timeoutId = window.setTimeout(() => {
      setStatus('app')
      setIsSubmitting(false)
    }, ENTRY_TRANSITION_MS)

    return () => {
      cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [status])

  function handleEntrySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const userName = entryName.trim()
    if (!userName) {
      setEntryError('Digite seu nome para continuar')
      return
    }

    persistUser(userName)
    setIsSubmitting(true)
    setEntryError(null)
    setIsAppVisible(false)
    setStatus('transition')

    startTransition(() => {
      if (pathname !== '/') {
        router.replace('/')
      }
    })
  }

  const showAppShell = status === 'app' || status === 'transition'
  const showIntro = status === 'intro' || status === 'transition'

  return (
    <>
      {showAppShell ? (
        <div
          className={`min-h-screen flex flex-col transition-opacity ${isAppVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <header
            className={`sticky top-0 z-40 overflow-hidden bg-[var(--header-background)] shadow-[0_2px_10px_rgba(0,0,0,0.16)] transition-all ${
              isAppVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
            style={{
              transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1"
              style={{ backgroundImage: 'var(--header-identity-gradient)' }}
            />
            <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 pt-1">
              <div aria-hidden="true" />
              <Link
                href="/"
                className="col-start-2 inline-flex items-center justify-center gap-2.5 rounded-md py-1 transition-opacity duration-200 hover:opacity-95"
                aria-label="Voyeurs"
              >
                <Image
                  src="/voyeursColorido.png"
                  alt="Voyeurs Logo"
                  width={32}
                  height={32}
                  priority
                  className="h-8 w-8 shrink-0 object-contain"
                />
                <h1
                  className="text-[1.7rem] font-semibold uppercase leading-none tracking-[0.06em] text-white"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                >
                  VOYEURS
                </h1>
              </Link>
              <div aria-hidden="true" />
            </div>
          </header>

          <main
            className={`flex-1 px-4 pt-3 pb-28 transition-all ${
              isAppVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{
              transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {children}
          </main>

          <div
            className={`transition-opacity ${isAppVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <BottomNav />
          </div>
        </div>
      ) : status === 'checking' ? (
        <HomeSkeleton />
      ) : (
        <div className="min-h-screen bg-[var(--header-background)]" />
      )}

      {showIntro && (
        <div
          className={`fixed inset-y-0 left-1/2 z-[90] flex w-full max-w-md -translate-x-1/2 overflow-hidden bg-[var(--header-background)] transition-all ${
            status === 'transition' ? 'pointer-events-none scale-[1.02] opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div
            className={`absolute inset-x-0 top-0 h-[36vh] min-h-[236px] transition-all ${
              status === 'transition' ? '-translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
            }`}
            style={{
              transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              className="absolute inset-0 rounded-b-[64px]"
              style={{ backgroundImage: 'var(--header-identity-gradient)' }}
            />
            <div
              className={`absolute inset-0 rounded-b-[64px] transition-opacity ${
                status === 'transition' ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                backgroundColor: 'rgba(0,0,0,0.58)',
              }}
            />
            <div className="absolute -bottom-[84px] left-1/2 h-[156px] w-[130%] -translate-x-1/2 rounded-[50%] bg-[var(--header-background)]" />
          </div>
          <div className="absolute inset-x-6 top-[clamp(80px,16vh,124px)] h-28 rounded-full bg-white/6 blur-3xl" />

          <div className="relative flex min-h-screen w-full flex-col px-6 pb-10 pt-10">
            <div className="flex flex-1 flex-col items-center justify-center">
              <Image
                src="/voyeursColoridoCompleto.png"
                alt="Voyeurs"
                width={302}
                height={170}
                priority
                className={`h-auto w-[min(78vw,302px)] max-w-full transition-all ${
                  status === 'transition' ? '-translate-y-8 scale-[0.82] opacity-0' : 'translate-y-0 scale-100 opacity-100'
                }`}
                style={{
                  transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />

              <form
                onSubmit={handleEntrySubmit}
                className={`mt-10 w-full space-y-3 transition-all delay-75 ${
                  status === 'transition' ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
                }`}
                style={{
                  transitionDuration: `${ENTRY_TRANSITION_MS}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <input
                  value={entryName}
                  onChange={(event) => setEntryName(event.target.value)}
                  placeholder="Digite seu nome"
                  autoComplete="name"
                  className="h-12 w-full rounded-xl border border-white/20 bg-black/45 px-4 text-base text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-[#1662b8]"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-[#d70f19] text-base font-semibold text-white transition-all duration-200 active:scale-[0.99] disabled:opacity-70"
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>

                {entryError && (
                  <p className="text-sm text-red-300">{entryError}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
