import { Home, Settings, Upload } from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const navigation: NavigationItem[] = [
  { 
    name: 'Início', 
    href: '/', 
    icon: Home 
  },
  { 
    name: 'Uploads', 
    href: '/upload', 
    icon: Upload 
  },
  { 
    name: 'Configurações', 
    href: '/settings', 
    icon: Settings 
  },
] 