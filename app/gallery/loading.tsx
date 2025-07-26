export default function Loading() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Navigation Skeleton */}
      <nav className='fixed top-0 w-full bg-background/95 backdrop-blur-xl border-b border-border/50 z-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
          <div className='flex items-center justify-between py-4'>
            <div className='h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
            <div className='hidden md:flex items-center space-x-6'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'
                />
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Header Skeleton */}
      <div className='pt-16'>
        <div className='bg-stone-50 dark:bg-slate-900 border-b border-border/20'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16'>
            <div className='flex items-center justify-between'>
              <div className='space-y-4'>
                <div className='h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                <div className='space-y-2'>
                  <div className='h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                  <div className='h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                </div>
              </div>
              <div className='hidden md:block'>
                <div className='h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid Skeleton */}
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className='space-y-4'>
                {/* Image skeleton */}
                <div className='aspect-[4/5] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse' />

                {/* Text skeleton */}
                <div className='space-y-2'>
                  <div className='h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                  <div className='space-y-1'>
                    <div className='h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                    <div className='h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                    <div className='h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-16'>
          <div className='flex items-center justify-center space-x-2'>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className='h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'
              />
            ))}
          </div>
          <div className='text-center mt-4'>
            <div className='h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto' />
          </div>
        </div>
      </div>
    </div>
  )
}
