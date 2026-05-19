'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Music, Loader2, Wifi } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import gsap from 'gsap'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setUser, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const bgRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated) { router.push('/dashboard'); return }

    // Animation GSAP — particules flottantes
    const ctx = gsap.context(() => {
      const particles = particlesRef.current?.querySelectorAll('.particle')
      particles?.forEach((p, i) => {
        gsap.to(p, {
          y: -30 - Math.random() * 40,
          x: (Math.random() - 0.5) * 30,
          opacity: 0.3 + Math.random() * 0.4,
          duration: 2 + Math.random() * 3,
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
          ease: 'sine.inOut',
        })
      })

      // Animation entrée de la carte
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' }
      )
    })

    return () => ctx.revert()
  }, [isAuthenticated, router])

  // Effet parallax sur le background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      gsap.to(bgRef.current, { x, y, duration: 1, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) { toast.error('Remplissez tous les champs'); return }
    setLoading(true)

    // Shake animation si erreur
    const shake = () => gsap.to(cardRef.current, {
      x: [-8, 8, -6, 6, -4, 4, 0],
      duration: 0.4, ease: 'power2.inOut'
    })

    try {
      const res = await authApi.login(username, password)
      const data = res.data
      if (data.ok) {
        setUser({ username: data.username, role: data.role, nom_complet: data.nom_complet })
        toast.success(`Bienvenue, ${data.nom_complet || data.username} !`)
        gsap.to(cardRef.current, {
          scale: 0.95, opacity: 0, duration: 0.3,
          onComplete: () => router.push('/dashboard')
        })
      } else {
        shake()
        toast.error(data.error || 'Identifiants incorrects')
      }
    } catch {
      shake()
      toast.error('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative bg-[#050510]">

      {/* Background animé */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <div className="absolute inset-0 bg-gradient-radial from-[#e94560]/8 via-transparent to-transparent" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(233,69,96,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(108,92,231,0.1) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(9,132,227,0.08) 0%, transparent 50%)' }} />

        {/* Grille */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Particules flottantes */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="particle absolute w-1 h-1 rounded-full opacity-20"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 4) * 20}%`,
              background: i % 3 === 0 ? '#e94560' : i % 3 === 1 ? '#6c5ce7' : '#0984e3',
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
            }}
          />
        ))}
      </div>

      {/* Carte login */}
      <div ref={cardRef} className="relative z-10 w-full max-w-md px-4">
        <div className="glass-strong rounded-3xl p-8 shadow-2xl" style={{
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)'
        }}>

          {/* Logo — CSS animation (fiable React 19) */}
          <div className="flex justify-center mb-6 anim-pop delay-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e94560] via-[#c0392b] to-[#6c5ce7] flex items-center justify-center shadow-xl glow-red">
              <Music size={28} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-8 anim-fadeup delay-300">
            <h1 className="text-2xl font-bold text-white">
              KS <span className="gradient-text">Production</span>
            </h1>
            <p className="text-white/40 text-sm mt-1">Studio d'Enregistrement & Sonorisation</p>
          </div>

          {/* Indicateur serveur */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mb-6 anim-fadein delay-400">
            <Wifi size={13} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">Serveur connecté — 127.0.0.1:5000</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="anim-slide delay-500">
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                Identifiant
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Votre identifiant"
                autoComplete="username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e94560]/60 transition-all"
              />
            </div>

            {/* Password */}
            <div className="anim-slide delay-600">
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e94560]/60 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <div className="anim-fadeup delay-700">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all relative overflow-hidden mt-2 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #e94560, #c0392b, #6c5ce7)' }}
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Connexion...</>
                  : 'Se connecter'
                }
              </motion.button>
            </div>
          </form>

          <p className="text-center text-white/20 text-xs mt-6 anim-fadein delay-900">
            © 2026 KS Production — Développé par AWUTE Maxime
          </p>
        </div>
      </div>
    </div>
  )
}
