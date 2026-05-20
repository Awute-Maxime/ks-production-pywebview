'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw, AlertTriangle, X, ShieldAlert,
  Receipt, Users, ArrowLeftRight, Calendar,
  Wrench, Package, Settings, CheckCircle2
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'

interface Zone {
  id: string; label: string; desc: string
  icon: React.ElementType; color: string; count: number
  danger: 'medium' | 'high' | 'critical'
}

const ZONES: Zone[] = [
  { id:'factures',   label:'Factures & Paiements', desc:'Supprime toutes les factures, proformas, paiements et reçus.',         icon:Receipt,         color:'#0984e3', count:42,  danger:'high'     },
  { id:'operations', label:'Opérations',            desc:'Efface le journal complet des recettes et dépenses.',                  icon:ArrowLeftRight,  color:'#6c5ce7', count:86,  danger:'high'     },
  { id:'clients',    label:'Clients',               desc:'Supprime toute la base clients et leur historique.',                   icon:Users,           color:'#00b894', count:12,  danger:'high'     },
  { id:'agenda',     label:'Agenda & Prestations',  desc:'Réinitialise le calendrier et l\'historique des prestations.',        icon:Calendar,        color:'#e17055', count:24,  danger:'medium'   },
  { id:'techniciens',label:'Techniciens',           desc:'Supprime les fiches techniciens et leurs assignations.',              icon:Wrench,          color:'#f59e0b', count:8,   danger:'medium'   },
  { id:'materiels',  label:'Matériels & Fournisseurs', desc:'Efface l\'inventaire du parc matériel et la liste fournisseurs.', icon:Package,         color:'#00cec9', count:21,  danger:'medium'   },
]

const CONSERVE = [
  'Paramètres de l\'entreprise (nom, logo, couleur)',
  'Comptes utilisateurs et mots de passe',
  'Catalogue des services & tarifs',
  'Configuration de la sauvegarde',
]

const CONFIRM_WORD = 'CONFIRMER'

export default function ReinitialiserPage() {
  const [checked, setChecked]     = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [inputVal, setInputVal]   = useState('')
  const [done, setDone]           = useState<Set<string>>(new Set())

  const toggleZone = (id: string) => {
    if (done.has(id)) return
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleReset = () => {
    if (inputVal !== CONFIRM_WORD) return
    const newDone = new Set([...done, ...checked])
    setDone(newDone)
    setChecked(new Set())
    setShowModal(false)
    setInputVal('')
  }

  const totalRecords = [...checked].reduce((s, id) => {
    const z = ZONES.find(z => z.id === id)
    return s + (z?.count || 0)
  }, 0)

  const hasCritical = [...checked].some(id => ZONES.find(z => z.id === id)?.danger === 'high')

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'#f0f2f8' }}>
      <Topbar title="Réinitialiser" subtitle="Zone de réinitialisation — Administrateur uniquement" />

      <div className="p-6 space-y-5 max-w-3xl">

        {/* ── Avertissement ── */}
        <div className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background:'linear-gradient(135deg,#fef2f2,#fff5f5)', border:'1.5px solid #fecaca' }}>
          <ShieldAlert size={28} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-700">Zone dangereuse — Actions irréversibles</div>
            <div className="text-sm text-red-600 mt-1 leading-relaxed">
              Sélectionnez les données à supprimer puis cliquez sur Réinitialiser. Chaque suppression est <strong>définitive</strong>. Assurez-vous d'avoir effectué une <strong>sauvegarde complète</strong> au préalable.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* ── Colonne gauche — sélection ── */}
          <div className="col-span-2 space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sélectionner les données à réinitialiser</div>
            {ZONES.map(zone => {
              const isChecked = checked.has(zone.id)
              const isDone    = done.has(zone.id)
              const Icon      = zone.icon
              return (
                <motion.div key={zone.id}
                  onClick={() => !isDone && toggleZone(zone.id)}
                  whileHover={{ x: isDone ? 0 : 2 }}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: isDone ? '#f0fdf4' : isChecked ? '#fef2f2' : '#fff',
                    border: isDone ? '1.5px solid #bbf7d0' : isChecked ? '1.5px solid #fca5a5' : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    opacity: isDone ? 0.7 : 1,
                    cursor: isDone ? 'default' : 'pointer',
                  }}>
                  {/* Checkbox */}
                  <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                    style={isDone
                      ? { background:'#00b894', borderColor:'#00b894' }
                      : isChecked
                      ? { background:'#dc2626', borderColor:'#dc2626' }
                      : { borderColor:'#d1d5db' }
                    }>
                    {(isChecked || isDone) && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  {/* Icône */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:`${zone.color}12`, border:`1px solid ${zone.color}20` }}>
                    <Icon size={17} style={{ color:zone.color }} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-sm">{zone.label}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={zone.danger === 'high' ? { background:'#fee2e2', color:'#dc2626' } : { background:'#fef3c7', color:'#92400e' }}>
                        {zone.danger === 'high' ? 'Critique' : 'Modéré'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{zone.desc}</div>
                  </div>
                  {/* Count */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold" style={{ color: isDone ? '#00b894' : zone.color }}>{zone.count}</div>
                    <div className="text-[10px] text-gray-400">enreg.</div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ── Colonne droite ── */}
          <div className="space-y-4">
            {/* Récapitulatif sélection */}
            <div className="bg-white rounded-2xl p-4"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Récapitulatif</div>
              {checked.size === 0 ? (
                <div className="text-xs text-gray-400 italic text-center py-4">Aucune donnée sélectionnée</div>
              ) : (
                <>
                  <div className="space-y-1.5 mb-3">
                    {[...checked].map(id => {
                      const z = ZONES.find(z => z.id === id)!
                      return (
                        <div key={id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{z.label}</span>
                          <span className="font-bold text-red-500">{z.count} enreg.</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-bold">
                    <span className="text-gray-700">Total</span>
                    <span className="text-red-600">{totalRecords} enreg.</span>
                  </div>
                </>
              )}
            </div>

            {/* Ce qui sera conservé */}
            <div className="bg-white rounded-2xl p-4"
              style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Settings size={11} /> Ce qui sera conservé
              </div>
              <div className="space-y-2">
                {CONSERVE.map(item => (
                  <div key={item} className="flex items-start gap-2 text-xs text-gray-500">
                    <CheckCircle2 size={11} className="text-green-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton réinitialiser */}
            <motion.button
              whileHover={{ scale: checked.size > 0 ? 1.02 : 1 }}
              whileTap={{ scale: checked.size > 0 ? 0.98 : 1 }}
              disabled={checked.size === 0}
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
              style={{
                background: checked.size > 0
                  ? hasCritical ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#f59e0b,#e17055)'
                  : '#e5e7eb',
                color: checked.size > 0 ? '#fff' : '#9ca3af',
                cursor: checked.size > 0 ? 'pointer' : 'not-allowed',
                boxShadow: checked.size > 0 ? '0 4px 12px rgba(220,38,38,0.3)' : 'none',
              }}>
              <RotateCcw size={15} />
              Réinitialiser {checked.size > 0 ? `(${checked.size})` : ''}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Modal confirmation ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)' }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:'#fee2e2' }}>
                  <AlertTriangle size={22} className="text-red-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Confirmer la réinitialisation</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Vous allez supprimer <strong className="text-red-600">{totalRecords} enregistrements</strong> définitivement. Cette action est irréversible.
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0"><X size={16} /></button>
              </div>

              {/* Récap */}
              <div className="rounded-xl p-3 mb-4 space-y-1" style={{ background:'#fef2f2', border:'1px solid #fecaca' }}>
                {[...checked].map(id => {
                  const z = ZONES.find(z => z.id === id)!
                  return (
                    <div key={id} className="flex items-center justify-between text-xs">
                      <span className="text-red-700 font-medium">{z.label}</span>
                      <span className="text-red-600 font-bold">{z.count} enreg.</span>
                    </div>
                  )
                })}
              </div>

              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Tapez <span className="text-red-600 font-mono">{CONFIRM_WORD}</span> pour confirmer
              </label>
              <input value={inputVal} onChange={e => setInputVal(e.target.value)}
                placeholder={CONFIRM_WORD}
                className="w-full border-2 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none transition-all mb-4"
                style={{ borderColor: inputVal === CONFIRM_WORD ? '#dc2626' : '#e5e7eb' }}
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowModal(false); setInputVal('') }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <motion.button whileHover={{ scale: inputVal === CONFIRM_WORD ? 1.02 : 1 }}
                  onClick={handleReset}
                  disabled={inputVal !== CONFIRM_WORD}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{
                    background: inputVal === CONFIRM_WORD ? 'linear-gradient(135deg,#dc2626,#ef4444)' : '#d1d5db',
                    cursor: inputVal === CONFIRM_WORD ? 'pointer' : 'not-allowed'
                  }}>
                  Confirmer & Réinitialiser
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
