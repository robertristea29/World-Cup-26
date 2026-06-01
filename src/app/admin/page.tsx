import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'
import type { Match } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin flag
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/predict')
  }

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_time', { ascending: true })

  return <AdminClient matches={(matches as Match[]) ?? []} />
}
