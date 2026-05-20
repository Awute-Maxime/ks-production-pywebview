'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Building2, Phone, Mail, Globe, Hash,
  FileText, Palette, Save, CheckCircle2, Upload,
  Image, Stamp, Eye, X
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'

type Tab = 'entreprise' | 'contact' | 'documents' | 'visuel'

interface Params {
  nom_entreprise: string; slogan: string; adresse: string
  telephone: string; email: string; site_web: string
  nif: string; rccm: string; mentions_legales: string
  coordonnees_bancaires: string; couleur_principale: string
}

const DEFAULT: Params = {
  nom_entreprise:        'KS Production',
  slogan:                "Studio d'Enregistrement & Sonorisation",
  adresse:               'Lomé, Togo — BP 1234',
  telephone:             '90 11 22 33',
  email:                 'contact@ksproduction.tg',
  site_web:              'www.ksproduction.tg',
  nif:                   'TG-2020-KSP',
  rccm:                  'RC-LME-2020-KS',
  mentions_legales:      'KS Production SARL — Capital social 5 000 000 FCFA',
  coordonnees_bancaires: 'ORABANK TOGO — IBAN : TG53 1234 5678 9012 3456 789',
  couleur_principale:    '#e94560',
}

const SWATCHES = ['#e94560','#0984e3','#6c5ce7','#00b894','#f59e0b','#e17055','#00cec9','#2d3436']

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key:'entreprise', label:'Entreprise',   icon: Building2, color:'#0984e3' },
  { key:'contact',    label:'Contact',      icon: Phone,     color:'#00b894' },
  { key:'documents',  label:'Documents',    icon: FileText,  color:'#6c5ce7' },
  { key:'visuel',     label:'Aspect visuel',icon: Palette,   color:'#e94560' },
]

function Field({ label, value, onChange, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; textarea?: boolean
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all resize-none" />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e94560] transition-all" />
      )}
    </div>
  )
}

function UploadZone({ label, icon: Icon, color, hint }: { label: string; icon: React.ElementType; color: string; hint: string }) {
  const [file, setFile] = useState<string | null>(null)
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">{label}</label>
      {file ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-200 flex items-center justify-center">
            <img src={file} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-700 truncate">Fichier chargé</div>
            <div className="text-xs text-gray-400 mt-0.5">{hint}</div>
          </div>
          <button onClick={() => setFile(null)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-all">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${color}12` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div className="text-sm font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">Cliquer pour uploader</div>
          <div className="text-xs text-gray-400">{hint}</div>
          <input type="file" className="hidden" accept="image/*"
            onChange={e => { const f = e.target.files?.[0]; if (f) setFile(URL.createObjectURL(f)) }} />
        </label>
      )}
    </div>
  )
}

export default function ParametresPage() {
  const [params, setParams] = useState<Params>(DEFAULT)
  const [tab, setTab]       = useState<Tab>('entreprise')
  const [saved, setSaved]   = useState(false)
  const [preview, setPreview] = useState(false)

  const set = (key: keyof Params) => (v: string) => setParams(p => ({ ...p, [key]: v }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'#f0f2f8' }}>
      <Topbar
        title="Paramètres"
        subtitle="Configuration générale de l'application"
        actions={
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={() => setPreview(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200"
              style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <Eye size={13} /> Aperçu document
            </motion.button>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ background: saved ? 'linear-gradient(135deg,#00b894,#00cec9)' : 'linear-gradient(135deg,#e94560,#6c5ce7)', boxShadow:'0 4px 12px rgba(233,69,96,0.3)' }}>
              {saved ? <><CheckCircle2 size={14} /> Enregistré</> : <><Save size={14} /> Enregistrer</>}
            </motion.button>
          </div>
        }
      />

      <div className="p-6 space-y-5 max-w-3xl">

        {/* ── Onglets ── */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1"
          style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
          {TABS.map(t => {
            const Icon = t.icon
            const isActive = tab === t.key
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={isActive
                  ? { background:t.color, color:'#fff', boxShadow:`0 4px 12px ${t.color}40` }
                  : { color:'#9ca3af' }
                }>
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ── Contenu onglets ── */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>

            {/* Entreprise */}
            {tab === 'entreprise' && (
              <div className="bg-white rounded-2xl p-6 space-y-4"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'#0984e312' }}>
                    <Building2 size={14} style={{ color:'#0984e3' }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Informations de l'entreprise</span>
                </div>
                <Field label="Nom de l'entreprise *" value={params.nom_entreprise} onChange={set('nom_entreprise')} placeholder="KS Production" />
                <Field label="Slogan / Activité" value={params.slogan} onChange={set('slogan')} placeholder="Studio d'Enregistrement & Sonorisation" />
                <Field label="Adresse complète" value={params.adresse} onChange={set('adresse')} placeholder="Lomé, Togo — BP 1234" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="NIF" value={params.nif} onChange={set('nif')} placeholder="TG-2020-XXX" />
                  <Field label="RCCM" value={params.rccm} onChange={set('rccm')} placeholder="RC-LME-2020-XX" />
                </div>
              </div>
            )}

            {/* Contact */}
            {tab === 'contact' && (
              <div className="bg-white rounded-2xl p-6 space-y-4"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'#00b89412' }}>
                    <Phone size={14} style={{ color:'#00b894' }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Coordonnées de contact</span>
                </div>
                <Field label="Téléphone" value={params.telephone} onChange={set('telephone')} placeholder="90 11 22 33" />
                <Field label="Email" value={params.email} onChange={set('email')} placeholder="contact@ksproduction.tg" />
                <Field label="Site web" value={params.site_web} onChange={set('site_web')} placeholder="www.ksproduction.tg" />
              </div>
            )}

            {/* Documents */}
            {tab === 'documents' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 space-y-4"
                  style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'#6c5ce712' }}>
                      <Image size={14} style={{ color:'#6c5ce7' }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Identité visuelle</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <UploadZone label="Logo de l'entreprise" icon={Image} color="#6c5ce7" hint="PNG, JPG — max 2 MB · Utilisé sur les factures" />
                    <UploadZone label="Cachet / Tampon numérisé" icon={Stamp} color="#e94560" hint="PNG transparent · Apposé sur les reçus" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 space-y-4"
                  style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'#f59e0b12' }}>
                      <FileText size={14} style={{ color:'#f59e0b' }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Mentions légales & bancaires</span>
                  </div>
                  <Field label="Mentions légales" value={params.mentions_legales} onChange={set('mentions_legales')} placeholder="SARL — Capital social..." textarea />
                  <Field label="Coordonnées bancaires" value={params.coordonnees_bancaires} onChange={set('coordonnees_bancaires')} placeholder="Banque — IBAN : ..." textarea />
                </div>
              </div>
            )}

            {/* Visuel */}
            {tab === 'visuel' && (
              <div className="space-y-4">
                {/* Couleur */}
                <div className="bg-white rounded-2xl p-6"
                  style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'#e9456012' }}>
                      <Palette size={14} style={{ color:'#e94560' }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Couleur principale</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <input type="color" value={params.couleur_principale}
                      onChange={e => set('couleur_principale')(e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200 p-1" />
                    <div>
                      <div className="text-base font-bold text-gray-800 font-mono">{params.couleur_principale}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Accents, boutons, en-têtes de documents</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="h-9 px-4 rounded-xl text-white text-xs font-bold flex items-center" style={{ background:params.couleur_principale }}>Bouton</div>
                      <div className="h-9 w-9 rounded-xl border-2" style={{ background:`${params.couleur_principale}15`, borderColor:`${params.couleur_principale}40` }} />
                    </div>
                  </div>
                  {/* Swatches */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 mr-1">Couleurs prédéfinies :</span>
                    {SWATCHES.map(color => (
                      <button key={color} onClick={() => set('couleur_principale')(color)}
                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          background: color,
                          borderColor: params.couleur_principale === color ? '#1a1a2e' : 'transparent',
                          boxShadow: params.couleur_principale === color ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : 'none',
                          transform: params.couleur_principale === color ? 'scale(1.15)' : undefined
                        }} />
                    ))}
                  </div>
                </div>

                {/* Aperçu carte de visite */}
                <div className="bg-white rounded-2xl p-6"
                  style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Aperçu — En-tête de document</div>
                  <div className="rounded-2xl overflow-hidden" style={{ boxShadow:'0 4px 20px rgba(0,0,0,0.12)' }}>
                    {/* Header */}
                    <div className="p-5 flex items-center gap-4" style={{ background:params.couleur_principale }}>
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {params.nom_entreprise.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg leading-tight">{params.nom_entreprise}</div>
                        <div className="text-white/75 text-xs mt-0.5">{params.slogan}</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-white/80 text-xs">{params.telephone}</div>
                        <div className="text-white/80 text-xs mt-0.5">{params.email}</div>
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-4 bg-gray-50 grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Adresse</div>
                        <div className="text-gray-600">{params.adresse}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Identifiants</div>
                        <div className="text-gray-600">NIF : {params.nif}</div>
                        <div className="text-gray-600">RCCM : {params.rccm}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Banque</div>
                        <div className="text-gray-600 text-[10px] leading-relaxed">{params.coordonnees_bancaires}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Aperçu document modal ── */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)' }}
            onClick={() => setPreview(false)}>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="font-bold text-gray-800">Aperçu en-tête document</span>
                <button onClick={() => setPreview(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-5">
                <div className="rounded-xl overflow-hidden" style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.1)' }}>
                  <div className="p-5 flex items-center gap-4" style={{ background:params.couleur_principale }}>
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold shrink-0">
                      {params.nom_entreprise.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-bold">{params.nom_entreprise}</div>
                      <div className="text-white/75 text-xs">{params.slogan}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 text-xs text-gray-500 space-y-1">
                    <div>{params.adresse} · {params.telephone} · {params.email}</div>
                    <div>NIF : {params.nif} · RCCM : {params.rccm}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
