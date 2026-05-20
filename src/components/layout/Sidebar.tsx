'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Receipt, FileText, ArrowLeftRight, Users, Clock,
  Bell, BarChart2, Grid, UserCog, Wrench, Package, Store,
  CreditCard, Settings, HardDrive, RotateCcw, LogOut, User,
  Music, ChevronDown, DollarSign, Cog, Factory
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api/auth'

const DIRECT_LINKS = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard, color: '#e94560' },
  { href: '/factures',   label: 'Factures',   icon: Receipt,         color: '#0984e3' },
  { href: '/proformas',  label: 'Proformas',  icon: FileText,        color: '#6c5ce7' },
  { href: '/agenda',     label: 'Agenda',     icon: Clock,           color: '#00b894' },
  { href: '/operations', label: 'Opérations', icon: ArrowLeftRight,  color: '#fdcb6e' },
  { href: '/clients',    label: 'Clients',    icon: Users,           color: '#00cec9' },
]

const CATEGORIES = [
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    color: '#0984e3',
    adminOnly: false,
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

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const getDefaultOpen = () => {
    const cat = CATEGORIES.find(c => c.items.some(i => pathname === i.href || pathname?.startsWith(i.href + '/')))
    return cat?.id ?? null
  }

  const [openCat, setOpenCat] = useState<string | null>(getDefaultOpen)

  useEffect(() => {
    const cat = CATEGORIES.find(c => c.items.some(i => pathname === i.href || pathname?.startsWith(i.href + '/')))
    if (cat) setOpenCat(cat.id)
  }, [pathname])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    router.push('/login')
  }

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

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">

        {/* Liens directs */}
        <div className="space-y-0.5 mb-3">
          {DIRECT_LINKS.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href || pathname?.startsWith(href + '/')
            return (
              <Link key={href} href={href}>
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer',
                  active ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
                )}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: active ? `${color}30` : `${color}18`,
                      border: `1px solid ${color}${active ? '50' : '28'}`,
                    }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <span>{label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Séparateur */}
        <div className="h-px bg-white/5 mx-1 mb-3" />

        {/* Catégories accordéon */}
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => {
            if (cat.adminOnly && user?.role !== 'Administrateur') return null
            const active = isCatActive(cat)
            const open = openCat === cat.id

            return (
              <div key={cat.id}>
                {/* Bouton catégorie */}
                <button
                  onClick={() => setOpenCat(open ? null : cat.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer select-none',
                    open || active ? 'text-white bg-white/8' : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: open || active ? `${cat.color}25` : 'transparent',
                      border: open || active ? `1px solid ${cat.color}40` : '1px solid transparent',
                    }}>
                    <cat.icon size={13} style={{ color: open || active ? cat.color : undefined }} />
                  </div>

                  <span>{cat.label}</span>

                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all"
                    style={{
                      background: open || active ? `${cat.color}20` : 'rgba(255,255,255,0.06)',
                      color: open || active ? cat.color : 'rgba(255,255,255,0.3)',
                    }}>
                    {cat.items.length}
                  </span>

                  <ChevronDown size={11} className={cn(
                    'transition-transform duration-200 text-white/25 shrink-0',
                    open && 'rotate-180 text-white/60'
                  )} />
                </button>

                {/* Sous-items accordéon */}
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-0.5 ml-3 pl-3 space-y-0.5 border-l"
                        style={{ borderColor: `${cat.color}30` }}>
                        {cat.items.map(({ href, label, icon: Icon, danger }: any) => {
                          const itemActive = pathname === href || pathname?.startsWith(href + '/')
                          return (
                            <Link key={href} href={href}>
                              <div className={cn(
                                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer',
                                itemActive
                                  ? 'text-white font-semibold'
                                  : danger
                                  ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10'
                                  : 'text-white/50 hover:text-white hover:bg-white/5'
                              )}
                                style={itemActive ? { background: `${cat.color}18`, color: cat.color } : {}}
                              >
                                <Icon size={13} className="shrink-0" />
                                {label}
                                {itemActive && (
                                  <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ background: cat.color }} />
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
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
