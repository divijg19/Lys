// A simple skeleton that mimics the new, centered layout of your Hero component.
export function HeroSkeleton() {
  return (
    <section className="flex min-h-[80vh] flex-col-reverse items-center justify-center gap-16 lg:flex-row">
      {/* Left Column Skeleton */}
      <div className="flex max-w-xl flex-col items-center gap-y-6 lg:items-start">
        <div className="h-28 w-full max-w-md rounded-md bg-muted" />
        <div className="h-8 w-full max-w-sm rounded-md bg-muted" />
        <div className="h-20 w-full max-w-xl rounded-md bg-muted" />
        <div className="flex flex-wrap gap-4">
          <div className="h-12 w-40 rounded-xl bg-muted" />
          <div className="h-12 w-32 rounded-xl bg-muted" />
        </div>
      </div>
      {/* Right Column Skeleton */}
      <div className="relative">
        <div className="h-[280px] w-[280px] rounded-full bg-muted" />
      </div>
    </section>
  );
}
