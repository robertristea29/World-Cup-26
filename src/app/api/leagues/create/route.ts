import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Generates a random uppercase alphanumeric code, e.g. "A3K9PQ"
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0, I/1 to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Must be logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await req.json()
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'League name is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Try up to 5 times to get a unique invite code (collision extremely unlikely)
  let league = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode()
    const { data, error } = await admin
      .from('leagues')
      .insert({ name: name.trim(), invite_code: code, created_by: user.id })
      .select()
      .single()

    if (!error) {
      league = data
      break
    }
    // If error is not a unique violation, bail immediately
    if (!error.message.includes('unique')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (!league) {
    return NextResponse.json({ error: 'Could not generate unique invite code' }, { status: 500 })
  }

  // Auto-join the creator as the first member
  await admin
    .from('league_members')
    .insert({ league_id: league.id, user_id: user.id })

  return NextResponse.json({ league })
}
