export function GenericCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 shadow-sm relative overflow-hidden">
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-muted/20 to-transparent"></div>

      <div className="flex justify-between items-start animate-pulse">
        <div className="space-y-3">
          <div className="h-6 w-48 bg-muted/60 rounded-md" />
          <div className="h-4 w-32 bg-muted/40 rounded-md" />
        </div>
        <div className="h-8 w-8 bg-muted/40 rounded-lg" />
      </div>

      <div className="mt-5 pt-4 border-t border-border/30 grid grid-cols-2 gap-y-4 gap-x-3 animate-pulse relative z-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-3 w-16 bg-muted/30 rounded-full" />
            <div className="h-4 w-24 bg-muted/50 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
