'use client'

import type { CSSProperties } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
  gradientPosition: string
  maskImage: string
  OutlineIcon: ({ color }: { color: string }) => React.JSX.Element
}

const labelFontStyle = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

function createMaskImage(svgPath: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">${svgPath}</svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

const sessionMaskImage = createMaskImage(
  '<path fill-rule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5ZM6.76 18.193a7.243 7.243 0 0 1 10.48 0 8.25 8.25 0 1 0-10.48 0ZM12 6.75a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" clip-rule="evenodd" />',
)

const historyMaskImage = createMaskImage(
  '<path fill-rule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5ZM12.75 7.5a.75.75 0 0 0-1.5 0v4.81c0 .199.079.39.22.53l2.25 2.25a.75.75 0 1 0 1.06-1.06l-2.03-2.03V7.5Z" clip-rule="evenodd" />',
)

const photosMaskImage = createMaskImage(
  '<path fill-rule="evenodd" d="M1.5 6A2.25 2.25 0 0 1 3.75 3.75h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6Zm16.5 2.25a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM6.31 17.47a.75.75 0 0 0 .53.22h10.94a.75.75 0 0 0 .53-1.28l-3.53-3.53a.75.75 0 0 0-1.06 0l-1.22 1.22-1.72-1.72a.75.75 0 0 0-1.06 0L5.78 16.4a.75.75 0 0 0 .53 1.28Z" clip-rule="evenodd" />',
)

function SessionOutlineIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden="true">
      <path
        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.964 0a9 9 0 1 0-11.964 0m11.964 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HistoryOutlineIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden="true">
      <path
        d="M12 6v6l4 2.25m6-2.25a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PhotosOutlineIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden="true">
      <path
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 17.25V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5A2.25 2.25 0 0 1 18.75 19.5H5.25A2.25 2.25 0 0 1 3 17.25Zm14.25-7.5h.008v.008h-.008V9.75Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GradientMaskIcon({ gradientPosition, maskImage }: { gradientPosition: string; maskImage: string }) {
  const style: CSSProperties = {
    backgroundImage: 'var(--header-identity-gradient)',
    backgroundSize: '300% 100%',
    backgroundPosition: gradientPosition,
    backgroundRepeat: 'no-repeat',
    WebkitMaskImage: maskImage,
    maskImage,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  }

  return <span className="block h-[22px] w-[22px]" style={style} aria-hidden="true" />
}

const items: NavItem[] = [
  {
    href: '/',
    label: 'Sessão',
    gradientPosition: '0% 50%',
    maskImage: sessionMaskImage,
    OutlineIcon: SessionOutlineIcon,
  },
  {
    href: '/historicos',
    label: 'Histórico',
    gradientPosition: '50% 50%',
    maskImage: historyMaskImage,
    OutlineIcon: HistoryOutlineIcon,
  },
  {
    href: '/fotos',
    label: 'Fotos',
    gradientPosition: '100% 50%',
    maskImage: photosMaskImage,
    OutlineIcon: PhotosOutlineIcon,
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2">
      <div
        className="relative overflow-hidden bg-[var(--header-background)] shadow-[0_-8px_24px_rgba(0,0,0,0.22)]"
        style={{
          height: 'calc(68px + max(env(safe-area-inset-bottom), 0px))',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        }}
      >
        <ul className="relative grid h-[68px] grid-cols-3">
          {items.map((item) => {
            const isActive = pathname === item.href
            const gradientStyle: CSSProperties = {
              backgroundImage: 'var(--header-identity-gradient)',
              backgroundSize: '300% 100%',
              backgroundPosition: item.gradientPosition,
              backgroundRepeat: 'no-repeat',
            }

            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative flex h-full flex-col items-center justify-center gap-1.5 transition-all duration-200 ease-out"
                >
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
                        isActive ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
                      }`}
                      style={{ opacity: isActive ? 0 : 1 }}
                    >
                      <item.OutlineIcon color="#ffffff" />
                    </span>

                    <span
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
                        isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                      }`}
                    >
                      <GradientMaskIcon
                        gradientPosition={item.gradientPosition}
                        maskImage={item.maskImage}
                      />
                    </span>
                  </span>

                  <span
                    className={`text-[12px] leading-none transition-all duration-200 ease-out ${
                      isActive ? 'font-bold text-transparent bg-clip-text' : 'font-semibold text-white'
                    }`}
                    style={isActive ? { ...labelFontStyle, ...gradientStyle } : labelFontStyle}
                  >
                    {item.label}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full transition-all duration-200 ease-out ${
                      isActive ? 'w-9 opacity-100' : 'w-7 opacity-100'
                    }`}
                    style={isActive ? gradientStyle : { backgroundColor: '#ffffff' }}
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
