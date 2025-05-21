import { Skeleton } from "@/components/ui/skeleton"

export function MessageSkeleton() {
  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          {/* Avatar skeleton */}
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />

          {/* Message content skeleton */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
