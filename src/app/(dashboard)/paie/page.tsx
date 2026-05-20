'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Plus, Search, X, CheckCircle2, Clock,
  FileText, Download, Printer, Banknote, TrendingDown,
  User, Calendar, Receipt, ChevronRight, AlertCircle
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'

type StatutPaie = 'En attente' | 'Payé'
type TypeDepense = 'Prime prestation' | 'Salaire' | 'Avance' | 'Transport' | 'Prime exceptionnelle' | 'Autre'

interface Depense {
  id: number; numero: string; date: string; beneficiaire: string
  type_depense: TypeDepense; description: string; montant: number
  statut: StatutPaie; prestation: string
}

interface Recu {
  id: number; numero: string; date: string; beneficiaire: string
  type_recu: 'Bulletin Salaire' | 'Reçu Prestation'; mois: string
  salaire_base: number; total_primes: number; total_net: number; notes: string
}

const TYPE_CONFIG: Record<TypeDepense, { color: string; bg: string }> = {
  'Prime prestation':    { color:'#6c5ce7', bg:'#f5f3ff' },
  'Salaire':             { color:'#0984e3', bg:'#eff6ff' },
  'Avance':              { color:'#e17055', bg:'#fef3f2' },
  'Transport':           { color:'#00b894', bg:'#f0fdf4' },
  'Prime exceptionnelle':{ color:'#f59e0b', bg:'#fef3c7' },
  'Autre':               { color:'#9ca3af', bg:'#f3f4f6' },
}

const DEMO_ATTENTES: Depense[] = [
  { id:1, numero:'DEP-20052026-001', date:'2026-05-20', beneficiaire:'LAWSON Edem',     type_depense:'Prime prestation',    description:'Prime mariage KONDO — 10/05',        montant:25000,  statut:'En attente', prestation:'Mariage KONDO' },
  { id:2, numero:'DEP-20052026-002', date:'2026-05-20', beneficiaire:'ATSUTSUI Kodjo',  type_depense:'Prime prestation',    description:'Prime concert Eglise Grâce — 01/05', montant:30000,  statut:'En attente', prestation:'Concert de Louange' },
  { id:3, numero:'DEP-19052026-001', date:'2026-05-19', beneficiaire:'AGBE Sényo',      type_depense:'Transport',           description:'Transport matériel — prestation DIG', montant:8000,   statut:'En attente', prestation:'Service DIG' },
  { id:4, numero:'DEP-19052026-002', date:'2026-05-19', beneficiaire:'DOSSOU Félix',    type_depense:'Prime prestation',    description:'Prime sono mariage — 10/05',          montant:20000,  statut:'En attente', prestation:'Mariage KONDO' },
  { id:5, numero:'DEP-15052026-001', date:'2026-05-15', beneficiaire:'KOFI Mensah',     type_depense:'Prime exceptionnelle',description:'Prime enregistrement album AWUTE',    montant:50000,  statut:'En attente', prestation:'Studio AWUTE' },
  { id:6, numero:'DEP-14052026-001', date:'2026-05-14', beneficiaire:'LAWSON Edem',     type_depense:'Salaire',             description:'Salaire mensuel — Mai 2026',          montant:75000,  statut:'En attente', prestation:'—' },
  { id:7, numero:'DEP-14052026-002', date:'2026-05-14', beneficiaire:'ATSUTSUI Kodjo',  type_depense:'Salaire',             description:'Salaire mensuel — Mai 2026',          montant:80000,  statut:'En attente', prestation:'—' },
  { id:8, numero:'DEP-14052026-003', date:'2026-05-14', beneficiaire:'KOFI Mensah',     type_depense:'Salaire',             description:'Salaire mensuel — Mai 2026',          montant:95000,  statut:'En attente', prestation:'—' },
]

const DEMO_RECUS: Recu[] = [
  { id:1, numero:'RECU-2026-001', date:'2026-04-30', beneficiaire:'LAWSON Edem',    type_recu:'Bulletin Salaire',   mois:'Avril 2026',  salaire_base:75000, total_primes:45000, total_net:120000, notes:'Salaire + primes prestations avril' },
  { id:2, numero:'RECU-2026-002', date:'2026-04-30', beneficiaire:'ATSUTSUI Kodjo', type_recu:'Bulletin Salaire',   mois:'Avril 2026',  salaire_base:80000, total_primes:35000, total_net:115000, notes:'Salaire + prime concert Eglise Victoire' },
  { id:3, numero:'RECU-2026-003', date:'2026-04-30', beneficiaire:'KOFI Mensah',    type_recu:'Bulletin Salaire',   mois:'Avril 2026',  salaire_base:95000, total_primes:25000, total_net:120000, notes:'Salaire + prime studio NKRUMAH' },
  { id:4, numero:'RECU-2026-004', date:'2026-04-15', beneficiaire:'AGBE Sényo',     type_recu:'Reçu Prestation',    mois:'Avril 2026',  salaire_base:0,     total_primes:28000, total_net:28000,  notes:'Primes 3 prestations éclairage' },
  { id:5, numero:'RECU-2026-005', date:'2026-03-31', beneficiaire:'LAWSON Edem',    type_recu:'Bulletin Salaire',   mois:'Mars 2026',   salaire_base:75000, total_primes:60000, total_net:135000, notes:'Salaire + 4 mariages mars' },
  { id:6, numero:'RECU-2026-006', date:'2026-03-31', beneficiaire:'ATSUTSUI Kodjo', type_recu:'Bulletin Salaire',   mois:'Mars 2026',   salaire_base:80000, total_primes:40000, total_net:120000, notes:'Salaire + primes mars' },
]

const TYPES: TypeDepense[] = ['Prime prestation', 'Salaire', 'Avance', 'Transport', 'Prime exceptionnelle', 'Autre']

export default function PaiePage() {
  const [activeTab, setActiveTab]   = useState<'attente' | 'historique'>('attente')
  const [depenses, setDepenses]     = useState<Depense[]>(DEMO_ATTENTES)
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState({ beneficiaire:'', type_depense:'Prime prestation' as TypeDepense, description:'', montant:'', prestation:'' })

  const filtered = (activeTab === 'attente' ? depenses : DEMO_RECUS).filter((item: any) => {
    const q = search.toLowerCase()
    return !q || item.beneficiaire.toLowerCase().includes(q) || (item.description || item.notes || '').toLowerCase().includes(q)
  })

  const totalAttente  = depenses.reduce((s,d) => s + d.montant, 0)
  const totalPayeMois = DEMO_RECUS.filter(r => r.mois.includes('2026')).reduce((s,r) => s + r.total_net, 0)
  const nbBeneficiaires = [...new Set(depenses.map(d => d.beneficiaire))].length

  const handlePayer = (id: number) => {
    setDepenses(ds => ds.filter(d => d.id !== id))
  }

  const handleSave = () => {
    if (!form.beneficiaire || !form.montant) return
    const newD: Depense = {
      id: Date.now(),
      numero: `DEP-${new Date().toLocaleDateString('fr-FR').replace(/\//g,'')}-${depenses.length+1}`,
      date: new Date().toISOString().slice(0,10),
      ...form, montant: Number(form.montant), statut: 'En attente'
    }
    setDepenses(ds => [newD, ...ds])
    setShowModal(false)
    setForm({ beneficiaire:'', type_depense:'Prime prestation', description:'', montant:'', prestation:'' })
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'#f0f2f8' }}>
      <Topbar
        title="Paie & Primes"
        subtitle={`${depenses.length} paiements en attente · ${DEMO_RECUS.length} reçus générés`}
        actions={
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)', boxShadow:'0 4px 12px rgba(233,69,96,0.3)' }}>
              <Plus size={15} /> Nouvelle dépense
            </motion.button>
          </div>
        }
      />

      <div className="p-6 space-y-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:'Total en attente',    value:formatFCFA(totalAttente),  sub:`${depenses.length} paiements`,          color:'#e94560', icon:AlertCircle },
            { label:'Bénéficiaires',        value:nbBeneficiaires,           sub:'techniciens concernés',                 color:'#6c5ce7', icon:User        },
            { label:'Payé ce cycle',        value:formatFCFA(totalPayeMois), sub:'bulletins générés',                     color:'#00b894', icon:CheckCircle2},
            { label:'Reçus générés',        value:DEMO_RECUS.length,         sub:'depuis le début',                       color:'#0984e3', icon:FileText    },
          ].map(({ label, value, sub, color, icon:Icon }, i) => (
            <motion.div key={label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="bg-white rounded-2xl px-4 py-3.5 relative overflow-hidden"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background:color }} />
              <div className="flex items-start justify-between mb-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${color}12` }}>
                  <Icon size={13} style={{ color }} />
                </div>
              </div>
              <div className="text-gray-800 font-bold text-xl">{value}</div>
              <div className="text-xs mt-0.5 font-medium" style={{ color }}>{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Onglets — particularité de cette page ── */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>

          {/* Barre onglets + recherche */}
          <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-gray-100">
            <div className="flex gap-1">
              {[
                { key:'attente',    label:'En attente',       icon:Clock,    badge:depenses.length },
                { key:'historique', label:'Historique reçus',  icon:FileText, badge:DEMO_RECUS.length },
              ].map(({ key, label, icon:Icon, badge }) => (
                <button key={key} onClick={() => { setActiveTab(key as any); setSearch('') }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all relative"
                  style={activeTab === key
                    ? { color:'#e94560', borderBottom:'2px solid #e94560', background:'transparent' }
                    : { color:'#9ca3af', borderBottom:'2px solid transparent' }
                  }>
                  <Icon size={14} />
                  {label}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: activeTab===key ? '#e9456015' : '#f3f4f6', color: activeTab===key ? '#e94560' : '#9ca3af' }}>
                    {badge}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative mb-2">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                className="pl-8 pr-4 py-1.5 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-[#e94560]/50 transition-all w-44" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X size={10} /></button>}
            </div>
          </div>

          {/* Contenu onglets */}
          <AnimatePresence mode="wait">

            {/* ─ Onglet En attente ─ */}
            {activeTab === 'attente' && (
              <motion.div key="attente" initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background:'#f9fafb' }}>
                      {['Date','Référence','Bénéficiaire','Type','Description / Prestation','Montant','Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(filtered as Depense[]).map(d => {
                      const t = TYPE_CONFIG[d.type_depense]
                      return (
                        <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors group">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(d.date)}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-gray-400">{d.numero}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                                style={{ background:`linear-gradient(135deg,${t.color},${t.color}cc)` }}>
                                {d.beneficiaire.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-700">{d.beneficiaire}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:t.bg, color:t.color }}>
                              {d.type_depense}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-700">{d.description}</div>
                            {d.prestation !== '—' && <div className="text-gray-400 mt-0.5">{d.prestation}</div>}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{formatFCFA(d.montant)}</td>
                          <td className="px-4 py-3">
                            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                              onClick={() => handlePayer(d.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white whitespace-nowrap"
                              style={{ background:'linear-gradient(135deg,#00b894,#00cec9)' }}>
                              <CheckCircle2 size={11} /> Payer
                            </motion.button>
                          </td>
                        </tr>
                      )
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400 opacity-50" />
                        <p className="font-medium">Tout est à jour — aucun paiement en attente</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>

                {/* Total en attente */}
                {depenses.length > 0 && (
                  <div className="flex items-center justify-end gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total à décaisser</span>
                    <span className="text-base font-bold text-gray-800">{formatFCFA(depenses.reduce((s,d)=>s+d.montant,0))}</span>
                    <motion.button whileHover={{ scale:1.03 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background:'linear-gradient(135deg,#0984e3,#6c5ce7)' }}>
                      <FileText size={12} /> Générer bulletins
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─ Onglet Historique ─ */}
            {activeTab === 'historique' && (
              <motion.div key="historique" initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background:'#f9fafb' }}>
                      {['Date','Numéro','Bénéficiaire','Type','Mois','Salaire base','Primes','Total net','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(filtered as Recu[]).map(r => (
                      <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(r.date)}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-gray-500">{r.numero}</td>
                        <td className="px-4 py-3 font-semibold text-gray-700">{r.beneficiaire}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={r.type_recu === 'Bulletin Salaire'
                              ? { background:'#eff6ff', color:'#0984e3' }
                              : { background:'#f5f3ff', color:'#6c5ce7' }
                            }>{r.type_recu}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{r.mois}</td>
                        <td className="px-4 py-3 text-gray-600">{r.salaire_base > 0 ? formatFCFA(r.salaire_base) : '—'}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color:'#6c5ce7' }}>{formatFCFA(r.total_primes)}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{formatFCFA(r.total_net)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 transition-all"><Printer size={11} /></button>
                            <button className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all"><Download size={11} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Modal nouvelle dépense ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800">Nouvelle dépense</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Bénéficiaire *</label>
                  <input value={form.beneficiaire} onChange={e => setForm(f=>({...f,beneficiaire:e.target.value}))} placeholder="Nom du technicien"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Type de dépense</label>
                  <select value={form.type_depense} onChange={e => setForm(f=>({...f,type_depense:e.target.value as TypeDepense}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Description</label>
                  <input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Ex: Prime mariage KONDO"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Montant (FCFA) *</label>
                    <input type="number" value={form.montant} onChange={e => setForm(f=>({...f,montant:e.target.value}))} placeholder="Ex: 25000"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Prestation liée</label>
                    <input value={form.prestation} onChange={e => setForm(f=>({...f,prestation:e.target.value}))} placeholder="Ex: Mariage KONDO"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">Annuler</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)' }}>
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
