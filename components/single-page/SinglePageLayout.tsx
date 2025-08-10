'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Artwork, Artist } from '@/lib/types'
import { useSafeGalleryStore, useModalState } from '@/lib/stores/gallery-store-safe'

// Import individual section components
import { HeroSection } from './HeroSection'
import { GallerySection } from './GallerySection'
import { ArtistSection } from './ArtistSection'
import { ExhibitionSection } from './ExhibitionSection'
import { ContactSection } from './ContactSection'
import { Navigation } from './Navigation'
import { ArtworkModal } from './ArtworkModal'

interface SinglePageLayoutProps {
  initialArtworks: Artwork[]
  artist?: Artist
}

export default function SinglePageLayout({ initialArtworks, artist }: SinglePageLayoutProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Zustand store state and actions (using safe wrapper)
  const {
    currentSection,
    setCurrentSection,
    navigateToSection,
    setArtworks,
    setArtist,
    openModal,
    closeModal,
    trackSectionView
  } = useSafeGalleryStore()
  
  const { isOpen: isModalOpen, artwork: selectedArtwork } = useModalState()

  // Debug logging
  useEffect(() => {
    console.log('SinglePageLayout mounted', { artworks: initialArtworks?.length, artist: !!artist })
  }, [])

  // Initialize store with server data
  useEffect(() => {
    try {
      setArtworks(initialArtworks)
      if (artist) {
        setArtist(artist)
      }
    } catch (error) {
      console.error('Error initializing gallery store:', error)
    }
  }, [initialArtworks, artist, setArtworks, setArtist])

  // Handle URL parameters for direct artwork links
  useEffect(() => {
    const artworkId = searchParams.get('artwork')
    if (artworkId && initialArtworks.length > 0) {
      const artwork = initialArtworks.find(a => a.id === artworkId)
      if (artwork) {
        openModal(artwork)
        navigateToSection('gallery')
        
        // Clean up URL parameter after opening modal (client-side only)
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.searchParams.delete('artwork')
          router.replace(url.pathname + url.hash, { scroll: false })
        }
      }
    }
  }, [searchParams, initialArtworks, openModal, navigateToSection, router])

  // Handle artwork selection
  const handleArtworkSelect = (artwork: Artwork) => {
    openModal(artwork)
  }

  // Intersection observer for active section tracking
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '-50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          setCurrentSection(sectionId)
          trackSectionView(sectionId)
        }
      })
    }, observerOptions)

    // Observe all sections
    const sections = ['hero', 'gallery', 'artist', 'exhibition', 'contact']
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [setCurrentSection, trackSectionView])

  try {
    return (
      <>
        {/* Fixed Navigation */}
        <Navigation 
          currentSection={currentSection}
          onNavigate={navigateToSection}
        />

        {/* Single Page Sections */}
        <main className="min-h-screen bg-white">
          {/* Hero Section */}
          <section id="hero" className="min-h-screen">
            <HeroSection onNavigate={navigateToSection} />
          </section>

          {/* Gallery Section */}
          <section id="gallery" className="min-h-screen py-32">
            <GallerySection 
              artworks={initialArtworks}
              onArtworkSelect={handleArtworkSelect}
            />
          </section>

          {/* Artist Section */}
          <section id="artist" className="min-h-screen py-32">
            <ArtistSection artist={artist} />
          </section>

          {/* Exhibition Section */}
          <section id="exhibition" className="min-h-screen py-32">
            <ExhibitionSection />
          </section>

          {/* Contact Section */}
          <section id="contact" className="min-h-screen py-32">
            <ContactSection />
          </section>
        </main>

        {/* Artwork Modal */}
        <AnimatePresence>
          {isModalOpen && selectedArtwork && (
            <ArtworkModal
              artwork={selectedArtwork}
              onClose={closeModal}
              artworks={initialArtworks}
              onArtworkChange={(artwork) => openModal(artwork)}
            />
          )}
        </AnimatePresence>
      </>
    )
  } catch (error) {
    console.error('SinglePageLayout render error:', error)
    throw error
  }
}