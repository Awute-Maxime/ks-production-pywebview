'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Plus, Search, Download, Eye, Trash2,
  ArrowRightLeft, Clock, CheckCircle2, ChevronDown, X, AlertCircle,
  Printer, Building2, Phone, Mail, MapPin, Calendar, User, Receipt,
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'
import type { Facture } from '@/types'

/* ── Demo data ─────────────────────────────────────────────── */
const DEMO_PROFORMAS: Facture[] = [
  { id:1, numero:'PROF-19052026-001', date:'2026-05-19', nom_client:'NKRUMAH Events',   service:'Sonorisation Gala annuel — Plein air',    montant_ttc:420000, montant_paye:0, reste_du:420000, etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'admin' },
  { id:2, numero:'PROF-18052026-001', date:'2026-05-18', nom_client:'Eglise Victoire',  service:'Sonorisation Concert de Noël 2026',       montant_ttc:350000, montant_paye:0, reste_du:350000, etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'admin' },
  { id:3, numero:'PROF-15052026-001', date:'2026-05-15', nom_client:'MENSAH Kofi',      service:'Album complet 12 titres — Studio',        montant_ttc:280000, montant_paye:0, reste_du:280000, etat_paiement:'Converti',  type_operation:'Proforma', section:'Studio',       cree_par:'admin' },
  { id:4, numero:'PROF-12052026-001', date:'2026-05-12', nom_client:'ATCHO Emmanuel',   service:'Mariage — Sonorisation & Animation',      montant_ttc:310000, montant_paye:0, reste_du:310000, etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'caissier' },
  { id:5, numero:'PROF-10052026-001', date:'2026-05-10', nom_client:'AGBEKO Mawuli',    service:'EP 6 titres — Enregistrement & Mixage',  montant_ttc:185000, montant_paye:0, reste_du:185000, etat_paiement:'Converti',  type_operation:'Proforma', section:'Studio',       cree_par:'admin' },
  { id:6, numero:'PROF-05052026-001', date:'2026-05-05', nom_client:'AMOUZOU Dodji',    service:'Location matériel — Séminaire 3 jours',  montant_ttc:120000, montant_paye:0, reste_du:120000, etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'admin' },
  { id:7, numero:'PROF-01052026-001', date:'2026-05-01', nom_client:'LA VOIE AU TOGO',  service:'Sonorisation émission TV mensuelle',      montant_ttc:95000,  montant_paye:0, reste_du:95000,  etat_paiement:'Non Payer', type_operation:'Proforma', section:'Sonorisation', cree_par:'admin' },
  { id:8, numero:'PROF-25042026-001', date:'2026-04-25', nom_client:'KONDO KOFFI',      service:'Doublage publicitaire — 3 spots radio',  montant_ttc:75000,  montant_paye:0, reste_du:75000,  etat_paiement:'Converti',  type_operation:'Proforma', section:'Studio',       cree_par:'caissier' },
]

const DEMO_CLIENTS  = ['NKRUMAH Events','Eglise Victoire','MENSAH Kofi','ATCHO Emmanuel','AGBEKO Mawuli','AMOUZOU Dodji','LA VOIE AU TOGO','KONDO KOFFI','TOGO TELECOM','LOMÉ EVENTS']
const DEMO_SERVICES = ['Sonorisation Gala annuel','Concert de Noël','Album 12 titres Studio','Mariage Sonorisation & Animation','EP 6 titres Enregistrement','Location matériel Séminaire','Sonorisation émission TV','Doublage publicitaire 3 spots']

const ETATS = [
  { value: '',          label: 'Tous les états' },
  { value: 'Non Payer', label: 'En attente' },
  { value: 'Converti',  label: 'Convertis' },
]

/* ── Numéro auto ─────────────────────────────────────────── */
function genNumero(list: Facture[]) {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2,'0')
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const yy = d.getFullYear()
  const seq = String(list.filter(p => p.date === `${yy}-${mm}-${dd}`).length + 1).padStart(3,'0')
  return `PROF-${dd}${mm}${yy}-${seq}`
}

/* ── EtatBadge ───────────────────────────────────────────── */
function EtatBadge({ etat }: { etat: string }) {
  const cfg = etat === 'Converti'
    ? { icon: CheckCircle2, color: '#00b894', label: 'Converti' }
    : { icon: Clock,        color: '#fdcb6e', label: 'En attente' }
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background:`${cfg.color}18`, color:cfg.color, border:`1px solid ${cfg.color}30` }}>
      <Icon size={11}/>{cfg.label}
    </span>
  )
}

/* ── StatCard ────────────────────────────────────────────── */
function StatCard({ label, count, amount, color, icon:Icon }: {
  label:string; count:number; amount:number; color:string; icon:React.ElementType
}) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
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

/* ── Aperçu Proforma ─────────────────────────────────────── */
function ApercuProforma({ proforma, onClose }: { proforma: Facture; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale:0.93, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.93, opacity:0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'#6c5ce715' }}>
              <FileText size={15} style={{ color:'#6c5ce7' }} />
            </div>
            <span className="font-bold text-gray-700 text-sm">Aperçu proforma</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
              <Printer size={12} /> Imprimer
            </motion.button>
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background:'linear-gradient(135deg,#6c5ce7,#5849c2)' }}>
              <Download size={12} /> PDF
            </motion.button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Document */}
        <div className="overflow-y-auto flex-1 p-8 text-sm" style={{ fontFamily:'Georgia, serif' }}>

          {/* En-tête */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="text-2xl font-black tracking-tight" style={{ color:'#6c5ce7' }}>KS PRODUCTION</div>
              <div className="text-xs text-gray-500 mt-1">Studio d'enregistrement & Sonorisation</div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><MapPin size={10}/> Lomé, Togo · Adidogomé</div>
              <div className="flex items-center gap-1 text-xs text-gray-400"><Phone size={10}/> +228 92 XX XX XX</div>
              <div className="flex items-center gap-1 text-xs text-gray-400"><Mail size={10}/> contact@ksproduction.tg</div>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase"
                style={{ background:'#6c5ce720', color:'#6c5ce7', border:'2px solid #6c5ce740' }}>
                PROFORMA
              </div>
              <div className="text-xl font-bold text-gray-800 mt-3 font-mono">{proforma.numero}</div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 justify-end"><Calendar size={10}/> Émis le {formatDate(proforma.date)}</div>
              <div className="text-xs text-gray-400">Valide 30 jours · Non acquitté</div>
            </div>
          </div>

          {/* Client */}
          <div className="rounded-xl p-4 mb-6" style={{ background:'#6c5ce708', border:'1px solid #6c5ce720' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <User size={11} style={{ color:'#6c5ce7' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:'#6c5ce7' }}>Destinataire</span>
            </div>
            <div className="font-bold text-gray-800">{proforma.nom_client}</div>
            <div className="text-xs text-gray-400 mt-0.5">Lomé, Togo</div>
          </div>

          {/* Tableau services */}
          <table className="w-full mb-6 text-xs">
            <thead>
              <tr style={{ background:'#6c5ce7', color:'#fff' }}>
                <th className="px-3 py-2 text-left rounded-tl-lg font-semibold">Description</th>
                <th className="px-3 py-2 text-center font-semibold">Section</th>
                <th className="px-3 py-2 text-right rounded-tr-lg font-semibold">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background:'#6c5ce708' }}>
                <td className="px-3 py-3 text-gray-700">{proforma.service}</td>
                <td className="px-3 py-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background:'#6c5ce720', color:'#6c5ce7' }}>{proforma.section}</span>
                </td>
                <td className="px-3 py-3 text-right font-bold text-gray-800">{formatFCFA(proforma.montant_ttc)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totaux */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Sous-total HT</span><span>{formatFCFA(proforma.montant_ttc)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>TVA (0%)</span><span>0 FCFA</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total TTC</span>
                <span className="text-base" style={{ color:'#6c5ce7' }}>{formatFCFA(proforma.montant_ttc)}</span>
              </div>
            </div>
          </div>

          {/* Mentions */}
          <div className="border-t border-gray-100 pt-4 space-y-1 text-[10px] text-gray-400">
            <p>Ce document est un devis et n'a pas valeur de facture définitive. Il est valable 30 jours à compter de la date d'émission.</p>
            <p>Pour toute question, contactez-nous au +228 92 XX XX XX ou contact@ksproduction.tg</p>
            <p className="font-semibold text-gray-500">KS Production — RCCM : TG-LOM-XXXX · NIF : XXXXXXXXX</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Page principale ─────────────────────────────────────── */
export default function ProformasPage() {
  const [proformas, setProformas]         = useState<Facture[]>(DEMO_PROFORMAS)
  const [search, setSearch]               = useState('')
  const [filtreEtat, setFiltreEtat]       = useState('')
  const [filtreSection, setFiltreSection] = useState('')

  const [showNew, setShowNew]             = useState(false)
  const [apercuItem, setApercuItem]       = useState<Facture | null>(null)
  const [convertItem, setConvertItem]     = useState<Facture | null>(null)
  const [deleteItem, setDeleteItem]       = useState<Facture | null>(null)

  const [newForm, setNewForm] = useState({
    nom_client:'', service:'', section:'Sonorisation', date: new Date().toISOString().slice(0,10), montant_ttc:''
  })

  /* Filtrage */
  const filtered = proformas.filter(p => {
    if (filtreEtat && p.etat_paiement !== filtreEtat) return false
    if (filtreSection && p.section !== filtreSection) return false
    if (search) {
      const q = search.toLowerCase()
      return p.numero.toLowerCase().includes(q) || p.nom_client.toLowerCase().includes(q) || p.service.toLowerCase().includes(q)
    }
    return true
  })

  /* Stats */
  const enAttente  = proformas.filter(p => p.etat_paiement === 'Non Payer')
  const convertis  = proformas.filter(p => p.etat_paiement === 'Converti')
  const tauxConv   = proformas.length ? Math.round((convertis.length / proformas.length) * 100) : 0
  const totalMontant = proformas.reduce((s,p) => s + p.montant_ttc, 0)

  /* Actions */
  const handleCreate = () => {
    if (!newForm.nom_client || !newForm.service || !newForm.montant_ttc) return
    const montant = Number(newForm.montant_ttc)
    const nouveau: Facture = {
      id: Date.now(), numero: genNumero(proformas),
      date: newForm.date, nom_client: newForm.nom_client,
      service: newForm.service, section: newForm.section as any,
      montant_ttc: montant, montant_paye: 0, reste_du: montant,
      etat_paiement: 'Non Payer', type_operation: 'Proforma', cree_par: 'admin',
    }
    setProformas(prev => [nouveau, ...prev])
    setShowNew(false)
    setNewForm({ nom_client:'', service:'', section:'Sonorisation', date: new Date().toISOString().slice(0,10), montant_ttc:'' })
  }

  const handleConvert = () => {
    if (!convertItem) return
    setProformas(prev => prev.map(p => p.id === convertItem.id ? { ...p, etat_paiement: 'Converti' } : p))
    setConvertItem(null)
  }

  const handleDelete = () => {
    if (!deleteItem) return
    setProformas(prev => prev.filter(p => p.id !== deleteItem.id))
    setDeleteItem(null)
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Proformas"
        subtitle={`${proformas.length} devis · Taux de conversion ${tauxConv}%`}
        actions={
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background:'linear-gradient(135deg,#6c5ce7,#5849c2)', boxShadow:'0 4px 12px rgba(108,92,231,0.3)' }}>
            <Plus size={15}/> Nouveau devis
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total devis"     count={proformas.length}    amount={totalMontant}                                   color="#6c5ce7" icon={FileText} />
          <StatCard label="En attente"      count={enAttente.length}    amount={enAttente.reduce((s,p)=>s+p.montant_ttc,0)}    color="#fdcb6e" icon={Clock} />
          <StatCard label="Convertis"       count={convertis.length}    amount={convertis.reduce((s,p)=>s+p.montant_ttc,0)}    color="#00b894" icon={CheckCircle2} />
          <StatCard label="Taux conversion" count={tauxConv}            amount={convertis.reduce((s,p)=>s+p.montant_ttc,0)}    color="#0984e3" icon={ArrowRightLeft} />
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par n°, client, service..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#6c5ce7]/40 transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14}/></button>
            )}
          </div>
          <div className="relative">
            <select value={filtreEtat} onChange={e => setFiltreEtat(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
              {ETATS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          <div className="relative">
            <select value={filtreSection} onChange={e => setFiltreSection(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
              <option value="">Toutes sections</option>
              <option value="Sonorisation">Sonorisation</option>
              <option value="Studio">Studio</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          <span className="text-gray-400 text-xs ml-auto">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
            <Download size={14}/> Export CSV
          </motion.button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="grid gap-3 px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"
            style={{ gridTemplateColumns:'170px 1fr 130px 110px 100px 90px' }}>
            <span>N° Proforma</span>
            <span>Client / Service</span>
            <span className="text-right">Montant TTC</span>
            <span>Section</span>
            <span>État</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText size={32} className="mx-auto mb-3 opacity-30"/>
                <p className="text-sm">Aucun proforma trouvé</p>
              </div>
            ) : filtered.map(p => (
              <div key={p.id}
                className="grid gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-all group"
                style={{ gridTemplateColumns:'170px 1fr 130px 110px 100px 90px' }}>

                <div>
                  <div className="text-xs font-bold text-[#6c5ce7] font-mono">{p.numero}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(p.date)} · Valable 30j</div>
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{p.nom_client}</div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{p.service}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800">{formatFCFA(p.montant_ttc)}</div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
                    style={{ background:p.section==='Studio'?'#6c5ce715':'#e9456015', color:p.section==='Studio'?'#6c5ce7':'#e94560' }}>
                    {p.section}
                  </span>
                </div>

                <div><EtatBadge etat={p.etat_paiement}/></div>

                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                    onClick={() => setApercuItem(p)}
                    className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-all" title="Aperçu">
                    <Eye size={13}/>
                  </motion.button>
                  {p.etat_paiement !== 'Converti' && (
                    <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                      onClick={() => setConvertItem(p)}
                      className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-all" title="Convertir en facture">
                      <ArrowRightLeft size={13}/>
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                    onClick={() => setDeleteItem(p)}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all" title="Supprimer">
                    <Trash2 size={13}/>
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{filtered.length} proforma(s) affichée(s)</span>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Total : <strong className="text-gray-700">{formatFCFA(filtered.reduce((s,p)=>s+p.montant_ttc,0))}</strong></span>
              <span>Taux conversion : <strong className="text-[#00b894]">{tauxConv}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      <AnimatePresence>

        {/* Nouvelle proforma */}
        {showNew && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)' }}
            onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.92, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'#6c5ce715' }}>
                    <FileText size={17} style={{ color:'#6c5ce7' }}/>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">Nouveau devis (Proforma)</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{genNumero(proformas)}</p>
                  </div>
                </div>
                <button onClick={() => setShowNew(false)} className="w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center transition-all">
                  <X size={15}/>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Client *</label>
                  <input list="clients-list" value={newForm.nom_client} onChange={e => setNewForm(f=>({...f,nom_client:e.target.value}))}
                    placeholder="Nom du client ou structure"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#6c5ce7] transition-all"/>
                  <datalist id="clients-list">{DEMO_CLIENTS.map(c=><option key={c} value={c}/>)}</datalist>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Service / Prestation *</label>
                  <input list="services-list" value={newForm.service} onChange={e => setNewForm(f=>({...f,service:e.target.value}))}
                    placeholder="Description de la prestation"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#6c5ce7] transition-all"/>
                  <datalist id="services-list">{DEMO_SERVICES.map(s=><option key={s} value={s}/>)}</datalist>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Section</label>
                    <div className="relative">
                      <select value={newForm.section} onChange={e => setNewForm(f=>({...f,section:e.target.value}))}
                        className="w-full appearance-none border border-gray-200 rounded-xl px-3 pr-8 py-2.5 text-sm focus:outline-none focus:border-[#6c5ce7] transition-all cursor-pointer">
                        <option value="Sonorisation">Sonorisation</option>
                        <option value="Studio">Studio</option>
                        <option value="Location">Location</option>
                        <option value="Administration">Administration</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Date</label>
                    <input type="date" value={newForm.date} onChange={e => setNewForm(f=>({...f,date:e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#6c5ce7] transition-all"/>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Montant TTC (FCFA) *</label>
                  <input type="number" value={newForm.montant_ttc} onChange={e => setNewForm(f=>({...f,montant_ttc:e.target.value}))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#6c5ce7] transition-all"/>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowNew(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleCreate}
                  disabled={!newForm.nom_client || !newForm.service || !newForm.montant_ttc}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: newForm.nom_client && newForm.service && newForm.montant_ttc ? 'linear-gradient(135deg,#6c5ce7,#5849c2)' : '#d1d5db', cursor: newForm.nom_client && newForm.service && newForm.montant_ttc ? 'pointer' : 'not-allowed' }}>
                  Créer le devis
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Aperçu */}
        {apercuItem && <ApercuProforma proforma={apercuItem} onClose={() => setApercuItem(null)}/>}

        {/* Convertir en facture */}
        {convertItem && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)' }}
            onClick={() => setConvertItem(null)}>
            <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.92, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:'#6c5ce715' }}>
                  <ArrowRightLeft size={20} style={{ color:'#6c5ce7' }}/>
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Convertir en facture</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Le proforma <strong className="text-[#6c5ce7] font-mono text-xs">{convertItem.numero}</strong> sera converti en facture officielle pour <strong>{convertItem.nom_client}</strong>.
                  </p>
                </div>
                <button onClick={() => setConvertItem(null)} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0"><X size={15}/></button>
              </div>

              <div className="rounded-xl p-3 mb-5" style={{ background:'#6c5ce708', border:'1px solid #6c5ce720' }}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Service</span><span className="font-medium text-gray-800 text-right max-w-[60%] truncate">{convertItem.service}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Montant TTC</span><span className="font-bold text-[#6c5ce7]">{formatFCFA(convertItem.montant_ttc)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl mb-5" style={{ background:'#fef3c7', border:'1px solid #fde68a' }}>
                <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5"/>
                <p className="text-xs text-amber-700">Une nouvelle facture sera créée. Ce proforma sera marqué "Converti" et ne pourra plus être modifié.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setConvertItem(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleConvert}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background:'linear-gradient(135deg,#6c5ce7,#5849c2)' }}>
                  <Receipt size={13}/> Convertir
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Supprimer */}
        {deleteItem && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)' }}
            onClick={() => setDeleteItem(null)}>
            <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.92, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:'#fee2e2' }}>
                  <Trash2 size={20} className="text-red-500"/>
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Supprimer le proforma</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    <strong className="text-red-500 font-mono text-xs">{deleteItem.numero}</strong> — {deleteItem.nom_client}
                  </p>
                </div>
                <button onClick={() => setDeleteItem(null)} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0"><X size={15}/></button>
              </div>
              <p className="text-sm text-gray-500 mb-5">Cette action est <strong>irréversible</strong>. Le proforma sera définitivement supprimé.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteItem(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                  Supprimer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
