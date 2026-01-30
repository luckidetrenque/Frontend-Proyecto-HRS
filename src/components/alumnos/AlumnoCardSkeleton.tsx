export function AlumnoCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-background p-5">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="h-8 w-8 rounded bg-muted" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-6 w-28 rounded bg-muted" />
      </div>
    </div>
  );
}
