'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Receipt, FileText, ArrowLeftRight, Users, Clock,
  Bell, BarChart2, Grid, UserCog, Wrench, Package, Store,
  CreditCard, Settings, HardDrive, RotateCcw, LogOut, User,
  Music, ChevronRight, DollarSign, Cog, Factory
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api/auth'

// Liens directs — toujours visibles
const DIRECT_LINKS = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard, color: '#e94560' },
  { href: '/factures',   label: 'Factures',   icon: Receipt,         color: '#0984e3' },
  { href: '/proformas',  label: 'Proformas',  icon: FileText,        color: '#6c5ce7' },
  { href: '/agenda',     label: 'Agenda',     icon: Clock,           color: '#00b894' },
  { href: '/operations', label: 'Opérations', icon: ArrowLeftRight,  color: '#fdcb6e' },
  { href: '/clients',    label: 'Clients',    icon: Users,           color: '#00cec9' },
]

// Catégories avec flyout
const CATEGORIES = [
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    color: '#0984e3',
    items: [
      { href: '/paiements', label: 'Paiements',  icon: CreditCard },
      { href: '/relances',  label: 'Relances',   icon: Bell },
      { href: '/rapport',   label: 'Rapport',    icon: BarChart2 },
    ],
  },
  {
    id: 'production',
    label: 'Production',
    icon: Factory,
    color: '#00b894',
    adminOnly: false,
    items: [
      { href: '/techniciens',  label: 'Techniciens',   icon: Wrench },
      { href: '/materiels',    label: 'Matériels',     icon: Package },
      { href: '/fournisseurs', label: 'Fournisseurs',  icon: Store },
      { href: '/paie',         label: 'Paie & Primes', icon: CreditCard },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Cog,
    color: '#6c5ce7',
    adminOnly: true,
    items: [
      { href: '/services',      label: 'Services',      icon: Grid },
      { href: '/utilisateurs',  label: 'Utilisateurs',  icon: UserCog },
      { href: '/parametres',    label: 'Paramètres',    icon: Settings },
      { href: '/sauvegarde',    label: 'Sauvegarde',    icon: HardDrive },
      { href: '/reinitialiser', label: 'Réinitialiser', icon: RotateCcw, danger: true },
    ],
  },
]

function FlyoutPanel({ category, pathname }: { category: typeof CATEGORIES[0]; pathname: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scaleX: 0.95 }}
      animate={{ opacity: 1, x: 0, scaleX: 1 }}
      exit={{ opacity: 0, x: -8, scaleX: 0.95 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute left-full top-0 ml-2 w-48 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'linear-gradient(145deg, #1e1e35, #16213e)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '8px 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Header catégorie */}
      <div className="px-4 py-3 border-b border-white/6 flex items-center gap-2">
        <div className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: `${category.color}25` }}>
          <category.icon size={11} style={{ color: category.color }} />
        </div>
        <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">
          {category.label}
        </span>
      </div>

      {/* Items */}
      <div className="p-2">
        {category.items.map(({ href, label, icon: Icon, danger }) => {
          const active = pathname === href || pathname?.startsWith(href + '/')
          return (
            <Link key={href} href={href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer',
                active
                  ? 'text-white font-semibold'
                  : danger
                  ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-white/55 hover:text-white hover:bg-white/6',
              )}
                style={active ? { background: `${category.color}20`, color: category.color } : {}}
              >
                <Icon size={14} className="shrink-0" />
                {label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: category.color }} />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    router.push('/login')
  }

  // Vérifie si une catégorie contient la page active
  const isCatActive = (cat: typeof CATEGORIES[0]) =>
    cat.items.some(i => pathname === i.href || pathname?.startsWith(i.href + '/'))

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-50"
      style={{
        width: 220,
        background: 'linear-gradient(180deg, #0f0f1a 0%, #12122a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 min-h-[60px]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e94560] to-[#6c5ce7] flex items-center justify-center shadow-lg shrink-0">
          <Music size={14} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">
            KS <span className="text-[#e94560]">Production</span>
          </div>
          <div className="text-white/25 text-[9px] font-medium tracking-widest uppercase">Studio & Sono</div>
        </div>
      </div>

      {/* Nav principale */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">

        {/* Liens directs */}
        <div className="space-y-0.5 mb-3">
          {DIRECT_LINKS.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href || pathname?.startsWith(href + '/')
            return (
              <Link key={href} href={href}>
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/55 hover:text-white hover:bg-white/5'
                )}>
                  {/* Icône colorée */}
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: active ? `${color}30` : `${color}18`,
                      border: `1px solid ${color}${active ? '50' : '28'}`,
                    }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <span>{label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: color }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Séparateur */}
        <div className="h-px bg-white/5 mx-1 mb-3" />

        {/* Catégories avec flyout */}
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => {
            if (cat.adminOnly && user?.role !== 'Administrateur') return null
            const active = isCatActive(cat)
            const open = hoveredCat === cat.id

            return (
              <div key={cat.id} className="relative"
                onMouseEnter={() => setHoveredCat(cat.id)}
                onMouseLeave={() => setHoveredCat(null)}
              >
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer select-none',
                  open || active
                    ? 'text-white bg-white/8'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}>
                  {/* Icône colorée */}
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: open || active ? `${cat.color}25` : 'transparent',
                      border: open || active ? `1px solid ${cat.color}40` : '1px solid transparent',
                    }}>
                    <cat.icon size={13} style={{ color: open || active ? cat.color : undefined }} />
                  </div>

                  <span>{cat.label}</span>

                  {/* Badge nombre d'items */}
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all"
                    style={{
                      background: open || active ? `${cat.color}20` : 'rgba(255,255,255,0.06)',
                      color: open || active ? cat.color : 'rgba(255,255,255,0.3)',
                    }}>
                    {cat.items.length}
                  </span>

                  <ChevronRight size={11} className={cn(
                    'transition-transform duration-200 text-white/25',
                    open && 'rotate-90 text-white/60'
                  )} />
                </div>

                {/* Flyout panel */}
                <AnimatePresence>
                  {open && <FlyoutPanel category={cat} pathname={pathname || ''} />}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-3 space-y-0.5">
        <Link href="/profil">
          <div className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer',
            pathname === '/profil' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
          )}>
            <User size={15} className="shrink-0" />
            Mon Profil
          </div>
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/8 transition-all">
          <LogOut size={15} className="shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
