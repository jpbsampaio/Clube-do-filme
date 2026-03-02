import { Pool } from 'pg'

let pool: Pool | null = null
let schemaPromise: Promise<void> | null = null

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada')
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }

  return pool
}

const schemaSql = `
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  current_round INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, name)
);

CREATE TABLE IF NOT EXISTS movies (
  id BIGSERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  external_id TEXT,
  poster_url TEXT,
  added_by_participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id BIGSERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  voter_participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, round_number, voter_participant_id)
);

CREATE TABLE IF NOT EXISTS winners (
  id BIGSERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  votes_count INTEGER NOT NULL,
  closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movies_session_round ON movies(session_id, round_number);
CREATE INDEX IF NOT EXISTS idx_votes_session_round ON votes(session_id, round_number);
CREATE INDEX IF NOT EXISTS idx_winners_session_closed ON winners(session_id, closed_at DESC);
`

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const db = getPool()
      await db.query(schemaSql)
    })()
  }

  await schemaPromise
}

export function getDb() {
  return getPool()
}
