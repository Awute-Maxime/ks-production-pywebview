'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Plus, Search, Download, Eye, Trash2,
  ArrowRightLeft, Clock, CheckCircle2, ChevronDown, X, AlertCircle
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'
import type { Facture } from '@/types'

const DEMO_PROFORMAS: Facture[] = [
  { id:1,  numero:'PROF-19052026-001', date:'2026-05-19', nom_client:'NKRUMAH Events',    service:'Sonorisation Gala annuel — Plein air',     montant_ttc:420000, montant_paye:0, reste_du:420000, etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'admin' },
  { id:2,  numero:'PROF-18052026-001', date:'2026-05-18', nom_client:'Eglise Victoire',   service:'Sonorisation Concert de Noël 2026',        montant_ttc:350000, montant_paye:0, reste_du:350000, etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'admin' },
  { id:3,  numero:'PROF-15052026-001', date:'2026-05-15', nom_client:'MENSAH Kofi',       service:'Album complet 12 titres — Studio',         montant_ttc:280000, montant_paye:0, reste_du:280000, etat_paiement:'Converti',  type_operation:'Proforma', section:'Studio',       cree_par:'admin' },
  { id:4,  numero:'PROF-12052026-001', date:'2026-05-12', nom_client:'ATCHO Emmanuel',    service:'Mariage — Sonorisation & Animation',       montant_ttc:310000, montant_paye:0, reste_du:310000, etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'caissier' },
  { id:5,  numero:'PROF-10052026-001', date:'2026-05-10', nom_client:'AGBEKO Mawuli',     service:'EP 6 titres — Enregistrement & Mixage',   montant_ttc:185000, montant_paye:0, reste_du:185000, etat_paiement:'Converti',  type_operation:'Proforma', section:'Studio',       cree_par:'admin' },
  { id:6,  numero:'PROF-05052026-001', date:'2026-05-05', nom_client:'AMOUZOU Dodji',     service:'Location matériel — Séminaire 3 jours',   montant_ttc:120000, montant_paye:0, reste_du:120000, etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'admin' },
  { id:7,  numero:'PROF-01052026-001', date:'2026-05-01', nom_client:'LA VOIE AU TOGO',   service:'Sonorisation émission TV mensuelle',       montant_ttc:95000,  montant_paye:0, reste_du:95000,  etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'admin' },
  { id:8,  numero:'PROF-25042026-001', date:'2026-04-25', nom_client:'KONDO KOFFI',       service:'Doublage publicitaire — 3 spots radio',   montant_ttc:75000,  montant_paye:0, reste_du:75000,  etat_paiement:'Converti',  type_operation:'Proforma', section:'Studio',       cree_par:'caissier' },
]

const ETATS = [
  { value: '',           label: 'Tous les états' },
  { value: 'Non Payer',  label: 'En attente' },
  { value: 'Converti',   label: 'Convertis' },
]

function EtatBadge({ etat }: { etat: string }) {
  const cfg = etat === 'Converti'
    ? { icon: CheckCircle2, color: '#00b894', label: 'Converti' }
    : { icon: Clock,        color: '#fdcb6e', label: 'En attente' }
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function StatCard({ label, count, amount, color, icon: Icon }: {
  label: string; count: number; amount: number; color: string; icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <div className="text-gray-800 font-bold text-lg leading-tight">{count}</div>
        <div className="text-gray-400 text-xs">{label}</div>
        <div className="font-semibold text-xs mt-0.5" style={{ color }}>{formatFCFA(amount)}</div>
      </div>
    </div>
  )
}

export default function ProformasPage() {
  const [search, setSearch]             = useState('')
  const [filtreEtat, setFiltreEtat]     = useState('')
  const [filtreSection, setFiltreSection] = useState('')

  const proformas = DEMO_PROFORMAS.filter(p => {
    if (filtreEtat && p.etat_paiement !== filtreEtat) return false
    if (filtreSection && p.section !== filtreSection) return false
    if (search) {
      const q = search.toLowerCase()
      return p.numero.toLowerCase().includes(q) ||
             p.nom_client.toLowerCase().includes(q) ||
             p.service.toLowerCase().includes(q)
    }
    return true
  })

  const totalMontant = DEMO_PROFORMAS.reduce((s, p) => s + p.montant_ttc, 0)
  const enAttente    = DEMO_PROFORMAS.filter(p => p.etat_paiement === 'Non Payer')
  const convertis    = DEMO_PROFORMAS.filter(p => p.etat_paiement === 'Converti')
  const tauxConv     = Math.round((convertis.length / DEMO_PROFORMAS.length) * 100)

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Proformas"
        subtitle={`${DEMO_PROFORMAS.length} devis · Taux de conversion ${tauxConv}%`}
        actions={
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #6c5ce7, #5849c2)', boxShadow: '0 4px 12px rgba(108,92,231,0.3)' }}
          >
            <Plus size={15} />
            Nouveau devis
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-fadeup">
          <StatCard label="Total devis"    count={DEMO_PROFORMAS.length} amount={totalMontant}                                      color="#6c5ce7" icon={FileText} />
          <StatCard label="En attente"     count={enAttente.length}       amount={enAttente.reduce((s,p)=>s+p.montant_ttc,0)}       color="#fdcb6e" icon={Clock} />
          <StatCard label="Convertis"      count={convertis.length}       amount={convertis.reduce((s,p)=>s+p.montant_ttc,0)}       color="#00b894" icon={CheckCircle2} />
          <StatCard label="Taux conversion" count={tauxConv}              amount={convertis.reduce((s,p)=>s+p.montant_ttc,0)}       color="#0984e3" icon={ArrowRightLeft} />
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3 anim-fadein delay-100"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par n°, client, service..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#6c5ce7]/40 transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <select value={filtreEtat} onChange={e => setFiltreEtat(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
              {ETATS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={filtreSection} onChange={e => setFiltreSection(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
              <option value="">Toutes sections</option>
              <option value="Sonorisation">Sonorisation</option>
              <option value="Studio">Studio</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <span className="text-gray-400 text-xs ml-auto">{proformas.length} résultat{proformas.length !== 1 ? 's' : ''}</span>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
            <Download size={14} /> Export CSV
          </motion.button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden anim-fadein delay-200"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

          {/* Header */}
          <div className="grid gap-3 px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
            style={{ gridTemplateColumns: '170px 1fr 130px 90px 90px 90px' }}>
            <span>N° Proforma</span>
            <span>Client / Service</span>
            <span className="text-right">Montant TTC</span>
            <span>Section</span>
            <span>État</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {proformas.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun proforma trouvé</p>
              </div>
            ) : proformas.map((p, i) => (
              <div key={p.id}
                className="grid gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-all group"
                style={{ gridTemplateColumns: '170px 1fr 130px 90px 90px 90px' }}>

                {/* Numéro */}
                <div>
                  <div className="text-xs font-bold text-[#6c5ce7] font-mono">{p.numero}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(p.date)} · Valable 30j</div>
                </div>

                {/* Client / Service */}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{p.nom_client}</div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{p.service}</div>
                </div>

                {/* Montant */}
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800">{formatFCFA(p.montant_ttc)}</div>
                </div>

                {/* Section */}
                <div>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
                    style={{
                      background: p.section === 'Studio' ? '#6c5ce715' : '#e9456015',
                      color: p.section === 'Studio' ? '#6c5ce7' : '#e94560',
                    }}>
                    {p.section}
                  </span>
                </div>

                {/* État */}
                <div><EtatBadge etat={p.etat_paiement} /></div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-all" title="Aperçu">
                    <Eye size={13} />
                  </motion.button>
                  {p.etat_paiement !== 'Converti' && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-all" title="Convertir en facture">
                      <ArrowRightLeft size={13} />
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all" title="Supprimer">
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{proformas.length} proforma(s) affichée(s)</span>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Total : <strong className="text-gray-700">{formatFCFA(proformas.reduce((s,p)=>s+p.montant_ttc,0))}</strong></span>
              <span>Taux conversion : <strong className="text-[#00b894]">{tauxConv}%</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
