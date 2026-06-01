import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface LeaderboardRow {
  user_id: string
  display_name: string
  total_points: number
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Sum points per user, join with profile for display name
  const { data: entries } = await supabase
    .from('point_entries')
    .select('user_id, points, profiles(display_name)')

  // Aggregate totals client-side (avoids needing a DB view)
  const totals: Record<string, { display_name: string; total: number }> = {}

  for (const e of entries ?? []) {
    const profile = e.profiles as unknown as { display_name: string } | null
    const name = profile?.display_name ?? 'Unknown'
    if (!totals[e.user_id]) totals[e.user_id] = { display_name: name, total: 0 }
    totals[e.user_id].total += e.points
  }

  const leaderboard: LeaderboardRow[] = Object.entries(totals)
    .map(([user_id, v]) => ({ user_id, display_name: v.display_name, total_points: v.total }))
    .sort((a, b) => b.total_points - a.total_points)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      {leaderboard.length === 0 && (
        <p className="text-gray-500 text-sm">No points yet — check back after the first matches!</p>
      )}

      <div className="flex flex-col gap-2">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.user_id}
            className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
              entry.user_id === user.id ? 'bg-blue-900/40 border border-blue-700' : 'bg-gray-900'
            }`}
          >
            {/* Rank */}
            <span className={`text-lg font-bold w-8 text-center ${
              index === 0 ? 'text-yellow-400' :
              index === 1 ? 'text-gray-300' :
              index === 2 ? 'text-orange-400' : 'text-gray-500'
            }`}>
              {index + 1}
            </span>

            {/* Name */}
            <span className="flex-1 font-medium">
              {entry.display_name}
              {entry.user_id === user.id && <span className="text-blue-400 text-xs ml-2">(you)</span>}
            </span>

            {/* Points */}
            <span className="font-bold text-white text-lg">
              {entry.total_points} <span className="text-gray-400 text-sm font-normal">pts</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
