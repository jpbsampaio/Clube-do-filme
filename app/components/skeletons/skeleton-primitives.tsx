'use client'

type SkeletonBlockProps = {
  className?: string
}

export function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.08] ${className}`} />
}

export function SkeletonLogo({ large = false }: { large?: boolean }) {
  return large ? (
    <div className="flex flex-col items-center gap-4">
      <SkeletonBlock className="h-[132px] w-[132px] rounded-[2rem] bg-white/[0.09]" />
      <SkeletonBlock className="h-6 w-32 rounded-full bg-white/[0.09]" />
    </div>
  ) : (
    <div className="inline-flex items-center justify-center gap-2.5">
      <SkeletonBlock className="h-8 w-8 rounded-lg bg-white/[0.09]" />
      <SkeletonBlock className="h-6 w-28 rounded-full bg-white/[0.09]" />
    </div>
  )
}

export function SkeletonTopGradient() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-1"
      style={{ backgroundImage: 'var(--header-identity-gradient)' }}
    />
  )
}

export function SkeletonCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-white/6 bg-voyeur-gray p-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)] ${className}`}>
      {children}
    </section>
  )
}

export function SkeletonNavbar({
  active,
}: {
  active: 'session' | 'history' | 'photos'
}) {
  const items = [
    { id: 'session', width: 'w-6', labelWidth: 'w-12' },
    { id: 'history', width: 'w-6', labelWidth: 'w-14' },
    { id: 'photos', width: 'w-6', labelWidth: 'w-10' },
  ] as const

  return (
    <nav className="absolute inset-x-0 bottom-0 z-10">
      <div
        className="relative overflow-hidden bg-[var(--header-background)] shadow-[0_-8px_24px_rgba(0,0,0,0.22)]"
        style={{
          height: 'calc(68px + max(env(safe-area-inset-bottom), 0px))',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        }}
      >
        <ul className="grid h-[68px] grid-cols-3">
          {items.map((item) => {
            const isActive = item.id === active

            return (
              <li key={item.id} className="flex h-full flex-col items-center justify-center gap-1.5">
                <SkeletonBlock
                  className={`${item.width} h-6 rounded-full ${isActive ? 'bg-white/[0.18]' : 'bg-white/[0.08]'}`}
                />
                <SkeletonBlock
                  className={`${item.labelWidth} h-3 rounded-full ${isActive ? 'bg-white/[0.16]' : 'bg-white/[0.08]'}`}
                />
                <SkeletonBlock
                  className={`${isActive ? 'w-9 bg-white/[0.18]' : 'w-7 bg-white/[0.08]'} h-[2px] rounded-full`}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export function SkeletonAppFrame({ children }: { children: React.ReactNode }) {
  return <div className="space-y-0">{children}</div>
}
