'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Plus, Search, X, Phone, Mail, MapPin,
  Pencil, Trash2, ChevronRight, Package,
  Speaker, Mic, Lightbulb, Truck, Box, Layers
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'

type TypeService = 'Location sono' | 'Location éclairage' | 'Location transport' | 'Location studio' | 'Prêt matériel' | 'Mixte' | 'Autre'

interface MatAssoc { nom: string; quantite: number; categorie: string }
interface Fournisseur {
  id: number; nom: string; telephone: string; email: string
  adresse: string; type_service: TypeService; notes: string
  nb_materiels: number; materiels: MatAssoc[]
}

const TYPE_CONFIG: Record<TypeService, { color: string; icon: React.ElementType }> = {
  'Location sono':       { color:'#e94560', icon: Speaker   },
  'Location éclairage':  { color:'#f59e0b', icon: Lightbulb },
  'Location transport':  { color:'#00b894', icon: Truck     },
  'Location studio':     { color:'#0984e3', icon: Mic       },
  'Prêt matériel':       { color:'#6c5ce7', icon: Package   },
  'Mixte':               { color:'#e17055', icon: Layers    },
  'Autre':               { color:'#9ca3af', icon: Box       },
}

const DEMO: Fournisseur[] = [
  { id:1, nom:'AudioTech Togo',      telephone:'22501234', email:'contact@audiotech.tg',    adresse:'Lomé, Avenue du 24 Janvier', type_service:'Location sono',      notes:'Partenaire principal pour la sono. Tarifs négociés.',   nb_materiels:3, materiels:[{ nom:'Système Sono JBL', quantite:2, categorie:'Sono' },{ nom:'Ampli Crown XTi', quantite:1, categorie:'Sono' },{ nom:'Câbles XLR Cordial', quantite:20, categorie:'Câblage' }] },
  { id:2, nom:'LightPro Togo',       telephone:'22509876', email:'lightpro@gmail.com',      adresse:'Lomé, Bè Kpota',            type_service:'Location éclairage', notes:'Spécialiste éclairage scène et événementiel.',          nb_materiels:2, materiels:[{ nom:'Projecteur LED Chauvet', quantite:6, categorie:'Éclairage' },{ nom:'Contrôleur DMX Showtec', quantite:1, categorie:'Éclairage' }] },
  { id:3, nom:'SoundRent Togo',      telephone:'90112233', email:'soundrent@tg.com',        adresse:'Lomé, Tokoin Habitat',      type_service:'Location sono',      notes:'Location ponctuelle pour les grandes jauges.',          nb_materiels:1, materiels:[{ nom:'Sono RCF ART 745-A', quantite:2, categorie:'Sono' }] },
  { id:4, nom:'Music Store Lomé',    telephone:'91223344', email:'musicstore@gmail.com',    adresse:'Lomé, Centre commercial',   type_service:'Location studio',    notes:'Vente et location matériel studio. Bon SAV.',           nb_materiels:3, materiels:[{ nom:'Microphone Shure SM58', quantite:4, categorie:'Studio' },{ nom:'Micro condensateur AT2020', quantite:2, categorie:'Studio' },{ nom:'Batterie Roland TD-17', quantite:1, categorie:'Studio' }] },
  { id:5, nom:'Auto-Location Lomé',  telephone:'92334455', email:'autoloc@gmail.com',       adresse:'Lomé, Adidogomé carrefour', type_service:'Location transport', notes:'Location camion Toyota Hiace par prestation.',          nb_materiels:1, materiels:[{ nom:'Camion Toyota Hiace', quantite:1, categorie:'Transport' }] },
  { id:6, nom:'Focusrite Direct',    telephone:'',         email:'support@focusrite.com',   adresse:'En ligne',                  type_service:'Location studio',    notes:'Fournisseur interface audio. Livraison internationale.', nb_materiels:1, materiels:[{ nom:'Focusrite Scarlett 4i4', quantite:2, categorie:'Studio' }] },
  { id:7, nom:'KOFI Mensah',         telephone:'91223344', email:'kofi.mensah@gmail.com',   adresse:'Lomé, Bè',                  type_service:'Prêt matériel',      notes:'Prête sa batterie électronique pour les sessions studio.',nb_materiels:1, materiels:[{ nom:'Batterie Roland TD-17KVX', quantite:1, categorie:'Studio' }] },
]

const TYPES: TypeService[] = ['Location sono', 'Location éclairage', 'Location transport', 'Location studio', 'Prêt matériel', 'Mixte', 'Autre']
const EMPTY_FORM = { nom:'', telephone:'', email:'', adresse:'', type_service:'Autre' as TypeService, notes:'' }

const initiales = (nom: string) => nom.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()

export default function FournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>(DEMO)
  const [search, setSearch]             = useState('')
  const [selectedId, setSelectedId]     = useState(DEMO[0].id)
  const [showModal, setShowModal]       = useState(false)
  const [editing, setEditing]           = useState<Fournisseur | null>(null)
  const [form, setForm]                 = useState(EMPTY_FORM)

  const filtered = fournisseurs.filter(f => {
    const q = search.toLowerCase()
    return !q || f.nom.toLowerCase().includes(q) || f.type_service.toLowerCase().includes(q) || f.adresse.toLowerCase().includes(q)
  })

  const selected   = fournisseurs.find(f => f.id === selectedId) || fournisseurs[0]
  const cfg        = TYPE_CONFIG[selected.type_service]
  const TypeIcon   = cfg.icon

  const openNew  = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (f: Fournisseur) => { setEditing(f); setForm({ nom:f.nom, telephone:f.telephone, email:f.email, adresse:f.adresse, type_service:f.type_service, notes:f.notes }); setShowModal(true) }

  const handleSave = () => {
    if (!form.nom.trim()) return
    if (editing) {
      setFournisseurs(fs => fs.map(f => f.id === editing.id ? { ...f, ...form } : f))
    } else {
      const newF: Fournisseur = { id:Date.now(), ...form, nb_materiels:0, materiels:[] }
      setFournisseurs(fs => [...fs, newF])
      setSelectedId(newF.id)
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => {
    const remaining = fournisseurs.filter(f => f.id !== id)
    setFournisseurs(remaining)
    if (remaining.length > 0) setSelectedId(remaining[0].id)
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Fournisseurs"
        subtitle={`${fournisseurs.length} fournisseurs · ${fournisseurs.reduce((s,f)=>s+f.nb_materiels,0)} matériels associés`}
        actions={
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)', boxShadow:'0 4px 12px rgba(233,69,96,0.3)' }}>
            <Plus size={15} /> Nouveau fournisseur
          </motion.button>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          {[
            { label:'Total fournisseurs', value:fournisseurs.length,                                         sub:'partenaires actifs',    color:'#6c5ce7', icon:Store   },
            { label:'Location sono',      value:fournisseurs.filter(f=>f.type_service==='Location sono').length, sub:'prestataires audio', color:'#e94560', icon:Speaker },
            { label:'Location matériel',  value:fournisseurs.filter(f=>['Location éclairage','Location transport','Location studio'].includes(f.type_service)).length, sub:'autres locations', color:'#0984e3', icon:Package },
            { label:'Prêts & divers',     value:fournisseurs.filter(f=>['Prêt matériel','Mixte','Autre'].includes(f.type_service)).length, sub:'prêts & mixte', color:'#00b894', icon:Layers },
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

            <div className="p-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#e94560]/50 transition-all" />
                {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X size={12} /></button>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filtered.map(f => {
                const c = TYPE_CONFIG[f.type_service]
                const Icon = c.icon
                const isActive = f.id === selectedId
                return (
                  <motion.div key={f.id} onClick={() => setSelectedId(f.id)}
                    whileHover={{ x: isActive ? 0 : 2 }}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                    style={{ background:isActive ? `${c.color}08` : 'transparent', borderLeft:`3px solid ${isActive ? c.color : 'transparent'}` }}
                  >
                    {/* Avatar initiales */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background:`linear-gradient(135deg,${c.color},${c.color}cc)` }}>
                      {initiales(f.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{f.nom}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon size={9} style={{ color:c.color }} />
                        <span className="text-[10px] text-gray-400 truncate">{f.type_service}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold" style={{ color:c.color }}>{f.nb_materiels} mat.</span>
                      {isActive && <ChevronRight size={11} style={{ color:c.color }} />}
                    </div>
                  </motion.div>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Store size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun résultat</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
              <span className="text-[11px] text-gray-400">{filtered.length} fournisseur{filtered.length!==1?'s':''}</span>
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
                  style={{ background:`linear-gradient(135deg,${cfg.color}20,${cfg.color}06)`, borderBottom:`1px solid ${cfg.color}18` }}>
                  <div className="absolute bottom-0 left-6 translate-y-1/2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold"
                      style={{ background:`linear-gradient(135deg,${cfg.color},${cfg.color}cc)`, boxShadow:`0 4px 12px ${cfg.color}40` }}>
                      {initiales(selected.nom)}
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background:`${cfg.color}12`, color:cfg.color }}>
                      <TypeIcon size={11} /> {selected.type_service}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Phone size={13} className="text-gray-500" /></div>
                      <span className="font-mono text-sm text-gray-600">{selected.telephone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Mail size={13} className="text-gray-500" /></div>
                      <span className="text-xs text-gray-600 truncate">{selected.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><MapPin size={13} className="text-gray-500" /></div>
                      <span className="text-xs text-gray-600">{selected.adresse || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI matériels associés */}
              <div className="grid grid-cols-3 gap-4 shrink-0">
                {[
                  { label:'Matériels fournis', value:selected.nb_materiels,    sub:'références associées',  color:cfg.color,  icon:Package },
                  { label:'Type de service',   value:selected.type_service,    sub:'catégorie principale',  color:cfg.color,  icon:cfg.icon },
                  { label:'Contact',           value:selected.telephone||'—',  sub:selected.email||'—',     color:'#6b7280',  icon:Phone },
                ].map(({ label, value, sub, color:c, icon:Icon }) => (
                  <div key={label} className="bg-white rounded-2xl p-4"
                    style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${c}12`, border:`1px solid ${c}20` }}>
                        <Icon size={14} style={{ color:c }} />
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{label}</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 truncate">{value}</div>
                    <div className="text-xs mt-0.5 font-medium text-gray-400 truncate">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Matériels associés — particularité de cette page */}
              {selected.materiels.length > 0 && (
                <div className="bg-white rounded-2xl overflow-hidden shrink-0"
                  style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Package size={14} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">Matériels associés</span>
                    <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background:`${cfg.color}12`, color:cfg.color }}>{selected.materiels.length}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {selected.materiels.map((m, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/60 transition-all">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background:`${cfg.color}10`, border:`1px solid ${cfg.color}20` }}>
                          <Package size={13} style={{ color:cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-700">{m.nom}</div>
                          <div className="text-xs text-gray-400">{m.categorie}</div>
                        </div>
                        <span className="text-sm font-bold shrink-0" style={{ color:cfg.color }}>×{m.quantite}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800">{editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Nom *</label>
                  <input value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: AudioTech Togo"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Téléphone</label>
                  <input value={form.telephone} onChange={e => setForm(f=>({...f,telephone:e.target.value}))} placeholder="22XXXXXX"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Email</label>
                  <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="email@exemple.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Adresse</label>
                  <input value={form.adresse} onChange={e => setForm(f=>({...f,adresse:e.target.value}))} placeholder="Ex: Lomé, Avenue du 24 Janvier"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Type de service</label>
                  <select value={form.type_service} onChange={e => setForm(f=>({...f,type_service:e.target.value as TypeService}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
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
