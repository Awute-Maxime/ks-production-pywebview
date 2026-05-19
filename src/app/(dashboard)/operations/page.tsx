'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftRight, Plus, Search, X, ChevronDown,
  TrendingUp, TrendingDown, Download, Eye, Trash2
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'
import type { Operation } from '@/types'

const DEMO_OPS: Operation[] = [
  { id:1,  numero:'OPE-19052026-001', date:'2026-05-19', nom_client:'LA VOIE AU TOGO',   service:'Service reconnaissance — Soeur DIG',     montant_ttc:80000,  type_operation:'Recettes', section:'Sonorisation', categorie:'Facture' },
  { id:2,  numero:'OPE-19052026-002', date:'2026-05-19', nom_client:'LA VOIE AU TOGO',   service:'Service reconnaissance — Nestor MA',     montant_ttc:80000,  type_operation:'Recettes', section:'Sonorisation', categorie:'Facture' },
  { id:3,  numero:'OPE-18052026-001', date:'2026-05-18', nom_client:'Fournisseur Audio',  service:'Achat câbles XLR (lot 20)',               montant_ttc:45000,  type_operation:'Depenses', section:'Sonorisation', categorie:'Achat' },
  { id:4,  numero:'OPE-15052026-001', date:'2026-05-15', nom_client:'AWUTE Kossi',        service:'Enregistrement Studio — Album complet',   montant_ttc:150000, type_operation:'Recettes', section:'Studio',       categorie:'Facture' },
  { id:5,  numero:'OPE-14052026-001', date:'2026-05-14', nom_client:'Salaires Mai 2026',  service:'Salaire — Technicien Son Kofi',           montant_ttc:80000,  type_operation:'Depenses', section:'Administration', categorie:'Salaire' },
  { id:6,  numero:'OPE-10052026-001', date:'2026-05-10', nom_client:'KONDO KOFFI',        service:'Sonorisation Mariage — Plein air',        montant_ttc:236000, type_operation:'Recettes', section:'Sonorisation', categorie:'Facture' },
  { id:7,  numero:'OPE-09052026-001', date:'2026-05-09', nom_client:'Location véhicule',  service:'Transport matériel — Mariage KONDO',      montant_ttc:15000,  type_operation:'Depenses', section:'Sonorisation', categorie:'Transport' },
  { id:8,  numero:'OPE-08052026-001', date:'2026-05-08', nom_client:'ATCHO Emmanuel',     service:'Location matériel sonorisation',          montant_ttc:59000,  type_operation:'Recettes', section:'Sonorisation', categorie:'Facture' },
  { id:9,  numero:'OPE-07052026-001', date:'2026-05-07', nom_client:'Electricité CEET',   service:'Facture électricité — Studio Mai',        montant_ttc:22000,  type_operation:'Depenses', section:'Studio',       categorie:'Charge' },
  { id:10, numero:'OPE-05052026-001', date:'2026-05-05', nom_client:'MENSAH Kofi',        service:'Mixage & Mastering — EP 5 titres',       montant_ttc:95000,  type_operation:'Recettes', section:'Studio',       categorie:'Facture' },
  { id:11, numero:'OPE-04052026-001', date:'2026-05-04', nom_client:'Prime prestation',   service:'Prime — Technicien ATSUTSUI',             montant_ttc:25000,  type_operation:'Depenses', section:'Sonorisation', categorie:'Prime' },
  { id:12, numero:'OPE-01052026-001', date:'2026-05-01', nom_client:'Eglise Grâce',       service:'Sonorisation Concert de Louange',         montant_ttc:354000, type_operation:'Recettes', section:'Sonorisation', categorie:'Facture' },
]

const TYPES = [
  { value: '',          label: 'Recettes & Dépenses' },
  { value: 'Recettes',  label: 'Recettes uniquement' },
  { value: 'Depenses',  label: 'Dépenses uniquement' },
]

export default function OperationsPage() {
  const [search, setSearch]         = useState('')
  const [filtreType, setFiltreType] = useState('')
  const [filtreSection, setFiltreSection] = useState('')

  const ops = DEMO_OPS.filter(o => {
    if (filtreType && o.type_operation !== filtreType) return false
    if (filtreSection && o.section !== filtreSection) return false
    if (search) {
      const q = search.toLowerCase()
      return o.numero.toLowerCase().includes(q) ||
             (o.nom_client || '').toLowerCase().includes(q) ||
             (o.service || '').toLowerCase().includes(q)
    }
    return true
  })

  const totalRec = DEMO_OPS.filter(o => o.type_operation === 'Recettes').reduce((s, o) => s + (o.montant_ttc || 0), 0)
  const totalDep = DEMO_OPS.filter(o => o.type_operation === 'Depenses').reduce((s, o) => s + (o.montant_ttc || 0), 0)
  const solde    = totalRec - totalDep

  const sections = [...new Set(DEMO_OPS.map(o => o.section).filter(Boolean))]

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Opérations"
        subtitle={`${DEMO_OPS.length} opérations · Solde ${formatFCFA(solde)}`}
        actions={
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #fdcb6e, #e17055)', boxShadow: '0 4px 12px rgba(253,203,110,0.35)' }}
          >
            <Plus size={15} /> Nouvelle opération
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 anim-fadeup">
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#00b89420', border: '1px solid #00b89430' }}>
              <TrendingUp size={20} style={{ color: '#00b894' }} />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Recettes</div>
              <div className="text-gray-800 text-xl font-bold">{formatFCFA(totalRec)}</div>
              <div className="text-gray-400 text-xs">{DEMO_OPS.filter(o=>o.type_operation==='Recettes').length} opérations</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#e9456020', border: '1px solid #e9456030' }}>
              <TrendingDown size={20} style={{ color: '#e94560' }} />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Dépenses</div>
              <div className="text-gray-800 text-xl font-bold">{formatFCFA(totalDep)}</div>
              <div className="text-gray-400 text-xs">{DEMO_OPS.filter(o=>o.type_operation==='Depenses').length} opérations</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4"
            style={{ boxShadow: `0 2px 12px rgba(0,0,0,0.06), 0 0 0 2px ${solde >= 0 ? '#00b89420' : '#e9456020'}`, border: `1px solid ${solde >= 0 ? '#00b89430' : '#e9456030'}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: solde >= 0 ? '#0984e320' : '#e9456020', border: `1px solid ${solde >= 0 ? '#0984e330' : '#e9456030'}` }}>
              <ArrowLeftRight size={20} style={{ color: solde >= 0 ? '#0984e3' : '#e94560' }} />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Solde net</div>
              <div className="text-xl font-bold" style={{ color: solde >= 0 ? '#00b894' : '#e94560' }}>{formatFCFA(solde)}</div>
              <div className="text-gray-400 text-xs">{solde >= 0 ? 'Bénéfice' : 'Déficit'} du mois</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3 anim-fadein delay-100"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par n°, client, service..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#fdcb6e]/50 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
          </div>

          <div className="relative">
            <select value={filtreType} onChange={e => setFiltreType(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={filtreSection} onChange={e => setFiltreSection(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
              <option value="">Toutes sections</option>
              {sections.map(s => <option key={s} value={s!}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <span className="text-gray-400 text-xs ml-auto">{ops.length} résultat{ops.length !== 1 ? 's' : ''}</span>

          <motion.button whileHover={{ scale: 1.03 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
            <Download size={14} /> Export CSV
          </motion.button>
        </div>

        {/* Timeline / Table */}
        <div className="bg-white rounded-2xl overflow-hidden anim-fadein delay-200"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

          <div className="grid gap-3 px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
            style={{ gridTemplateColumns: '170px 1fr 110px 90px 90px 80px' }}>
            <span>N° Opération</span>
            <span>Client / Service</span>
            <span className="text-right">Montant</span>
            <span>Type</span>
            <span>Section</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-gray-50">
            {ops.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune opération trouvée</p>
              </div>
            ) : ops.map((op) => {
              const isRec = op.type_operation === 'Recettes'
              return (
                <div key={op.id} className="grid gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-all group"
                  style={{ gridTemplateColumns: '170px 1fr 110px 90px 90px 80px' }}>

                  <div>
                    <div className="text-xs font-bold font-mono" style={{ color: isRec ? '#00b894' : '#e94560' }}>{op.numero}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(op.date || '')}</div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{op.nom_client}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{op.service}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: isRec ? '#00b894' : '#e94560' }}>
                      {isRec ? '+' : '−'}{formatFCFA(op.montant_ttc || 0)}
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold"
                      style={{
                        background: isRec ? '#00b89415' : '#e9456015',
                        color: isRec ? '#00b894' : '#e94560',
                        border: `1px solid ${isRec ? '#00b89425' : '#e9456025'}`,
                      }}>
                      {isRec ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {isRec ? 'Recette' : 'Dépense'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
                      style={{
                        background: op.section === 'Studio' ? '#6c5ce715' : op.section === 'Administration' ? '#fdcb6e15' : '#e9456015',
                        color: op.section === 'Studio' ? '#6c5ce7' : op.section === 'Administration' ? '#b7950b' : '#e94560',
                      }}>
                      {op.section}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button whileHover={{ scale: 1.1 }}
                      className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center">
                      <Eye size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center">
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{ops.length} opération{ops.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Recettes : <strong className="text-[#00b894]">{formatFCFA(ops.filter(o=>o.type_operation==='Recettes').reduce((s,o)=>s+(o.montant_ttc||0),0))}</strong></span>
              <span>Dépenses : <strong className="text-[#e94560]">{formatFCFA(ops.filter(o=>o.type_operation==='Depenses').reduce((s,o)=>s+(o.montant_ttc||0),0))}</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
