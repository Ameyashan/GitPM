import { Skeleton } from "@/components/ui/skeleton";

function ProjectRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gitpm-border/30 bg-surface-dark/30 px-4 py-3">
      <Skeleton className="h-10 w-16 rounded bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-48 bg-white/5" />
        <Skeleton className="h-3 w-24 bg-white/5" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16 bg-white/5 rounded-full" />
        <Skeleton className="h-7 w-7 bg-white/5 rounded" />
        <Skeleton className="h-7 w-7 bg-white/5 rounded" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 bg-white/5" />
          <Skeleton className="h-7 w-52 bg-white/5" />
          <Skeleton className="h-4 w-72 bg-white/5" />
        </div>
        <Skeleton className="h-9 w-32 bg-white/5 rounded-md" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gitpm-border/40 bg-surface-dark/40 px-4 py-3 space-y-1.5"
          >
            <Skeleton className="h-7 w-10 bg-white/5" />
            <Skeleton className="h-3 w-20 bg-white/5" />
          </div>
        ))}
      </div>

      {/* Project list */}
      <div className="space-y-2">
        <ProjectRowSkeleton />
        <ProjectRowSkeleton />
        <ProjectRowSkeleton />
      </div>
    </div>
  );
}
