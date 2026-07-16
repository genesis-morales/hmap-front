import { HeroSection } from '@/features/home/components/HeroSection/HeroSection'
import { AboutSection } from '@/features/home/components/AboutSection/AboutSection'
import { RoomsSection } from '@/features/home/components/RoomsSection/RoomsSection'
import { AmenitiesSection } from '@/features/home/components/AmenitiesSection/AmenitiesSection'
import { TestimonialsSection } from '@/features/home/components/TestimonialsSection/TestimonialsSection'
import { GallerySection } from '@/features/home/components/GallerySection/GallerySection'

/** HU-001 — Página principal del portal público. */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <RoomsSection />
      <AmenitiesSection />
      <TestimonialsSection />
      <GallerySection />
    </>
  )
}
