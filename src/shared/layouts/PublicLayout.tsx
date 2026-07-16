import { Outlet } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar/Navbar'
import { Footer } from '@/shared/components/Footer/Footer'

/** Layout del portal público: navbar fijo + contenido + footer. */
export function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
