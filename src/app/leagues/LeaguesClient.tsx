'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LeaguesClient() {
  const router = useRouter()

  // ── Create league ─────────────────────────────────
  const [createName, setCreateName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreateLoading(true)

    const res = await fetch('/api/leagues/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: createName }),
    })

    const json = await res.json()
    setCreateLoading(false)

    if (!res.ok) {
      setCreateError(json.error ?? 'Eroare necunoscută')
      return
    }

    // Navigate to the new league's page
    router.push(`/leagues/${json.league.id}`)
    router.refresh()
  }

  // ── Join league ───────────────────────────────────
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoinError('')
    setJoinLoading(true)

    const res = await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: joinCode }),
    })

    const json = await res.json()
    setJoinLoading(false)

    if (!res.ok) {
      setJoinError(json.error ?? 'Eroare necunoscută')
      return
    }

    router.push(`/leagues/${json.league.id}`)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Create */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="font-semibold text-white mb-4">Creează o ligă</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Numele ligii"
            value={createName}
            onChange={e => setCreateName(e.target.value)}
            maxLength={50}
            required
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {createError && <p className="text-red-400 text-xs">{createError}</p>}
          <button
            type="submit"
            disabled={createLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition"
          >
            {createLoading ? 'Se creează...' : 'Creează'}
          </button>
        </form>
      </div>

      {/* Join */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="font-semibold text-white mb-4">Alătură-te cu un cod</h2>
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Cod invitație (ex: A3K9PQ)"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
          />
          {joinError && <p className="text-red-400 text-xs">{joinError}</p>}
          <button
            type="submit"
            disabled={joinLoading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition"
          >
            {joinLoading ? 'Se alătură...' : 'Alătură-te'}
          </button>
        </form>
      </div>
    </div>
  )
}
