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

      <main className='pt-16'>
        {/* Breadcrumb Skeleton */}
        <div className='fixed top-20 left-4 z-40'>
          <div className='h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
        </div>

        {/* Image Section Skeleton */}
        <div className='relative bg-stone-50 dark:bg-slate-900 py-8'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
            <div className='flex items-center justify-center'>
              <div className='relative max-w-4xl w-full bg-white dark:bg-slate-800 shadow-2xl rounded-lg overflow-hidden'>
                <div className='w-full h-[60vh] bg-gray-200 dark:bg-gray-700 animate-pulse' />
              </div>
            </div>
          </div>
        </div>

        {/* Artwork Information Skeleton */}
        <div className='bg-background'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12'>
            <div className='max-w-4xl mx-auto'>
              <div className='grid lg:grid-cols-2 gap-12'>
                {/* Left: Main Info Skeleton */}
                <div className='space-y-8'>
                  <div className='space-y-4'>
                    {/* Title skeleton */}
                    <div className='h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />

                    {/* Metadata skeleton */}
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className='flex items-center space-x-2'>
                          <div className='h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                          <div className='h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description skeleton */}
                  <div className='space-y-2'>
                    <div className='h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                    <div className='h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                    <div className='h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                  </div>
                </div>

                {/* Right: Artist Note & Actions Skeleton */}
                <div className='space-y-8'>
                  {/* Artist note skeleton */}
                  <div className='bg-stone-50 dark:bg-slate-800/50 rounded-lg p-6'>
                    <div className='h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4' />
                    <div className='space-y-2'>
                      <div className='h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                      <div className='h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                    </div>
                  </div>

                  {/* Action buttons skeleton */}
                  <div className='flex flex-wrap gap-3'>
                    <div className='h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                    <div className='h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                  </div>

                  {/* Navigation skeleton */}
                  <div className='pt-8 border-t border-border/20'>
                    <div className='flex justify-between'>
                      <div className='h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                      <div className='h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
