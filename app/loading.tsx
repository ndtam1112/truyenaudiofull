export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="page-shell space-y-8 py-6 md:py-8">
        <div className="h-[62vh] animate-pulse rounded-[2rem] bg-neutral-900" />
        <div className="space-y-4">
          <div className="h-6 w-44 animate-pulse rounded-full bg-neutral-900" />
          <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[260px] min-w-[152px] animate-pulse rounded-2xl bg-neutral-900"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
