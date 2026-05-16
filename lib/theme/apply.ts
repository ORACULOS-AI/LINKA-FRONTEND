import type { TenantConfig } from '@/lib/api/config'

export function applyTenantTheme(tenant: TenantConfig) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (tenant.primary_color) root.style.setProperty('--color-primary', tenant.primary_color)
  if (tenant.secondary_color) root.style.setProperty('--color-secondary', tenant.secondary_color)
  if (tenant.accent_color) root.style.setProperty('--color-accent', tenant.accent_color)
  if (tenant.font_family) root.style.setProperty('--font-tenant', tenant.font_family)
  if (tenant.favicon_url) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = tenant.favicon_url
  }
}
