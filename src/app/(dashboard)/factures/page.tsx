'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, Plus, Search, Download, Eye, Trash2,
  CheckCircle2, Clock, AlertCircle, ChevronDown, X,
  CreditCard, Printer, Pencil, Building2, Phone, Mail,
  MapPin, CalendarDays, Hash
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'
import type { Facture } from '@/types'

// ── Données démo ────────────────────────────────────────────────────────────
const DEMO_FACTURES: Facture[] = [
  { id:1,  numero:'FKSP-18052026-001', date:'2026-05-18', nom_client:'LA VOIE AU TOGO',  service:'Service de reconnaissance Soeur DIG',   montant_ttc:80000,  montant_paye:0,      reste_du:80000,  etat_paiement:'Non Payer', type_operation:'Recettes', section:'Sonorisation', cree_par:'admin' },
  { id:2,  numero:'FKSP-18052026-002', date:'2026-05-18', nom_client:'LA VOIE AU TOGO',  service:'Service de reconnaissance Nestor MA',    montant_ttc:80000,  montant_paye:0,      reste_du:80000,  etat_paiement:'Non Payer', type_operation:'Recettes', section:'Sonorisation', cree_par:'admin' },
  { id:3,  numero:'FKSP-15052026-001', date:'2026-05-15', nom_client:'AWUTE Kossi',       service:'Enregistrement Studio — Album complet',  montant_ttc:150000, montant_paye:75000,  reste_du:75000,  etat_paiement:'Partiel',   type_operation:'Recettes', section:'Studio',       cree_par:'admin' },
  { id:4,  numero:'FKSP-10052026-001', date:'2026-05-10', nom_client:'KONDO KOFFI',       service:'Sonorisation Mariage — Plein air',       montant_ttc:236000, montant_paye:236000, reste_du:0,      etat_paiement:'Payer',     type_operation:'Recettes', section:'Sonorisation', cree_par:'caissier' },
  { id:5,  numero:'FKSP-08052026-001', date:'2026-05-08', nom_client:'ATCHO Emmanuel',    service:'Location matériel sonorisation',         montant_ttc:59000,  montant_paye:59000,  reste_du:0,      etat_paiement:'Payer',     type_operation:'Recettes', section:'Sonorisation', cree_par:'admin' },
  { id:6,  numero:'FKSP-05052026-001', date:'2026-05-05', nom_client:'MENSAH Kofi',       service:'Mixage & Mastering — EP 5 titres',      montant_ttc:95000,  montant_paye:0,      reste_du:95000,  etat_paiement:'Non Payer', type_operation:'Recettes', section:'Studio',       cree_par:'admin' },
  { id:7,  numero:'FKSP-01052026-001', date:'2026-05-01', nom_client:'Eglise Grâce',      service:'Sonorisation Concert de Louange',        montant_ttc:354000, montant_paye:354000, reste_du:0,      etat_paiement:'Payer',     type_operation:'Recettes', section:'Sonorisation', cree_par:'caissier' },
  { id:8,  numero:'FKSP-28042026-001', date:'2026-04-28', nom_client:'AMOUZOU Dodji',     service:'Doublage & Voix off publicité',          montant_ttc:45000,  montant_paye:22500,  reste_du:22500,  etat_paiement:'Partiel',   type_operation:'Recettes', section:'Studio',       cree_par:'admin' },
  { id:9,  numero:'FKSP-20042026-001', date:'2026-04-20', nom_client:'NKRUMAH Events',    service:'Sonorisation Séminaire 2 jours',         montant_ttc:180000, montant_paye:0,      reste_du:180000, etat_paiement:'Non Payer', type_operation:'Recettes', section:'Sonorisation', cree_par:'admin' },
  { id:10, numero:'FKSP-15042026-001', date:'2026-04-15', nom_client:'AGBEKO Mawuli',     service:'Enregistrement Studio — Single',         montant_ttc:35000,  montant_paye:35000,  reste_du:0,      etat_paiement:'Payer',     type_operation:'Recettes', section:'Studio',       cree_par:'admin' },
]

const DEMO_CLIENTS = ['LA VOIE AU TOGO','AWUTE Kossi','KONDO KOFFI','ATCHO Emmanuel','MENSAH Kofi','Eglise Grâce','AMOUZOU Dodji','NKRUMAH Events','AGBEKO Mawuli','Eglise Victoire','AKAKPO Sénam']
const DEMO_SERVICES = ['Enregistrement voix — single','Enregistrement voix — album (10)','Mixage & Mastering — single','Mixage & Mastering — EP (5 titres)','Doublage & Voix off','Sonorisation mariage (demi-journée)','Sonorisation mariage (journée)','Sonorisation concert / gala','Sonorisation séminaire / conf.','Location enceintes (lot 2)','Location console de mixage','Location sono complète']
const MODES_PAIEMENT = ['Espèces','Mobile Money','Virement bancaire','Chèque','Orange Money']
const SECTIONS = ['Sonorisation','Studio','Location','Administration']

const ETATS = [
  { value: '',          label: 'Tous les états' },
  { value: 'Non Payer', label: 'Impayées' },
  { value: 'Partiel',   label: 'Partielles' },
  { value: 'Payer',     label: 'Payées' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function genNumero(factures: Facture[]) {
  const today = new Date()
  const d = String(today.getDate()).padStart(2,'0')
  const m = String(today.getMonth()+1).padStart(2,'0')
  const y = today.getFullYear()
  const n = String(factures.length + 1).padStart(3,'0')
  return `FKSP-${d}${m}${y}-${n}`
}

function EtatBadge({ etat }: { etat: string }) {
  const cfg: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    'Payer':     { icon: CheckCircle2, color:'#00b894', label:'Payée'     },
    'Partiel':   { icon: Clock,        color:'#f59e0b', label:'Partielle' },
    'Non Payer': { icon: AlertCircle,  color:'#e94560', label:'Impayée'   },
  }
  const c = cfg[etat] || { icon: AlertCircle, color:'#aaa', label:etat }
  const Icon = c.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background:`${c.color}15`, color:c.color, border:`1px solid ${c.color}30` }}>
      <Icon size={10} /> {c.label}
    </span>
  )
}

// ── Composant Aperçu Facture ──────────────────────────────────────────────────
function ApercuFacture({ facture, onClose }: { facture: Facture; onClose: () => void }) {
  const tauxRecouvrement = facture.montant_ttc > 0 ? Math.round((facture.montant_paye / facture.montant_ttc) * 100) : 0
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Barre actions */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="font-bold text-gray-800 text-sm">Aperçu facture</span>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale:1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
              <Download size={12} /> PDF
            </motion.button>
            <motion.button whileHover={{ scale:1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background:'linear-gradient(135deg,#0984e3,#6c5ce7)' }}>
              <Printer size={12} /> Imprimer
            </motion.button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
          </div>
        </div>

        {/* Corps facture */}
        <div className="p-8">
          {/* En-tête entreprise */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)' }}>KS</div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">KS Production</div>
                  <div className="text-xs text-gray-400">Studio d'Enregistrement & Sonorisation</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5 ml-13">
                <div className="flex items-center gap-1.5"><MapPin size={10} className="text-gray-400" /> Lomé, Togo — BP 1234</div>
                <div className="flex items-center gap-1.5"><Phone size={10} className="text-gray-400" /> 90 11 22 33</div>
                <div className="flex items-center gap-1.5"><Mail size={10} className="text-gray-400" /> contact@ksproduction.tg</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-200 uppercase tracking-widest mb-1">FACTURE</div>
              <div className="text-sm font-bold text-[#0984e3] font-mono">{facture.numero}</div>
              <div className="text-xs text-gray-400 mt-1">Date : {formatDate(facture.date)}</div>
              <div className="mt-2 inline-block"><EtatBadge etat={facture.etat_paiement} /></div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="h-px bg-gray-100 mb-6" />

          {/* Client */}
          <div className="mb-6">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Facturé à</div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="font-bold text-gray-800">{facture.nom_client}</div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1.5"><Building2 size={10} className="text-gray-400" /> Lomé, Togo</span>
              </div>
            </div>
          </div>

          {/* Tableau prestation */}
          <div className="mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background:'#e94560' }}>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-white rounded-tl-lg">Description</th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold text-white">Qté</th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold text-white">Section</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-white rounded-tr-lg">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border border-gray-100">
                  <td className="px-4 py-3 text-gray-700">{facture.service}</td>
                  <td className="px-4 py-3 text-center text-gray-600">1</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background:'#e9456012', color:'#e94560' }}>{facture.section}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">{formatFCFA(facture.montant_ttc)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Montant total</span>
                <span className="font-bold text-gray-800">{formatFCFA(facture.montant_ttc)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Montant payé</span>
                <span className="font-bold text-green-600">{formatFCFA(facture.montant_paye)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Reste dû</span>
                <span className={`font-bold text-lg ${facture.reste_du > 0 ? 'text-[#e94560]' : 'text-[#00b894]'}`}>
                  {formatFCFA(facture.reste_du)}
                </span>
              </div>
              {/* Barre recouvrement */}
              <div className="mt-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width:`${tauxRecouvrement}%`, background:'linear-gradient(90deg,#00b894,#00cec9)' }} />
                </div>
                <div className="text-[10px] text-gray-400 text-right mt-1">{tauxRecouvrement}% encaissé</div>
              </div>
            </div>
          </div>

          {/* Mentions */}
          <div className="border-t border-gray-100 pt-4 text-xs text-gray-400 text-center space-y-1">
            <div>KS Production SARL — NIF : TG-2020-KSP — RCCM : RC-LME-2020-KS</div>
            <div>ORABANK TOGO — Merci de régler à réception · Tout retard entraîne des pénalités de 2%/mois</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function FacturesPage() {
  const [factures, setFactures]         = useState<Facture[]>(DEMO_FACTURES)
  const [search, setSearch]             = useState('')
  const [filtreEtat, setFiltreEtat]     = useState('')
  const [filtreSection, setFiltreSection] = useState('')
  const [selected, setSelected]         = useState<number[]>([])

  // Modals
  const [showNouvelle, setShowNouvelle] = useState(false)
  const [showPaiement, setShowPaiement] = useState(false)
  const [showApercu, setShowApercu]     = useState(false)
  const [showDelete, setShowDelete]     = useState(false)
  const [activeFact, setActiveFact]     = useState<Facture | null>(null)

  // Form nouvelle facture
  const [formFact, setFormFact] = useState({
    nom_client:'', service:'', section:'Sonorisation', date: new Date().toISOString().slice(0,10), montant_ttc:'', notes:''
  })

  // Form paiement
  const [formPaie, setFormPaie] = useState({ montant:'', mode:'Espèces', notes:'' })

  // Filtrage
  const filtered = factures.filter(f => {
    if (filtreEtat && f.etat_paiement !== filtreEtat) return false
    if (filtreSection && f.section !== filtreSection) return false
    if (search) {
      const q = search.toLowerCase()
      return f.numero.toLowerCase().includes(q) || f.nom_client.toLowerCase().includes(q) || f.service.toLowerCase().includes(q)
    }
    return true
  })

  const impayes    = factures.filter(f => f.etat_paiement === 'Non Payer')
  const partielles = factures.filter(f => f.etat_paiement === 'Partiel')
  const payees     = factures.filter(f => f.etat_paiement === 'Payer')
  const total      = factures.reduce((s,f) => s + f.montant_ttc, 0)

  const toggleSelect = (id: number) => setSelected(s => s.includes(id) ? s.filter(i=>i!==id) : [...s, id])
  const toggleAll    = () => setSelected(selected.length === filtered.length ? [] : filtered.map(f=>f.id))

  // Créer facture
  const handleCreateFacture = () => {
    if (!formFact.nom_client || !formFact.service || !formFact.montant_ttc) return
    const montant = Number(formFact.montant_ttc)
    const newF: Facture = {
      id: Date.now(), numero: genNumero(factures), date: formFact.date,
      nom_client: formFact.nom_client, service: formFact.service,
      montant_ttc: montant, montant_paye: 0, reste_du: montant,
      etat_paiement: 'Non Payer', type_operation: 'Recettes',
      section: formFact.section, cree_par: 'admin',
    }
    setFactures(fs => [newF, ...fs])
    setShowNouvelle(false)
    setFormFact({ nom_client:'', service:'', section:'Sonorisation', date: new Date().toISOString().slice(0,10), montant_ttc:'', notes:'' })
  }

  // Enregistrer paiement
  const handleSavePaiement = () => {
    if (!activeFact || !formPaie.montant) return
    const montantPaye = Number(formPaie.montant)
    if (montantPaye <= 0 || montantPaye > activeFact.reste_du) return
    setFactures(fs => fs.map(f => {
      if (f.id !== activeFact.id) return f
      const newPaye = f.montant_paye + montantPaye
      const newReste = f.montant_ttc - newPaye
      return { ...f, montant_paye: newPaye, reste_du: newReste, etat_paiement: newReste === 0 ? 'Payer' : 'Partiel' as any }
    }))
    setShowPaiement(false)
    setFormPaie({ montant:'', mode:'Espèces', notes:'' })
  }

  // Supprimer
  const handleDelete = () => {
    if (!activeFact) return
    setFactures(fs => fs.filter(f => f.id !== activeFact.id))
    setShowDelete(false)
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Factures"
        subtitle={`${factures.length} factures · Total ${formatFCFA(total)}`}
        alertCount={impayes.length}
        actions={
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowNouvelle(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background:'linear-gradient(135deg,#e94560,#c0392b)', boxShadow:'0 4px 12px rgba(233,69,96,0.3)' }}>
            <Plus size={15} /> Nouvelle facture
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:'Total factures', count:factures.length, amount:total,                                             color:'#0984e3' },
            { label:'Impayées',       count:impayes.length,   amount:impayes.reduce((s,f)=>s+f.reste_du,0),           color:'#e94560' },
            { label:'Partielles',     count:partielles.length, amount:partielles.reduce((s,f)=>s+f.reste_du,0),       color:'#f59e0b' },
            { label:'Payées',         count:payees.length,     amount:payees.reduce((s,f)=>s+f.montant_ttc,0),        color:'#00b894' },
          ].map(({ label, count, amount, color }, i) => (
            <motion.div key={label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
                <Receipt size={16} style={{ color }} />
              </div>
              <div>
                <div className="text-gray-800 font-bold text-lg leading-tight">{count}</div>
                <div className="text-gray-400 text-xs">{label}</div>
                <div className="font-semibold text-xs mt-0.5" style={{ color }}>{formatFCFA(amount)}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par n°, client, service..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#0984e3]/40 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
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
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <span className="text-gray-400 text-xs ml-auto">{filtered.length} résultat{filtered.length!==1?'s':''}</span>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
            <Download size={14} /> Export CSV
          </motion.button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="grid gap-3 px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
            style={{ gridTemplateColumns:'32px 170px 1fr 120px 110px 100px 90px 90px' }}>
            <input type="checkbox" checked={selected.length===filtered.length && filtered.length>0} onChange={toggleAll}
              className="rounded accent-[#e94560] cursor-pointer" />
            <span>N° Facture</span>
            <span>Client / Service</span>
            <span className="text-right">Montant TTC</span>
            <span className="text-right">Reste dû</span>
            <span>Section</span>
            <span>État</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune facture trouvée</p>
              </div>
            ) : (
              filtered.map((f) => (
                <div key={f.id}
                  className={`grid gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-all group ${selected.includes(f.id) ? 'bg-blue-50/40' : ''}`}
                  style={{ gridTemplateColumns:'32px 170px 1fr 120px 110px 100px 90px 90px' }}>
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleSelect(f.id)}
                    className="rounded accent-[#e94560] cursor-pointer" />
                  <div>
                    <div className="text-xs font-bold text-[#0984e3] font-mono">{f.numero}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(f.date)}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{f.nom_client}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{f.service}</div>
                  </div>
                  <div className="text-right font-bold text-gray-800 text-sm">{formatFCFA(f.montant_ttc)}</div>
                  <div className="text-right">
                    {f.reste_du > 0
                      ? <span className="text-sm font-bold text-[#e94560]">{formatFCFA(f.reste_du)}</span>
                      : <span className="text-sm font-bold text-[#00b894]">—</span>
                    }
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
                      style={{ background: f.section==='Studio'?'#6c5ce715':'#e9456015', color: f.section==='Studio'?'#6c5ce7':'#e94560' }}>
                      {f.section}
                    </span>
                  </div>
                  <div><EtatBadge etat={f.etat_paiement} /></div>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Aperçu */}
                    <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                      onClick={() => { setActiveFact(f); setShowApercu(true) }}
                      className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center" title="Aperçu">
                      <Eye size={13} />
                    </motion.button>
                    {/* Paiement */}
                    {f.reste_du > 0 && (
                      <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                        onClick={() => { setActiveFact(f); setFormPaie({ montant:'', mode:'Espèces', notes:'' }); setShowPaiement(true) }}
                        className="w-7 h-7 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center" title="Enregistrer paiement">
                        <CreditCard size={13} />
                      </motion.button>
                    )}
                    {/* Modifier */}
                    <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                      className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center" title="Modifier">
                      <Pencil size={13} />
                    </motion.button>
                    {/* Supprimer */}
                    <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                      onClick={() => { setActiveFact(f); setShowDelete(true) }}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center" title="Supprimer">
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {selected.length > 0 ? `${selected.length} sélectionné(s)` : `${filtered.length} facture(s)`}
            </span>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Total affiché : <strong className="text-gray-700">{formatFCFA(filtered.reduce((s,f)=>s+f.montant_ttc,0))}</strong></span>
              <span>Reste dû : <strong className="text-[#e94560]">{formatFCFA(filtered.reduce((s,f)=>s+f.reste_du,0))}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODAL NOUVELLE FACTURE ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNouvelle && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(5px)' }}
            onClick={() => setShowNouvelle(false)}>
            <motion.div initial={{ scale:0.95, opacity:0, y:8 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#e94560,#c0392b)' }}>
                  <Receipt size={16} className="text-white" />
                </div>
                <h2 className="font-bold text-gray-800">Nouvelle facture</h2>
                <button onClick={() => setShowNouvelle(false)} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Client *</label>
                  <input list="clients-list" value={formFact.nom_client} onChange={e => setForm(setFormFact, 'nom_client', e.target.value)}
                    placeholder="Nom du client"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                  <datalist id="clients-list">{DEMO_CLIENTS.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Service / Prestation *</label>
                  <input list="services-list" value={formFact.service} onChange={e => setForm(setFormFact, 'service', e.target.value)}
                    placeholder="Description de la prestation"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                  <datalist id="services-list">{DEMO_SERVICES.map(s => <option key={s} value={s} />)}</datalist>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Section</label>
                    <select value={formFact.section} onChange={e => setForm(setFormFact, 'section', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                      {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Date</label>
                    <input type="date" value={formFact.date} onChange={e => setForm(setFormFact, 'date', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Montant TTC (FCFA) *</label>
                  <input type="number" value={formFact.montant_ttc} onChange={e => setForm(setFormFact, 'montant_ttc', e.target.value)}
                    placeholder="Ex: 150000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowNouvelle(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">Annuler</button>
                <button onClick={handleCreateFacture}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background:'linear-gradient(135deg,#e94560,#c0392b)' }}>
                  Créer la facture
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MODAL PAIEMENT ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPaiement && activeFact && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(5px)' }}
            onClick={() => setShowPaiement(false)}>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#00b894,#00cec9)' }}>
                  <CreditCard size={16} className="text-white" />
                </div>
                <h2 className="font-bold text-gray-800">Enregistrer un paiement</h2>
                <button onClick={() => setShowPaiement(false)} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>

              {/* Récap facture */}
              <div className="rounded-xl p-4 mb-4" style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
                <div className="font-bold text-gray-800 text-sm">{activeFact.nom_client}</div>
                <div className="text-xs text-gray-500 mt-0.5">{activeFact.numero} — {activeFact.service}</div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total facture</div>
                    <div className="font-bold text-gray-700">{formatFCFA(activeFact.montant_ttc)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Déjà payé</div>
                    <div className="font-bold text-green-600">{formatFCFA(activeFact.montant_paye)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Reste dû</div>
                    <div className="font-bold text-[#e94560]">{formatFCFA(activeFact.reste_du)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Montant encaissé (FCFA) * <span className="normal-case text-gray-400">(max : {formatFCFA(activeFact.reste_du)})</span>
                  </label>
                  <input type="number" max={activeFact.reste_du} value={formPaie.montant} onChange={e => setFormPaie(p => ({...p, montant:e.target.value}))}
                    placeholder={`Ex: ${activeFact.reste_du}`}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00b894] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mode de paiement</label>
                  <select value={formPaie.mode} onChange={e => setFormPaie(p => ({...p, mode:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00b894] transition-all">
                    {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Notes</label>
                  <input value={formPaie.notes} onChange={e => setFormPaie(p => ({...p, notes:e.target.value}))}
                    placeholder="Référence transaction, remarques..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00b894] transition-all" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowPaiement(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">Annuler</button>
                <button onClick={handleSavePaiement}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background:'linear-gradient(135deg,#00b894,#00cec9)' }}>
                  Enregistrer le paiement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ APERÇU FACTURE ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showApercu && activeFact && (
          <ApercuFacture facture={activeFact} onClose={() => setShowApercu(false)} />
        )}
      </AnimatePresence>

      {/* ══ CONFIRMATION SUPPRESSION ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDelete && activeFact && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(5px)' }}
            onClick={() => setShowDelete(false)}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h2 className="font-bold text-gray-800 mb-1">Supprimer la facture ?</h2>
              <p className="text-sm text-gray-500 mb-5">{activeFact.numero} — {activeFact.nom_client}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">Annuler</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)' }}>Supprimer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper pour éviter la répétition
function setForm<T>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof T, value: any) {
  setter((f: T) => ({ ...f, [key]: value }))
}
