'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Match, Prediction } from '@/types'

interface Props {
  matches: Match[]
  predictions: Prediction[]
  userId: string
}

export default function PredictionsClient({ matches, predictions, userId }: Props) {
  // Map match_id → prediction for quick lookup
  const [predMap, setPredMap] = useState<Record<number, Prediction>>(
    Object.fromEntries(predictions.map(p => [p.match_id, p]))
  )

  // Pending input values per match (before saving)
  const [inputs, setInputs] = useState<Record<number, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})

  function isLocked(match: Match) {
    return new Date() >= new Date(match.kickoff_time)
  }

  function getResult(match: Match): string {
    if (match.home_score === null || match.away_score === null) return ''
    if (match.home_score > match.away_score) return '1'
    if (match.home_score < match.away_score) return '2'
    return 'X'
  }

  async function savePrediction(match: Match) {
    const input = inputs[match.id]
    const pred = predMap[match.id]
    if (!input && !pred) return
    const home = (input?.home ?? '') !== '' ? parseInt(input!.home) : (pred ? pred.predicted_home : NaN)
    const away = (input?.away ?? '') !== '' ? parseInt(input!.away) : (pred ? pred.predicted_away : NaN)

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setErrors(prev => ({ ...prev, [match.id]: 'Enter valid scores (0 or more)' }))
      return
    }

    setSaving(prev => ({ ...prev, [match.id]: true }))
    setErrors(prev => ({ ...prev, [match.id]: '' }))

    const supabase = createClient()
    const { data, error } = await supabase
      .from('predictions')
      .upsert(
        { user_id: userId, match_id: match.id, predicted_home: home, predicted_away: away },
        { onConflict: 'user_id,match_id' }
      )
      .select()
      .single()

    setSaving(prev => ({ ...prev, [match.id]: false }))

    if (error) {
      setErrors(prev => ({ ...prev, [match.id]: 'Failed to save. Try again.' }))
    } else {
      setPredMap(prev => ({ ...prev, [match.id]: data as Prediction }))
      setInputs(prev => { const n = { ...prev }; delete n[match.id]; return n })
    }
  }

  // Group matches by group_name
  const groups = Array.from(new Set(matches.map(m => m.group_name))).sort()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Predictions</h1>

      {groups.map(group => (
        <div key={group} className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-400 mb-3">Group {group}</h2>
          <div className="flex flex-col gap-3">
            {matches.filter(m => m.group_name === group).map(match => {
              const locked = isLocked(match)
              const pred = predMap[match.id]
              const input = inputs[match.id]
              const finished = match.status === 'finished'

              return (
                <div
                  key={match.id}
                  className="bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  {/* Match info */}
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">
                      MD{match.matchday} · {new Date(match.kickoff_time).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest'
                      })}
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      <span>{match.home_team}</span>
                      <span className="text-gray-500">vs</span>
                      <span>{match.away_team}</span>
                    </div>
                    {/* Actual result if finished */}
                    {finished && match.home_score !== null && (
                      <div className="text-green-400 text-sm mt-1 font-mono">
                        Result: {match.home_score} – {match.away_score} ({getResult(match)})
                      </div>
                    )}
                  </div>

                  {/* Prediction input / display */}
                  <div className="flex items-center gap-2">
                    {locked ? (
                      // Locked — show saved prediction or dash
                      <div className="text-right">
                        {pred ? (
                          <span className="font-mono text-blue-300 text-lg">
                            {pred.predicted_home} – {pred.predicted_away}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">No prediction</span>
                        )}
                      </div>
                    ) : (
                      // Unlocked — show input fields
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          placeholder={pred ? String(pred.predicted_home) : '0'}
                          value={input?.home ?? ''}
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
                          placeholder={pred ? String(pred.predicted_away) : '0'}
                          value={input?.away ?? ''}
                          onChange={e => setInputs(prev => ({
                            ...prev,
                            [match.id]: { home: prev[match.id]?.home ?? '', away: e.target.value }
                          }))}
                          className="w-12 text-center bg-gray-800 border border-gray-700 rounded-lg py-1 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => savePrediction(match)}
                          disabled={saving[match.id] || !input}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm px-3 py-1 rounded-lg transition"
                        >
                          {saving[match.id] ? '...' : pred ? 'Update' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  {errors[match.id] && (
                    <p className="text-red-400 text-xs mt-1">{errors[match.id]}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
