import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/es'
import '@/shared/styles/global.scss'
import App from '@/App.tsx'

// Fechas en español + parseo estricto de YYYY-MM-DD (contrato de API).
dayjs.extend(customParseFormat)
dayjs.locale('es')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
