'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, TrendingDown, Download, Printer,
  Calendar, Filter, ChevronDown, X, ArrowUpRight, ArrowDownRight,
  Receipt, Wallet, AlertCircle, CheckCircle2, DollarSign
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'

// ── Données de démo ─────────────────────────────────────────────────────────

const DEMO_MONTHLY = [
  { mois: 'Jan', recettes: 620000,  depenses: 180000 },
  { mois: 'Fév', recettes: 480000,  depenses: 210000 },
  { mois: 'Mar', recettes: 750000,  depenses: 140000 },
  { mois: 'Avr', recettes: 920000,  depenses: 290000 },
  { mois: 'Mai', recettes: 1100000, depenses: 310000 },
  { mois: 'Jun', recettes: 980000,  depenses: 100000 },
]

const DEMO_SECTIONS = [
  { name: 'Sonorisation', value: 2800000, color: '#e94560' },
  { name: 'Studio',       value: 1450000, color: '#6c5ce7' },
  { name: 'Location',     value: 600000,  color: '#0984e3' },
]

const DEMO_TOP_CLIENTS = [
  { nom: 'LA VOIE AU TOGO',  ca: 1250000 },
  { nom: 'Eglise Grâce',     ca: 354000  },
  { nom: 'AWUTE Kossi',      ca: 326000  },
  { nom: 'KONDO KOFFI',      ca: 295000  },
  { nom: 'NKRUMAH Events',   ca: 180000  },
]

const DEMO_DEPENSES = [
  { cat: 'Salaires',   montant: 480000 },
  { cat: 'Achats',     montant: 290000 },
  { cat: 'Charges',    montant: 180000 },
  { cat: 'Transport',  montant: 130000 },
  { cat: 'Primes',     montant: 100000 },
  { cat: 'Autres',     montant: 70000  },
]

const DEMO_OPERATIONS = [
  { id:1,  date:'2026-05-19', numero:'OPE-19052026-001', client:'LA VOIE AU TOGO',   service:'Reconnaissance Soeur DIG',         montant:80000,  type:'Recettes', section:'Sonorisation' },
  { id:2,  date:'2026-05-19', numero:'OPE-19052026-002', client:'LA VOIE AU TOGO',   service:'Reconnaissance Nestor MA',         montant:80000,  type:'Recettes', section:'Sonorisation' },
  { id:3,  date:'2026-05-18', numero:'OPE-18052026-001', client:'Fournisseur Audio',  service:'Achat câbles XLR (lot 20)',        montant:45000,  type:'Depenses', section:'Sonorisation' },
  { id:4,  date:'2026-05-15', numero:'OPE-15052026-001', client:'AWUTE Kossi',        service:'Enregistrement — Album complet',   montant:150000, type:'Recettes', section:'Studio'       },
  { id:5,  date:'2026-05-14', numero:'OPE-14052026-001', client:'Salaires Mai 2026',  service:'Salaire Technicien Son Kofi',      montant:80000,  type:'Depenses', section:'Administration'},
  { id:6,  date:'2026-05-10', numero:'OPE-10052026-001', client:'KONDO KOFFI',        service:'Sonorisation Mariage — Plein air', montant:236000, type:'Recettes', section:'Sonorisation' },
  { id:7,  date:'2026-05-09', numero:'OPE-09052026-001', client:'Location véhicule',  service:'Transport matériel Mariage',       montant:15000,  type:'Depenses', section:'Sonorisation' },
  { id:8,  date:'2026-05-08', numero:'OPE-08052026-001', client:'ATCHO Emmanuel',     service:'Location matériel sonorisation',   montant:59000,  type:'Recettes', section:'Sonorisation' },
  { id:9,  date:'2026-05-07', numero:'OPE-07052026-001', client:'Electricité CEET',   service:'Facture électricité Studio',       montant:22000,  type:'Depenses', section:'Studio'       },
  { id:10, date:'2026-05-05', numero:'OPE-05052026-001', client:'MENSAH Kofi',        service:'Mixage & Mastering — EP 5 titres', montant:95000,  type:'Recettes', section:'Studio'       },
  { id:11, date:'2026-05-04', numero:'OPE-04052026-001', client:'Prime prestation',   service:'Prime Technicien ATSUTSUI',        montant:25000,  type:'Depenses', section:'Sonorisation' },
  { id:12, date:'2026-05-01', numero:'OPE-01052026-001', client:'Eglise Grâce',       service:'Sonorisation Concert de Louange',  montant:354000, type:'Recettes', section:'Sonorisation' },
]

const PERIODES = [
  { label: 'Ce mois',      debut: '2026-05-01', fin: '2026-05-31' },
  { label: 'Mois dernier', debut: '2026-04-01', fin: '2026-04-30' },
  { label: '3 derniers mois', debut: '2026-03-01', fin: '2026-05-31' },
  { label: 'Cette année',  debut: '2026-01-01', fin: '2026-12-31' },
]

const SECTIONS = ['', 'Sonorisation', 'Studio', 'Location', 'Administration']

// ── Tooltip personnalisé ─────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-xs" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div className="font-semibold text-white/70 mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name === 'recettes' ? 'Recettes' : 'Dépenses'} :</span>
          <span className="text-white font-semibold">{formatFCFA(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────────────────────

export default function RapportPage() {
  const [periode, setPeriode] = useState(PERIODES[0])
  const [section, setSection] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | 'Recettes' | 'Depenses'>('all')

  const totalRecettes = 4850000
  const totalDepenses = 1230000
  const soldeNet      = totalRecettes - totalDepenses
  const totalFacture  = 5200000
  const totalEncaisse = 3900000
  const totalImpayes  = 1300000
  const tauxRecouvrement = Math.round((totalEncaisse / totalFacture) * 100)

  const operations = DEMO_OPERATIONS.filter(op =>
    (typeFilter === 'all' || op.type === typeFilter) &&
    (!section || op.section === section)
  )

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#f0f2f8' }}>
      <Topbar
        title="Rapport Financier"
        subtitle={`Période : ${periode.label}`}
        alertCount={0}
        actions={
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
            >
              <Printer size={13} /> Imprimer
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #e94560, #6c5ce7)' }}
            >
              <Download size={13} /> Exporter
            </motion.button>
          </div>
        }
      />

      <div className="p-6 space-y-6">

        {/* ── Filtres ── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
        >
          {/* Raccourcis période */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1.5"><Calendar size={12} /> Période</span>
            {PERIODES.map(p => (
              <button key={p.label} onClick={() => setPeriode(p)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={periode.label === p.label
                  ? { background: '#e94560', color: '#fff' }
                  : { background: '#f3f4f6', color: '#6b7280', border: '1.5px solid #e5e7eb' }
                }
              >{p.label}</button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: showFilters ? '#0984e320' : '#f3f4f6', color: showFilters ? '#0984e3' : '#6b7280', border: `1.5px solid ${showFilters ? '#0984e340' : '#e5e7eb'}` }}
            >
              <Filter size={11} /> Filtres avancés <ChevronDown size={11} className={showFilters ? 'rotate-180' : ''} style={{ transition: 'transform .2s' }} />
            </button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="flex items-end gap-4 pt-4 border-t border-gray-100"
            >
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Date début</label>
                <input type="date" defaultValue={periode.debut}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Date fin</label>
                <input type="date" defaultValue={periode.fin}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Section</label>
                <select value={section} onChange={e => setSection(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                  {SECTIONS.map(s => <option key={s} value={s}>{s || 'Toutes les sections'}</option>)}
                </select>
              </div>
              <button onClick={() => { setSection(''); setShowFilters(false) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all">
                <X size={12} /> Réinitialiser
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* ── KPIs Financiers ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Recettes totales',   value: totalRecettes, color: '#00b894', icon: TrendingUp,     trend: '+12%', bg: 'linear-gradient(135deg, #00b894, #00cec9)' },
            { label: 'Dépenses totales',   value: totalDepenses, color: '#e17055', icon: TrendingDown,   trend: '-5%',  bg: 'linear-gradient(135deg, #e17055, #d63031)' },
            { label: soldeNet >= 0 ? 'Bénéfice net' : 'Déficit net',
                                           value: Math.abs(soldeNet), color: soldeNet >= 0 ? '#0984e3' : '#636e72',
                                           icon: soldeNet >= 0 ? ArrowUpRight : ArrowDownRight,
                                           trend: soldeNet >= 0 ? 'Positif' : 'Négatif',
                                           bg: soldeNet >= 0 ? 'linear-gradient(135deg, #0984e3, #6c5ce7)' : 'linear-gradient(135deg, #636e72, #2d3436)' },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ background: kpi.bg, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            >
              <div className="absolute -right-4 -top-4 opacity-15">
                <kpi.icon size={72} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{kpi.label}</div>
              <div className="text-2xl font-bold leading-tight">{formatFCFA(kpi.value)}</div>
              <div className="text-xs opacity-70 mt-1.5 font-medium">{kpi.trend} vs mois précédent</div>
            </motion.div>
          ))}
        </div>

        {/* ── KPIs Factures ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total facturé',    value: totalFacture,  icon: Receipt,       color: '#6c5ce7' },
            { label: 'Total encaissé',   value: totalEncaisse, icon: CheckCircle2,  color: '#00b894' },
            { label: 'Total impayés',    value: totalImpayes,  icon: AlertCircle,   color: '#e94560' },
            { label: 'Taux recouvrement', value: null, icon: Wallet, color: '#0984e3', pct: tauxRecouvrement },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06 }}
              className="bg-white rounded-2xl p-4 relative overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: k.color }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15` }}>
                  <k.icon size={15} style={{ color: k.color }} />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{k.label}</span>
              </div>
              {k.pct !== undefined ? (
                <div>
                  <div className="text-2xl font-bold text-gray-800">{k.pct}%</div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${k.pct}%`, background: k.color }} />
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold text-gray-800">{formatFCFA(k.value!)}</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Graphiques row 1 ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Évolution mensuelle */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="col-span-2 bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={15} className="text-[#e94560]" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Évolution mensuelle — Recettes vs Dépenses</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={DEMO_MONTHLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00b894" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00b894" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#e94560" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="recettes" stroke="#00b894" strokeWidth={2.5} fill="url(#gRec)" />
                <Area type="monotone" dataKey="depenses" stroke="#e94560" strokeWidth={2}   fill="url(#gDep)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 justify-end">
              <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-0.5 rounded bg-[#00b894]" /> Recettes</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-0.5 rounded bg-[#e94560]" /> Dépenses</div>
            </div>
          </motion.div>

          {/* Répartition par section */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={15} className="text-[#6c5ce7]" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Répartition par section</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={DEMO_SECTIONS} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" strokeWidth={0}>
                  {DEMO_SECTIONS.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatFCFA(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {DEMO_SECTIONS.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-gray-500">{s.name}</span>
                  </div>
                  <span className="font-semibold text-gray-700">{formatFCFA(s.value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Graphiques row 2 ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top 5 clients */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-[#00b894]" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Top 5 clients par CA</span>
            </div>
            <div className="space-y-3">
              {DEMO_TOP_CLIENTS.map((c, i) => {
                const max = DEMO_TOP_CLIENTS[0].ca
                const pct = Math.round((c.ca / max) * 100)
                return (
                  <div key={c.nom}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: ['#e94560','#6c5ce7','#0984e3','#00b894','#fdcb6e'][i] }}>{i+1}</span>
                        <span className="font-medium text-gray-700 truncate max-w-[140px]">{c.nom}</span>
                      </div>
                      <span className="font-semibold text-gray-600">{formatFCFA(c.ca)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ['#e94560','#6c5ce7','#0984e3','#00b894','#fdcb6e'][i] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Répartition dépenses */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={15} className="text-[#e17055]" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Répartition des dépenses</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={DEMO_DEPENSES} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="cat" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip formatter={(v: number) => formatFCFA(v)} />
                <Bar dataKey="montant" fill="#e17055" radius={[0, 6, 6, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── Journal des opérations ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Receipt size={15} className="text-[#e94560]" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Journal des opérations</span>
              <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#e9456015', color: '#e94560' }}>
                {operations.length}
              </span>
            </div>
            {/* Filtre type */}
            <div className="flex items-center gap-1">
              {(['all', 'Recettes', 'Depenses'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={typeFilter === t
                    ? { background: t === 'Recettes' ? '#00b89420' : t === 'Depenses' ? '#e9456015' : '#6c5ce720', color: t === 'Recettes' ? '#00b894' : t === 'Depenses' ? '#e94560' : '#6c5ce7' }
                    : { color: '#9ca3af' }
                  }
                >{t === 'all' ? 'Tout' : t}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Date', 'Référence', 'Client / Motif', 'Section', 'Montant', 'Type'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {operations.map((op, i) => (
                  <tr key={op.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(op.date)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{op.numero}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-700">{op.client}</div>
                      <div className="text-gray-400 mt-0.5">{op.service}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          background: op.section === 'Sonorisation' ? '#e9456012' : op.section === 'Studio' ? '#6c5ce712' : '#0984e312',
                          color:      op.section === 'Sonorisation' ? '#e94560'   : op.section === 'Studio' ? '#6c5ce7'   : '#0984e3',
                        }}>
                        {op.section}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap" style={{ color: op.type === 'Recettes' ? '#00b894' : '#e94560' }}>
                      {op.type === 'Recettes' ? '+' : '-'} {formatFCFA(op.montant)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={op.type === 'Recettes'
                          ? { background: '#00b89415', color: '#00b894' }
                          : { background: '#e9456015', color: '#e94560' }
                        }>{op.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
