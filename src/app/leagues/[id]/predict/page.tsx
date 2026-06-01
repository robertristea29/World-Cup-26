import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeaguePredictionsClient from './LeaguePredictionsClient'
import type { Match, Prediction } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeaguePredictPage({ params }: Props) {
  const { id } = await params
  const leagueId = parseInt(id)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify the user is a member of this league
  const { data: membership } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('league_id', leagueId)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/leagues')

  // Fetch league name
  const { data: league } = await supabase
    .from('leagues')
    .select('name')
    .eq('id', leagueId)
    .single()

  // Fetch all matches sorted by kickoff
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true })

  // Fetch this user's predictions for this specific league
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .eq('league_id', leagueId)

  return (
    <LeaguePredictionsClient
      matches={(matches as Match[]) ?? []}
      predictions={(predictions as Prediction[]) ?? []}
      userId={user.id}
      leagueId={leagueId}
      leagueName={league?.name ?? ''}
    />
  )
}
