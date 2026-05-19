'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Search, X, Phone, Mail, MapPin,
  Receipt, Building2, Hash, TrendingUp, AlertTriangle,
  CheckCircle2, ChevronRight, Pencil, Trash2, FileText,
  UserPlus, ArrowUpRight
} from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { formatFCFA, formatDate } from '@/lib/utils'

const COLORS = ['#e94560','#0984e3','#6c5ce7','#00b894','#fdcb6e','#00cec9','#e17055','#a29bfe','#fd79a8','#00b894','#74b9ff','#636e72']

const DEMO_CLIENTS = [
  { id:1,  numero:'CLI-001', nom:'AWUTE Kossi',        adresse:'Lomé, Quartier Bè',     telephone:'92117715', email:'awute.kossi@gmail.com',      nif:'TG-2024-001', rccm:'RC-LME-001', nb_factures:4, total_ca:326000,  impayees:0, section:'Studio',       factures:[
    { numero:'FKSP-15052026-001', date:'2026-05-15', montant:150000, etat:'Partiel' },
    { numero:'FKSP-10042026-001', date:'2026-04-10', montant:95000,  etat:'Payer' },
    { numero:'FKSP-01032026-001', date:'2026-03-01', montant:45000,  etat:'Payer' },
    { numero:'FKSP-15022026-001', date:'2026-02-15', montant:36000,  etat:'Payer' },
  ]},
  { id:2,  numero:'CLI-002', nom:'KONDO KOFFI',         adresse:'Lomé, Adidogomé',       telephone:'90354873', email:'kondo.koffi@yahoo.fr',        nif:'', rccm:'',           nb_factures:2, total_ca:295000,  impayees:0, section:'Sonorisation', factures:[
    { numero:'FKSP-10052026-001', date:'2026-05-10', montant:236000, etat:'Payer' },
    { numero:'FKSP-20032026-001', date:'2026-03-20', montant:59000,  etat:'Payer' },
  ]},
  { id:3,  numero:'CLI-003', nom:'LA VOIE AU TOGO',     adresse:'Lomé-Togo, BP 1234',    telephone:'90018327', email:'contact@lavoiautogo.tg',      nif:'TG-2022-156', rccm:'RC-LME-089', nb_factures:6, total_ca:1250000, impayees:2, section:'Sonorisation', factures:[
    { numero:'FKSP-19052026-001', date:'2026-05-19', montant:80000,  etat:'Non Payer' },
    { numero:'FKSP-19052026-002', date:'2026-05-19', montant:80000,  etat:'Non Payer' },
    { numero:'FKSP-01042026-001', date:'2026-04-01', montant:354000, etat:'Payer' },
    { numero:'FKSP-01032026-001', date:'2026-03-01', montant:180000, etat:'Payer' },
  ]},
  { id:4,  numero:'CLI-004', nom:'NKRUMAH Events',      adresse:'Lomé, Tokoin',          telephone:'91234567', email:'nkrumah.events@gmail.com',    nif:'TG-2023-412', rccm:'RC-LME-201', nb_factures:3, total_ca:870000,  impayees:1, section:'Sonorisation', factures:[
    { numero:'FKSP-20042026-001', date:'2026-04-20', montant:180000, etat:'Non Payer' },
    { numero:'FKSP-15032026-001', date:'2026-03-15', montant:354000, etat:'Payer' },
    { numero:'FKSP-10022026-001', date:'2026-02-10', montant:336000, etat:'Payer' },
  ]},
  { id:5,  numero:'CLI-005', nom:'ATCHO Emmanuel',      adresse:'Lomé, Hédzranawoé',     telephone:'93456789', email:'atcho.emm@hotmail.com',       nif:'', rccm:'',           nb_factures:2, total_ca:369000,  impayees:0, section:'Sonorisation', factures:[
    { numero:'FKSP-08052026-001', date:'2026-05-08', montant:59000,  etat:'Payer' },
    { numero:'FKSP-10032026-001', date:'2026-03-10', montant:310000, etat:'Payer' },
  ]},
  { id:6,  numero:'CLI-006', nom:'MENSAH Kofi',         adresse:'Lomé, Agbalepedo',      telephone:'98765432', email:'mensah.kofi@gmail.com',       nif:'', rccm:'',           nb_factures:3, total_ca:280000,  impayees:1, section:'Studio',       factures:[
    { numero:'FKSP-05052026-001', date:'2026-05-05', montant:95000,  etat:'Non Payer' },
    { numero:'FKSP-01042026-001', date:'2026-04-01', montant:95000,  etat:'Payer' },
    { numero:'FKSP-01032026-001', date:'2026-03-01', montant:90000,  etat:'Payer' },
  ]},
  { id:7,  numero:'CLI-007', nom:'Eglise Grâce',        adresse:'Lomé, Agoè',            telephone:'22501234', email:'eglise.grace@tg.org',         nif:'TG-2019-007', rccm:'',           nb_factures:5, total_ca:980000,  impayees:0, section:'Sonorisation', factures:[
    { numero:'FKSP-01052026-001', date:'2026-05-01', montant:354000, etat:'Payer' },
    { numero:'FKSP-01042026-001', date:'2026-04-01', montant:236000, etat:'Payer' },
    { numero:'FKSP-01032026-001', date:'2026-03-01', montant:180000, etat:'Payer' },
  ]},
  { id:8,  numero:'CLI-008', nom:'AMOUZOU Dodji',       adresse:'Lomé, Baguida',         telephone:'97654321', email:'amouzou.dodji@gmail.com',     nif:'', rccm:'',           nb_factures:2, total_ca:112500,  impayees:0, section:'Studio',       factures:[
    { numero:'FKSP-28042026-001', date:'2026-04-28', montant:45000,  etat:'Partiel' },
    { numero:'FKSP-10032026-001', date:'2026-03-10', montant:67500,  etat:'Payer' },
  ]},
  { id:9,  numero:'CLI-009', nom:'AGBEKO Mawuli',       adresse:'Lomé, Djidjolé',        telephone:'91111222', email:'agbeko.mawuli@yahoo.fr',      nif:'', rccm:'',           nb_factures:2, total_ca:220000,  impayees:0, section:'Studio',       factures:[
    { numero:'FKSP-10042026-001', date:'2026-04-10', montant:185000, etat:'Payer' },
    { numero:'FKSP-15022026-001', date:'2026-02-15', montant:35000,  etat:'Payer' },
  ]},
  { id:10, numero:'CLI-010', nom:'Eglise Victoire',     adresse:'Lomé, Wuiti',           telephone:'22509876', email:'victoire@eglisevictoire.tg',  nif:'TG-2021-333', rccm:'',           nb_factures:1, total_ca:350000,  impayees:0, section:'Sonorisation', factures:[
    { numero:'FKSP-18042026-001', date:'2026-04-18', montant:350000, etat:'Payer' },
  ]},
  { id:11, numero:'CLI-011', nom:'KOFFI Anoumou',       adresse:'Kpalimé, Centre-ville', telephone:'90222333', email:'koffi.anoumou@gmail.com',     nif:'', rccm:'',           nb_factures:1, total_ca:45000,   impayees:0, section:'Studio',       factures:[
    { numero:'FKSP-05042026-001', date:'2026-04-05', montant:45000,  etat:'Payer' },
  ]},
  { id:12, numero:'CLI-012', nom:'AKAKPO Sénam',        adresse:'Lomé, Nyékonakpoè',     telephone:'93333444', email:'akakpo.senam@gmail.com',      nif:'', rccm:'',           nb_factures:2, total_ca:160000,  impayees:1, section:'Sonorisation', factures:[
    { numero:'FKSP-01042026-001', date:'2026-04-01', montant:80000,  etat:'Non Payer' },
    { numero:'FKSP-01032026-001', date:'2026-03-01', montant:80000,  etat:'Payer' },
  ]},
]

type Client = typeof DEMO_CLIENTS[0]

function Avatar({ nom, color, size = 38 }: { nom: string; color: string; size?: number }) {
  const initiales = nom.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size, minWidth: size, borderRadius: size * 0.28, background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.32 }}>
      {initiales}
    </div>
  )
}

function EtatBadge({ etat }: { etat: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    'Payer':     { color: '#00b894', label: 'Payée' },
    'Partiel':   { color: '#fdcb6e', label: 'Partielle' },
    'Non Payer': { color: '#e94560', label: 'Impayée' },
  }
  const c = cfg[etat] || { color: '#aaa', label: etat }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30` }}>
      {c.label}
    </span>
  )
}

export default function ClientsPage() {
  const [search, setSearch]         = useState('')
  const [selectedId, setSelectedId] = useState<number>(DEMO_CLIENTS[0].id)

  const clients = DEMO_CLIENTS.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.nom.toLowerCase().includes(q) ||
           c.telephone?.includes(q) ||
           c.email?.toLowerCase().includes(q) ||
           c.numero.toLowerCase().includes(q)
  })

  const selected: Client | undefined = DEMO_CLIENTS.find(c => c.id === selectedId) || DEMO_CLIENTS[0]
  const color = COLORS[(selected.id - 1) % COLORS.length]
  const totalCA = DEMO_CLIENTS.reduce((s, c) => s + c.total_ca, 0)
  const maxCA   = Math.max(...DEMO_CLIENTS.map(c => c.total_ca))

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Clients"
        subtitle={`${DEMO_CLIENTS.length} clients · CA total ${formatFCFA(totalCA)}`}
        actions={
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #00cec9, #00b894)', boxShadow: '0 4px 12px rgba(0,206,201,0.3)' }}>
            <UserPlus size={15} /> Nouveau client
          </motion.button>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 anim-fadeup shrink-0">
          {[
            { label: 'Total clients',   value: DEMO_CLIENTS.length,   sub: 'enregistrés',               color: '#00cec9' },
            { label: 'CA total',        value: formatFCFA(totalCA),   sub: 'toutes périodes',            color: '#0984e3' },
            { label: 'Avec impayés',    value: DEMO_CLIENTS.filter(c=>c.impayees>0).length, sub: 'clients à relancer', color: '#e94560' },
            { label: 'Factures émises', value: DEMO_CLIENTS.reduce((s,c)=>s+c.nb_factures,0), sub: 'au total', color: '#6c5ce7' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-2xl px-4 py-3.5"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</div>
              <div className="text-gray-800 font-bold text-lg leading-tight">{value}</div>
              <div className="text-xs mt-0.5 font-medium" style={{ color }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Split view */}
        <div className="flex gap-4 flex-1 overflow-hidden anim-fadein delay-100">

          {/* ─── LISTE GAUCHE ─────────────────────────────────── */}
          <div className="w-72 shrink-0 bg-white rounded-2xl flex flex-col overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

            {/* Recherche */}
            <div className="p-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#00cec9]/50 transition-all" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {clients.map((client, i) => {
                const c = COLORS[i % COLORS.length]
                const isActive = client.id === selectedId
                return (
                  <motion.div key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    whileHover={{ x: isActive ? 0 : 2 }}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all relative"
                    style={{
                      background: isActive ? '#f5f3ff' : 'transparent',
                      borderLeft: `3px solid ${isActive ? '#6c5ce7' : 'transparent'}`,
                    }}
                  >
                    <Avatar nom={client.nom} color={c} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{client.nom}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-mono">{client.numero}</span>
                        {client.impayees > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">
                            {client.impayees} imp.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-gray-700">{formatFCFA(client.total_ca)}</div>
                      <div className="text-[10px] text-gray-400">{client.nb_factures} fact.</div>
                    </div>
                    {isActive && (
                      <ChevronRight size={12} className="text-[#6c5ce7] shrink-0" />
                    )}
                  </motion.div>
                )
              })}
              {clients.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun client</p>
                </div>
              )}
            </div>

            {/* Footer liste */}
            <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
              <span className="text-[11px] text-gray-400">{clients.length} client{clients.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* ─── PANEL DÉTAIL DROIT ───────────────────────────── */}
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide"
              >
                {/* En-tête client */}
                <div className="bg-white rounded-2xl overflow-hidden shrink-0"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  {/* Bandeau couleur */}
                  <div className="h-16 relative" style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)`, borderBottom: `1px solid ${color}20` }}>
                    <div className="absolute bottom-0 left-6 translate-y-1/2">
                      <Avatar nom={selected.nom} color={color} size={52} />
                    </div>
                    {/* Actions */}
                    <div className="absolute top-3 right-4 flex gap-2">
                      <motion.button whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                        style={{ background: color }}>
                        <Receipt size={12} /> Nouvelle facture
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200">
                        <Pencil size={12} /> Modifier
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }}
                        className="w-7 h-7 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Infos client */}
                  <div className="pt-8 px-6 pb-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{selected.nom}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono text-gray-400">{selected.numero}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${color}15`, color }}>
                            {selected.section}
                          </span>
                          {selected.nif && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono">
                              NIF: {selected.nif}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Phone size={13} className="text-gray-500" />
                        </div>
                        <span className="font-mono text-sm">{selected.telephone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Mail size={13} className="text-gray-500" />
                        </div>
                        <span className="truncate text-xs">{selected.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <MapPin size={13} className="text-gray-500" />
                        </div>
                        <span className="text-xs">{selected.adresse}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-4 shrink-0">
                  {[
                    { label: 'Chiffre d\'affaires', value: formatFCFA(selected.total_ca), icon: TrendingUp, color: '#0984e3', sub: 'total cumulé' },
                    { label: 'Factures émises',     value: selected.nb_factures,          icon: Receipt,    color: '#6c5ce7', sub: 'toutes périodes' },
                    { label: 'Impayées',             value: selected.impayees,             icon: selected.impayees > 0 ? AlertTriangle : CheckCircle2,
                      color: selected.impayees > 0 ? '#e94560' : '#00b894',
                      sub: selected.impayees > 0 ? 'à relancer' : 'tout est à jour' },
                  ].map(({ label, value, icon: Icon, color: c, sub }) => (
                    <div key={label} className="bg-white rounded-2xl p-4"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: `${c}15`, border: `1px solid ${c}25` }}>
                          <Icon size={14} style={{ color: c }} />
                        </div>
                        <span className="text-xs text-gray-400 font-semibold">{label}</span>
                      </div>
                      <div className="text-xl font-bold text-gray-800">{value}</div>
                      <div className="text-xs mt-0.5 font-medium" style={{ color: c }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Barre CA relative */}
                <div className="bg-white rounded-2xl p-4 shrink-0"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Part dans le CA global</span>
                    <span className="text-xs font-bold" style={{ color }}>
                      {Math.round((selected.total_ca / totalCA) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(selected.total_ca / maxCA) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">0 FCFA</span>
                    <span className="text-[10px] text-gray-400">{formatFCFA(maxCA)}</span>
                  </div>
                </div>

                {/* Historique factures */}
                <div className="bg-white rounded-2xl overflow-hidden shrink-0"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">Historique des factures</span>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                      style={{ color, background: `${color}10` }}>
                      Voir tout <ArrowUpRight size={11} />
                    </motion.button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {selected.factures.map((f) => (
                      <div key={f.numero} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/60 transition-all group">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold font-mono text-gray-700">{f.numero}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(f.date)}</div>
                        </div>
                        <div className="text-sm font-bold text-gray-800">{formatFCFA(f.montant)}</div>
                        <EtatBadge etat={f.etat} />
                        <motion.button whileHover={{ scale: 1.1 }}
                          className="w-6 h-6 rounded-lg bg-blue-50 text-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight size={11} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
