'use client'

import {
  SkeletonAppFrame,
  SkeletonBlock,
} from '@/app/components/skeletons/skeleton-primitives'

export default function HistorySkeleton() {
  return (
    <SkeletonAppFrame>
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, index, items) => {
          const isLatest = index === 0
          const isLast = index === items.length - 1

          return (
            <article key={index} className="grid grid-cols-[22px_minmax(0,1fr)] gap-4">
              <div className="relative flex justify-center">
                {isLatest && <span aria-hidden="true" className="absolute top-[-18px] h-[29px] w-[2px] -translate-x-1/2 bg-white/30" />}
                {!isLatest && <span aria-hidden="true" className="absolute top-[-20px] h-[31px] w-[2px] -translate-x-1/2 bg-white/18" />}
                {!isLast && <span aria-hidden="true" className="absolute bottom-[-20px] top-[11px] w-[2px] -translate-x-1/2 bg-white/18" />}
                <span
                  aria-hidden="true"
                  className={`relative z-10 h-[22px] w-[22px] rounded-full border-4 border-white ${isLatest ? 'bg-white/24' : 'bg-white/14'}`}
                />
              </div>

              <div className={`rounded-2xl border p-4 ${isLatest ? 'border-white/14 bg-zinc-950/95' : 'border-white/7 bg-black/40'}`}>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <SkeletonBlock className="h-24 w-[72px] shrink-0 rounded-xl" />

                    <div className="min-w-0 flex min-h-24 flex-1 flex-col justify-between gap-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <SkeletonBlock className="h-6 w-32 rounded-full" />
                          <SkeletonBlock className="h-4 w-10 rounded-full" />
                        </div>
                        <SkeletonBlock className="h-4 w-28 rounded-full" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <SkeletonBlock className="h-4 w-24 rounded-full" />
                          <SkeletonBlock className={`h-4 w-20 rounded-full ${isLatest ? 'bg-white/[0.16]' : ''}`} />
                        </div>
                        <SkeletonBlock className="h-4 w-32 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </SkeletonAppFrame>
  )
}
