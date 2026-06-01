import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeagueLeaderboardClient from './LeagueLeaderboardClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeagueLeaderboardPage({ params }: Props) {
  const { id } = await params
  const leagueId = parseInt(id)

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the league — RLS ensures only members can see it
  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, invite_code, created_by')
    .eq('id', leagueId)
    .single()

  // If league not found or user is not a member, redirect
  if (!league) redirect('/leagues')

  // Fetch all member user_ids in this league
  const { data: members } = await supabase
    .from('league_members')
    .select('user_id')
    .eq('league_id', leagueId)

  const memberIds = (members ?? []).map(m => m.user_id)

  // Fetch point_entries for this league (filtered directly by league_id)
  const { data: entries } = await supabase
    .from('point_entries')
    .select('user_id, points, profiles(display_name)')
    .eq('league_id', leagueId)

  // Aggregate totals
  const totals: Record<string, { display_name: string; total: number }> = {}
  for (const e of entries ?? []) {
    const profile = e.profiles as unknown as { display_name: string } | null
    const name = profile?.display_name ?? 'Unknown'
    if (!totals[e.user_id]) totals[e.user_id] = { display_name: name, total: 0 }
    totals[e.user_id].total += e.points
  }

  // Also include members with 0 points (they're in the league but have no entries yet)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', memberIds)

  for (const p of profiles ?? []) {
    if (!totals[p.id]) totals[p.id] = { display_name: p.display_name, total: 0 }
  }

  const leaderboard = Object.entries(totals)
    .map(([user_id, v]) => ({ user_id, display_name: v.display_name, total_points: v.total }))
    .sort((a, b) => b.total_points - a.total_points)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <a href="/leagues" className="text-gray-500 text-sm hover:text-white transition">← Înapoi la ligi</a>
        <h1 className="text-2xl font-bold mt-2">{league.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-400 text-sm">Cod invitație:</span>
          <span className="font-mono text-white bg-gray-800 px-2 py-0.5 rounded text-sm">{league.invite_code}</span>
          <span className="text-gray-500 text-xs">(trimite-l prietenilor)</span>
        </div>
        <a
          href={`/leagues/${leagueId}/predict`}
          className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          ✏ Predicțiile mele
        </a>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-sm">Niciun punct încă — verifică după primele meciuri!</p>
      ) : (
        <div className="flex flex-col gap-2 mb-8">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
                entry.user_id === user.id ? 'bg-blue-900/40 border border-blue-700' : 'bg-gray-900'
              }`}
            >
              <span className={`text-lg font-bold w-8 text-center ${
                index === 0 ? 'text-yellow-400' :
                index === 1 ? 'text-gray-300' :
                index === 2 ? 'text-orange-400' : 'text-gray-500'
              }`}>
                {index + 1}
              </span>
              <span className="flex-1 font-medium">
                {entry.display_name}
                {entry.user_id === user.id && <span className="text-blue-400 text-xs ml-2">(tu)</span>}
              </span>
              <span className="font-bold text-white text-lg">
                {entry.total_points} <span className="text-gray-400 text-sm font-normal">pts</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Leave button — client component handles the API call */}
      <LeagueLeaderboardClient
        leagueId={leagueId}
        isCreator={league.created_by === user.id}
      />
    </div>
  )
}
