'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  leagueId: number
  isCreator: boolean
}

export default function LeagueLeaderboardClient({ leagueId, isCreator }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLeave() {
    if (!confirm(isCreator
      ? 'Ești creatorul acestei ligi. Dacă o ștergi, toți membrii vor fi eliminați. Continui?'
      : 'Ești sigur că vrei să părăsești această ligă?'
    )) return

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isCreator) {
      // Deleting the league cascades and removes all members
      await supabase.from('leagues').delete().eq('id', leagueId)
    } else {
      await supabase
        .from('league_members')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
    }

    setLoading(false)
    router.push('/leagues')
    router.refresh()
  }

  return (
    <button
      onClick={handleLeave}
      disabled={loading}
      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-40 transition"
    >
      {loading ? 'Se procesează...' : isCreator ? 'Șterge liga' : 'Părăsește liga'}
    </button>
  )
}
