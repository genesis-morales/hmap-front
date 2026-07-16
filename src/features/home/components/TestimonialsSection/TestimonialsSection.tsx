import { TestimonialCard } from '@/features/home/components/TestimonialCard/TestimonialCard'
import { testimonials } from '@/features/home/data/testimonials'
import './TestimonialsSection.scss'

/** HU-001 — Testimonios de huéspedes. */
export function TestimonialsSection() {
  return (
    <section id="testimonios" className="testimonials section">
      <div className="container">
        <header className="testimonials__header">
          <span className="eyebrow testimonials__eyebrow">Experiencias de huéspedes</span>
          <h2 className="testimonials__title">Testimonios</h2>
        </header>

        <div className="testimonials__grid">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.author} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}
