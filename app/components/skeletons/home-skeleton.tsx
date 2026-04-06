'use client'

import { SkeletonBlock, SkeletonLogo } from '@/app/components/skeletons/skeleton-primitives'

export default function HomeSkeleton() {
  return (
    <div className="fixed inset-y-0 left-1/2 z-[90] flex w-full max-w-md -translate-x-1/2 overflow-hidden bg-[var(--header-background)]">
      <div className="absolute inset-x-0 top-0 h-[36vh] min-h-[236px]">
        <div
          className="absolute inset-0 rounded-b-[64px]"
          style={{ backgroundImage: 'var(--header-identity-gradient)' }}
        />
        <div className="absolute inset-0 rounded-b-[64px] bg-black/55" />
        <div className="absolute -bottom-[84px] left-1/2 h-[156px] w-[130%] -translate-x-1/2 rounded-[50%] bg-[var(--header-background)]" />
      </div>

      <div className="absolute inset-x-6 top-[clamp(80px,16vh,124px)] h-28 rounded-full bg-white/6 blur-3xl" />

      <div className="relative flex min-h-screen w-full flex-col px-6 pb-10 pt-10">
        <div className="flex flex-1 flex-col items-center justify-center">
          <SkeletonLogo large />

          <div className="mt-10 w-full space-y-3">
            <SkeletonBlock className="h-12 w-full rounded-xl" />
            <SkeletonBlock className="h-12 w-full rounded-xl bg-white/[0.12]" />
          </div>
        </div>
      </div>
    </div>
  )
}
