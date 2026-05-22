'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, Moon, Sun, Shield, FileSearch, FolderKanban, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const v = document.documentElement.getAttribute('data-theme') as Theme | null
  if (v === 'light' || v === 'dark') return v
  const stored = window.localStorage.getItem('selinka-theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  window.localStorage.setItem('selinka-theme', theme)
}

export function SettingsDropdown() {
  const isAdmin = useAuth((s) => Boolean(s.me?.is_admin))
  const reset = useAuth((s) => s.reset)
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTheme(readTheme())
    setMounted(true)
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await fetch('/api/auth/logout', { method: 'POST' })
    reset()
    router.replace('/entrar')
  }

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label="Configurações e preferências"
        className={cn('nav-item', open && 'nav-item--active')}
      >
        <Settings size={20} aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 w-56 rounded-lg border border-border bg-surface shadow-lg">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-t-lg px-4 py-2.5 text-sm text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg-1"
          >
            {mounted && theme === 'dark' ? (
              <><Sun size={16} aria-hidden /> Modo claro</>
            ) : (
              <><Moon size={16} aria-hidden /> Modo escuro</>
            )}
          </button>

          <div className="mx-4 my-0.5 h-px bg-border" />

          <Link
            href="/meus-itens"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg-1"
          >
            <FolderKanban size={16} aria-hidden />
            Meus itens
          </Link>

          <Link
            href="/reivindicar"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg-1"
          >
            <FileSearch size={16} aria-hidden />
            Reivindicar entidade
          </Link>

          <Link
            href="/configuracoes"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg-1"
          >
            <Settings size={16} aria-hidden />
            Configurações
          </Link>

          {isAdmin && (
            <>
              <div className="mx-4 my-0.5 h-px bg-border" />
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg-1"
              >
                <Shield size={16} aria-hidden />
                Admin
              </Link>
            </>
          )}

          <div className="mx-4 my-0.5 h-px bg-border" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-b-lg px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <LogOut size={16} aria-hidden />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
