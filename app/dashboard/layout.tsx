import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar com z-index alto */}
      <div className="w-64 fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Conteúdo principal com margem para a sidebar */}
      <div className="flex-1 ml-64">
        <Header />
        <main>
          {children}
        </main>
      </div>
    </div>
  )
} 