'use client'

import ArtworkDetailModalClient from '@/components/artwork-detail-modal-client'

export default function ClientEntry({
  artwork,
  recommendedArtworks,
}: {
  artwork: any
  recommendedArtworks: any[]
}) {
  return (
    <ArtworkDetailModalClient
      artwork={artwork}
      recommendedArtworks={recommendedArtworks}
    />
  )
}
