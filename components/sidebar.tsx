/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import {
  Network,
  UserCircle,
  Briefcase,
  LogOut,
  LogIn,
  Home,
  ChevronRight,
  GitPullRequestArrow,
  GraduationCap,
  Pickaxe,
  BellIcon,
  HandshakeIcon,
  Building2,
  X,
  CalendarCheck,
  ChevronDown,
  Sparkles,
  MessageCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { useNotifications } from '@/lib/context/NotificationsContext'
import { NotificationBell } from '@/components/global-notifications/NotificationBell'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'

interface MainSidebarProps
  extends React.ComponentPropsWithoutRef<typeof Sidebar> {
  onClose?: () => void
}

interface IconProps {
  className?: string
}

interface SidebarNavItemProps {
  className?: string
  title: string
  items: Array<{
    name: string
    icon: React.ComponentType<IconProps>
    href: string
  }>
}

export function MainSidebar({ className, onClose }: MainSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { hasUnread } = useNotifications()
  const { isAuthenticated, logout, userType, isAdmin } = useAuth()

  const handleLogout = React.useCallback(async () => {
    try {
      router.push('/login')
      await logout()
    } catch {
      // Logout failed silently
    }
  }, [router, logout])

  const vitrinesItems = React.useMemo(() => {
    const items = [
      { name: 'Negócios', icon: Briefcase, href: '/negocios' },
      { name: 'Iniciativas', icon: HandshakeIcon, href: '/iniciativas' },
      { name: 'Laboratórios', icon: Pickaxe, href: '/laboratorios' },
    ]

    return items
  }, [])

  const comunidadeItems = React.useMemo(
    () => [
      { name: 'Rede', icon: Network, href: '/rede' },
      { name: 'Reuniões', icon: CalendarCheck, href: '/reunioes' },
      { name: 'Eventos', icon: CalendarCheck, href: '/eventos' },
    ],
    [],
  )

  const adminItems = React.useMemo(() => [
    {
      name: 'Painel de Controle',
      icon: GitPullRequestArrow,
      href: '/administrativo',
    },
    {
      name: 'Administrar Negócios',
      icon: Building2,
      href: '/administrativo/negocios',
    },
    {
      name: 'Administrar Laboratórios',
      icon: Pickaxe,
      href: '/administrativo/laboratorios',
    },
    {
      name: 'Administrar Iniciativas',
      icon: HandshakeIcon,
      href: '/administrativo/iniciativas',
    },
    {
      name: 'Administrar Eventos',
      icon: CalendarCheck,
      href: '/administrativo/eventos',
    },
  ], [])

  const personalItems = React.useMemo(() => {
    const items = [
      { name: 'Meus Negócios', icon: Building2, href: '/meus-negocios' },
      { name: 'Meus Eventos', icon: CalendarCheck, href: '/meus-eventos' },
      {
        name: 'Minhas Iniciativas',
        icon: HandshakeIcon,
        href: '/minhas-iniciativas',
      },
    ]

    // Apenas pesquisadores e admins veem Meus Laboratórios
    if (isAdmin || userType === 'pesquisador') {
      items.push({ name: 'Meus Laboratórios', icon: Pickaxe, href: '/meus-laboratorios' })
    }

    items.push({ name: 'Perfil do Usuário', icon: UserCircle, href: '/perfil' })

    return items
  }, [isAdmin, userType])

  const SidebarNavItem = React.forwardRef<HTMLDivElement, SidebarNavItemProps>(
    ({ className, title, items, ...props }, ref) => {
      // Definir quais seções ficam expandidas por padrão
      const defaultExpanded = React.useMemo(() => 
        ['Vitrines', 'Comunidade'].includes(title), [title]
      )
      
      // Estado inicial baseado no localStorage ou valor padrão
      const [isOpen, setIsOpen] = React.useState(() => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(`sidebar-${title}-expanded`)
          return saved !== null ? JSON.parse(saved) : defaultExpanded
        }
        return defaultExpanded
      })

      // Persistir estado no localStorage
      React.useEffect(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`sidebar-${title}-expanded`, JSON.stringify(isOpen))
        }
      }, [isOpen, title])

      return (
        <div ref={ref} className={cn('', className)} {...props}>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-gray-700 hover:text-purple-700 hover:bg-purple-50/50 transition-all duration-200 font-medium"
              >
                {title}
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform duration-200 text-purple-600', {
                    '-rotate-180': isOpen,
                  })}
                />
              </Button>
            </CollapsibleTrigger>
            {isOpen && (
              <CollapsibleContent asChild>
                <div className="space-y-1 mt-2">
                  {items.map((item) => {
                    const isActive = pathname === item.href
                    const isDisabled = !item.href
                    
                    return (
                      <div key={item.name}>
                        <Button
                          asChild={!isDisabled}
                          variant="ghost"
                          className={cn(
                            'w-full justify-start relative group transition-all duration-200 text-sm',
                            isActive && 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 font-medium',
                            !isActive && !isDisabled && 'hover:bg-purple-50/50 hover:text-purple-700',
                            isDisabled && 'opacity-50 cursor-not-allowed text-gray-400'
                          )}
                          disabled={isDisabled}
                        >
                          {isDisabled ? (
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-4 w-4" />
                              <span>{item.name}</span>
                              <Sparkles className="ml-auto h-3 w-3 text-yellow-500" />
                            </div>
                          ) : (
                            <Link href={item.href} className="flex items-center w-full">
                              <item.icon className={cn(
                                "mr-3 h-4 w-4 transition-colors duration-200",
                                isActive && "text-purple-600"
                              )} />
                              <span>{item.name}</span>
                              {isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-l-full" />
                              )}
                            </Link>
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>
        </div>
      )
    },
  )
  SidebarNavItem.displayName = 'SidebarNavItem'

  return (
    <Sidebar
      className={cn(
        'border-r border-purple-100 h-full min-h-screen flex flex-col w-full md:max-w-[280px] bg-white shadow-sm',
        className,
      )}
    >
      <SidebarHeader className="border-b border-purple-100 px-4 py-4 flex justify-between items-center bg-gradient-to-r from-purple-50 to-violet-50">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo-ufc-inova.png" alt="UFC Inova" className="h-9 w-auto" />
          <span className="text-sm font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent leading-tight">
            Ambiente Digital<br />de Conexões
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden hover:bg-purple-100 hover:text-purple-700 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-grow overflow-y-auto overflow-x-hidden py-4">
        <SidebarNav className="space-y-4 w-full px-2">
          {/* Item Início no topo */}
          <div className="px-2">
            <Button
              asChild
              variant="ghost"
              className={cn(
                'w-full justify-start relative group transition-all duration-200',
                pathname === '/' && 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 font-medium',
                pathname !== '/' && 'hover:bg-purple-50/50 hover:text-purple-700'
              )}
            >
              <Link href="/" className="flex items-center w-full">
                <Home className={cn(
                  "mr-3 h-4 w-4 transition-colors duration-200",
                  pathname === '/' && "text-purple-600"
                )} />
                <span>Início</span>
                {pathname === '/' && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-l-full" />
                )}
              </Link>
            </Button>
          </div>

          <SidebarNavItem title="Vitrines" items={vitrinesItems} />
          <SidebarNavItem title="Comunidade" items={comunidadeItems} />
          <SidebarNavItem title="Pessoal" items={personalItems} />
          {isAdmin && (
            <SidebarNavItem title="Administrativo" items={adminItems} />
          )}
        </SidebarNav>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-purple-100 p-4 bg-gradient-to-r from-purple-50/50 to-violet-50/50">
        {isAuthenticated ? (
          <Button
            variant="outline"
            className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200" 
            asChild
          >
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login e Cadastro
            </Link>
          </Button>
        )}
        <Button
          variant="outline"
          className="mt-2 w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          asChild
        >
          <Link href="/dashboard" rel="noopener noreferrer">
            <Home className="mr-2 h-4 w-4" />
            Analytics
            <ChevronRight className="ml-auto h-4 w-4" />
          </Link>
        </Button>
        <div className="mt-4 flex justify-center">
          <img src="/logo-ufc-inova.png" alt="UFC INOVA" className="h-10 w-auto opacity-70" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
