'use client'

import {
  SkeletonAppFrame,
  SkeletonBlock,
  SkeletonCard,
} from '@/app/components/skeletons/skeleton-primitives'

export default function SessionSkeleton() {
  return (
    <SkeletonAppFrame>
      <div className="space-y-4">
        <SkeletonCard>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-24 rounded-full" />
                <SkeletonBlock className="h-7 w-40 rounded-full" />
              </div>
              <SkeletonBlock className="h-8 w-20 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-2xl border border-white/7 bg-black/25 p-3"
                >
                  <SkeletonBlock className="h-3 w-16 rounded-full" />
                  <SkeletonBlock className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/7 bg-black/25 p-3">
              <SkeletonBlock className="h-4 w-32 rounded-full" />
            </div>

            <div className="space-y-2">
              <SkeletonBlock className="h-12 w-full rounded-xl bg-white/[0.12]" />
              <SkeletonBlock className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </SkeletonCard>

        <SkeletonCard>
          <div className="space-y-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-24 rounded-full" />
              <SkeletonBlock className="h-7 w-44 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/7 bg-black/25 p-1">
              <SkeletonBlock className="h-11 w-full rounded-xl bg-white/[0.14]" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>

            <SkeletonBlock className="h-12 w-full rounded-xl" />
            <SkeletonBlock className="h-12 w-full rounded-xl bg-white/[0.12]" />

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-2xl border border-white/7 bg-black/25 p-3"
                >
                  <div className="flex items-start gap-3">
                    <SkeletonBlock className="h-16 w-12 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <SkeletonBlock className="h-5 w-3/4 rounded-full" />
                      <SkeletonBlock className="h-4 w-1/2 rounded-full" />
                    </div>
                  </div>
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </SkeletonCard>
      </div>
    </SkeletonAppFrame>
  )
}
