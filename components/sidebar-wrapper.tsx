'use client'

import { usePathname } from 'next/navigation'
import { MainSidebar } from '@/components/sidebar'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Briefcase, Network, Bell, UserCircle, LogOut, Pickaxe, HandshakeIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'

export function SidebarWrapper() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Lista de rotas onde a sidebar NÃO deve ser mostrada - memoizada
  const excludedRoutes = useMemo(() => ['/login', '/cadastro'], [])

  // A sidebar deve ser mostrada se a rota ATUAL NÃO ESTIVER na lista de excluídas - memoizada
  const showSidebar = useMemo(() => !excludedRoutes.includes(pathname), [excludedRoutes, pathname])

  // Callback para toggle da sidebar
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const newState = !prev
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
      return newState
    })
  }, [])

  // Callback para logout
  const handleLogout = useCallback(async () => {
    try {
      router.push('/login')
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [router, logout])

  // Carregar estado do localStorage apenas uma vez
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Principais rotas para a sidebar colapsada - memoizada
  const mainRoutes = useMemo(() => [
    { 
      icon: Briefcase, 
      href: '/negocios', 
      title: 'Negócios',
      isActive: pathname === '/negocios'
    },
    { 
      icon: Pickaxe, 
      href: '/laboratorios', 
      title: 'Laboratórios',
      isActive: pathname === '/laboratorios'
    },
    { 
      icon: HandshakeIcon, 
      href: '/iniciativas', 
      title: 'Iniciativas',
      isActive: pathname === '/iniciativas'
    },
    { 
      icon: Network, 
      href: '/rede', 
      title: 'Rede',
      isActive: pathname === '/rede'
    },
    { 
      icon: Bell, 
      href: '/notificacoes', 
      title: 'Notificações',
      isActive: pathname === '/notificacoes'
    },
    { 
      icon: UserCircle, 
      href: '/perfil', 
      title: 'Perfil',
      isActive: pathname === '/perfil'
    }
  ], [pathname])

  // Early return se não deve mostrar sidebar
  if (!showSidebar) {
    return null
  }

  return (
    <>
      <div className="hidden md:flex md:sticky md:top-0 md:h-screen relative">
        {!isCollapsed ? (
          <div className="w-[280px] transition-all duration-200 ease-in-out">
            <MainSidebar />
          </div>
        ) : (
          <div className="w-[60px] bg-white border-r border-purple-100 shadow-sm flex flex-col items-center py-4 transition-all duration-200 ease-in-out">
            {/* Logo colapsado */}
            <div className="mb-6">
              <Link href="/negocios">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform">
                  L
                </span>
              </Link>
            </div>

            {/* Ícones principais */}
            <div className="flex flex-col gap-2">
              {mainRoutes.map((route) => (
                <Button
                  key={route.href}
                  variant="ghost"
                  size="icon"
                  asChild
                  className={`h-10 w-10 relative transition-colors duration-200 ${
                    route.isActive 
                      ? 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700' 
                      : 'hover:bg-purple-50 hover:text-purple-700'
                  }`}
                  title={route.title}
                >
                  <Link href={route.href}>
                    <route.icon className="h-5 w-5" />
                    {route.isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-l-full" />
                    )}
                  </Link>
                </Button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Botão de logout colapsado */}
            {isAuthenticated && (
              <div className="mt-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-10 w-10 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão de toggle */}
      <div
        className="hidden md:block fixed z-[9999] transition-all duration-200"
        style={{
          left: isCollapsed ? 'calc(60px - 20px)' : 'calc(280px - 20px)',
          top: '48px'
        }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="h-10 w-10 rounded-full bg-white border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-xl hover:shadow-purple-500/25 transition-all duration-200"
          title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-purple-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-purple-600" />
          )}
        </Button>
      </div>
    </>
  )
}
