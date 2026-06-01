'use client'

import { useState } from 'react'
import type { Match } from '@/types'

interface Props {
  matches: Match[]
}

export default function AdminClient({ matches: initialMatches }: Props) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [inputs, setInputs] = useState<Record<number, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [success, setSuccess] = useState<Record<number, boolean>>({})

  async function saveResult(match: Match) {
    const input = inputs[match.id]
    if (!input) return

    const home = parseInt(input.home)
    const away = parseInt(input.away)

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setErrors(prev => ({ ...prev, [match.id]: 'Enter valid scores' }))
      return
    }

    setSaving(prev => ({ ...prev, [match.id]: true }))
    setErrors(prev => ({ ...prev, [match.id]: '' }))

    // Call the server action API route that saves result + calculates points
    const res = await fetch('/api/admin/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: match.id, home_score: home, away_score: away }),
    })

    setSaving(prev => ({ ...prev, [match.id]: false }))

    if (!res.ok) {
      const body = await res.json()
      setErrors(prev => ({ ...prev, [match.id]: body.error ?? 'Failed to save' }))
    } else {
      // Update local match state
      setMatches(prev =>
        prev.map(m =>
          m.id === match.id
            ? { ...m, home_score: home, away_score: away, status: 'finished' }
            : m
        )
      )
      setInputs(prev => { const n = { ...prev }; delete n[match.id]; return n })
      setSuccess(prev => ({ ...prev, [match.id]: true }))
      setTimeout(() => setSuccess(prev => ({ ...prev, [match.id]: false })), 3000)
    }
  }

  // Show only matches that have kicked off (past kickoff time)
  const played = matches.filter(m => new Date() >= new Date(m.kickoff_time))
  const upcoming = matches.filter(m => new Date() < new Date(m.kickoff_time))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
      <p className="text-gray-400 text-sm mb-6">Enter match results here. Points are calculated automatically on save.</p>

      <h2 className="text-lg font-semibold text-yellow-400 mb-3">Results to enter</h2>

      {played.length === 0 && (
        <p className="text-gray-500 text-sm">No matches have kicked off yet.</p>
      )}

      <div className="flex flex-col gap-3 mb-10">
        {played.map(match => (
          <div key={match.id} className="bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">
                Group {match.group_name} · MD{match.matchday} ·{' '}
                {new Date(match.kickoff_time).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest'
                })}
              </div>
              <div className="font-semibold">
                {match.home_team} vs {match.away_team}
              </div>
              {match.status === 'finished' && match.home_score !== null && (
                <div className="text-green-400 text-sm mt-1 font-mono">
                  ✓ Saved: {match.home_score} – {match.away_score}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                placeholder={match.home_score !== null ? String(match.home_score) : '0'}
                value={inputs[match.id]?.home ?? ''}
                onChange={e => setInputs(prev => ({
                  ...prev,
                  [match.id]: { home: e.target.value, away: prev[match.id]?.away ?? '' }
                }))}
                className="w-12 text-center bg-gray-800 border border-gray-700 rounded-lg py-1 text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-500">–</span>
              <input
                type="number"
                min={0}
                max={20}
                placeholder={match.away_score !== null ? String(match.away_score) : '0'}
                value={inputs[match.id]?.away ?? ''}
                onChange={e => setInputs(prev => ({
                  ...prev,
                  [match.id]: { home: prev[match.id]?.home ?? '', away: e.target.value }
                }))}
                className="w-12 text-center bg-gray-800 border border-gray-700 rounded-lg py-1 text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => saveResult(match)}
                disabled={saving[match.id] || !inputs[match.id]}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm px-3 py-1 rounded-lg transition"
              >
                {saving[match.id] ? '...' : match.status === 'finished' ? 'Update' : 'Save'}
              </button>
            </div>

            {errors[match.id] && <p className="text-red-400 text-xs">{errors[match.id]}</p>}
            {success[match.id] && <p className="text-green-400 text-xs">✓ Points calculated!</p>}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-500 mb-3">Upcoming ({upcoming.length})</h2>
      <div className="flex flex-col gap-2">
        {upcoming.slice(0, 10).map(match => (
          <div key={match.id} className="text-gray-600 text-sm">
            {new Date(match.kickoff_time).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest'
            })} — {match.home_team} vs {match.away_team} (Group {match.group_name})
          </div>
        ))}
        {upcoming.length > 10 && <p className="text-gray-600 text-sm">...and {upcoming.length - 10} more</p>}
      </div>
    </div>
  )
}
