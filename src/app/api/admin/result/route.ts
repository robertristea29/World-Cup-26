import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { calculatePoints } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  // Verify the caller is an authenticated admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { match_id, home_score, away_score } = body

  if (typeof match_id !== 'number' || typeof home_score !== 'number' || typeof away_score !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Use service role client to bypass RLS for writes
  const admin = createAdminClient()

  // 1. Save the result on the match row
  const { error: matchError } = await admin
    .from('matches')
    .update({ home_score, away_score, status: 'finished' })
    .eq('id', match_id)

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 })
  }

  // 2. Fetch all predictions for this match
  const { data: predictions, error: predError } = await admin
    .from('predictions')
    .select('*')
    .eq('match_id', match_id)

  if (predError) {
    return NextResponse.json({ error: predError.message }, { status: 500 })
  }

  // 3. Calculate points for each prediction and upsert into point_entries (per league)
  if (predictions && predictions.length > 0) {
    const entries = predictions.map((p: {
      user_id: string
      match_id: number
      league_id: number
      predicted_home: number
      predicted_away: number
    }) => ({
      user_id: p.user_id,
      match_id: p.match_id,
      league_id: p.league_id,
      points: calculatePoints(p.predicted_home, p.predicted_away, home_score, away_score),
    }))

    const { error: pointsError } = await admin
      .from('point_entries')
      .upsert(entries, { onConflict: 'user_id,match_id,league_id' })

    if (pointsError) {
      return NextResponse.json({ error: pointsError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, predictions_scored: predictions?.length ?? 0 })
}
