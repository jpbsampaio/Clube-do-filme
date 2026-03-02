import type { PoolClient } from 'pg'
import { ensureSchema, getDb } from '@/lib/db'

export type AppMovie = {
  id: string
  title: string
  year: number | null
  addedBy: string
  posterUrl: string | null
}

export type AppWinner = {
  id: string
  title: string
  year: number | null
  suggestedBy: string
  votes: number
  finishedAt: string
}

export type SessionPayload = {
  sessionName: string
  currentRound: number
  participants: string[]
  movies: AppMovie[]
  votes: Record<string, string>
  winners: AppWinner[]
}

type SessionRow = {
  id: number
  name: string
  current_round: number
}

async function getOrCreateSession(client: PoolClient, sessionName: string) {
  const normalizedName = sessionName.trim() || 'Sessão Voyeurs'

  const existing = await client.query<SessionRow>(
    'SELECT id, name, current_round FROM sessions WHERE name = $1 LIMIT 1',
    [normalizedName],
  )

  if (existing.rowCount) {
    return existing.rows[0]
  }

  const created = await client.query<SessionRow>(
    `INSERT INTO sessions (name)
     VALUES ($1)
     RETURNING id, name, current_round`,
    [normalizedName],
  )

  return created.rows[0]
}

async function ensureParticipant(client: PoolClient, sessionId: number, userName: string) {
  const cleanName = userName.trim()
  if (!cleanName) {
    throw new Error('Nome do usuário é obrigatório')
  }

  const participant = await client.query<{ id: number; name: string }>(
    `INSERT INTO participants (session_id, name)
     VALUES ($1, $2)
     ON CONFLICT (session_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name`,
    [sessionId, cleanName],
  )

  return participant.rows[0]
}

async function buildSessionPayload(client: PoolClient, session: SessionRow): Promise<SessionPayload> {
  const participantsResult = await client.query<{ name: string }>(
    `SELECT name
     FROM participants
     WHERE session_id = $1
     ORDER BY name ASC`,
    [session.id],
  )

  const moviesResult = await client.query<{
    id: string
    title: string
    year: number | null
    added_by: string
    poster_url: string | null
  }>(
    `SELECT m.id::text,
            m.title,
            m.year,
            p.name AS added_by,
            m.poster_url
     FROM movies m
     INNER JOIN participants p ON p.id = m.added_by_participant_id
     WHERE m.session_id = $1 AND m.round_number = $2
     ORDER BY m.created_at ASC`,
    [session.id, session.current_round],
  )

  const votesResult = await client.query<{ voter_name: string; movie_id: string }>(
    `SELECT p.name AS voter_name,
            v.movie_id::text
     FROM votes v
     INNER JOIN participants p ON p.id = v.voter_participant_id
     WHERE v.session_id = $1 AND v.round_number = $2`,
    [session.id, session.current_round],
  )

  const winnersResult = await client.query<{
    id: string
    title: string
    year: number | null
    suggested_by: string
    votes_count: number
    closed_at: string
  }>(
    `SELECT w.id::text,
            m.title,
            m.year,
            p.name AS suggested_by,
            w.votes_count,
            w.closed_at::text
     FROM winners w
     INNER JOIN movies m ON m.id = w.movie_id
     INNER JOIN participants p ON p.id = m.added_by_participant_id
     WHERE w.session_id = $1
     ORDER BY w.closed_at DESC
     LIMIT 30`,
    [session.id],
  )

  const votes = votesResult.rows.reduce<Record<string, string>>((acc, vote) => {
    acc[vote.voter_name] = vote.movie_id
    return acc
  }, {})

  return {
    sessionName: session.name,
    currentRound: session.current_round,
    participants: participantsResult.rows.map((row) => row.name),
    movies: moviesResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      year: row.year,
      addedBy: row.added_by,
      posterUrl: row.poster_url,
    })),
    votes,
    winners: winnersResult.rows.map((winner) => ({
      id: winner.id,
      title: winner.title,
      year: winner.year,
      suggestedBy: winner.suggested_by,
      votes: winner.votes_count,
      finishedAt: winner.closed_at,
    })),
  }
}

export async function getSessionState(sessionName: string) {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    const session = await getOrCreateSession(client, sessionName)
    return await buildSessionPayload(client, session)
  } finally {
    client.release()
  }
}

export async function joinSession(sessionName: string, userName: string) {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await getOrCreateSession(client, sessionName)
    await ensureParticipant(client, session.id, userName)
    const payload = await buildSessionPayload(client, session)
    await client.query('COMMIT')
    return payload
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function addMovieSuggestion(input: {
  sessionName: string
  userName: string
  title: string
  year: number | null
  externalId?: string | null
  posterUrl?: string | null
}) {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await getOrCreateSession(client, input.sessionName)
    const participant = await ensureParticipant(client, session.id, input.userName)

    const existing = await client.query<{ id: string }>(
      `SELECT id::text
       FROM movies
       WHERE session_id = $1 AND round_number = $2 AND added_by_participant_id = $3
       LIMIT 1`,
      [session.id, session.current_round, participant.id],
    )

    if (existing.rowCount) {
      throw new Error('Você já sugeriu um filme nesta rodada')
    }

    await client.query(
      `INSERT INTO movies (session_id, round_number, title, year, external_id, poster_url, added_by_participant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        session.id,
        session.current_round,
        input.title.trim(),
        input.year,
        input.externalId ?? null,
        input.posterUrl ?? null,
        participant.id,
      ],
    )

    const payload = await buildSessionPayload(client, session)
    await client.query('COMMIT')
    return payload
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function registerVote(input: {
  sessionName: string
  userName: string
  movieId: string
}) {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await getOrCreateSession(client, input.sessionName)
    const participant = await ensureParticipant(client, session.id, input.userName)

    const movie = await client.query<{ id: string; added_by_participant_id: number }>(
      `SELECT id::text, added_by_participant_id
       FROM movies
       WHERE id = $1 AND session_id = $2 AND round_number = $3
       LIMIT 1`,
      [input.movieId, session.id, session.current_round],
    )

    if (!movie.rowCount) {
      throw new Error('Filme não encontrado nesta rodada')
    }

    if (movie.rows[0].added_by_participant_id === participant.id) {
      throw new Error('Não é permitido votar no próprio filme')
    }

    const vote = await client.query(
      `INSERT INTO votes (session_id, round_number, voter_participant_id, movie_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (session_id, round_number, voter_participant_id) DO NOTHING`,
      [session.id, session.current_round, participant.id, input.movieId],
    )

    if (vote.rowCount === 0) {
      throw new Error('Você já votou nesta rodada')
    }

    const payload = await buildSessionPayload(client, session)
    await client.query('COMMIT')
    return payload
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function closeRound(sessionName: string) {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await getOrCreateSession(client, sessionName)

    const winner = await client.query<{ movie_id: string; votes_count: number }>(
      `SELECT m.id::text AS movie_id,
              COUNT(v.id)::int AS votes_count
       FROM movies m
       LEFT JOIN votes v
         ON v.movie_id = m.id
         AND v.session_id = m.session_id
         AND v.round_number = m.round_number
       WHERE m.session_id = $1
         AND m.round_number = $2
       GROUP BY m.id, m.title
       ORDER BY votes_count DESC, m.title ASC
       LIMIT 1`,
      [session.id, session.current_round],
    )

    if (!winner.rowCount) {
      throw new Error('Não há filmes para fechar a rodada')
    }

    if ((winner.rows[0].votes_count ?? 0) <= 0) {
      throw new Error('Ainda não há votos para definir vencedor')
    }

    await client.query(
      `INSERT INTO winners (session_id, round_number, movie_id, votes_count)
       VALUES ($1, $2, $3, $4)`,
      [session.id, session.current_round, winner.rows[0].movie_id, winner.rows[0].votes_count],
    )

    const updated = await client.query<SessionRow>(
      `UPDATE sessions
       SET current_round = current_round + 1
       WHERE id = $1
       RETURNING id, name, current_round`,
      [session.id],
    )

    const payload = await buildSessionPayload(client, updated.rows[0])
    await client.query('COMMIT')
    return payload
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
