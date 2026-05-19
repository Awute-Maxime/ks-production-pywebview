'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Plus, ChevronLeft, ChevronRight,
  Clock, MapPin, Wrench, CheckCircle2,
  AlertCircle, XCircle, Eye, Pencil, Music2, Users
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'

interface Prestation {
  id: number; titre: string; date: string
  heure_debut?: string; heure_fin?: string
  nom_client?: string; service?: string
  section: 'Sonorisation' | 'Studio'
  lieu?: string; statut: 'Confirmé' | 'Tentative' | 'Annulé' | 'Terminée'
  nb_techs?: number
}

const DEMO: Prestation[] = [
  { id:1,  titre:'Mariage ATCHO Emmanuel',        date:'2026-05-19', heure_debut:'10:00', heure_fin:'20:00', nom_client:'ATCHO Emmanuel',  service:'Sonorisation Mariage',   section:'Sonorisation', lieu:'Lomé Beach Hotel',     statut:'Confirmé',  nb_techs:3 },
  { id:2,  titre:'Concert Eglise Grâce',           date:'2026-05-22', heure_debut:'17:00', heure_fin:'22:00', nom_client:'Eglise Grâce',    service:'Sonorisation Concert',   section:'Sonorisation', lieu:'Palais des Congrès',   statut:'Confirmé',  nb_techs:4 },
  { id:3,  titre:'Enregistrement MENSAH Kofi',     date:'2026-05-23', heure_debut:'09:00', heure_fin:'17:00', nom_client:'MENSAH Kofi',     service:'Enregistrement Studio',  section:'Studio',       lieu:'Studio KS Production', statut:'Confirmé',  nb_techs:2 },
  { id:4,  titre:'Séminaire NKRUMAH Events',       date:'2026-05-25', heure_debut:'08:00', heure_fin:'18:00', nom_client:'NKRUMAH Events',  service:'Sonorisation Séminaire', section:'Sonorisation', lieu:'Hôtel Sarakawa',       statut:'Tentative', nb_techs:2 },
  { id:5,  titre:'Mixage EP — AGBEKO Mawuli',      date:'2026-05-27', heure_debut:'10:00', heure_fin:'16:00', nom_client:'AGBEKO Mawuli',   service:'Mixage & Mastering',     section:'Studio',       lieu:'Studio KS Production', statut:'Confirmé',  nb_techs:1 },
  { id:6,  titre:'Gala annuel NKRUMAH Events',     date:'2026-06-05', heure_debut:'19:00', heure_fin:'02:00', nom_client:'NKRUMAH Events',  service:'Sonorisation Gala',      section:'Sonorisation', lieu:'Palais des Congrès',   statut:'Confirmé',  nb_techs:5 },
  { id:7,  titre:'Concert Noël — Eglise Victoire', date:'2026-06-12', heure_debut:'18:00', heure_fin:'23:00', nom_client:'Eglise Victoire', service:'Sonorisation Concert',   section:'Sonorisation', lieu:'Centre Culturel',      statut:'Tentative', nb_techs:3 },
  { id:8,  titre:'Doublage LA VOIE AU TOGO',       date:'2026-06-15', heure_debut:'09:00', heure_fin:'13:00', nom_client:'LA VOIE AU TOGO', service:'Doublage & Voix off',    section:'Studio',       lieu:'Studio KS Production', statut:'Confirmé',  nb_techs:2 },
  { id:9,  titre:'Mariage AKAKPO Sénam',           date:'2026-06-20', heure_debut:'11:00', heure_fin:'22:00', nom_client:'AKAKPO Sénam',    service:'Sonorisation Mariage',   section:'Sonorisation', lieu:'Village du Bénin',     statut:'Tentative', nb_techs:3 },
  { id:10, titre:'Enregistrement KOFFI Anoumou',   date:'2026-06-25', heure_debut:'14:00', heure_fin:'18:00', nom_client:'KOFFI Anoumou',   service:'Enregistrement Studio',  section:'Studio',       lieu:'Studio KS Production', statut:'Confirmé',  nb_techs:1 },
]

const STATUT_CONFIG = {
  'Confirmé':  { color: '#00b894', gradient: 'from-[#00b894] to-[#00cec9]', icon: CheckCircle2, label: 'Confirmé' },
  'Tentative': { color: '#fdcb6e', gradient: 'from-[#fdcb6e] to-[#e17055]', icon: AlertCircle,  label: 'Tentative' },
  'Annulé':    { color: '#e94560', gradient: 'from-[#e94560] to-[#c0392b]', icon: XCircle,      label: 'Annulé' },
  'Terminée':  { color: '#9ca3af', gradient: 'from-[#9ca3af] to-[#6b7280]', icon: CheckCircle2, label: 'Terminée' },
}

const SECTION_STYLE = {
  Sonorisation: { color: '#e94560', bg: 'from-[#e94560] to-[#c0392b]', light: '#e9456012' },
  Studio:       { color: '#6c5ce7', bg: 'from-[#6c5ce7] to-[#a29bfe]', light: '#6c5ce712' },
}

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function getJoursDuMois(annee: number, mois: number) {
  const premier = new Date(annee, mois, 1)
  const dernier = new Date(annee, mois + 1, 0)
  const jourDepart = (premier.getDay() + 6) % 7
  const jours: (number | null)[] = Array(jourDepart).fill(null)
  for (let d = 1; d <= dernier.getDate(); d++) jours.push(d)
  while (jours.length % 7 !== 0) jours.push(null)
  return jours
}

export default function AgendaPage() {
  const today = new Date()
  const [annee, setAnnee] = useState(today.getFullYear())
  const [mois,  setMois]  = useState(today.getMonth())
  const [jourSel, setJourSel] = useState<number | null>(today.getDate())
  const [selected, setSelected] = useState<number | null>(null)

  const jours = getJoursDuMois(annee, mois)

  const dateStr = (j: number) =>
    `${annee}-${String(mois + 1).padStart(2,'0')}-${String(j).padStart(2,'0')}`

  const prestationsMois = DEMO.filter(p => {
    const [y, m] = p.date.split('-').map(Number)
    return y === annee && m === mois + 1
  })
  const prestationsJour = jourSel ? DEMO.filter(p => p.date === dateStr(jourSel)) : []
  const liste = jourSel ? prestationsJour : prestationsMois

  const prevMois = () => { mois === 0 ? (setMois(11), setAnnee(a=>a-1)) : setMois(m=>m-1); setJourSel(null) }
  const nextMois = () => { mois === 11 ? (setMois(0), setAnnee(a=>a+1)) : setMois(m=>m+1); setJourSel(null) }

  const presDay  = (j: number) => DEMO.filter(p => p.date === dateStr(j))

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Agenda"
        subtitle={`${prestationsMois.length} prestation${prestationsMois.length!==1?'s':''} ce mois`}
        alertCount={prestationsMois.filter(p=>p.statut==='Tentative').length}
        actions={
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#00b894,#00cec9)', boxShadow:'0 4px 14px rgba(0,184,148,0.35)' }}>
            <Plus size={15} /> Nouvelle prestation
          </motion.button>
        }
      />

      <div className="flex-1 overflow-hidden flex gap-5 p-6">

        {/* ─── CALENDRIER ─────────────────────────────── */}
        <div className="flex flex-col gap-4 w-[320px] shrink-0">

          {/* Mini calendrier */}
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid rgba(0,0,0,0.06)' }}>

            {/* Navigation */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ background:'linear-gradient(135deg,#1a1a2e,#16213e)', borderBottom:'2px solid #e94560' }}>
              <motion.button whileHover={{ scale:1.15, x:-2 }} whileTap={{ scale:0.9 }} onClick={prevMois}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                <ChevronLeft size={15} />
              </motion.button>
              <div className="text-center">
                <div className="font-bold text-white text-sm">{MOIS[mois]} {annee}</div>
                <div className="text-white/40 text-[10px]">{prestationsMois.length} prestation{prestationsMois.length!==1?'s':''}</div>
              </div>
              <motion.button whileHover={{ scale:1.15, x:2 }} whileTap={{ scale:0.9 }} onClick={nextMois}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                <ChevronRight size={15} />
              </motion.button>
            </div>

            <div className="p-4">
              {/* Jours header */}
              <div className="grid grid-cols-7 mb-2">
                {JOURS.map(j => (
                  <div key={j} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{j}</div>
                ))}
              </div>

              {/* Cases */}
              <motion.div className="grid grid-cols-7 gap-1"
                key={`${annee}-${mois}`}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ duration:0.25 }}>
                {jours.map((j, i) => {
                  if (!j) return <div key={i} />
                  const pres    = presDay(j)
                  const isToday = j===today.getDate() && mois===today.getMonth() && annee===today.getFullYear()
                  const isSel   = j===jourSel
                  const hasConf = pres.some(p=>p.statut==='Confirmé')
                  const hasTent = pres.some(p=>p.statut==='Tentative')
                  return (
                    <motion.button key={i}
                      whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}
                      onClick={() => setJourSel(jourSel===j ? null : j)}
                      className="relative flex flex-col items-center justify-center h-9 w-full rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: isSel
                          ? 'linear-gradient(135deg,#6c5ce7,#a29bfe)'
                          : isToday ? '#6c5ce710' : 'transparent',
                        color: isSel ? '#fff' : isToday ? '#6c5ce7' : '#374151',
                        border: isToday && !isSel ? '1.5px solid #6c5ce740' : '1.5px solid transparent',
                        boxShadow: isSel ? '0 4px 12px rgba(108,92,231,0.4)' : 'none',
                      }}>
                      {j}
                      {pres.length > 0 && (
                        <div className="absolute bottom-1 flex gap-0.5">
                          {hasConf && <div className="w-1 h-1 rounded-full bg-[#00b894]" />}
                          {hasTent && <div className="w-1 h-1 rounded-full bg-[#fdcb6e]" />}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            </div>

            {/* Légende */}
            <div className="px-4 pb-3 flex gap-4 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <div className="w-2 h-2 rounded-full bg-[#00b894]" /> Confirmé
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <div className="w-2 h-2 rounded-full bg-[#fdcb6e]" /> Tentative
              </div>
            </div>
          </div>

          {/* Stats avec couleurs */}
          <div className="bg-white rounded-2xl p-4"
            style={{ boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Résumé du mois</div>
            <div className="space-y-2.5">
              {[
                { label:'Confirmées',  count:prestationsMois.filter(p=>p.statut==='Confirmé').length,  color:'#00b894', bg:'#00b89415' },
                { label:'Tentatives',  count:prestationsMois.filter(p=>p.statut==='Tentative').length, color:'#fdcb6e', bg:'#fdcb6e15' },
                { label:'Sonorisation',count:prestationsMois.filter(p=>p.section==='Sonorisation').length, color:'#e94560', bg:'#e9456015' },
                { label:'Studio',      count:prestationsMois.filter(p=>p.section==='Studio').length,   color:'#6c5ce7', bg:'#6c5ce715' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: bg, color }}>
                    {count}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width:0 }}
                        animate={{ width:`${prestationsMois.length ? (count/prestationsMois.length)*100 : 0}%` }}
                        transition={{ duration:0.8, delay:0.2, ease:'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${color},${color}88)` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── LISTE PRESTATIONS ──────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">

          {/* Header liste */}
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">
                {jourSel
                  ? `${jourSel} ${MOIS[mois]} ${annee}`
                  : `${MOIS[mois]} ${annee} — Toutes les prestations`}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {liste.length} prestation{liste.length!==1?'s':''}
              </p>
            </div>
            {jourSel && (
              <motion.button whileHover={{ scale:1.03 }} onClick={() => setJourSel(null)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-xl transition-all"
                style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <XCircle size={12} /> Voir tout le mois
              </motion.button>
            )}
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
            <AnimatePresence mode="popLayout">
              {liste.length === 0 ? (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="text-center py-20 text-gray-400">
                  <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Aucune prestation {jourSel ? 'ce jour' : 'ce mois'}</p>
                </motion.div>
              ) : liste.map((p, i) => {
                const cfg    = STATUT_CONFIG[p.statut]
                const sec    = SECTION_STYLE[p.section]
                const Icon   = cfg.icon
                const isSel  = selected === p.id

                return (
                  <motion.div key={p.id}
                    layout
                    initial={{ opacity:0, x:20 }}
                    animate={{ opacity:1, x:0 }}
                    exit={{ opacity:0, x:-20, height:0 }}
                    transition={{ duration:0.25, delay: i * 0.06 }}
                    onClick={() => setSelected(isSel ? null : p.id)}
                    whileHover={{ y: isSel ? 0 : -2 }}
                    className="bg-white rounded-2xl cursor-pointer overflow-hidden"
                    style={{
                      boxShadow: isSel
                        ? `0 8px 30px ${sec.color}25, 0 0 0 2px ${sec.color}35`
                        : '0 2px 12px rgba(0,0,0,0.07)',
                      border:`1px solid ${isSel ? sec.color+'30' : 'rgba(0,0,0,0.06)'}`,
                    }}
                  >
                    {/* Bande gauche colorée */}
                    <div className="flex">
                      <div className={`w-1.5 shrink-0 bg-gradient-to-b ${sec.bg}`} />

                      <div className="flex-1 p-4">
                        <div className="flex items-start gap-3">
                          {/* Icône section */}
                          <motion.div
                            animate={{ rotate: isSel ? 360 : 0 }}
                            transition={{ duration:0.5 }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background:`linear-gradient(135deg,${sec.color}20,${sec.color}08)`, border:`1px solid ${sec.color}25` }}>
                            <Music2 size={16} style={{ color:sec.color }} />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-bold text-gray-800 text-sm leading-tight">{p.titre}</div>
                                <div className="text-xs text-gray-400 mt-0.5 font-medium">{p.nom_client}</div>
                              </div>
                              {/* Badge statut animé */}
                              <motion.span
                                initial={{ scale:0.8 }} animate={{ scale:1 }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                                style={{ background:`${cfg.color}15`, color:cfg.color, border:`1px solid ${cfg.color}25` }}>
                                <Icon size={10} />
                                {cfg.label}
                              </motion.span>
                            </div>

                            {/* Infos détail */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                              {!jourSel && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold"
                                  style={{ color:sec.color }}>
                                  <Calendar size={11} />
                                  {new Date(p.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}
                                </div>
                              )}
                              {p.heure_debut && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <Clock size={11} className="text-gray-400" />
                                  {p.heure_debut}{p.heure_fin ? ` → ${p.heure_fin}` : ''}
                                </div>
                              )}
                              {p.lieu && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <MapPin size={11} className="text-gray-400" />
                                  {p.lieu}
                                </div>
                              )}
                              {p.nb_techs && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <Wrench size={11} className="text-gray-400" />
                                  {p.nb_techs} tech.
                                </div>
                              )}
                              {/* Badge section */}
                              <span className="ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                                style={{ background:`linear-gradient(135deg,${sec.color}15,${sec.color}08)`, color:sec.color, border:`1px solid ${sec.color}20` }}>
                                {p.section}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions dépliables */}
                        <AnimatePresence>
                          {isSel && (
                            <motion.div
                              initial={{ opacity:0, height:0, marginTop:0 }}
                              animate={{ opacity:1, height:'auto', marginTop:16 }}
                              exit={{ opacity:0, height:0, marginTop:0 }}
                              transition={{ duration:0.25 }}
                              className="overflow-hidden border-t border-gray-100 pt-3"
                            >
                              <div className="flex gap-2 flex-wrap">
                                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                                  style={{ background:`linear-gradient(135deg,${sec.color},${sec.color}cc)`, boxShadow:`0 4px 12px ${sec.color}35` }}>
                                  <Eye size={12} /> Fiche PDF
                                </motion.button>
                                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                                  <Pencil size={12} /> Modifier
                                </motion.button>
                                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                                  <Users size={12} /> Techniciens
                                </motion.button>
                                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                                  className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                                  <XCircle size={12} /> Supprimer
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
