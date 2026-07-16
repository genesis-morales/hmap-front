import { ConfigProvider, App as AntdApp } from 'antd'
import esES from 'antd/locale/es_ES'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { antdTheme } from '@/shared/theme/antdTheme'
import { router } from '@/app/router'

function App() {
  return (
    <ConfigProvider theme={antdTheme} locale={esES}>
      <AntdApp>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
