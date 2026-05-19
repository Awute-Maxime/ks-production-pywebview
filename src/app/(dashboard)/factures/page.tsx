'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Receipt, Plus, Search, Filter, Download, Eye, Trash2,
  CheckCircle2, Clock, AlertCircle, ChevronDown, X, CreditCard
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate, getEtatColor, getEtatLabel } from '@/lib/utils'
import type { Facture } from '@/types'

// ── Données de démo ────────────────────────────────────────────────
const DEMO_FACTURES: Facture[] = [
  { id:1,  numero:'FKSP-18052026-001', date:'2026-05-18', nom_client:'LA VOIE AU TOGO',  service:'Service de reconnaissance Soeur DIG', montant_ttc:80000,  montant_paye:0,     reste_du:80000,  etat_paiement:'Non Payer', type_operation:'Recettes', section:'Sonorisation', cree_par:'admin' },
  { id:2,  numero:'FKSP-18052026-002', date:'2026-05-18', nom_client:'LA VOIE AU TOGO',  service:'Service de reconnaissance Nestor MA', montant_ttc:80000,  montant_paye:0,     reste_du:80000,  etat_paiement:'Non Payer', type_operation:'Recettes', section:'Sonorisation', cree_par:'admin' },
  { id:3,  numero:'FKSP-15052026-001', date:'2026-05-15', nom_client:'AWUTE Kossi',       service:'Enregistrement Studio — Album complet', montant_ttc:150000, montant_paye:75000, reste_du:75000,  etat_paiement:'Partiel',   type_operation:'Recettes', section:'Studio',       cree_par:'admin' },
  { id:4,  numero:'FKSP-10052026-001', date:'2026-05-10', nom_client:'KONDO KOFFI',       service:'Sonorisation Mariage — Plein air',      montant_ttc:236000, montant_paye:236000,reste_du:0,      etat_paiement:'Payer',     type_operation:'Recettes', section:'Sonorisation', cree_par:'caissier' },
  { id:5,  numero:'FKSP-08052026-001', date:'2026-05-08', nom_client:'ATCHO Emmanuel',    service:'Location matériel sonorisation',        montant_ttc:59000,  montant_paye:59000, reste_du:0,      etat_paiement:'Payer',     type_operation:'Recettes', section:'Sonorisation', cree_par:'admin' },
  { id:6,  numero:'FKSP-05052026-001', date:'2026-05-05', nom_client:'MENSAH Kofi',       service:'Mixage & Mastering — EP 5 titres',     montant_ttc:95000,  montant_paye:0,     reste_du:95000,  etat_paiement:'Non Payer', type_operation:'Recettes', section:'Studio',       cree_par:'admin' },
  { id:7,  numero:'FKSP-01052026-001', date:'2026-05-01', nom_client:'Eglise Grâce',      service:'Sonorisation Concert de Louange',       montant_ttc:354000, montant_paye:354000,reste_du:0,      etat_paiement:'Payer',     type_operation:'Recettes', section:'Sonorisation', cree_par:'caissier' },
  { id:8,  numero:'FKSP-28042026-001', date:'2026-04-28', nom_client:'AMOUZOU Dodji',     service:'Doublage & Voix off publicité',         montant_ttc:45000,  montant_paye:22500, reste_du:22500,  etat_paiement:'Partiel',   type_operation:'Recettes', section:'Studio',       cree_par:'admin' },
  { id:9,  numero:'FKSP-20042026-001', date:'2026-04-20', nom_client:'NKRUMAH Events',    service:'Sonorisation Séminaire 2 jours',        montant_ttc:180000, montant_paye:0,     reste_du:180000, etat_paiement:'Non Payer', type_operation:'Recettes', section:'Sonorisation', cree_par:'admin' },
  { id:10, numero:'FKSP-15042026-001', date:'2026-04-15', nom_client:'AGBEKO Mawuli',     service:'Enregistrement Studio — Single',        montant_ttc:35000,  montant_paye:35000, reste_du:0,      etat_paiement:'Payer',     type_operation:'Recettes', section:'Studio',       cree_par:'admin' },
]

const ETATS = [
  { value: '',          label: 'Tous les états' },
  { value: 'Non Payer', label: 'Impayées' },
  { value: 'Partiel',   label: 'Partielles' },
  { value: 'Payer',     label: 'Payées' },
]

const SECTIONS = ['', 'Sonorisation', 'Studio']

function StatBadge({ label, count, amount, color }: { label: string; count: number; amount: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Receipt size={16} style={{ color }} />
      </div>
      <div>
        <div className="text-gray-800 font-bold text-lg leading-tight">{count}</div>
        <div className="text-gray-400 text-xs">{label}</div>
        <div className="font-semibold text-xs mt-0.5" style={{ color }}>{formatFCFA(amount)}</div>
      </div>
    </div>
  )
}

function EtatBadge({ etat }: { etat: string }) {
  const configs: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
    'Payer':     { icon: CheckCircle2, bg: '#00b894', text: '#fff', label: 'Payée' },
    'Partiel':   { icon: Clock,        bg: '#fdcb6e', text: '#7d6008', label: 'Partielle' },
    'Non Payer': { icon: AlertCircle,  bg: '#e94560', text: '#fff', label: 'Impayée' },
  }
  const cfg = configs[etat] || { icon: AlertCircle, bg: '#aaa', text: '#fff', label: etat }
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: `${cfg.bg}18`, color: cfg.bg, border: `1px solid ${cfg.bg}30` }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

export default function FacturesPage() {
  const [search, setSearch]     = useState('')
  const [filtreEtat, setFiltreEtat]       = useState('')
  const [filtreSection, setFiltreSection] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  const factures = DEMO_FACTURES.filter(f => {
    if (filtreEtat && f.etat_paiement !== filtreEtat) return false
    if (filtreSection && f.section !== filtreSection) return false
    if (search) {
      const q = search.toLowerCase()
      return f.numero.toLowerCase().includes(q) || f.nom_client.toLowerCase().includes(q) || f.service.toLowerCase().includes(q)
    }
    return true
  })

  const total      = DEMO_FACTURES.reduce((s, f) => s + f.montant_ttc, 0)
  const impayes    = DEMO_FACTURES.filter(f => f.etat_paiement === 'Non Payer')
  const partielles = DEMO_FACTURES.filter(f => f.etat_paiement === 'Partiel')
  const payees     = DEMO_FACTURES.filter(f => f.etat_paiement === 'Payer')

  const toggleSelect = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id])

  const toggleAll = () =>
    setSelected(selected.length === factures.length ? [] : factures.map(f => f.id))

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Factures"
        subtitle={`${DEMO_FACTURES.length} factures · Total ${formatFCFA(total)}`}
        alertCount={impayes.length}
        actions={
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #e94560, #c0392b)', boxShadow: '0 4px 12px rgba(233,69,96,0.3)' }}
          >
            <Plus size={15} />
            Nouvelle facture
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-fadeup">
          <StatBadge label="Total factures"   count={DEMO_FACTURES.length} amount={total}                                            color="#0984e3" />
          <StatBadge label="Impayées"         count={impayes.length}        amount={impayes.reduce((s,f)=>s+f.reste_du,0)}           color="#e94560" />
          <StatBadge label="Partielles"       count={partielles.length}     amount={partielles.reduce((s,f)=>s+f.reste_du,0)}        color="#fdcb6e" />
          <StatBadge label="Payées"           count={payees.length}         amount={payees.reduce((s,f)=>s+f.montant_ttc,0)}         color="#00b894" />
        </div>

        {/* Barre filtres */}
        <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3 anim-fadein delay-100"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par n°, client, service..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#0984e3]/40 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtre état */}
          <div className="relative">
            <select value={filtreEtat} onChange={e => setFiltreEtat(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-[#0984e3]/40 transition-all cursor-pointer">
              {ETATS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filtre section */}
          <div className="relative">
            <select value={filtreSection} onChange={e => setFiltreSection(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-[#0984e3]/40 transition-all cursor-pointer">
              <option value="">Toutes sections</option>
              <option value="Sonorisation">Sonorisation</option>
              <option value="Studio">Studio</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Compteur résultats */}
          <span className="text-gray-400 text-xs ml-auto">{factures.length} résultat{factures.length !== 1 ? 's' : ''}</span>

          {/* Export */}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
            <Download size={14} />
            Export CSV
          </motion.button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden anim-fadein delay-200"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

          {/* Header table */}
          <div className="grid gap-3 px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
            style={{ gridTemplateColumns: '32px 160px 1fr 120px 110px 90px 90px 80px' }}>
            <input type="checkbox"
              checked={selected.length === factures.length && factures.length > 0}
              onChange={toggleAll}
              className="rounded accent-[#e94560] cursor-pointer" />
            <span>N° Facture</span>
            <span>Client / Service</span>
            <span className="text-right">Montant TTC</span>
            <span className="text-right">Reste dû</span>
            <span>Section</span>
            <span>État</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {factures.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune facture trouvée</p>
              </div>
            ) : (
              factures.map((f, i) => (
                <div key={f.id}
                  className={`grid gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-all group ${selected.includes(f.id) ? 'bg-blue-50/40' : ''}`}
                  style={{ gridTemplateColumns: '32px 160px 1fr 120px 110px 90px 90px 80px',
                           animationDelay: `${i * 30}ms` }}
                >
                  {/* Checkbox */}
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleSelect(f.id)}
                    className="rounded accent-[#e94560] cursor-pointer" />

                  {/* Numéro */}
                  <div>
                    <div className="text-xs font-bold text-[#0984e3] font-mono">{f.numero}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(f.date)}</div>
                  </div>

                  {/* Client / Service */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{f.nom_client}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{f.service}</div>
                  </div>

                  {/* Montant TTC */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">{formatFCFA(f.montant_ttc)}</div>
                  </div>

                  {/* Reste dû */}
                  <div className="text-right">
                    {f.reste_du > 0
                      ? <div className="text-sm font-bold text-[#e94560]">{formatFCFA(f.reste_du)}</div>
                      : <div className="text-sm font-bold text-[#00b894]">—</div>
                    }
                  </div>

                  {/* Section */}
                  <div>
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
                      style={{
                        background: f.section === 'Studio' ? '#6c5ce715' : '#e9456015',
                        color: f.section === 'Studio' ? '#6c5ce7' : '#e94560',
                      }}>
                      {f.section}
                    </span>
                  </div>

                  {/* État */}
                  <div><EtatBadge etat={f.etat_paiement} /></div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-all" title="Voir">
                      <Eye size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-all" title="Paiement">
                      <CreditCard size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all" title="Supprimer">
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer table */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {selected.length > 0 ? `${selected.length} sélectionné(s)` : `${factures.length} facture(s)`}
            </span>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Total affiché : <strong className="text-gray-700">{formatFCFA(factures.reduce((s,f)=>s+f.montant_ttc,0))}</strong></span>
              <span>Reste dû : <strong className="text-[#e94560]">{formatFCFA(factures.reduce((s,f)=>s+f.reste_du,0))}</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
