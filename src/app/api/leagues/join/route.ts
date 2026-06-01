import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Must be logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invite_code } = await req.json()
  if (!invite_code || typeof invite_code !== 'string') {
    return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
  }

  // Look up the league by invite code using the admin client —
  // the user is not yet a member so RLS would block a normal query
  const adminSupabase = createAdminClient()
  const { data: league, error: leagueError } = await adminSupabase
    .from('leagues')
    .select('id, name')
    .eq('invite_code', invite_code.trim().toUpperCase())
    .single()

  if (leagueError || !league) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
  }

  // Check if already a member (insert would fail silently, but let's give a clear message)
  const { data: existing } = await adminSupabase
    .from('league_members')
    .select('league_id')
    .eq('league_id', league.id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'You are already in this league' }, { status: 409 })
  }

  // Join the league
  const { error: joinError } = await adminSupabase
    .from('league_members')
    .insert({ league_id: league.id, user_id: user.id })

  if (joinError) {
    return NextResponse.json({ error: joinError.message }, { status: 500 })
  }

  return NextResponse.json({ league })
}
