'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wrench, Plus, Search, X, Phone, Mail,
  CheckCircle2, XCircle, Pencil, Trash2,
  Calendar, Banknote, UserCog, Star, Zap, ChevronRight
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA } from '@/lib/utils'

const COLORS = ['#e94560','#0984e3','#6c5ce7','#00b894','#f39c12','#00cec9','#e17055','#a29bfe']

interface Technicien {
  id: number; nom: string; telephone: string; email: string
  specialite: string; role: string; statut: 'Disponible'|'Inactif'
  statut_emploi: 'Salarié'|'Temporaire'; salaire_base: number
  nb_prestations: number; notes: string; color: string
  competences: string[]
}

const DEMO: Technicien[] = [
  { id:1, nom:'ATSUTSUI Kodjo',  telephone:'90112233', email:'atsutsui@gmail.com',    specialite:'Sonorisation Live',      role:'Technicien Son',        statut:'Disponible', statut_emploi:'Salarié',    salaire_base:80000,  nb_prestations:24, notes:'Expérimenté sur les grands événements extérieurs.',  color:'#e94560', competences:['Sono Live','Câblage','PA System','Retours scène'] },
  { id:2, nom:'KOFI Mensah',     telephone:'91223344', email:'kofi.mensah@gmail.com', specialite:'Studio & Mixage',        role:'Ingénieur du son',      statut:'Disponible', statut_emploi:'Salarié',    salaire_base:95000,  nb_prestations:18, notes:'Spécialiste mixage & mastering. Travaille la nuit.', color:'#0984e3', competences:['Mixage','Mastering','ProTools','Studio'] },
  { id:3, nom:'AGBE Sényo',      telephone:'92334455', email:'agbe.senyo@gmail.com',  specialite:'Éclairage & Scène',      role:'Technicien Lumière',    statut:'Disponible', statut_emploi:'Temporaire', salaire_base:60000,  nb_prestations:12, notes:'Disponible week-ends uniquement.',                    color:'#6c5ce7', competences:['Éclairage','DMX','Scène','Effets'] },
  { id:4, nom:'DOSSOU Félix',    telephone:'93445566', email:'dossou.f@yahoo.fr',     specialite:'Sonorisation & Câblage', role:'Technicien Son',        statut:'Disponible', statut_emploi:'Temporaire', salaire_base:55000,  nb_prestations:9,  notes:'',                                                   color:'#00b894', competences:['Sono','Câblage','Installation'] },
  { id:5, nom:'KPODO Aristide',  telephone:'94556677', email:'kpodo.a@gmail.com',     specialite:'Installation & Config',  role:'Technicien Matériel',   statut:'Inactif',    statut_emploi:'Temporaire', salaire_base:50000,  nb_prestations:5,  notes:"En formation jusqu'en juillet 2026.",                color:'#f39c12', competences:['Maintenance','Config','Inventaire'] },
  { id:6, nom:'AMOUZOU Selom',   telephone:'95667788', email:'amouzou.s@gmail.com',   specialite:'Enregistrement Studio',  role:'Assistant Studio',      statut:'Disponible', statut_emploi:'Temporaire', salaire_base:45000,  nb_prestations:7,  notes:'',                                                   color:'#00cec9', competences:['Enregistrement','Voix','Prise de son'] },
  { id:7, nom:'LAWSON Edem',     telephone:'96778899', email:'lawson.edem@gmail.com', specialite:'Sonorisation Mariage',   role:'Technicien Son',        statut:'Disponible', statut_emploi:'Salarié',    salaire_base:75000,  nb_prestations:31, notes:'Notre meilleur élément sur les mariages.',           color:'#e17055', competences:['Sono Mariage','DJ Setup','Animation','Fond sonore'] },
  { id:8, nom:'TOSSOU Barnabas', telephone:'97889900', email:'tossou.b@gmail.com',    specialite:'Multi-compétences',      role:'Technicien Polyvalent', statut:'Inactif',    statut_emploi:'Temporaire', salaire_base:50000,  nb_prestations:3,  notes:'Indisponible pour raisons personnelles.',            color:'#a29bfe', competences:['Polyvalent','Logistique'] },
]

const ROLES = ['', 'Technicien Son', 'Ingénieur du son', 'Technicien Lumière', 'Technicien Matériel', 'Assistant Studio', 'Technicien Polyvalent']
const EMPTY_FORM = { nom:'', telephone:'', email:'', specialite:'', role:'', statut_emploi:'Temporaire' as 'Salarié'|'Temporaire', salaire_base:'', notes:'' }
const initiales = (nom: string) => nom.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()

export default function TechniciensPage() {
  const [techniciens, setTechniciens] = useState<Technicien[]>(DEMO)
  const [search, setSearch]           = useState('')
  const [selectedId, setSelectedId]   = useState(DEMO[0].id)
  const [showModal, setShowModal]     = useState(false)
  const [editing, setEditing]         = useState<Technicien | null>(null)
  const [form, setForm]               = useState(EMPTY_FORM)

  const filtered = techniciens.filter(t => {
    const q = search.toLowerCase()
    return !q || t.nom.toLowerCase().includes(q) || t.role.toLowerCase().includes(q) || t.specialite.toLowerCase().includes(q)
  })

  const selected       = techniciens.find(t => t.id === selectedId) || techniciens[0]
  const nbDispos       = techniciens.filter(t => t.statut === 'Disponible').length
  const nbInactifs     = techniciens.filter(t => t.statut === 'Inactif').length
  const masseSalariale = techniciens.filter(t => t.statut_emploi === 'Salarié').reduce((s,t)=>s+t.salaire_base, 0)
  const topPrestataire = [...techniciens].sort((a,b)=>b.nb_prestations-a.nb_prestations)[0]
  const maxPrestations = Math.max(...techniciens.map(t=>t.nb_prestations))

  const openNew  = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (t: Technicien) => { setEditing(t); setForm({ nom:t.nom, telephone:t.telephone, email:t.email, specialite:t.specialite, role:t.role, statut_emploi:t.statut_emploi, salaire_base:String(t.salaire_base), notes:t.notes }); setShowModal(true) }

  const handleSave = () => {
    if (!form.nom.trim()) return
    if (editing) {
      const updated = { ...editing, ...form, salaire_base:Number(form.salaire_base)||0 }
      setTechniciens(ts => ts.map(t => t.id===editing.id ? updated : t))
    } else {
      const newT: Technicien = { id:Date.now(), ...form, salaire_base:Number(form.salaire_base)||0, statut:'Disponible', nb_prestations:0, color:COLORS[techniciens.length%COLORS.length], competences:[] }
      setTechniciens(ts => [...ts, newT])
      setSelectedId(newT.id)
    }
    setShowModal(false)
  }

  const handleToggle = () => {
    const updated = { ...selected, statut: selected.statut==='Disponible' ? 'Inactif' : 'Disponible' } as Technicien
    setTechniciens(ts => ts.map(t => t.id===selected.id ? updated : t))
  }

  const handleDelete = () => {
    const remaining = techniciens.filter(t => t.id !== selected.id)
    setTechniciens(remaining)
    if (remaining.length > 0) setSelectedId(remaining[0].id)
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Techniciens"
        subtitle={`${techniciens.length} techniciens · ${nbDispos} disponibles`}
        actions={
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)', boxShadow:'0 4px 12px rgba(233,69,96,0.3)' }}>
            <Plus size={15} /> Nouveau technicien
          </motion.button>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-5">

        {/* ── Stats — blanc, accent couleur discret ── */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          {[
            { label:'Total techniciens', value:techniciens.length,            sub:"dans l'équipe",          color:'#6c5ce7', icon:UserCog },
            { label:'Disponibles',       value:nbDispos,                      sub:'prêts à intervenir',     color:'#00b894', icon:Zap     },
            { label:'Masse salariale',   value:formatFCFA(masseSalariale),    sub:'salariés / mois',        color:'#0984e3', icon:Banknote},
            { label:'Top prestataire',   value:topPrestataire.nb_prestations, sub:topPrestataire.nom.split(' ')[0], color:'#e17055', icon:Star },
          ].map(({ label, value, sub, color, icon:Icon }, i) => (
            <motion.div key={label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="bg-white rounded-2xl px-4 py-3.5 relative overflow-hidden"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background:color }} />
              <div className="flex items-start justify-between mb-2">
                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background:`${color}12` }}>
                  <Icon size={13} style={{ color }} />
                </div>
              </div>
              <div className="text-gray-800 font-bold text-xl leading-tight">{value}</div>
              <div className="text-xs mt-0.5 font-medium" style={{ color }}>{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Split view ── */}
        <div className="flex gap-4 flex-1 overflow-hidden">

          {/* ─ Liste gauche — blanc ─ */}
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
              {filtered.map(t => {
                const isActive = t.id === selectedId
                return (
                  <motion.div key={t.id} onClick={() => setSelectedId(t.id)}
                    whileHover={{ x: isActive ? 0 : 2 }}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                    style={{ background:isActive ? `${t.color}08` : 'transparent', borderLeft:`3px solid ${isActive ? t.color : 'transparent'}` }}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 relative"
                      style={{ background: t.statut==='Disponible' ? `linear-gradient(135deg,${t.color},${t.color}cc)` : 'linear-gradient(135deg,#d1d5db,#9ca3af)' }}>
                      {initiales(t.nom)}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ background: t.statut==='Disponible' ? '#00b894' : '#9ca3af' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{t.nom}</div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">{t.role}</div>
                      {/* Mini barre prestations */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${(t.nb_prestations/maxPrestations)*100}%`, background:t.color, opacity:0.5 }} />
                        </div>
                        <span className="text-[9px] text-gray-400 shrink-0">{t.nb_prestations}</span>
                      </div>
                    </div>
                    {isActive && <ChevronRight size={12} style={{ color:t.color }} className="shrink-0" />}
                  </motion.div>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Wrench size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun résultat</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
              <span className="text-[11px] text-gray-400">{filtered.length} technicien{filtered.length!==1?'s':''}</span>
            </div>
          </div>

          {/* ─ Panneau détail ─ */}
          <AnimatePresence mode="wait">
            <motion.div key={selected.id}
              initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}
              transition={{ duration:0.2 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide"
            >
              {/* En-tête — même structure que Clients */}
              <div className="bg-white rounded-2xl overflow-hidden shrink-0"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                {/* Bandeau coloré subtil */}
                <div className="h-16 relative"
                  style={{ background:`linear-gradient(135deg,${selected.color}20,${selected.color}06)`, borderBottom:`1px solid ${selected.color}18` }}>
                  <div className="absolute bottom-0 left-6 translate-y-1/2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold"
                      style={{ background: selected.statut==='Disponible' ? `linear-gradient(135deg,${selected.color},${selected.color}cc)` : 'linear-gradient(135deg,#9ca3af,#d1d5db)', boxShadow:`0 4px 12px ${selected.color}40` }}>
                      {initiales(selected.nom)}
                    </div>
                  </div>
                  <div className="absolute top-3 right-4 flex gap-2">
                    <motion.button whileHover={{ scale:1.05 }} onClick={() => openEdit(selected)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 shadow-sm">
                      <Pencil size={12} /> Modifier
                    </motion.button>
                    <motion.button whileHover={{ scale:1.05 }} onClick={handleToggle}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={selected.statut==='Disponible'
                        ? { background:'#fef3c7', color:'#92400e' }
                        : { background:'#d1fae5', color:'#065f46' }}>
                      {selected.statut==='Disponible' ? <><XCircle size={12}/> Désactiver</> : <><CheckCircle2 size={12}/> Activer</>}
                    </motion.button>
                    <motion.button whileHover={{ scale:1.05 }} onClick={handleDelete}
                      className="w-7 h-7 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>

                <div className="pt-9 px-6 pb-5">
                  <h2 className="text-lg font-bold text-gray-900">{selected.nom}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background:`${selected.color}12`, color:selected.color }}>{selected.role}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={selected.statut==='Disponible' ? { background:'#d1fae5', color:'#065f46' } : { background:'#f3f4f6', color:'#6b7280' }}>
                      {selected.statut}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={selected.statut_emploi==='Salarié' ? { background:'#f5f3ff', color:'#5b21b6' } : { background:'#fef3c7', color:'#92400e' }}>
                      {selected.statut_emploi}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Phone size={13} className="text-gray-500" /></div>
                      <span className="font-mono text-sm">{selected.telephone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Mail size={13} className="text-gray-500" /></div>
                      <span className="text-xs text-gray-600 truncate">{selected.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Wrench size={13} className="text-gray-500" /></div>
                      <span className="text-xs text-gray-600">{selected.specialite}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs — blanc */}
              <div className="grid grid-cols-3 gap-4 shrink-0">
                {[
                  { label:'Salaire / mois',  value:formatFCFA(selected.salaire_base),  color:'#00b894', icon:Banknote, sub:'base mensuelle' },
                  { label:'Prestations',      value:selected.nb_prestations,            color:'#0984e3', icon:Calendar, sub:'effectuées',    progress:true },
                  { label:'Statut emploi',    value:selected.statut_emploi,             color:selected.statut_emploi==='Salarié'?'#6c5ce7':'#f39c12', icon:UserCog, sub:selected.statut_emploi==='Salarié'?'contrat fixe':'mission ponctuelle' },
                ].map(({ label, value, color:c, icon:Icon, sub, progress }) => (
                  <div key={label} className="bg-white rounded-2xl p-4"
                    style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${c}12`, border:`1px solid ${c}20` }}>
                        <Icon size={14} style={{ color:c }} />
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{label}</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800">{value}</div>
                    <div className="text-xs mt-0.5 font-medium" style={{ color:c }}>{sub}</div>
                    {progress && (
                      <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <motion.div initial={{ width:0 }} animate={{ width:`${(selected.nb_prestations/maxPrestations)*100}%` }}
                          transition={{ duration:0.6, ease:'easeOut' }}
                          className="h-full rounded-full" style={{ background:c }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Compétences */}
              <div className="bg-white rounded-2xl p-5 shrink-0"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Compétences</div>
                <div className="flex flex-wrap gap-2">
                  {selected.competences.map(c => (
                    <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background:`${selected.color}10`, color:selected.color, border:`1px solid ${selected.color}20` }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background:selected.color }} />
                      {c}
                    </span>
                  ))}
                  {selected.competences.length === 0 && <span className="text-xs text-gray-400 italic">Aucune compétence renseignée</span>}
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="bg-white rounded-2xl p-5 shrink-0"
                  style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</div>
                  <p className="text-sm text-gray-600 italic leading-relaxed">"{selected.notes}"</p>
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
            <motion.div initial={{ scale:0.95, opacity:0, y:8 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800">{editing ? 'Modifier le technicien' : 'Nouveau technicien'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Nom complet *</label>
                  <input value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: KOFI Mensah"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Téléphone</label>
                  <input value={form.telephone} onChange={e => setForm(f=>({...f,telephone:e.target.value}))} placeholder="9X XXX XXX"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Email</label>
                  <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="email@exemple.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Rôle</label>
                  <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                    {ROLES.map(r => <option key={r} value={r}>{r || '— Choisir —'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Statut emploi</label>
                  <select value={form.statut_emploi} onChange={e => setForm(f=>({...f,statut_emploi:e.target.value as any}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                    <option value="Temporaire">Temporaire</option>
                    <option value="Salarié">Salarié</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Spécialité</label>
                  <input value={form.specialite} onChange={e => setForm(f=>({...f,specialite:e.target.value}))} placeholder="Ex: Sonorisation Live, Studio & Mixage..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Salaire de base (FCFA)</label>
                  <input type="number" value={form.salaire_base} onChange={e => setForm(f=>({...f,salaire_base:e.target.value}))} placeholder="Ex: 75000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                <div>
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
