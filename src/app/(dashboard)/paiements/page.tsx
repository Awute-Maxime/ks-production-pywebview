'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Search, Download, Eye, Printer, ChevronDown, X,
  TrendingUp, Wallet, Banknote, Smartphone, CheckCircle2, Clock,
  AlertCircle, Receipt, Filter
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'
import type { Paiement } from '@/types'

const DEMO_PAIEMENTS: Paiement[] = [
  { id:1,  numero:'RECU-19052026-001', date:'2026-05-19', facture_id:1,  n_facture:'FACT-19052026-001', nom_client:'NKRUMAH Events',    montant_facture:420000, montant_paye:210000, reste_du:210000, mode_paiement:'Espèces',       etat_facture:'Partiel' },
  { id:2,  numero:'RECU-18052026-001', date:'2026-05-18', facture_id:2,  n_facture:'FACT-18052026-001', nom_client:'Eglise Victoire',   montant_facture:350000, montant_paye:350000, reste_du:0,      mode_paiement:'Virement',       etat_facture:'Payer' },
  { id:3,  numero:'RECU-17052026-001', date:'2026-05-17', facture_id:3,  n_facture:'FACT-17052026-001', nom_client:'MENSAH Kofi',       montant_facture:280000, montant_paye:280000, reste_du:0,      mode_paiement:'Mobile Money',   etat_facture:'Payer' },
  { id:4,  numero:'RECU-15052026-001', date:'2026-05-15', facture_id:4,  n_facture:'FACT-15052026-001', nom_client:'ATCHO Emmanuel',    montant_facture:310000, montant_paye:100000, reste_du:210000, mode_paiement:'Espèces',       etat_facture:'Partiel' },
  { id:5,  numero:'RECU-12052026-001', date:'2026-05-12', facture_id:5,  n_facture:'FACT-12052026-001', nom_client:'AGBEKO Mawuli',     montant_facture:185000, montant_paye:185000, reste_du:0,      mode_paiement:'Chèque',         etat_facture:'Payer' },
  { id:6,  numero:'RECU-10052026-001', date:'2026-05-10', facture_id:6,  n_facture:'FACT-10052026-001', nom_client:'AMOUZOU Dodji',     montant_facture:120000, montant_paye:120000, reste_du:0,      mode_paiement:'Virement',       etat_facture:'Payer' },
  { id:7,  numero:'RECU-07052026-001', date:'2026-05-07', facture_id:7,  n_facture:'FACT-07052026-001', nom_client:'LA VOIE AU TOGO',   montant_facture:95000,  montant_paye:95000,  reste_du:0,      mode_paiement:'Mobile Money',   etat_facture:'Payer' },
  { id:8,  numero:'RECU-05052026-001', date:'2026-05-05', facture_id:8,  n_facture:'FACT-05052026-001', nom_client:'KONDO KOFFI',       montant_facture:75000,  montant_paye:50000,  reste_du:25000,  mode_paiement:'Espèces',       etat_facture:'Partiel' },
  { id:9,  numero:'RECU-02052026-001', date:'2026-05-02', facture_id:9,  n_facture:'FACT-02052026-001', nom_client:'DOSSOU Patrick',    montant_facture:240000, montant_paye:240000, reste_du:0,      mode_paiement:'Virement',       etat_facture:'Payer' },
  { id:10, numero:'RECU-28042026-001', date:'2026-04-28', facture_id:10, n_facture:'FACT-28042026-001', nom_client:'SOGLO Marie',       montant_facture:160000, montant_paye:160000, reste_du:0,      mode_paiement:'Espèces',       etat_facture:'Payer' },
]

const MODES = [
  { value: '',             label: 'Tous modes',    icon: CreditCard,  color: '#6c5ce7' },
  { value: 'Espèces',     label: 'Espèces',        icon: Banknote,    color: '#00b894' },
  { value: 'Virement',    label: 'Virement',       icon: TrendingUp,  color: '#0984e3' },
  { value: 'Mobile Money',label: 'Mobile Money',   icon: Smartphone,  color: '#e17055' },
  { value: 'Chèque',      label: 'Chèque',         icon: Wallet,      color: '#fdcb6e' },
]

const ETATS = [
  { value: '',        label: 'Tous états' },
  { value: 'Payer',   label: 'Soldée' },
  { value: 'Partiel', label: 'Partielle' },
]

function ModeBadge({ mode }: { mode?: string }) {
  const cfg = MODES.find(m => m.value === mode) ?? MODES[0]
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
      <Icon size={11} />
      {mode ?? '—'}
    </span>
  )
}

function EtatBadge({ etat }: { etat: string }) {
  const isPaye = etat === 'Payer'
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{
        background: isPaye ? '#00b89415' : '#fdcb6e15',
        color: isPaye ? '#00b894' : '#e17055',
        border: `1px solid ${isPaye ? '#00b89430' : '#e1705530'}`,
      }}>
      {isPaye ? <CheckCircle2 size={11} /> : <Clock size={11} />}
      {isPaye ? 'Soldée' : 'Partielle'}
    </span>
  )
}

function StatCard({ label, value, sub, color, icon: Icon, delay = 0 }: {
  label: string; value: string; sub?: string; color: string; icon: React.ElementType; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)`, border: `1px solid ${color}25` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-gray-800 font-bold text-lg leading-tight truncate">{value}</div>
        <div className="text-gray-400 text-xs mt-0.5">{label}</div>
        {sub && <div className="text-xs font-semibold mt-0.5" style={{ color }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

function ModeRepartition({ paiements }: { paiements: Paiement[] }) {
  const modesActifs = MODES.slice(1).map(m => ({
    ...m,
    count: paiements.filter(p => p.mode_paiement === m.value).length,
    total: paiements.filter(p => p.mode_paiement === m.value).reduce((s, p) => s + p.montant_paye, 0),
  })).filter(m => m.count > 0)

  const maxTotal = Math.max(...modesActifs.map(m => m.total), 1)

  return (
    <div className="bg-white rounded-2xl p-5 anim-fadein delay-200"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: '#00b89415' }}>
          <CreditCard size={13} style={{ color: '#00b894' }} />
        </div>
        <span className="text-sm font-bold text-gray-700">Répartition par mode</span>
      </div>
      <div className="space-y-3">
        {modesActifs.map((m, i) => {
          const Icon = m.icon
          const pct = Math.round((m.total / maxTotal) * 100)
          return (
            <div key={m.value}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon size={12} style={{ color: m.color }} />
                  <span className="text-xs font-semibold text-gray-600">{m.label}</span>
                  <span className="text-[10px] text-gray-400">({m.count})</span>
                </div>
                <span className="text-xs font-bold" style={{ color: m.color }}>{formatFCFA(m.total)}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}99)` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PaiementsPage() {
  const [search, setSearch]         = useState('')
  const [filtreMode, setFiltreMode] = useState('')
  const [filtreEtat, setFiltreEtat] = useState('')
  const [selected, setSelected]     = useState<Paiement | null>(null)

  const filtered = DEMO_PAIEMENTS.filter(p => {
    if (filtreMode && p.mode_paiement !== filtreMode) return false
    if (filtreEtat && p.etat_facture !== filtreEtat) return false
    if (search) {
      const q = search.toLowerCase()
      return p.numero.toLowerCase().includes(q) ||
             p.nom_client.toLowerCase().includes(q) ||
             p.n_facture.toLowerCase().includes(q)
    }
    return true
  })

  const totalEncaisse  = DEMO_PAIEMENTS.reduce((s, p) => s + p.montant_paye, 0)
  const totalSoldees   = DEMO_PAIEMENTS.filter(p => p.etat_facture === 'Payer')
  const totalPartiels  = DEMO_PAIEMENTS.filter(p => p.etat_facture === 'Partiel')
  const tauxRecouvrement = Math.round((totalSoldees.length / DEMO_PAIEMENTS.length) * 100)

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Paiements"
        subtitle={`${DEMO_PAIEMENTS.length} reçus · ${formatFCFA(totalEncaisse)} encaissés`}
        actions={
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #00b894, #00a381)', boxShadow: '0 4px 12px rgba(0,184,148,0.3)' }}>
            <Receipt size={15} />
            Nouveau reçu
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total encaissé"    value={formatFCFA(totalEncaisse)}     color="#00b894"  icon={TrendingUp}   delay={0} />
          <StatCard label="Factures soldées"  value={`${totalSoldees.length}`}      sub={`${formatFCFA(totalSoldees.reduce((s,p)=>s+p.montant_paye,0))}`} color="#0984e3" icon={CheckCircle2} delay={0.08} />
          <StatCard label="Paiements partiels" value={`${totalPartiels.length}`}    sub={`${formatFCFA(totalPartiels.reduce((s,p)=>s+p.reste_du,0))} restants`} color="#e17055" icon={Clock} delay={0.16} />
          <StatCard label="Taux recouvrement" value={`${tauxRecouvrement}%`}        sub={`${totalSoldees.length}/${DEMO_PAIEMENTS.length} factures`}         color="#6c5ce7" icon={CreditCard} delay={0.24} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* Left — Filtres + Table */}
          <div className="space-y-4">

            {/* Filtres */}
            <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3 anim-fadein delay-100"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par n°, client, facture..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#00b894]/40 transition-all" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative">
                <select value={filtreMode} onChange={e => setFiltreMode(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
                  {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={filtreEtat} onChange={e => setFiltreEtat(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
                  {ETATS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <span className="text-gray-400 text-xs ml-auto">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
                <Download size={14} /> Export
              </motion.button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl overflow-hidden anim-fadein delay-200"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

              {/* Header */}
              <div className="grid gap-3 px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
                style={{ gridTemplateColumns: '170px 1fr 120px 110px 100px 80px' }}>
                <span>N° Reçu</span>
                <span>Client / Facture</span>
                <span className="text-right">Encaissé</span>
                <span className="text-right">Reste dû</span>
                <span>Mode</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucun paiement trouvé</p>
                  </div>
                ) : filtered.map((p, i) => (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    className="grid gap-3 px-5 py-3.5 items-center transition-all group cursor-pointer"
                    style={{
                      gridTemplateColumns: '170px 1fr 120px 110px 100px 80px',
                      background: selected?.id === p.id
                        ? 'linear-gradient(90deg, #00b89408, #00b89402)'
                        : undefined,
                      borderLeft: selected?.id === p.id ? '3px solid #00b894' : '3px solid transparent',
                    }}
                    whileHover={{ backgroundColor: 'rgba(0,184,148,0.03)' }}>

                    {/* Numéro */}
                    <div>
                      <div className="text-xs font-bold text-[#00b894] font-mono">{p.numero}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(p.date)}</div>
                    </div>

                    {/* Client / Facture */}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{p.nom_client}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{p.n_facture}</div>
                    </div>

                    {/* Encaissé */}
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#00b894]">{formatFCFA(p.montant_paye)}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">/ {formatFCFA(p.montant_facture)}</div>
                    </div>

                    {/* Reste dû */}
                    <div className="text-right">
                      {p.reste_du > 0
                        ? <div className="text-sm font-bold text-[#e17055]">{formatFCFA(p.reste_du)}</div>
                        : <div className="text-sm font-bold text-[#00b894]">—</div>
                      }
                    </div>

                    {/* Mode */}
                    <div><ModeBadge mode={p.mode_paiement} /></div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-all" title="Aperçu">
                        <Eye size={13} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-all" title="Imprimer reçu">
                        <Printer size={13} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{filtered.length} paiement(s) affiché(s)</span>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Total encaissé : <strong className="text-[#00b894]">{formatFCFA(filtered.reduce((s,p)=>s+p.montant_paye,0))}</strong></span>
                  <span>Reste dû : <strong className="text-[#e17055]">{formatFCFA(filtered.reduce((s,p)=>s+p.reste_du,0))}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Répartition + Détail */}
          <div className="space-y-4">
            <ModeRepartition paiements={DEMO_PAIEMENTS} />

            {/* Detail panel */}
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl p-5"
                  style={{ boxShadow: '0 2px 16px rgba(0,184,148,0.12)', border: '1px solid rgba(0,184,148,0.2)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: '#00b89415' }}>
                        <Receipt size={13} style={{ color: '#00b894' }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Détail du reçu</span>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">N° Reçu</div>
                      <div className="text-xs font-bold text-[#00b894] font-mono">{selected.numero}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Client</div>
                      <div className="text-sm font-semibold text-gray-800">{selected.nom_client}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Facture liée</div>
                      <div className="text-xs font-mono text-gray-600">{selected.n_facture}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Montant facture</div>
                        <div className="text-sm font-bold text-gray-700">{formatFCFA(selected.montant_facture)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Encaissé</div>
                        <div className="text-sm font-bold text-[#00b894]">{formatFCFA(selected.montant_paye)}</div>
                      </div>
                    </div>
                    {selected.reste_du > 0 && (
                      <div className="rounded-xl p-3" style={{ background: '#e1705510', border: '1px solid #e1705525' }}>
                        <div className="text-[10px] text-[#e17055] uppercase tracking-wider mb-0.5">Reste à percevoir</div>
                        <div className="text-base font-bold text-[#e17055]">{formatFCFA(selected.reste_du)}</div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Mode</div>
                        <ModeBadge mode={selected.mode_paiement} />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">État</div>
                        <EtatBadge etat={selected.etat_facture} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #00b894, #00a381)', boxShadow: '0 3px 10px rgba(0,184,148,0.25)' }}>
                      <Printer size={14} /> Imprimer
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
                      <Eye size={14} /> Aperçu
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl p-6 text-center"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: '#00b89410' }}>
                    <Receipt size={20} style={{ color: '#00b894' }} className="opacity-50" />
                  </div>
                  <p className="text-xs text-gray-400">Cliquez sur un paiement<br/>pour voir le détail</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
