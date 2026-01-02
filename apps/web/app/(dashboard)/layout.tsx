import { DashboardLayout } from '@/ui/layouts/dashboard-layout'
import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}

export default Layout
