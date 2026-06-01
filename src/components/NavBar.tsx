'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Don't show nav on auth pages
  if (pathname === '/login' || pathname === '/register') return null

  const linkClass = (path: string) =>
    `text-sm font-medium transition ${
      pathname.startsWith(path) ? 'text-white' : 'text-gray-400 hover:text-white'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/leagues" className="text-lg font-bold text-white">
          ⚽ WC26
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/leagues" className={linkClass('/leagues')}>Leagues</Link>
          <Link href="/leaderboard" className={linkClass('/leaderboard')}>Leaderboard</Link>
          <Link href="/admin" className={linkClass('/admin')}>Admin</Link>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
