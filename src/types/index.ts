// Types matching the Supabase database schema

export type MatchStatus = 'scheduled' | 'finished'

export interface Profile {
  id: string
  display_name: string
  is_admin: boolean
  created_at: string
}

export interface Match {
  id: number
  home_team: string
  away_team: string
  kickoff_time: string        // ISO timestamp
  group_name: string          // 'A' – 'L'
  matchday: number            // 1, 2, or 3
  home_score: number | null
  away_score: number | null
  status: MatchStatus
  api_fixture_id: number | null
}

export interface Prediction {
  id: number
  user_id: string
  match_id: number
  league_id: number
  predicted_home: number
  predicted_away: number
  created_at: string
}

export interface PointEntry {
  id: number
  user_id: string
  match_id: number
  league_id: number
  points: number
}

// Used for the leaderboard view — profile joined with total points
export interface LeaderboardEntry {
  user_id: string
  display_name: string
  total_points: number
}

// Used in the prediction UI — match with the current user's prediction attached
export interface MatchWithPrediction extends Match {
  prediction: Prediction | null
}

export interface League {
  id: number
  name: string
  invite_code: string
  created_by: string
  created_at: string
}

export interface LeagueMember {
  league_id: number
  user_id: string
  joined_at: string
}
