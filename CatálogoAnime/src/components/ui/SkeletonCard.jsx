export function SkeletonCard() {
  return (
    <article className="animate-pulse rounded-lg bg-surface-container-low p-4">
      <div className="aspect-[2/3] rounded-lg bg-surface-container-high" />
      <div className="mt-4 space-y-3">
        <div className="h-3 w-20 rounded-full bg-surface-container-high" />
        <div className="h-5 w-3/4 rounded-lg bg-surface-container-high" />
        <div className="h-3 w-1/2 rounded-full bg-surface-container-high" />
      </div>
    </article>
  );
}
