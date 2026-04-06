export function getAdaptiveFontSize(text: string, maxRem: number, minRem: number, threshold: number, step: number) {
  const overflow = Math.max(0, text.trim().length - threshold)
  return `${Math.max(minRem, maxRem - overflow * step).toFixed(3)}rem`
}

export function getStoredValue(key: string) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setStoredValue(key: string, value: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage failures and keep the in-memory state working.
  }
}

export function removeStoredValue(key: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage failures and keep the in-memory state working.
  }
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR')
}

export function getConfirmationDescription(action: string, consequence: string) {
  return `Tem certeza que você deseja ${action}? Fazendo isso você ${consequence}.`
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(body.error ?? 'Erro inesperado')
  }

  return body
}
