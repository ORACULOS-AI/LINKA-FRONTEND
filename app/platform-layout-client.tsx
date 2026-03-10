'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetTitle, SheetPortal } from '@/components/ui/sheet'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { MainSidebar } from '@/components/sidebar'
import { SidebarWrapper } from '@/components/sidebar-wrapper'
import PrivateRoute from '@/components/private_route'
import { Providers } from '@/components/providers'
import { NotificationsProvider } from '@/lib/context/NotificationsContext'
import { CommunityProviders } from '@/components/comunidade/CommunityProviders'
import { useAuth } from '@/lib/context/AuthContext'
import { cn } from '@/lib/utils'

interface PlatformLayoutClientProps {
  children: React.ReactNode
}

// Componente customizado do SheetOverlay simplificado
const CustomSheetOverlay = () => (
  <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
)

// Componente customizado do SheetContent simplificado
const CustomSheetContent = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>) => (
  <SheetPortal>
    <CustomSheetOverlay />
    <SheetPrimitive.Content
      className={cn(
        'fixed inset-y-0 left-0 z-50 h-full w-[280px] bg-white border-r border-purple-100 shadow-xl transition-transform duration-200 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        className
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
)

/**
 * Layout interno — tem acesso ao AuthContext pois está dentro de Providers.
 * Decide se mostra sidebar ou não baseado em rota + autenticação.
 */
function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const handleClose = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Rotas sem sidebar: login e landing pública (/ quando não autenticado)
  const isBarelessRoute =
    pathname === '/login' ||
    (pathname === '/' && !isAuthenticated)

  if (isBarelessRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <SidebarWrapper />

      {/* Mobile Menu Button */}
      <div className="block md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/95 backdrop-blur-sm shadow-lg border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200"
            >
              {isOpen ? (
                <X className="h-4 w-4 text-purple-600" />
              ) : (
                <Menu className="h-4 w-4 text-purple-600" />
              )}
              <span className="sr-only">
                {isOpen ? 'Fechar menu' : 'Abrir menu'}
              </span>
            </Button>
          </SheetTrigger>
          <CustomSheetContent>
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            <div className="h-full flex flex-col">
              <MainSidebar onClose={handleClose} />
            </div>
          </CustomSheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:pl-0 pl-0">
          <PrivateRoute>{children}</PrivateRoute>
        </div>
      </main>
    </div>
  )
}

export default function PlatformLayoutClient({
  children,
}: PlatformLayoutClientProps) {
  return (
    <Providers>
      <NotificationsProvider>
        <CommunityProviders>
          <InnerLayout>{children}</InnerLayout>
        </CommunityProviders>
      </NotificationsProvider>
    </Providers>
  )
}
