import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ScrollManager } from '@/app/ScrollManager'
import { PublicLayout } from '@/shared/layouts/PublicLayout'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { HomePage } from '@/features/home/pages/HomePage/HomePage'
import { PublicAvailabilityPage } from '@/features/rooms/pages/PublicAvailabilityPage/PublicAvailabilityPage'
import { LoginPage } from '@/features/auth/pages/LoginPage/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage/ForgotPasswordPage'
import { EmailSentPage } from '@/features/auth/pages/EmailSentPage/EmailSentPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage/ResetPasswordPage'
import { RequireAuth } from '@/features/auth/components/RequireAuth/RequireAuth'
import { ClientLayout } from '@/features/client/layout/ClientLayout/ClientLayout'
import { PanelHomePage } from '@/features/client/pages/PanelHomePage/PanelHomePage'
import { AvailabilityPage } from '@/features/client/pages/AvailabilityPage/AvailabilityPage'
import { ConfirmReservationPage } from '@/features/client/pages/ConfirmReservationPage/ConfirmReservationPage'
import { MyReservationsPage } from '@/features/client/pages/MyReservationsPage/MyReservationsPage'
import { ReservationDetailPage } from '@/features/client/pages/ReservationDetailPage/ReservationDetailPage'
import { EditReservationPage } from '@/features/client/pages/EditReservationPage/EditReservationPage'
import { ProfilePage } from '@/features/client/pages/ProfilePage/ProfilePage'
import { ChangePasswordPage } from '@/features/client/pages/ChangePasswordPage/ChangePasswordPage'
import { ReceptionLayout } from '@/features/reception/layout/ReceptionLayout/ReceptionLayout'
import { OccupancyPanelPage } from '@/features/reception/pages/OccupancyPanelPage/OccupancyPanelPage'
import { CalendarPage } from '@/features/reception/pages/CalendarPage/CalendarPage'
import { ReservationsPage } from '@/features/reception/pages/ReservationsPage/ReservationsPage'
import { CheckInOutPage } from '@/features/reception/pages/CheckInOutPage/CheckInOutPage'
import { RoomsPage } from '@/features/reception/pages/RoomsPage/RoomsPage'
import { SearchReservationPage } from '@/features/reception/pages/SearchReservationPage/SearchReservationPage'
import { AdminLayout } from '@/features/admin/layout/AdminLayout/AdminLayout'
import { UsersPage } from '@/features/admin/pages/UsersPage/UsersPage'

export const router = createBrowserRouter([
  {
    element: <ScrollManager />,
    children: [
      // Portal público
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          // RF-005/RF-006: el visitante consulta disponibilidad sin sesión
          { path: 'disponibilidad', element: <PublicAvailabilityPage /> },
        ],
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
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
      // Panel del cliente (E2) — requiere sesión con rol CLIENTE
      {
        path: 'panel',
        element: (
          <RequireAuth roles={['CLIENTE']}>
            <ClientLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <PanelHomePage /> },
          { path: 'disponibilidad', element: <AvailabilityPage /> },
          { path: 'confirmar', element: <ConfirmReservationPage /> },
          { path: 'reservas', element: <MyReservationsPage /> },
          { path: 'reservas/:id', element: <ReservationDetailPage /> },
          { path: 'reservas/:id/editar', element: <EditReservationPage /> },
          { path: 'perfil', element: <ProfilePage /> },
          { path: 'perfil/contrasena', element: <ChangePasswordPage /> },
        ],
      },
      // Panel de Recepcionista (E3) — rol RECEPCIONISTA o ADMINISTRADOR
      {
        path: 'panel-reception',
        element: (
          <RequireAuth roles={['RECEPCIONISTA', 'ADMINISTRADOR']}>
            <ReceptionLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <OccupancyPanelPage /> },
          { path: 'calendario', element: <CalendarPage /> },
          { path: 'reservas', element: <ReservationsPage /> },
          { path: 'check-in-out', element: <CheckInOutPage /> },
          { path: 'habitaciones', element: <RoomsPage /> },
          { path: 'buscar', element: <SearchReservationPage /> },
        ],
      },
      // Panel de Administrador (E4) — solo rol ADMINISTRADOR
      {
        path: 'panel-admin',
        element: (
          <RequireAuth roles={['ADMINISTRADOR']}>
            <AdminLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Navigate to="usuarios" replace /> },
          { path: 'usuarios', element: <UsersPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
