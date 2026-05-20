'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Save, CheckCircle2, Eye, EyeOff, Shield, Calendar } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store/auth'

export default function ProfilPage() {
  const { user } = useAuthStore()

  const [formInfo, setFormInfo] = useState({
    nom_complet: user?.nom_complet || user?.username || 'Admin',
    email: 'contact@ksproduction.tg',
  })
  const [formPwd, setFormPwd] = useState({ ancien:'', nouveau:'', confirmer:'' })
  const [showPwd, setShowPwd]  = useState(false)
  const [savedInfo, setSavedInfo] = useState(false)
  const [savedPwd, setSavedPwd]   = useState(false)

  const initiales = (nom: string) => nom.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  const nom = formInfo.nom_complet || 'Admin'

  const handleSaveInfo = () => { setSavedInfo(true); setTimeout(()=>setSavedInfo(false), 2500) }
  const handleSavePwd  = () => {
    if (!formPwd.nouveau || formPwd.nouveau !== formPwd.confirmer) return
    setSavedPwd(true)
    setFormPwd({ ancien:'', nouveau:'', confirmer:'' })
    setTimeout(()=>setSavedPwd(false), 2500)
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'#f0f2f8' }}>
      <Topbar title="Mon Profil" subtitle="Informations personnelles et sécurité" />

      <div className="p-6 space-y-5 max-w-2xl">

        {/* ── Carte identité ── */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="h-20" style={{ background:'linear-gradient(135deg,#e9456020,#6c5ce710)' }} />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-8 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ background:'linear-gradient(135deg,#e94560,#6c5ce7)', boxShadow:'0 4px 12px rgba(233,69,96,0.4)', border:'3px solid #fff' }}>
                {initiales(nom)}
              </div>
              <div className="mb-1">
                <div className="font-bold text-gray-900 text-lg">{nom}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-gray-400">@{user?.username || 'admin'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background:'#fef0f3', color:'#e94560' }}>
                    {user?.role || 'Administrateur'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label:'Rôle',              value:user?.role || 'Administrateur', icon:Shield,   color:'#e94560' },
                { label:'Identifiant',        value:user?.username || 'admin',      icon:User,     color:'#0984e3' },
                { label:'Membre depuis',      value:'Janvier 2026',                 icon:Calendar, color:'#00b894' },
              ].map(({ label, value, icon:Icon, color }) => (
                <div key={label} className="rounded-xl p-3" style={{ background:`${color}08`, border:`1px solid ${color}18` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={11} style={{ color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:`${color}99` }}>{label}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-700">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Informations personnelles ── */}
        <div className="bg-white rounded-2xl p-5"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'#0984e312' }}>
                <User size={14} style={{ color:'#0984e3' }} />
              </div>
              <span className="text-sm font-bold text-gray-700">Informations personnelles</span>
            </div>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={handleSaveInfo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
              style={{ background: savedInfo ? 'linear-gradient(135deg,#00b894,#00cec9)' : 'linear-gradient(135deg,#0984e3,#6c5ce7)' }}>
              {savedInfo ? <><CheckCircle2 size={11} /> Enregistré</> : <><Save size={11} /> Enregistrer</>}
            </motion.button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Nom complet</label>
              <input value={formInfo.nom_complet} onChange={e => setFormInfo(f=>({...f,nom_complet:e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0984e3] transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Email</label>
              <input value={formInfo.email} onChange={e => setFormInfo(f=>({...f,email:e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0984e3] transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Identifiant (non modifiable)</label>
              <input value={user?.username || 'admin'} disabled
                className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* ── Changer mot de passe ── */}
        <div className="bg-white rounded-2xl p-5"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'#e9456012' }}>
                <Lock size={14} style={{ color:'#e94560' }} />
              </div>
              <span className="text-sm font-bold text-gray-700">Changer le mot de passe</span>
            </div>
            <button onClick={() => setShowPwd(p=>!p)} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors">
              {showPwd ? <><EyeOff size={12} /> Masquer</> : <><Eye size={12} /> Afficher</>}
            </button>
          </div>
          <div className="space-y-3">
            {[
              { key:'ancien',    label:'Mot de passe actuel' },
              { key:'nouveau',   label:'Nouveau mot de passe' },
              { key:'confirmer', label:'Confirmer le nouveau' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">{field.label}</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPwd ? 'text' : 'password'}
                    value={(formPwd as any)[field.key]}
                    onChange={e => setFormPwd(f=>({...f,[field.key]:e.target.value}))}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
                </div>
              </div>
            ))}
            {formPwd.nouveau && formPwd.confirmer && formPwd.nouveau !== formPwd.confirmer && (
              <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
            )}
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleSavePwd}
              disabled={!formPwd.nouveau || formPwd.nouveau !== formPwd.confirmer}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-1 transition-all"
              style={{ background: savedPwd ? 'linear-gradient(135deg,#00b894,#00cec9)' : formPwd.nouveau && formPwd.nouveau === formPwd.confirmer ? 'linear-gradient(135deg,#e94560,#6c5ce7)' : '#d1d5db', cursor: formPwd.nouveau && formPwd.nouveau === formPwd.confirmer ? 'pointer' : 'not-allowed' }}>
              {savedPwd ? 'Mot de passe mis à jour ✓' : 'Mettre à jour le mot de passe'}
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  )
}
