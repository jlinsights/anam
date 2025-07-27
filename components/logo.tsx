interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLink?: boolean
  forceWhite?: boolean
}

export function Logo({
  className = '',
  size = 'md',
  showLink = true,
  forceWhite = false,
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  }

  const logoElement = (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {forceWhite ? (
        <img
          src='/logos/Logo & Tagline_black BG.png'
          alt='아남 배옥영 개인전 - 길'
          className='h-full w-auto object-contain'
        />
      ) : (
        <>
          <img
            src='/logos/Logo & Tagline_white BG.png'
            alt='아남 배옥영 개인전 - 길'
            className='h-full w-auto object-contain dark:hidden'
          />
          <img
            src='/logos/Logo & Tagline_black BG.png'
            alt='아남 배옥영 개인전 - 길'
            className='h-full w-auto object-contain hidden dark:block'
          />
        </>
      )}
    </div>
  )

  if (!showLink) {
    return logoElement
  }

  return (
    <a
      href='https://orientalcalligraphy.org'
      target='_blank'
      rel='noopener noreferrer'
      className='block transition-opacity hover:opacity-80'
      aria-label='동양서예협회 웹사이트로 이동'
    >
      {logoElement}
    </a>
  )
}
