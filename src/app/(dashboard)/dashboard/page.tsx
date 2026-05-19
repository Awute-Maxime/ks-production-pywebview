'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, AlertTriangle, Receipt,
  Users, Calendar, Wrench, Package, ArrowUpRight, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA } from '@/lib/utils'
import gsap from 'gsap'
import { dashboardApi } from '@/lib/api/dashboard'

// Données fictives de démonstration
const DEMO_STATS = {
  total_recettes: 4850000,
  total_depenses: 1230000,
  solde_net: 3620000,
  total_impayes: 780000,
  nb_factures: 42,
  nb_payees: 31,
  nb_impayes: 8,
  nb_partielles: 3,
  taux_recouvrement: 74,
  nb_techs_total: 8,
  nb_techs_dispos: 6,
  nb_materiels: 24,
  nb_fournisseurs: 5,
}

const DEMO_MONTHLY = [
  { mois: 'Jan', recettes: 620000, depenses: 180000 },
  { mois: 'Fév', recettes: 480000, depenses: 210000 },
  { mois: 'Mar', recettes: 750000, depenses: 140000 },
  { mois: 'Avr', recettes: 920000, depenses: 290000 },
  { mois: 'Mai', recettes: 1100000, depenses: 310000 },
  { mois: 'Jun', recettes: 980000, depenses: 100000 },
]

const DEMO_SECTIONS = [
  { name: 'Sonorisation', value: 2800000, color: '#e94560' },
  { name: 'Studio', value: 1450000, color: '#6c5ce7' },
  { name: 'Location', value: 600000, color: '#0984e3' },
]

const DEMO_ALERTES = [
  { id: 1, titre: 'Facture impayée — LA VOIE AU TOGO', message: 'FKSP-001 — 320 000 FCFA — 18j de retard', type: 'danger' as const },
  { id: 2, titre: 'Prestation demain', message: 'Mariage ATCHO — Lomé Beach — 10h00', type: 'warning' as const },
  { id: 3, titre: 'Facture partielle — AWUTE Kossi', message: 'FKSP-012 — reste 85 000 FCFA', type: 'warning' as const },
]

function CountUp({ target, prefix = '', suffix = '', duration = 1.5 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => setValue(Math.round(obj.val)),
    })
  }, [target, duration])

  return (
    <span ref={ref}>
      {prefix}{new Intl.NumberFormat('fr-FR').format(value)}{suffix}
    </span>
  )
}

function KpiCard({ label, value, icon: Icon, color, trend, trendLabel, delay = 0 }: {
  label: string; value: number; icon: React.ElementType
  color: string; trend?: 'up' | 'down'; trendLabel?: string; delay?: number
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 relative overflow-hidden group cursor-default transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.06)',
        animationDelay: `${delay}s`
      }}
    >
      {/* Accent couleur haut */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />

      {/* Glow hover subtil */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% 50%, ${color}08 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
            <Icon size={18} style={{ color }} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trendLabel}
            </div>
          )}
        </div>
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</div>
        <div className="text-gray-800 text-xl font-bold leading-tight">
          <CountUp target={value} /> <span className="text-gray-400 text-sm font-normal">FCFA</span>
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl p-3 text-xs shadow-lg border border-gray-100">
      <p className="text-gray-500 font-semibold mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="text-gray-800 font-bold">{formatFCFA(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false)
  const stats = DEMO_STATS

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }

  const stagger = { container: { animate: { transition: { staggerChildren: 0.08 } } } }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Dashboard"
        subtitle={`Mis à jour le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
        alertCount={DEMO_ALERTES.filter(a => a.type === 'danger').length}
        actions={
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Recettes totales" value={stats.total_recettes} icon={TrendingUp} color="#00b894" trend="up" trendLabel="+12%" delay={0} />
          <KpiCard label="Dépenses totales" value={stats.total_depenses} icon={TrendingDown} color="#e94560" trend="down" trendLabel="-5%" delay={0.1} />
          <KpiCard label="Solde net" value={stats.solde_net} icon={TrendingUp} color="#0984e3" delay={0.2} />
          <KpiCard label="Impayés" value={stats.total_impayes} icon={AlertTriangle} color="#e17055" delay={0.3} />
        </div>

        {/* Stats mini */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Factures', value: stats.nb_factures, sub: `${stats.nb_payees} payées`, icon: Receipt, color: '#6c5ce7' },
            { label: 'Clients', value: 18, sub: '3 nouveaux ce mois', icon: Users, color: '#00cec9' },
            { label: 'Techniciens', value: stats.nb_techs_total, sub: `${stats.nb_techs_dispos} disponibles`, icon: Wrench, color: '#fdcb6e' },
            { label: 'Matériels', value: stats.nb_materiels, sub: `${stats.nb_fournisseurs} fournisseurs`, icon: Package, color: '#a29bfe' },
          ].map(({ label, value, sub, icon: Icon, color }, i) => (
            <div key={label} className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all cursor-default"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <div className="text-gray-800 font-bold text-lg leading-tight">
                  <CountUp target={value} duration={1.2} />
                </div>
                <div className="text-gray-500 text-[11px]">{label}</div>
                <div className="text-gray-400 text-[10px]">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Évolution mensuelle */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="mb-5">
              <h3 className="text-gray-800 font-bold text-sm">Évolution mensuelle</h3>
              <p className="text-gray-400 text-xs">Recettes vs Dépenses — 6 derniers mois</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={DEMO_MONTHLY}>
                <defs>
                  <linearGradient id="gradRecettes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b894" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00b894" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e94560" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="mois" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="recettes" name="Recettes" stroke="#00b894" strokeWidth={2} fill="url(#gradRecettes)" />
                <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#e94560" strokeWidth={2} fill="url(#gradDepenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition sections */}
          <div className="bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="text-gray-800 font-bold text-sm mb-1">Répartition</h3>
            <p className="text-gray-400 text-xs mb-4">Par section d'activité</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={DEMO_SECTIONS} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" stroke="none">
                  {DEMO_SECTIONS.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatFCFA(v)} contentStyle={{
                  background: '#fff', border: '1px solid #f0f0f0',
                  borderRadius: '12px', fontSize: '12px', color: '#374151'
                }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {DEMO_SECTIONS.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-500 text-xs flex-1">{s.name}</span>
                  <span className="text-gray-800 text-xs font-bold">{formatFCFA(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Taux recouvrement + Alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Taux */}
          <div className="bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="text-gray-800 font-bold text-sm mb-4">Recouvrement</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <motion.circle
                    cx="60" cy="60" r="50" fill="none" stroke="#e94560" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - stats.taux_recouvrement / 100) }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-gray-800 text-2xl font-bold">
                    <CountUp target={stats.taux_recouvrement} suffix="%" duration={1.5} />
                  </span>
                  <span className="text-gray-400 text-xs">encaissé</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <div className="text-emerald-500 font-bold text-sm">{stats.nb_payees}</div>
                <div className="text-gray-400 text-[10px]">Payées</div>
              </div>
              <div>
                <div className="text-amber-500 font-bold text-sm">{stats.nb_partielles}</div>
                <div className="text-gray-400 text-[10px]">Partielles</div>
              </div>
              <div>
                <div className="text-red-500 font-bold text-sm">{stats.nb_impayes}</div>
                <div className="text-gray-400 text-[10px]">Impayées</div>
              </div>
            </div>
          </div>

          {/* Alertes */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-bold text-sm">Alertes & Notifications</h3>
              <span className="text-xs text-gray-400">{DEMO_ALERTES.length} alertes</span>
            </div>
            <div className="space-y-2">
              {DEMO_ALERTES.map((alerte, i) => (
                <div key={alerte.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${
                    alerte.type === 'danger'
                      ? 'bg-red-50 border-red-100 hover:bg-red-100/60'
                      : 'bg-amber-50 border-amber-100 hover:bg-amber-100/60'
                  }`}
                >
                  <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${alerte.type === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 text-xs font-semibold truncate">{alerte.titre}</div>
                    <div className="text-gray-400 text-[11px] mt-0.5">{alerte.message}</div>
                  </div>
                  <ArrowUpRight size={13} className="text-gray-300 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
