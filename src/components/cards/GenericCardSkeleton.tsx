export function GenericCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border p-5">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="h-6 w-6 bg-muted rounded" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}
