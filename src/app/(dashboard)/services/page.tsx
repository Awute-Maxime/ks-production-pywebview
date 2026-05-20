'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid, Plus, Pencil, Trash2, X, ChevronDown,
  Mic, Speaker, Package, Tag, Download, FileText
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA } from '@/lib/utils'

type Section = 'Studio' | 'Sonorisation' | 'Location' | 'Autre'

interface Service {
  id: number; libelle: string; section: Section; prix: number; actif: boolean
}

const SECTION_CONFIG: Record<Section, { color: string; icon: React.ElementType }> = {
  'Studio':       { color:'#0984e3', icon: Mic     },
  'Sonorisation': { color:'#e94560', icon: Speaker },
  'Location':     { color:'#00b894', icon: Package },
  'Autre':        { color:'#9ca3af', icon: Tag     },
}

const DEMO: Service[] = [
  { id:1,  libelle:'Enregistrement voix — single',       section:'Studio',       prix:35000,  actif:true },
  { id:2,  libelle:'Enregistrement voix — album (10)',   section:'Studio',       prix:120000, actif:true },
  { id:3,  libelle:'Mixage & Mastering — single',        section:'Studio',       prix:25000,  actif:true },
  { id:4,  libelle:'Mixage & Mastering — EP (5 titres)', section:'Studio',       prix:80000,  actif:true },
  { id:5,  libelle:'Doublage & Voix off',                section:'Studio',       prix:45000,  actif:true },
  { id:6,  libelle:'Sonorisation mariage (demi-journée)',section:'Sonorisation', prix:150000, actif:true },
  { id:7,  libelle:'Sonorisation mariage (journée)',     section:'Sonorisation', prix:250000, actif:true },
  { id:8,  libelle:'Sonorisation concert / gala',        section:'Sonorisation', prix:350000, actif:true },
  { id:9,  libelle:'Sonorisation séminaire / conf.',     section:'Sonorisation', prix:80000,  actif:true },
  { id:10, libelle:'Sonorisation culte religieux',       section:'Sonorisation', prix:120000, actif:true },
  { id:11, libelle:'Location enceintes (lot 2)',         section:'Location',     prix:30000,  actif:true },
  { id:12, libelle:'Location console de mixage',        section:'Location',     prix:25000,  actif:true },
  { id:13, libelle:'Location micro (lot 4)',             section:'Location',     prix:15000,  actif:true },
  { id:14, libelle:'Location sono complète',            section:'Location',     prix:80000,  actif:true },
  { id:15, libelle:'Montage / câblage scène',           section:'Autre',        prix:20000,  actif:true },
  { id:16, libelle:'Conseil technique événement',       section:'Autre',        prix:15000,  actif:true },
]

const SECTIONS: Section[] = ['Studio', 'Sonorisation', 'Location', 'Autre']
const EMPTY_FORM = { libelle:'', section:'Studio' as Section, prix:'' }

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(DEMO)
  const [openSections, setOpenSections] = useState<Set<Section>>(new Set(SECTIONS))
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]    = useState<Service | null>(null)
  const [form, setForm]          = useState(EMPTY_FORM)

  const toggleSection = (s: Section) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  const openNew  = (section?: Section) => { setEditing(null); setForm({ ...EMPTY_FORM, section: section || 'Studio' }); setShowModal(true) }
  const openEdit = (s: Service) => { setEditing(s); setForm({ libelle:s.libelle, section:s.section, prix:String(s.prix) }); setShowModal(true) }

  const handleSave = () => {
    if (!form.libelle.trim()) return
    if (editing) {
      setServices(ss => ss.map(s => s.id === editing.id ? { ...s, ...form, prix:Number(form.prix)||0 } : s))
    } else {
      setServices(ss => [...ss, { id:Date.now(), ...form, prix:Number(form.prix)||0, actif:true }])
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => setServices(ss => ss.filter(s => s.id !== id))

  const totalServices = services.length
  const totalCA = services.reduce((sum, s) => sum + s.prix, 0)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'#f0f2f8' }}>
      <Topbar
        title="Services & Tarifs"
        subtitle={`${totalServices} services · catalogue actif`}
        actions={
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200"
              style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <Download size={13} /> Fiche tarifs PDF
            </motion.button>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => openNew()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)', boxShadow:'0 4px 12px rgba(233,69,96,0.3)' }}>
              <Plus size={15} /> Nouveau service
            </motion.button>
          </div>
        }
      />

      <div className="p-6 space-y-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {SECTIONS.map((section, i) => {
            const cfg   = SECTION_CONFIG[section]
            const count = services.filter(s => s.section === section).length
            const Icon  = cfg.icon
            return (
              <motion.div key={section} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                className="bg-white rounded-2xl px-4 py-3.5 relative overflow-hidden cursor-pointer"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:`1px solid ${openSections.has(section) ? cfg.color+'30' : 'rgba(0,0,0,0.06)'}` }}
                onClick={() => toggleSection(section)}>
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background:cfg.color }} />
                <div className="flex items-start justify-between mb-2">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{section}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${cfg.color}12` }}>
                    <Icon size={13} style={{ color:cfg.color }} />
                  </div>
                </div>
                <div className="text-gray-800 font-bold text-xl">{count}</div>
                <div className="text-xs mt-0.5 font-medium" style={{ color:cfg.color }}>prestations</div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Catalogue groupé par section — particularité ── */}
        <div className="space-y-3">
          {SECTIONS.map(section => {
            const cfg      = SECTION_CONFIG[section]
            const Icon     = cfg.icon
            const items    = services.filter(s => s.section === section)
            const isOpen   = openSections.has(section)
            const totalSec = items.reduce((s, i) => s + i.prix, 0)
            return (
              <div key={section} className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                {/* Header section cliquable */}
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                  onClick={() => toggleSection(section)}
                  style={{ borderBottom: isOpen ? '1px solid #f3f4f6' : 'none' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:`${cfg.color}12`, border:`1px solid ${cfg.color}25` }}>
                    <Icon size={15} style={{ color:cfg.color }} />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-800">{section}</span>
                    <span className="ml-2 text-xs text-gray-400">{items.length} service{items.length!==1?'s':''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400">Prix moyen : <span className="font-bold text-gray-600">{items.length ? formatFCFA(Math.round(totalSec/items.length)) : '—'}</span></span>
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                      onClick={e => { e.stopPropagation(); openNew(section) }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                      style={{ background:`${cfg.color}12`, color:cfg.color }}>
                      <Plus size={10} /> Ajouter
                    </motion.button>
                    <ChevronDown size={16} className="text-gray-300 transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </div>
                </div>

                {/* Liste services */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background:'#fafafa' }}>
                            <th className="px-5 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Libellé</th>
                            <th className="px-5 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider w-36">Prix indicatif</th>
                            <th className="px-5 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((svc, i) => (
                            <tr key={svc.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors group">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:cfg.color }} />
                                  <span className="text-gray-700 font-medium">{svc.libelle}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-right font-bold" style={{ color: svc.prix > 0 ? cfg.color : '#9ca3af' }}>
                                {svc.prix > 0 ? formatFCFA(svc.prix) : '—'}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openEdit(svc)}
                                    className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all">
                                    <Pencil size={12} />
                                  </button>
                                  <button onClick={() => handleDelete(svc.id)}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 transition-all">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {items.length === 0 && (
                            <tr><td colSpan={3} className="px-5 py-6 text-center text-gray-400 text-sm italic">
                              Aucun service dans cette section
                            </td></tr>
                          )}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
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
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800">{editing ? 'Modifier le service' : 'Nouveau service'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Libellé *</label>
                  <input value={form.libelle} onChange={e => setForm(f=>({...f,libelle:e.target.value}))} placeholder="Ex: Sonorisation mariage journée"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Section</label>
                    <select value={form.section} onChange={e => setForm(f=>({...f,section:e.target.value as Section}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                      {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Prix indicatif (FCFA)</label>
                    <input type="number" value={form.prix} onChange={e => setForm(f=>({...f,prix:e.target.value}))} placeholder="Ex: 150000"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                  </div>
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
