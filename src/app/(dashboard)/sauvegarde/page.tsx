'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HardDrive, Download, Upload, CheckCircle2, Clock,
  Database, FileSpreadsheet, FileText, RefreshCw,
  Receipt, Users, ArrowLeftRight, Calendar, Wrench, Package, AlertCircle
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatDate } from '@/lib/utils'

const DB_STATS = [
  { label:'Factures',     value:42,  icon:Receipt,          color:'#0984e3' },
  { label:'Clients',      value:12,  icon:Users,            color:'#00b894' },
  { label:'Opérations',   value:86,  icon:ArrowLeftRight,   color:'#6c5ce7' },
  { label:'Prestations',  value:24,  icon:Calendar,         color:'#e17055' },
  { label:'Techniciens',  value:8,   icon:Wrench,           color:'#f59e0b' },
  { label:'Matériels',    value:14,  icon:Package,          color:'#e94560' },
]

const EXPORTS = [
  { label:'Factures & Paiements', icon:FileSpreadsheet, color:'#0984e3', desc:'Toutes les factures, paiements et reçus — format Excel' },
  { label:'Opérations',           icon:FileSpreadsheet, color:'#6c5ce7', desc:'Journal complet des recettes et dépenses — format Excel' },
  { label:'Clients',              icon:FileSpreadsheet, color:'#00b894', desc:'Carnet clients avec historique factures — format Excel' },
  { label:'Rapport mensuel PDF',  icon:FileText,        color:'#e94560', desc:'Bilan financier du mois en cours — format PDF' },
  { label:'Base de données JSON', icon:Database,        color:'#f59e0b', desc:'Export complet de toutes les tables — format JSON' },
]

const HISTORIQUE = [
  { id:1, date:'2026-05-19', heure:'22:28', taille:'2.4 MB', ok:true },
  { id:2, date:'2026-05-18', heure:'20:15', taille:'2.3 MB', ok:true },
  { id:3, date:'2026-05-17', heure:'21:00', taille:'2.2 MB', ok:true },
  { id:4, date:'2026-05-15', heure:'18:30', taille:'2.1 MB', ok:true },
  { id:5, date:'2026-05-10', heure:'23:00', taille:'1.9 MB', ok:true },
]

export default function SauvegardePage() {
  const [loadingExport, setLoadingExport] = useState<string | null>(null)
  const [loadingBackup, setLoadingBackup] = useState(false)
  const [dragOver, setDragOver]           = useState(false)
  const [imported, setImported]           = useState<string | null>(null)

  const handleExport = (label: string) => {
    setLoadingExport(label)
    setTimeout(() => setLoadingExport(null), 1800)
  }

  const handleBackup = () => {
    setLoadingBackup(true)
    setTimeout(() => setLoadingBackup(false), 2200)
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'#f0f2f8' }}>
      <Topbar title="Sauvegarde" subtitle="Export, import et historique des sauvegardes" />

      <div className="p-6 space-y-5">

        {/* ── Stats base de données ── */}
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Database size={12} /> État actuel de la base de données
          </div>
          <div className="grid grid-cols-6 gap-3">
            {DB_STATS.map(({ label, value, icon:Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 text-center relative overflow-hidden"
                style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:color }} />
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background:`${color}12` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div className="text-xl font-bold text-gray-800">{value}</div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">

          {/* ── Colonne gauche ── */}
          <div className="space-y-5">

            {/* Sauvegarde complète */}
            <div className="bg-white rounded-2xl p-5"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'#0984e312' }}>
                  <HardDrive size={15} style={{ color:'#0984e3' }} />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-700">Sauvegarde complète</span>
                  <div className="text-xs text-gray-400 mt-0.5">Dernière : 19/05/2026 à 22:28 — 2.4 MB</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Génère une archive complète de toutes les données : factures, clients, opérations, agenda, techniciens, matériels, paramètres.
              </p>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleBackup}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm transition-all"
                style={{ background:'linear-gradient(135deg,#0984e3,#6c5ce7)', boxShadow:'0 4px 12px rgba(9,132,227,0.3)' }}>
                {loadingBackup
                  ? <><RefreshCw size={15} className="animate-spin" /> Sauvegarde en cours...</>
                  : <><HardDrive size={15} /> Lancer la sauvegarde</>
                }
              </motion.button>
            </div>

            {/* Exports */}
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <Download size={14} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-700">Exports de données</span>
              </div>
              <div className="divide-y divide-gray-50">
                {EXPORTS.map(exp => {
                  const Icon = exp.icon
                  const isLoading = loadingExport === exp.label
                  return (
                    <div key={exp.label} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-all">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background:`${exp.color}12`, border:`1px solid ${exp.color}20` }}>
                        <Icon size={15} style={{ color:exp.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-700">{exp.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate">{exp.desc}</div>
                      </div>
                      <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                        onClick={() => handleExport(exp.label)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0"
                        style={{ background:`${exp.color}10`, color:exp.color, border:`1px solid ${exp.color}20` }}>
                        {isLoading
                          ? <><RefreshCw size={10} className="animate-spin" /> Export...</>
                          : <><Download size={10} /> Télécharger</>
                        }
                      </motion.button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Colonne droite ── */}
          <div className="space-y-5">

            {/* Import / Restauration */}
            <div className="bg-white rounded-2xl p-5"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'#00b89412' }}>
                  <Upload size={15} style={{ color:'#00b894' }} />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-700">Import / Restauration</span>
                  <div className="text-xs text-gray-400 mt-0.5">Restaurer depuis un fichier de sauvegarde</div>
                </div>
              </div>

              {/* Zone de dépôt */}
              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setImported(f.name) }}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all"
                style={{ borderColor: dragOver ? '#00b894' : imported ? '#00b894' : '#e5e7eb', background: dragOver ? '#f0fdf4' : imported ? '#f0fdf4' : '#fafafa' }}>
                {imported ? (
                  <>
                    <CheckCircle2 size={32} className="text-green-500" />
                    <div className="text-sm font-semibold text-green-700">{imported}</div>
                    <div className="text-xs text-green-600">Fichier prêt à restaurer</div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:'#00b89415' }}>
                      <Upload size={22} style={{ color:'#00b894' }} />
                    </div>
                    <div className="text-sm font-semibold text-gray-500">Glisser-déposer ou cliquer</div>
                    <div className="text-xs text-gray-400">Fichier JSON de sauvegarde KS Production</div>
                  </>
                )}
                <input type="file" className="hidden" accept=".json,.zip"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setImported(f.name) }} />
              </label>

              {imported && (
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background:'linear-gradient(135deg,#00b894,#00cec9)' }}>
                  <Upload size={14} /> Restaurer maintenant
                </motion.button>
              )}

              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl" style={{ background:'#fef3c7', border:'1px solid #fde68a' }}>
                <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">La restauration remplacera toutes les données existantes. Effectuez une sauvegarde avant de procéder.</p>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-700">Historique des sauvegardes</span>
              </div>
              <div className="divide-y divide-gray-50">
                {HISTORIQUE.map((h, i) => (
                  <div key={h.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-all group">
                    <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-700">Sauvegarde complète</div>
                      <div className="text-xs text-gray-400">{formatDate(h.date)} à {h.heure} — {h.taille}</div>
                    </div>
                    {i === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background:'#d1fae5', color:'#065f46' }}>Dernière</span>
                    )}
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 shrink-0">
                      <Download size={10} /> Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
