import { Skeleton } from "@/components/ui/skeleton";

function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-gitpm-border/25 bg-surface-dark/40 overflow-hidden">
      {/* Thumbnail */}
      <Skeleton className="w-full aspect-video bg-white/5" />
      <div className="p-4 space-y-3">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-2/3 bg-white/5" />
          <Skeleton className="h-4 w-16 bg-white/5 rounded-full" />
        </div>
        {/* Description */}
        <Skeleton className="h-3 w-full bg-white/5" />
        <Skeleton className="h-3 w-4/5 bg-white/5" />
        {/* Pills */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 bg-white/5 rounded-full" />
          <Skeleton className="h-5 w-14 bg-white/5 rounded-full" />
          <Skeleton className="h-5 w-20 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-navy">
      {/* Dark hero header */}
      <div className="bg-navy border-b border-gitpm-border/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Profile header skeleton */}
          <div className="flex items-start gap-4">
            <Skeleton className="h-[72px] w-[72px] rounded-full bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-5 w-40 bg-white/5" />
              <Skeleton className="h-4 w-64 bg-white/5" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-4 w-4 bg-white/5 rounded" />
                <Skeleton className="h-4 w-4 bg-white/5 rounded" />
              </div>
            </div>
          </div>

          {/* Stats row skeleton */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gitpm-border/20 bg-surface-dark/30 px-4 py-3 space-y-1.5">
                <Skeleton className="h-6 w-10 bg-white/5" />
                <Skeleton className="h-3 w-20 bg-white/5" />
              </div>
            ))}
          </div>

          {/* Tools row skeleton */}
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-6 w-20 bg-white/5 rounded-full" />
            <Skeleton className="h-6 w-24 bg-white/5 rounded-full" />
            <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>

      {/* Project grid skeleton */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-3 w-16 bg-white/5 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      </div>
    </div>
  );
}
