'use client'

// This wrapper exists because `ssr: false` in next/dynamic is only allowed
// inside a Client Component, not a Server Component (the layout).
import dynamic from 'next/dynamic'

const NavBar = dynamic(() => import('./NavBar'), { ssr: false })

export default function ClientNavBar() {
  return <NavBar />
}
