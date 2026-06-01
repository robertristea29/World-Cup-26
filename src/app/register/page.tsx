'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // The DB trigger auto-creates the profile row using display_name from metadata
      router.push('/predict')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">⚽ World Cup 26</h1>
        <p className="text-gray-400 text-center mb-6 text-sm">Create your account</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm block mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              placeholder="How your friends will see you"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 transition"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
