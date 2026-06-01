import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LeaguesClient from './LeaguesClient'

export default async function LeaguesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all leagues the user is a member of, with member count
  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, leagues(id, name, invite_code, created_by)')
    .eq('user_id', user.id)

  const leagues = (memberships ?? [])
    .map(m => m.leagues as { id: number; name: string; invite_code: string; created_by: string } | null)
    .filter(Boolean) as { id: number; name: string; invite_code: string; created_by: string }[]

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Ligi</h1>
      <p className="text-gray-400 text-sm mb-8">
        Creează o ligă privată și invită-ți prietenii. Fiecare ligă are un clasament propriu.
      </p>

      {/* List of user's leagues */}
      {leagues.length > 0 ? (
        <div className="flex flex-col gap-3 mb-10">
          {leagues.map(league => (
            <Link
              key={league.id}
              href={`/leagues/${league.id}`}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition rounded-xl px-5 py-4 border border-gray-800"
            >
              <div>
                <p className="font-semibold text-white">{league.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cod invitație: <span className="font-mono text-gray-300">{league.invite_code}</span>
                  {league.created_by === user.id && (
                    <span className="ml-2 text-blue-400">(creat de tine)</span>
                  )}
                </p>
              </div>
              <span className="text-gray-500 text-sm">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-10">
          Nu ești în nicio ligă încă. Creează una sau alătură-te cu un cod.
        </p>
      )}

      {/* Create & Join forms (interactive — client component) */}
      <LeaguesClient />
    </div>
  )
}
