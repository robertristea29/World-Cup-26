import { redirect } from 'next/navigation'

// Predictions are now per-league. Go to /leagues to pick a league first.
export default async function PredictPage() {
  redirect('/leagues')
}
