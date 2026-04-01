export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="page-shell py-8 md:py-12 space-y-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-16 w-full bg-white rounded-2xl border border-border" />
        
        {/* Hero Skeleton (Landing Page) */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
           <div className="h-[400px] bg-white rounded-3xl border border-border flex flex-col md:flex-row gap-8 p-6 md:p-8">
              <div className="w-full md:w-56 aspect-[3/4] bg-surface-strong rounded-xl shrink-0" />
              <div className="flex-1 space-y-4 pt-4">
                 <div className="h-8 w-3/4 bg-surface-strong rounded-lg" />
                 <div className="h-4 w-1/4 bg-surface-strong rounded-lg" />
                 <div className="space-y-2 pt-4">
                    <div className="h-4 w-full bg-surface-strong rounded-lg" />
                    <div className="h-4 w-5/6 bg-surface-strong rounded-lg" />
                 </div>
              </div>
           </div>
           {/* Ranking Skeleton */}
           <div className="hidden lg:block h-[400px] bg-white rounded-3xl border border-border p-6 space-y-6">
              <div className="h-6 w-1/2 bg-surface-strong rounded-lg" />
              {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="flex gap-4 items-center">
                    <div className="h-12 w-10 bg-surface-strong rounded-lg shrink-0" />
                    <div className="h-4 w-full bg-surface-strong rounded-lg" />
                 </div>
              ))}
           </div>
        </div>

        {/* Row Grid Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-44 bg-surface-strong rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-[3/4] w-full bg-white rounded-2xl border border-border" />
                <div className="h-4 w-3/4 bg-surface-strong rounded-lg" />
                <div className="h-3 w-1/2 bg-surface-strong/60 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
