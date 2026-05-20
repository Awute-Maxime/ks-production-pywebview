'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Plus, Search, X, Pencil, Trash2,
  Speaker, Mic, Lightbulb, Cable, Truck, Box,
  CheckCircle2, AlertTriangle, XCircle, Building2,
  DollarSign, Hash, ChevronRight, Layers
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA } from '@/lib/utils'

type Statut     = 'Disponible' | 'En maintenance' | 'Hors service'
type Provenance = 'KS Production' | 'Location' | 'Prêt'
type Categorie  = 'Sono' | 'Studio' | 'Éclairage' | 'Câblage' | 'Transport' | 'Autre'

interface Materiel {
  id: number; nom: string; categorie: Categorie; marque: string; modele: string
  quantite: number; provenance: Provenance; fournisseur: string
  cout_location: number; statut: Statut; notes: string
}

const CAT_CONFIG: Record<Categorie, { icon: React.ElementType; color: string }> = {
  'Sono':      { icon: Speaker,   color: '#e94560' },
  'Studio':    { icon: Mic,       color: '#0984e3' },
  'Éclairage': { icon: Lightbulb, color: '#f59e0b' },
  'Câblage':   { icon: Cable,     color: '#6c5ce7' },
  'Transport': { icon: Truck,     color: '#00b894' },
  'Autre':     { icon: Box,       color: '#9ca3af' },
}

const STATUT_CONFIG: Record<Statut, { color: string; bg: string; icon: React.ElementType }> = {
  'Disponible':     { color:'#065f46', bg:'#d1fae5', icon: CheckCircle2  },
  'En maintenance': { color:'#92400e', bg:'#fef3c7', icon: AlertTriangle  },
  'Hors service':   { color:'#991b1b', bg:'#fee2e2', icon: XCircle        },
}

const PROV_CONFIG: Record<Provenance, { color: string; bg: string }> = {
  'KS Production': { color:'#065f46', bg:'#d1fae5' },
  'Location':      { color:'#92400e', bg:'#fef3c7' },
  'Prêt':          { color:'#1e40af', bg:'#dbeafe' },
}

const DEMO: Materiel[] = [
  { id:1,  nom:'Système Sono Principal',         categorie:'Sono',       marque:'JBL',            modele:'PRX815W',      quantite:2,  provenance:'KS Production', fournisseur:'AudioTech Togo',      cout_location:0,     statut:'Disponible',     notes:'Enceintes actives 15" 1500W' },
  { id:2,  nom:'Ampli de puissance',             categorie:'Sono',       marque:'Crown',          modele:'XTi 4002',     quantite:1,  provenance:'KS Production', fournisseur:'AudioTech Togo',      cout_location:0,     statut:'En maintenance', notes:'En réparation depuis mai 2026' },
  { id:3,  nom:'Console de mixage',              categorie:'Sono',       marque:'Yamaha',         modele:'MG16XU',       quantite:1,  provenance:'KS Production', fournisseur:'Music Store Lomé',    cout_location:0,     statut:'Disponible',     notes:'16 canaux' },
  { id:4,  nom:'Sono de location appoint',       categorie:'Sono',       marque:'RCF',            modele:'ART 745-A',    quantite:2,  provenance:'Location',      fournisseur:'SoundRent Togo',      cout_location:30000, statut:'Disponible',     notes:'Location ponctuelle grandes jauges' },
  { id:5,  nom:'Microphone vocal',               categorie:'Studio',     marque:'Shure',          modele:'SM58',         quantite:4,  provenance:'KS Production', fournisseur:'Music Store Lomé',    cout_location:0,     statut:'Disponible',     notes:'' },
  { id:6,  nom:'Microphone condensateur',        categorie:'Studio',     marque:'Audio-Technica', modele:'AT2020',       quantite:2,  provenance:'KS Production', fournisseur:'Music Store Lomé',    cout_location:0,     statut:'Disponible',     notes:'Pour enregistrement voix' },
  { id:7,  nom:'Interface audio',                categorie:'Studio',     marque:'Focusrite',      modele:'Scarlett 4i4', quantite:2,  provenance:'KS Production', fournisseur:'Focusrite Direct',    cout_location:0,     statut:'Disponible',     notes:'USB-C' },
  { id:8,  nom:'Batterie électronique',          categorie:'Studio',     marque:'Roland',         modele:'TD-17KVX',     quantite:1,  provenance:'Prêt',          fournisseur:'KOFI Mensah',         cout_location:0,     statut:'Disponible',     notes:'Prêt temporaire' },
  { id:9,  nom:'Projecteur LED',                 categorie:'Éclairage',  marque:'Chauvet',        modele:'SlimPAR Pro',  quantite:6,  provenance:'KS Production', fournisseur:'LightPro Togo',       cout_location:0,     statut:'Disponible',     notes:'RGBAW+UV' },
  { id:10, nom:'Contrôleur DMX',                 categorie:'Éclairage',  marque:'Showtec',        modele:'Phantom 250',  quantite:1,  provenance:'KS Production', fournisseur:'LightPro Togo',       cout_location:0,     statut:'Disponible',     notes:'' },
  { id:11, nom:'Câbles XLR 10m',                 categorie:'Câblage',    marque:'Cordial',        modele:'CFM10FM',      quantite:20, provenance:'KS Production', fournisseur:'AudioTech Togo',      cout_location:0,     statut:'Disponible',     notes:'' },
  { id:12, nom:'Multipaire 16 canaux 30m',       categorie:'Câblage',    marque:'Klotz',          modele:'MY206M',       quantite:1,  provenance:'KS Production', fournisseur:'AudioTech Togo',      cout_location:0,     statut:'Disponible',     notes:'30m longueur' },
  { id:13, nom:'Camion de transport',            categorie:'Transport',  marque:'Toyota',         modele:'Hiace',        quantite:1,  provenance:'Location',      fournisseur:'Auto-Location Lomé',  cout_location:50000, statut:'Disponible',     notes:'Loué par prestation' },
  { id:14, nom:'Chariot à matériel',             categorie:'Transport',  marque:'',               modele:'',             quantite:2,  provenance:'KS Production', fournisseur:'',                    cout_location:0,     statut:'Disponible',     notes:'' },
]

const CATEGORIES: (Categorie | 'Tous')[] = ['Tous', 'Sono', 'Studio', 'Éclairage', 'Câblage', 'Transport', 'Autre']
const STATUTS: Statut[]     = ['Disponible', 'En maintenance', 'Hors service']
const PROVENANCES: Provenance[] = ['KS Production', 'Location', 'Prêt']
const EMPTY_FORM = { nom:'', categorie:'Sono' as Categorie, marque:'', modele:'', quantite:'1', provenance:'KS Production' as Provenance, fournisseur:'', cout_location:'', statut:'Disponible' as Statut, notes:'' }

export default function MaterielsPage() {
  const [materiels, setMateriels] = useState<Materiel[]>(DEMO)
  const [search, setSearch]       = useState('')
  const [catActive, setCatActive] = useState<Categorie|'Tous'>('Tous')
  const [selectedId, setSelectedId] = useState(DEMO[0].id)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Materiel | null>(null)
  const [form, setForm]           = useState(EMPTY_FORM)

  const filtered = materiels.filter(m => {
    const q = search.toLowerCase()
    const matchCat = catActive === 'Tous' || m.categorie === catActive
    const matchQ   = !q || m.nom.toLowerCase().includes(q) || m.marque.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const selected   = materiels.find(m => m.id === selectedId) || materiels[0]
  const cat        = CAT_CONFIG[selected.categorie]
  const stat       = STATUT_CONFIG[selected.statut]
  const prov       = PROV_CONFIG[selected.provenance]
  const StatIcon   = stat.icon
  const CatIcon    = cat.icon

  const nbDispo    = materiels.filter(m => m.statut === 'Disponible').length
  const nbMaint    = materiels.filter(m => m.statut === 'En maintenance').length
  const totalQte   = materiels.reduce((s, m) => s + m.quantite, 0)

  const openNew  = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (m: Materiel) => { setEditing(m); setForm({ nom:m.nom, categorie:m.categorie, marque:m.marque, modele:m.modele, quantite:String(m.quantite), provenance:m.provenance, fournisseur:m.fournisseur, cout_location:String(m.cout_location), statut:m.statut, notes:m.notes }); setShowModal(true) }

  const handleSave = () => {
    if (!form.nom.trim()) return
    if (editing) {
      setMateriels(ms => ms.map(m => m.id === editing.id ? { ...m, ...form, quantite:Number(form.quantite)||1, cout_location:Number(form.cout_location)||0 } : m))
    } else {
      const newM = { id:Date.now(), ...form, quantite:Number(form.quantite)||1, cout_location:Number(form.cout_location)||0 }
      setMateriels(ms => [...ms, newM])
      setSelectedId(newM.id)
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => {
    const remaining = materiels.filter(m => m.id !== id)
    setMateriels(remaining)
    if (remaining.length > 0) setSelectedId(remaining[0].id)
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Matériels"
        subtitle={`${materiels.length} références · ${totalQte} articles`}
        actions={
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)', boxShadow:'0 4px 12px rgba(233,69,96,0.3)' }}>
            <Plus size={15} /> Nouveau matériel
          </motion.button>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          {[
            { label:'Références',     value:materiels.length, sub:`${totalQte} articles au total`,  color:'#6c5ce7', icon:Package       },
            { label:'Disponibles',    value:nbDispo,          sub:'prêts à l\'emploi',              color:'#00b894', icon:CheckCircle2  },
            { label:'En maintenance', value:nbMaint,          sub:'en cours de réparation',         color:'#f59e0b', icon:AlertTriangle },
            { label:'Hors service',   value:materiels.filter(m=>m.statut==='Hors service').length, sub:'à remplacer', color:'#e94560', icon:XCircle },
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

        {/* ── Split view ── */}
        <div className="flex gap-4 flex-1 overflow-hidden">

          {/* ─ Liste gauche ─ */}
          <div className="w-72 shrink-0 bg-white rounded-2xl flex flex-col overflow-hidden"
            style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>

            {/* Onglets catégories — particularité de cette page */}
            <div className="p-2 border-b border-gray-100 shrink-0">
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map(cat => {
                  const cfg  = cat !== 'Tous' ? CAT_CONFIG[cat as Categorie] : null
                  const Icon = cfg?.icon || Layers
                  const count = cat === 'Tous' ? materiels.length : materiels.filter(m => m.categorie === cat).length
                  const isActive = catActive === cat
                  return (
                    <button key={cat} onClick={() => setCatActive(cat)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                      style={isActive
                        ? { background: cfg?.color || '#6c5ce7', color:'#fff' }
                        : { background:'#f3f4f6', color:'#9ca3af' }
                      }>
                      <Icon size={10} />
                      {cat === 'Tous' ? 'Tous' : cat}
                      <span className="ml-0.5 opacity-75">({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recherche */}
            <div className="px-3 py-2 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#e94560]/50 transition-all" />
                {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X size={11} /></button>}
              </div>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filtered.map(m => {
                const c = CAT_CONFIG[m.categorie]
                const s = STATUT_CONFIG[m.statut]
                const Icon = c.icon
                const isActive = m.id === selectedId
                return (
                  <motion.div key={m.id} onClick={() => setSelectedId(m.id)}
                    whileHover={{ x: isActive ? 0 : 2 }}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all"
                    style={{ background:isActive ? `${c.color}08` : 'transparent', borderLeft:`3px solid ${isActive ? c.color : 'transparent'}` }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background:`${c.color}15`, border:`1px solid ${c.color}25` }}>
                      <Icon size={14} style={{ color:c.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{m.nom}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{[m.marque, m.modele].filter(Boolean).join(' · ') || m.categorie}</div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs font-bold" style={{ color:c.color }}>×{m.quantite}</span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    </div>
                    {isActive && <ChevronRight size={11} style={{ color:c.color }} className="shrink-0" />}
                  </motion.div>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Package size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun résultat</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
              <span className="text-[11px] text-gray-400">{filtered.length} matériel{filtered.length!==1?'s':''}</span>
            </div>
          </div>

          {/* ─ Panneau détail ─ */}
          <AnimatePresence mode="wait">
            <motion.div key={selected.id}
              initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}
              transition={{ duration:0.2 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide"
            >
              {/* En-tête */}
              <div className="bg-white rounded-2xl overflow-hidden shrink-0"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                <div className="h-16 relative"
                  style={{ background:`linear-gradient(135deg,${cat.color}20,${cat.color}06)`, borderBottom:`1px solid ${cat.color}18` }}>
                  <div className="absolute bottom-0 left-6 translate-y-1/2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background:`linear-gradient(135deg,${cat.color},${cat.color}cc)`, boxShadow:`0 4px 12px ${cat.color}40` }}>
                      <CatIcon size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-4 flex gap-2">
                    <motion.button whileHover={{ scale:1.05 }} onClick={() => openEdit(selected)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 shadow-sm">
                      <Pencil size={12} /> Modifier
                    </motion.button>
                    <motion.button whileHover={{ scale:1.05 }} onClick={() => handleDelete(selected.id)}
                      className="w-7 h-7 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>

                <div className="pt-9 px-6 pb-5">
                  <h2 className="text-lg font-bold text-gray-900">{selected.nom}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background:`${cat.color}12`, color:cat.color }}>{selected.categorie}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background:stat.bg, color:stat.color }}>
                      <StatIcon size={9} /> {selected.statut}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background:prov.bg, color:prov.color }}>{selected.provenance}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Hash size={13} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">Marque / Modèle</div>
                        <div className="text-xs font-semibold text-gray-700">{[selected.marque, selected.modele].filter(Boolean).join(' ') || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Building2 size={13} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">Fournisseur</div>
                        <div className="text-xs font-semibold text-gray-700">{selected.fournisseur || '—'}</div>
                      </div>
                    </div>
                    {selected.cout_location > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <DollarSign size={13} className="text-gray-500" />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400">Coût location</div>
                          <div className="text-xs font-semibold text-amber-600">{formatFCFA(selected.cout_location)} / presta</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4 shrink-0">
                {[
                  { label:'Quantité en stock', value:selected.quantite, unit:'pièces', color:cat.color, icon:Package },
                  { label:'Statut',            value:selected.statut,   unit:selected.provenance, color:stat.color, icon:stat.icon },
                  { label:'Catégorie',         value:selected.categorie, unit:selected.marque || 'Sans marque', color:cat.color, icon:cat.icon },
                ].map(({ label, value, unit, color:c, icon:Icon }) => (
                  <div key={label} className="bg-white rounded-2xl p-4"
                    style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${c}12`, border:`1px solid ${c}20` }}>
                        <Icon size={14} style={{ color:c }} />
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{label}</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800">{value}</div>
                    <div className="text-xs mt-0.5 font-medium" style={{ color:c }}>{unit}</div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="bg-white rounded-2xl p-5 shrink-0"
                  style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</div>
                  <p className="text-sm text-gray-600 italic">"{selected.notes}"</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800">{editing ? 'Modifier le matériel' : 'Nouveau matériel'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Nom *</label>
                  <input value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Console de mixage"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm(f=>({...f,categorie:e.target.value as Categorie}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                    {(['Sono','Studio','Éclairage','Câblage','Transport','Autre'] as Categorie[]).map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Quantité</label>
                  <input type="number" min="1" value={form.quantite} onChange={e => setForm(f=>({...f,quantite:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Marque</label>
                  <input value={form.marque} onChange={e => setForm(f=>({...f,marque:e.target.value}))} placeholder="Ex: JBL"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Modèle</label>
                  <input value={form.modele} onChange={e => setForm(f=>({...f,modele:e.target.value}))} placeholder="Ex: PRX815W"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Provenance</label>
                  <select value={form.provenance} onChange={e => setForm(f=>({...f,provenance:e.target.value as Provenance}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                    {PROVENANCES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Statut</label>
                  <select value={form.statut} onChange={e => setForm(f=>({...f,statut:e.target.value as Statut}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                    {STATUTS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Fournisseur</label>
                  <input value={form.fournisseur} onChange={e => setForm(f=>({...f,fournisseur:e.target.value}))} placeholder="Nom du fournisseur"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Coût location (FCFA)</label>
                  <input type="number" value={form.cout_location} onChange={e => setForm(f=>({...f,cout_location:e.target.value}))} placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Notes</label>
                  <input value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Remarques..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">Annuler</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)' }}>
                  {editing ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
