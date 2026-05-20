'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCog, Plus, X, Pencil, Trash2,
  CheckCircle2, XCircle, Shield, User, Lock, Eye, EyeOff
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatDate } from '@/lib/utils'

type Role   = 'Administrateur' | 'Caissier' | 'Technicien' | 'Lecture seule'
type Statut = 'Actif' | 'Inactif'

interface Utilisateur {
  id: number; username: string; nom_complet: string
  role: Role; statut: Statut; derniere_connexion: string
}

const ROLE_CONFIG: Record<Role, { color: string; bg: string }> = {
  'Administrateur': { color:'#e94560', bg:'#fef0f3' },
  'Caissier':       { color:'#0984e3', bg:'#eff6ff' },
  'Technicien':     { color:'#00b894', bg:'#f0fdf4' },
  'Lecture seule':  { color:'#9ca3af', bg:'#f3f4f6' },
}

const DEMO: Utilisateur[] = [
  { id:1, username:'admin',    nom_complet:'AWUTE Maxime',    role:'Administrateur', statut:'Actif',   derniere_connexion:'2026-05-20' },
  { id:2, username:'caissier', nom_complet:'KOFFI Anoumou',  role:'Caissier',       statut:'Actif',   derniere_connexion:'2026-05-19' },
  { id:3, username:'tech1',    nom_complet:'ATSUTSUI Kodjo', role:'Technicien',     statut:'Actif',   derniere_connexion:'2026-05-18' },
  { id:4, username:'lecteur',  nom_complet:'Invité Lecture',  role:'Lecture seule',  statut:'Inactif', derniere_connexion:'2026-04-10' },
]

const ROLES: Role[] = ['Administrateur', 'Caissier', 'Technicien', 'Lecture seule']
const EMPTY_FORM = { username:'', nom_complet:'', role:'Caissier' as Role, password:'', confirm_password:'' }
const initiales = (nom: string) => nom.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>(DEMO)
  const [showModal, setShowModal]       = useState(false)
  const [editing, setEditing]           = useState<Utilisateur | null>(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [showPwd, setShowPwd]           = useState(false)

  const openNew  = () => { setEditing(null); setForm(EMPTY_FORM); setShowPwd(false); setShowModal(true) }
  const openEdit = (u: Utilisateur) => { setEditing(u); setForm({ username:u.username, nom_complet:u.nom_complet, role:u.role, password:'', confirm_password:'' }); setShowPwd(false); setShowModal(true) }

  const handleSave = () => {
    if (!form.username.trim() || !form.nom_complet.trim()) return
    if (!editing && (!form.password || form.password !== form.confirm_password)) return
    if (editing) {
      setUtilisateurs(us => us.map(u => u.id === editing.id ? { ...u, nom_complet:form.nom_complet, role:form.role } : u))
    } else {
      setUtilisateurs(us => [...us, { id:Date.now(), username:form.username, nom_complet:form.nom_complet, role:form.role, statut:'Actif', derniere_connexion:'—' }])
    }
    setShowModal(false)
  }

  const handleToggle = (id: number) => {
    setUtilisateurs(us => us.map(u => u.id === id && u.username !== 'admin' ? { ...u, statut: u.statut === 'Actif' ? 'Inactif' : 'Actif' } : u))
  }

  const handleDelete = (id: number) => {
    setUtilisateurs(us => us.filter(u => u.id !== id || u.username === 'admin'))
  }

  const nbActifs = utilisateurs.filter(u => u.statut === 'Actif').length

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'#f0f2f8' }}>
      <Topbar
        title="Utilisateurs"
        subtitle={`${utilisateurs.length} comptes · ${nbActifs} actifs`}
        actions={
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)', boxShadow:'0 4px 12px rgba(233,69,96,0.3)' }}>
            <Plus size={15} /> Nouveau compte
          </motion.button>
        }
      />

      <div className="p-6 space-y-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {ROLES.map((role, i) => {
            const cfg   = ROLE_CONFIG[role]
            const count = utilisateurs.filter(u => u.role === role).length
            return (
              <motion.div key={role} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                className="bg-white rounded-2xl px-4 py-3.5 relative"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background:cfg.color }} />
                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{role}</div>
                <div className="text-gray-800 font-bold text-2xl">{count}</div>
                <div className="text-xs mt-0.5 font-medium" style={{ color:cfg.color }}>compte{count!==1?'s':''}</div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Liste utilisateurs ── */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <UserCog size={15} className="text-gray-400" />
            <span className="font-bold text-gray-700">Gestion des accès</span>
          </div>
          <div className="divide-y divide-gray-50">
            {utilisateurs.map(u => {
              const cfg = ROLE_CONFIG[u.role]
              return (
                <motion.div key={u.id} initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-all group">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: u.statut === 'Actif' ? `linear-gradient(135deg,${cfg.color},${cfg.color}cc)` : 'linear-gradient(135deg,#d1d5db,#9ca3af)' }}>
                    {initiales(u.nom_complet)}
                  </div>
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{u.nom_complet}</span>
                      {u.username === 'admin' && (
                        <Shield size={12} className="text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">@{u.username}</div>
                  </div>
                  {/* Rôle */}
                  <span className="text-xs font-bold px-3 py-1 rounded-full shrink-0"
                    style={{ background:cfg.bg, color:cfg.color }}>{u.role}</span>
                  {/* Dernière connexion */}
                  <div className="text-right shrink-0 hidden md:block">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Dernière connexion</div>
                    <div className="text-xs font-semibold text-gray-600 mt-0.5">{u.derniere_connexion !== '—' ? formatDate(u.derniere_connexion) : '—'}</div>
                  </div>
                  {/* Statut */}
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                    style={u.statut === 'Actif' ? { background:'#d1fae5', color:'#065f46' } : { background:'#f3f4f6', color:'#6b7280' }}>
                    {u.statut === 'Actif' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {u.statut}
                  </span>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(u)}
                      className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all">
                      <Pencil size={13} />
                    </button>
                    {u.username !== 'admin' && (
                      <>
                        <button onClick={() => handleToggle(u.id)}
                          className="p-2 rounded-xl transition-all"
                          style={u.statut === 'Actif' ? { background:'#fef3c7', color:'#92400e' } : { background:'#d1fae5', color:'#065f46' }}>
                          {u.statut === 'Actif' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        </button>
                        <button onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-xl bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
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
                <h2 className="font-bold text-gray-800">{editing ? 'Modifier le compte' : 'Nouveau compte'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Nom complet *</label>
                  <input value={form.nom_complet} onChange={e => setForm(f=>({...f,nom_complet:e.target.value}))} placeholder="Ex: KOFFI Anoumou"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
                {!editing && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Identifiant *</label>
                    <input value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value.toLowerCase()}))} placeholder="Ex: caissier2"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#e94560] transition-all" />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Rôle</label>
                  <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value as Role}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    {editing ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}
                  </label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                    <button onClick={() => setShowPwd(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                {!editing && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Confirmer le mot de passe *</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPwd ? 'text' : 'password'} value={form.confirm_password} onChange={e => setForm(f=>({...f,confirm_password:e.target.value}))}
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                    </div>
                    {form.password && form.confirm_password && form.password !== form.confirm_password && (
                      <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">Annuler</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)' }}>
                  {editing ? 'Enregistrer' : 'Créer le compte'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
