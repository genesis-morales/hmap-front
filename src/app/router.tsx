import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ScrollManager } from '@/app/ScrollManager'
import { PublicLayout } from '@/shared/layouts/PublicLayout'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { HomePage } from '@/features/home/pages/HomePage/HomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage/ForgotPasswordPage'
import { EmailSentPage } from '@/features/auth/pages/EmailSentPage/EmailSentPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage/ResetPasswordPage'
import { ClientPage } from '@/features/client/page/ClientPage'

export const router = createBrowserRouter([
  {
    element: <ScrollManager />,
    children: [
      // Portal público
      {
        element: <PublicLayout />,
        children: [{ index: true, element: <HomePage /> }],
      },
      // Autenticación
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'registro', element: <RegisterPage /> },
          { path: 'recuperar-contrasena', element: <ForgotPasswordPage /> },
          { path: 'recuperar-contrasena/enviado', element: <EmailSentPage /> },
          { path: 'restablecer-contrasena', element: <ResetPasswordPage /> },
        ],
      },
      // Panel de cliente (prueba)
      { path: 'panel', element: <ClientPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
