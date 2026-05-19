'use client'

import { motion } from 'framer-motion'
import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  alertCount?: number
}

export default function Topbar({ title, subtitle, actions, alertCount = 0 }: TopbarProps) {
  const { user } = useAuthStore()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-30 px-6 py-3 anim-fadein"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderBottom: '2px solid #e94560',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25), 0 2px 8px rgba(233,69,96,0.15)'
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Titre */}
        <div>
          <h1 className="text-white font-bold text-base leading-tight">{title}</h1>
          {subtitle && <p className="text-white/35 text-xs mt-0.5">{subtitle}</p>}
        </div>

        {/* Recherche */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Rechercher..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white/6 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#e94560]/50 transition-all"
            />
          </div>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-2">
          {actions}

          {/* Cloche alertes */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <Bell size={15} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e94560] text-white text-[9px] font-bold flex items-center justify-center">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </motion.button>

          {/* Avatar utilisateur */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-white/8 transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#e94560] to-[#6c5ce7] flex items-center justify-center text-white text-[11px] font-bold">
              {user?.nom_complet?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <div className="text-white text-[12px] font-semibold leading-tight">
                {user?.nom_complet || user?.username}
              </div>
              <div className="text-white/35 text-[9px]">{user?.role}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
