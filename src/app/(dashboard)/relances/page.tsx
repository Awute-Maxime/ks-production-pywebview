'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Search, X, ChevronDown, Send, Eye, FileText,
  AlertTriangle, AlertCircle, Clock, TrendingDown,
  Users, Printer, Filter, Mail, Phone
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'

interface Relance {
  id: number
  nom_client: string
  telephone?: string
  n_facture: string
  date_facture: string
  montant_ttc: number
  montant_paye: number
  reste_du: number
  jours_retard: number
  niveau: 1 | 2 | 3
  derniere_relance?: string
  section: string
}

const DEMO_RELANCES: Relance[] = [
  { id:1, nom_client:'NKRUMAH Events',    telephone:'90123456', n_facture:'FACT-19052026-001', date_facture:'2026-05-19', montant_ttc:420000, montant_paye:210000, reste_du:210000, jours_retard:0,  niveau:1, section:'Sonorisation' },
  { id:2, nom_client:'ATCHO Emmanuel',    telephone:'91234567', n_facture:'FACT-15052026-001', date_facture:'2026-05-15', montant_ttc:310000, montant_paye:100000, reste_du:210000, jours_retard:4,  niveau:1, derniere_relance:'2026-05-16', section:'Sonorisation' },
  { id:3, nom_client:'KONDO KOFFI',       telephone:'92345678', n_facture:'FACT-05052026-001', date_facture:'2026-05-05', montant_ttc:75000,  montant_paye:50000,  reste_du:25000,  jours_retard:14, niveau:2, derniere_relance:'2026-05-10', section:'Studio' },
  { id:4, nom_client:'AMOUZOU Dodji',     telephone:'93456789', n_facture:'FACT-05052026-002', date_facture:'2026-04-20', montant_ttc:120000, montant_paye:0,      reste_du:120000, jours_retard:29, niveau:2, derniere_relance:'2026-05-01', section:'Sonorisation' },
  { id:5, nom_client:'LA VOIE AU TOGO',   telephone:'94567890', n_facture:'FACT-01042026-001', date_facture:'2026-04-01', montant_ttc:95000,  montant_paye:0,      reste_du:95000,  jours_retard:48, niveau:3, derniere_relance:'2026-04-20', section:'Sonorisation' },
  { id:6, nom_client:'SOGLO Enterprises', telephone:'95678901', n_facture:'FACT-15032026-001', date_facture:'2026-03-15', montant_ttc:280000, montant_paye:0,      reste_du:280000, jours_retard:65, niveau:3, derniere_relance:'2026-04-15', section:'Studio' },
]

const NIVEAUX = [
  { value: 0, label: 'Tous niveaux',    icon: Filter,        color: '#6c5ce7' },
  { value: 1, label: '1ère relance',    icon: Clock,         color: '#fdcb6e' },
  { value: 2, label: '2ème relance',    icon: AlertTriangle, color: '#e17055' },
  { value: 3, label: 'Contentieux',     icon: AlertCircle,   color: '#d63031' },
]

function NiveauBadge({ niveau }: { niveau: 1 | 2 | 3 }) {
  const cfg = NIVEAUX[niveau]
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function JoursRetardBadge({ jours }: { jours: number }) {
  const color = jours === 0 ? '#00b894' : jours < 15 ? '#fdcb6e' : jours < 45 ? '#e17055' : '#d63031'
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
      style={{ background: `${color}15`, color }}>
      {jours === 0 ? 'Aujourd\'hui' : `+${jours}j`}
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

function UrgenceBar({ relances }: { relances: Relance[] }) {
  const niv1 = relances.filter(r => r.niveau === 1)
  const niv2 = relances.filter(r => r.niveau === 2)
  const niv3 = relances.filter(r => r.niveau === 3)
  const total = relances.length || 1

  return (
    <div className="bg-white rounded-2xl p-5 anim-fadein delay-200"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#e1705515' }}>
          <TrendingDown size={13} style={{ color: '#e17055' }} />
        </div>
        <span className="text-sm font-bold text-gray-700">Répartition par urgence</span>
      </div>

      <div className="space-y-3">
        {[
          { label: '1ère relance', count: niv1.length, montant: niv1.reduce((s,r)=>s+r.reste_du,0), color: '#fdcb6e' },
          { label: '2ème relance', count: niv2.length, montant: niv2.reduce((s,r)=>s+r.reste_du,0), color: '#e17055' },
          { label: 'Contentieux',  count: niv3.length, montant: niv3.reduce((s,r)=>s+r.reste_du,0), color: '#d63031' },
        ].map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-xs font-semibold text-gray-600">{item.label}</span>
                <span className="text-[10px] text-gray-400">({item.count})</span>
              </div>
              <span className="text-xs font-bold" style={{ color: item.color }}>{formatFCFA(item.montant)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / total) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.12 + 0.3, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total à recouvrer</div>
        <div className="text-lg font-bold text-gray-800">
          {formatFCFA(relances.reduce((s,r)=>s+r.reste_du,0))}
        </div>
      </div>
    </div>
  )
}

export default function RelancesPage() {
  const [search, setSearch]         = useState('')
  const [filtreNiveau, setFiltreNiveau] = useState(0)
  const [selected, setSelected]     = useState<Relance | null>(null)

  const filtered = DEMO_RELANCES.filter(r => {
    if (filtreNiveau && r.niveau !== filtreNiveau) return false
    if (search) {
      const q = search.toLowerCase()
      return r.nom_client.toLowerCase().includes(q) ||
             r.n_facture.toLowerCase().includes(q)
    }
    return true
  })

  const totalDu       = DEMO_RELANCES.reduce((s,r) => s+r.reste_du, 0)
  const enContentieux = DEMO_RELANCES.filter(r => r.niveau === 3)
  const plusUrgents   = DEMO_RELANCES.filter(r => r.jours_retard >= 30)

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Relances"
        subtitle={`${DEMO_RELANCES.length} impayés · ${formatFCFA(totalDu)} à recouvrer`}
        actions={
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #e17055, #d63031)', boxShadow: '0 4px 12px rgba(225,112,85,0.35)' }}>
            <Send size={15} />
            Envoyer relances
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total à recouvrer" value={formatFCFA(totalDu)}         color="#e17055"  icon={TrendingDown}   delay={0}    />
          <StatCard label="Dossiers actifs"   value={`${DEMO_RELANCES.length}`}   sub="clients en retard" color="#fdcb6e" icon={Users} delay={0.08} />
          <StatCard label="En contentieux"    value={`${enContentieux.length}`}   sub={formatFCFA(enContentieux.reduce((s,r)=>s+r.reste_du,0))} color="#d63031" icon={AlertCircle} delay={0.16} />
          <StatCard label="Retard > 30 jours" value={`${plusUrgents.length}`}     sub="dossiers critiques" color="#6c5ce7" icon={AlertTriangle} delay={0.24} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* Left */}
          <div className="space-y-4">

            {/* Filtre niveau + recherche */}
            <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3 anim-fadein delay-100"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

              {/* Boutons niveau */}
              <div className="flex items-center gap-2">
                {NIVEAUX.map(n => {
                  const Icon = n.icon
                  const active = filtreNiveau === n.value
                  return (
                    <motion.button key={n.value}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => setFiltreNiveau(n.value)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: active ? `${n.color}20` : '#f8f9fa',
                        color: active ? n.color : '#9ca3af',
                        border: `1px solid ${active ? n.color + '40' : '#e5e7eb'}`,
                      }}>
                      <Icon size={11} />
                      {n.label}
                    </motion.button>
                  )
                })}
              </div>

              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Client ou n° facture..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#e17055]/40 transition-all" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <span className="text-gray-400 text-xs ml-auto">{filtered.length} dossier{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Liste des relances */}
            <div className="space-y-2.5 anim-fadein delay-200">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl p-12 text-center"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <Bell size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-400">Aucune relance trouvée</p>
                  </motion.div>
                ) : filtered.map((r, i) => {
                  const isSelected = selected?.id === r.id
                  const niveauColor = NIVEAUX[r.niveau].color
                  return (
                    <motion.div key={r.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      onClick={() => setSelected(isSelected ? null : r)}
                      className="bg-white rounded-2xl p-4 cursor-pointer transition-all group relative overflow-hidden"
                      style={{
                        boxShadow: isSelected
                          ? `0 4px 20px ${niveauColor}20`
                          : '0 2px 12px rgba(0,0,0,0.05)',
                        border: `1px solid ${isSelected ? niveauColor + '40' : 'rgba(0,0,0,0.06)'}`,
                      }}
                      whileHover={{ y: -2, boxShadow: `0 6px 24px ${niveauColor}18` }}>

                      {/* Bande colorée gauche */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ background: `linear-gradient(180deg, ${niveauColor}, ${niveauColor}66)` }} />

                      <div className="pl-3 flex items-start gap-4">
                        {/* Icône urgence */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${niveauColor}15`, border: `1px solid ${niveauColor}25` }}>
                          {r.niveau === 1 ? <Clock size={16} style={{ color: niveauColor }} />
                            : r.niveau === 2 ? <AlertTriangle size={16} style={{ color: niveauColor }} />
                            : <AlertCircle size={16} style={{ color: niveauColor }} />}
                        </div>

                        {/* Infos principales */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-800">{r.nom_client}</span>
                            <NiveauBadge niveau={r.niveau} />
                            <JoursRetardBadge jours={r.jours_retard} />
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="font-mono">{r.n_facture}</span>
                            <span>·</span>
                            <span>Facturée le {formatDate(r.date_facture)}</span>
                            {r.derniere_relance && (
                              <>
                                <span>·</span>
                                <span>Dernière relance : {formatDate(r.derniere_relance)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Montants */}
                        <div className="text-right shrink-0">
                          <div className="text-base font-bold" style={{ color: niveauColor }}>
                            {formatFCFA(r.reste_du)}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            / {formatFCFA(r.montant_ttc)}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: '#f8f9fa' }}>
                              {r.section}
                            </span>
                          </div>
                        </div>

                        {/* Actions hover */}
                        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={e => { e.stopPropagation() }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: `${niveauColor}15`, color: niveauColor }}
                            title="Envoyer relance">
                            <Send size={12} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={e => { e.stopPropagation() }}
                            className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-all"
                            title="Voir facture">
                            <Eye size={12} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={e => { e.stopPropagation() }}
                            className="w-7 h-7 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-all"
                            title="Imprimer lettre">
                            <Printer size={12} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right — Urgence + Détail */}
          <div className="space-y-4">
            <UrgenceBar relances={DEMO_RELANCES} />

            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl p-5"
                  style={{
                    boxShadow: `0 4px 24px ${NIVEAUX[selected.niveau].color}18`,
                    border: `1px solid ${NIVEAUX[selected.niveau].color}30`,
                  }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: `${NIVEAUX[selected.niveau].color}15` }}>
                        <Bell size={13} style={{ color: NIVEAUX[selected.niveau].color }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Dossier client</span>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Client</div>
                      <div className="text-sm font-bold text-gray-800">{selected.nom_client}</div>
                    </div>

                    {selected.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone size={11} className="text-gray-400" />
                        <span className="text-xs text-gray-600">{selected.telephone}</span>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Facture</div>
                      <div className="text-xs font-mono text-gray-600">{selected.n_facture}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">émise le {formatDate(selected.date_facture)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-3" style={{ background: '#f8f9fa' }}>
                        <div className="text-[9px] text-gray-400 uppercase mb-1">Facturé</div>
                        <div className="text-sm font-bold text-gray-700">{formatFCFA(selected.montant_ttc)}</div>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: '#00b89410' }}>
                        <div className="text-[9px] text-gray-400 uppercase mb-1">Payé</div>
                        <div className="text-sm font-bold text-[#00b894]">{formatFCFA(selected.montant_paye)}</div>
                      </div>
                    </div>

                    <div className="rounded-xl p-3"
                      style={{ background: `${NIVEAUX[selected.niveau].color}10`, border: `1px solid ${NIVEAUX[selected.niveau].color}25` }}>
                      <div className="text-[10px] uppercase tracking-wider mb-1"
                        style={{ color: NIVEAUX[selected.niveau].color }}>Reste à recouvrer</div>
                      <div className="text-lg font-bold" style={{ color: NIVEAUX[selected.niveau].color }}>
                        {formatFCFA(selected.reste_du)}
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: NIVEAUX[selected.niveau].color }}>
                        {selected.jours_retard === 0 ? 'Échéance aujourd\'hui' : `${selected.jours_retard} jours de retard`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <NiveauBadge niveau={selected.niveau} />
                      <span className="text-[10px] text-gray-400 font-mono px-2 py-1 rounded-lg bg-gray-50">{selected.section}</span>
                    </div>

                    {selected.derniere_relance && (
                      <div className="text-[10px] text-gray-400">
                        Dernière relance : <span className="font-semibold">{formatDate(selected.derniere_relance)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-5">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${NIVEAUX[selected.niveau].color}, ${NIVEAUX[selected.niveau].color}cc)`,
                        boxShadow: `0 3px 12px ${NIVEAUX[selected.niveau].color}30`,
                      }}>
                      <Send size={14} /> Envoyer relance
                    </motion.button>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
                        <Printer size={12} /> Imprimer
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all">
                        <Eye size={12} /> Facture
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl p-6 text-center"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: '#e1705510' }}>
                    <Bell size={20} className="opacity-40" style={{ color: '#e17055' }} />
                  </div>
                  <p className="text-xs text-gray-400">Cliquez sur un dossier<br/>pour voir le détail</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
