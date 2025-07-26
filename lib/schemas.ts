import { z } from 'zod'

// Artwork Schema
export const ArtworkSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  year: z.number().int().nonnegative(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  aspectRatio: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string(),
  imageUrlQuery: z.string().optional(),
  artistNote: z.string().optional(),
  featured: z.boolean().optional(),
  category: z.string().optional(),
  available: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  series: z.string().optional(),
  technique: z.string().optional(),
  inspiration: z.string().optional(),
  symbolism: z.string().optional(),
  culturalContext: z.string().optional(),
  price: z.number().optional(),
  exhibition: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type ArtworkValidated = z.infer<typeof ArtworkSchema>

// Social Links Schema
export const SocialLinksSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
})

// Artist Schema - lib/types.ts의 Artist 타입과 일치하도록 확장
export const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string().optional(),
  statement: z.string().optional(),
  profileImageUrl: z.string().optional(),
  // 기본 연락처 정보
  birthYear: z.number().optional(),
  education: z.array(z.string()).optional(),
  exhibitions: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  collections: z.array(z.string()).optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  socialLinks: SocialLinksSchema.optional(),
  // 추가 작가 정보
  birthPlace: z.string().optional(),
  currentLocation: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  influences: z.array(z.string()).optional(),
  teachingExperience: z.array(z.string()).optional(),
  publications: z.array(z.string()).optional(),
  memberships: z.array(z.string()).optional(),
  philosophy: z.string().optional(),
  techniques: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
})

export type ArtistValidated = z.infer<typeof ArtistSchema>
