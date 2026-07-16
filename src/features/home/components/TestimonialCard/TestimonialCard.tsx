import { StarFilled } from '@ant-design/icons'
import type { Testimonial } from '@/features/home/types'
import './TestimonialCard.scss'

interface TestimonialCardProps {
  testimonial: Testimonial
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** HU-001 — Tarjeta de testimonio de huésped. */
export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article className="testimonial-card">
      <div className="testimonial-card__stars" aria-label={`${testimonial.rating} de 5`}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <StarFilled key={i} />
        ))}
      </div>

      <p className="testimonial-card__quote">“{testimonial.quote}”</p>

      <footer className="testimonial-card__author">
        <span className="testimonial-card__avatar">{initials(testimonial.author)}</span>
        <span>
          <strong className="testimonial-card__name">{testimonial.author}</strong>
          <span className="testimonial-card__location">{testimonial.location}</span>
        </span>
      </footer>
    </article>
  )
}
