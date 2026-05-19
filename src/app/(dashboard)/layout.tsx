'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/login')
  }, [mounted, isAuthenticated, router])

  // Afficher le fond pendant l'hydratation
  if (!mounted) {
    return <div className="flex min-h-screen bg-[#0a0a14]" />
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen p-2" style={{ background: '#0f0f1a' }}>
      <div className="flex min-h-[calc(100vh-16px)] rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 0 1px rgba(233,69,96,0.15), 0 0 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)'
        }}
      >
        <Sidebar />
        <main className="flex-1 ml-[220px] flex flex-col anim-fadein"
          style={{ background: 'linear-gradient(135deg, #e8ecf5 0%, #f2f4fb 35%, #ffffff 65%, #f5f5f5 100%)', height: 'calc(100vh - 16px)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
