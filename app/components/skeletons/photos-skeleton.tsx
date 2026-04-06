'use client'

import {
  SkeletonAppFrame,
  SkeletonBlock,
} from '@/app/components/skeletons/skeleton-primitives'

export default function PhotosSkeleton() {
  return (
    <SkeletonAppFrame>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonBlock key={index} className="aspect-[4/5] rounded-xl" />
        ))}
      </div>
    </SkeletonAppFrame>
  )
}
