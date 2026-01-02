import { AuthGuard } from '@/modules/auth/ui/components/auth-guard'
import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}

export default Layout
