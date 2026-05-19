'use client'

// Wrapper standard pour toutes les pages dashboard.
// Le Topbar reste fixe en haut, le contenu défile en dessous.
export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  )
}
