import type { PoolClient } from 'pg'

import { ensureSchema, getDb } from '@/lib/db'

const DEFAULT_SESSION_NAME = 'Sess\u00e3o Voyeurs'

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
  sessionName: string
  suggestedBy: string
  posterUrl: string | null
  votes: number
  finishedAt: string
  roundNumber: number
  voterNames: string[]
  roundMovies: Array<{
    title: string
    suggestedBy: string
  }>
}

export type HistorySession = {
  sessionName: string
  currentRound: number
  winners: AppWinner[]
}

export type HistoryPayload = {
  sessions: HistorySession[]
}

export type SessionPayload = {
  sessionName: string
  currentRound: number
  ownerName: string | null
  participants: string[]
  movies: AppMovie[]
  votes: Record<string, string>
  winners: AppWinner[]
}

export type ActiveSessionPayload = {
  activeSession: SessionPayload | null
}

type SessionRow = {
  id: number
  name: string
  current_round: number
  status: 'active' | 'closed' | 'cancelled'
  owner_name: string | null
}

type SessionSummaryRow = {
  id: number
  name: string
  current_round: number
}

function normalizeSessionName(sessionName: string) {
  return sessionName.trim() || DEFAULT_SESSION_NAME
}

async function getSessionByName(client: PoolClient, sessionName: string) {
  const existing = await client.query<SessionRow>(
    `SELECT id, name, current_round, status
            , owner_name
     FROM sessions
     WHERE name = $1
     LIMIT 1`,
    [normalizeSessionName(sessionName)],
  )

  return existing.rows[0] ?? null
}

async function getActiveSession(client: PoolClient) {
  const activeSession = await client.query<SessionRow>(
    `SELECT id, name, current_round, status
            , owner_name
     FROM sessions
     WHERE status = 'active'
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
  )

  return activeSession.rows[0] ?? null
}

async function createSession(client: PoolClient, sessionName: string, ownerName: string) {
  const created = await client.query<SessionRow>(
    `INSERT INTO sessions (name, status, owner_name)
     VALUES ($1, 'active', $2)
     RETURNING id, name, current_round, status, owner_name`,
    [normalizeSessionName(sessionName), ownerName.trim()],
  )

  return created.rows[0]
}

async function ensureSessionOwner(client: PoolClient, session: SessionRow, ownerName: string) {
  if (session.owner_name) {
    return session
  }

  const updated = await client.query<SessionRow>(
    `UPDATE sessions
     SET owner_name = $2
     WHERE id = $1
     RETURNING id, name, current_round, status, owner_name`,
    [session.id, ownerName.trim()],
  )

  return updated.rows[0]
}

async function requireActiveSessionByName(client: PoolClient, sessionName: string) {
  const session = await getSessionByName(client, sessionName)

  if (!session || session.status !== 'active') {
    throw new Error('Sess\u00e3o ativa n\u00e3o encontrada')
  }

  return session
}

async function ensureParticipant(client: PoolClient, sessionId: number, userName: string) {
  const cleanName = userName.trim()
  if (!cleanName) {
    throw new Error('Nome do usu\u00e1rio \u00e9 obrigat\u00f3rio')
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

async function getRoundVoteCount(client: PoolClient, sessionId: number, roundNumber: number) {
  const votesCount = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM votes
     WHERE session_id = $1 AND round_number = $2`,
    [sessionId, roundNumber],
  )

  return Number(votesCount.rows[0]?.count ?? '0')
}

function assertSessionOwner(session: SessionRow, userName: string, actionLabel: string) {
  const cleanUserName = userName.trim()

  if (!cleanUserName) {
    throw new Error('Nome do usuário é obrigatório')
  }

  if (session.owner_name !== cleanUserName) {
    throw new Error(
      session.owner_name
        ? `Somente ${session.owner_name} pode ${actionLabel}`
        : `Somente o criador da sessão pode ${actionLabel}`,
    )
  }
}

async function getWinnersForSession(client: PoolClient, sessionId: number, sessionName: string): Promise<AppWinner[]> {
  const winnersResult = await client.query<{
    id: string
    title: string
    year: number | null
    suggested_by: string
    poster_url: string | null
    votes_count: number
    closed_at: string
    round_number: number
    voter_names: string[]
    round_movies: Array<{
      title: string
      suggestedBy: string
    }>
  }>(
    `SELECT w.id::text,
            m.title,
            m.year,
            p.name AS suggested_by,
            m.poster_url,
            w.votes_count,
            w.closed_at::text,
            w.round_number,
            COALESCE(
              (
                SELECT ARRAY(
                  SELECT p2.name
                  FROM votes v2
                  INNER JOIN participants p2 ON p2.id = v2.voter_participant_id
                  WHERE v2.session_id = w.session_id
                    AND v2.round_number = w.round_number
                    AND v2.movie_id = w.movie_id
                  ORDER BY p2.name ASC
                )
              ),
              ARRAY[]::text[]
            ) AS voter_names,
            COALESCE(
              (
                SELECT JSONB_AGG(
                  JSONB_BUILD_OBJECT(
                    'title', m2.title,
                    'suggestedBy', p3.name
                  )
                  ORDER BY m2.created_at ASC
                )
                FROM movies m2
                INNER JOIN participants p3 ON p3.id = m2.added_by_participant_id
                WHERE m2.session_id = w.session_id
                  AND m2.round_number = w.round_number
              ),
              '[]'::jsonb
            ) AS round_movies
     FROM winners w
     INNER JOIN movies m ON m.id = w.movie_id
     INNER JOIN participants p ON p.id = m.added_by_participant_id
     WHERE w.session_id = $1
     ORDER BY w.closed_at DESC
     LIMIT 30`,
    [sessionId],
  )

  return winnersResult.rows.map((winner) => ({
    id: winner.id,
    title: winner.title,
    year: winner.year,
    sessionName,
    suggestedBy: winner.suggested_by,
    posterUrl: winner.poster_url,
    votes: winner.votes_count,
    finishedAt: winner.closed_at,
    roundNumber: winner.round_number,
    voterNames: winner.voter_names ?? [],
    roundMovies: winner.round_movies ?? [],
  }))
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

  const winners = await getWinnersForSession(client, session.id, session.name)

  const votes = votesResult.rows.reduce<Record<string, string>>((acc, vote) => {
    acc[vote.voter_name] = vote.movie_id
    return acc
  }, {})

  return {
    sessionName: session.name,
    currentRound: session.current_round,
    ownerName: session.owner_name,
    participants: participantsResult.rows.map((row) => row.name),
    movies: moviesResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      year: row.year,
      addedBy: row.added_by,
      posterUrl: row.poster_url,
    })),
    votes,
    winners,
  }
}

export async function getHistoryState(): Promise<HistoryPayload> {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    const sessionsResult = await client.query<SessionSummaryRow>(
      `SELECT s.id, s.name, s.current_round
       FROM sessions s
       LEFT JOIN LATERAL (
         SELECT MAX(w.closed_at) AS latest_closed_at
         FROM winners w
         WHERE w.session_id = s.id
       ) history ON true
       ORDER BY history.latest_closed_at DESC NULLS LAST, s.created_at DESC`,
    )

    const sessions = await Promise.all(
      sessionsResult.rows.map(async (session) => ({
        sessionName: session.name,
        currentRound: session.current_round,
        winners: await getWinnersForSession(client, session.id, session.name),
      })),
    )

    return { sessions }
  } finally {
    client.release()
  }
}

export async function getActiveSessionState(): Promise<ActiveSessionPayload> {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    const session = await getActiveSession(client)

    if (!session) {
      return { activeSession: null }
    }

    return { activeSession: await buildSessionPayload(client, session) }
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

    const activeSession = await getActiveSession(client)
    const requestedSessionName = sessionName.trim()
    let session = activeSession

    if (activeSession) {
      if (requestedSessionName && requestedSessionName !== activeSession.name) {
        throw new Error('J\u00e1 existe uma sess\u00e3o ativa em andamento')
      }

      session = await ensureSessionOwner(client, activeSession, userName)
    } else {
      session = await createSession(client, sessionName, userName)
    }

    if (!session) {
      throw new Error('N\u00e3o foi poss\u00edvel carregar a sess\u00e3o ativa')
    }

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
    const session = await requireActiveSessionByName(client, input.sessionName)
    const participant = await ensureParticipant(client, session.id, input.userName)

    const existing = await client.query<{ id: string }>(
      `SELECT id::text
       FROM movies
       WHERE session_id = $1 AND round_number = $2 AND added_by_participant_id = $3
       LIMIT 1`,
      [session.id, session.current_round, participant.id],
    )

    if (existing.rowCount) {
      throw new Error('Voc\u00ea j\u00e1 sugeriu um filme nesta rodada')
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

export async function updateMovieSuggestion(input: {
  sessionName: string
  userName: string
  movieId: string
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
    const session = await requireActiveSessionByName(client, input.sessionName)
    const participant = await ensureParticipant(client, session.id, input.userName)
    const roundVoteCount = await getRoundVoteCount(client, session.id, session.current_round)

    if (roundVoteCount > 0) {
      throw new Error('Sua sugestão só pode ser alterada antes do primeiro voto')
    }

    const movie = await client.query<{ id: string }>(
      `SELECT id::text
       FROM movies
       WHERE id = $1
         AND session_id = $2
         AND round_number = $3
         AND added_by_participant_id = $4
       LIMIT 1`,
      [input.movieId, session.id, session.current_round, participant.id],
    )

    if (!movie.rowCount) {
      throw new Error('Sua sugestão não foi encontrada nesta rodada')
    }

    await client.query(
      `UPDATE movies
       SET title = $2,
           year = $3,
           external_id = $4,
           poster_url = $5
       WHERE id = $1`,
      [
        input.movieId,
        input.title.trim(),
        input.year,
        input.externalId ?? null,
        input.posterUrl ?? null,
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
    const session = await requireActiveSessionByName(client, input.sessionName)
    const participant = await ensureParticipant(client, session.id, input.userName)

    const movie = await client.query<{ id: string; added_by_participant_id: number }>(
      `SELECT id::text, added_by_participant_id
       FROM movies
       WHERE id = $1 AND session_id = $2 AND round_number = $3
       LIMIT 1`,
      [input.movieId, session.id, session.current_round],
    )

    if (!movie.rowCount) {
      throw new Error('Filme n\u00e3o encontrado nesta rodada')
    }

    if (movie.rows[0].added_by_participant_id === participant.id) {
      throw new Error('N\u00e3o \u00e9 permitido votar no pr\u00f3prio filme')
    }

    await client.query(
      `INSERT INTO votes (session_id, round_number, voter_participant_id, movie_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (session_id, round_number, voter_participant_id)
       DO UPDATE SET movie_id = EXCLUDED.movie_id,
                     created_at = NOW()`,
      [session.id, session.current_round, participant.id, input.movieId],
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

export async function cancelVote(input: {
  sessionName: string
  userName: string
}) {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await requireActiveSessionByName(client, input.sessionName)
    const participant = await ensureParticipant(client, session.id, input.userName)

    await client.query(
      `DELETE FROM votes
       WHERE session_id = $1
         AND round_number = $2
         AND voter_participant_id = $3`,
      [session.id, session.current_round, participant.id],
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

export async function closeRound(sessionName: string, userName: string) {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await requireActiveSessionByName(client, sessionName)
    assertSessionOwner(session, userName, 'fechar a rodada')

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
      throw new Error('N\u00e3o h\u00e1 filmes para fechar a rodada')
    }

    if ((winner.rows[0].votes_count ?? 0) <= 0) {
      throw new Error('Ainda n\u00e3o h\u00e1 votos para definir vencedor')
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
       RETURNING id, name, current_round, status, owner_name`,
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

export async function cancelRound(sessionName: string, userName: string) {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await requireActiveSessionByName(client, sessionName)
    assertSessionOwner(session, userName, 'cancelar a rodada')

    await client.query(
      `DELETE FROM votes
       WHERE session_id = $1
         AND round_number = $2`,
      [session.id, session.current_round],
    )

    await client.query(
      `DELETE FROM movies
       WHERE session_id = $1
         AND round_number = $2`,
      [session.id, session.current_round],
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

export async function closeSession(sessionName: string, userName: string): Promise<ActiveSessionPayload> {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await requireActiveSessionByName(client, sessionName)
    assertSessionOwner(session, userName, 'encerrar a sessão')

    await client.query(
      `UPDATE sessions
       SET status = 'closed',
           closed_at = NOW()
       WHERE id = $1
         AND status = 'active'`,
      [session.id],
    )

    await client.query('COMMIT')
    return { activeSession: null }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function cancelSession(sessionName: string, userName: string): Promise<ActiveSessionPayload> {
  await ensureSchema()
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const session = await requireActiveSessionByName(client, sessionName)
    assertSessionOwner(session, userName, 'cancelar a sessão')

    await client.query(
      `DELETE FROM sessions
       WHERE id = $1`,
      [session.id],
    )

    await client.query('COMMIT')
    return { activeSession: null }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
