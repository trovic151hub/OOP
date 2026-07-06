const BASE_URL = import.meta.env.VITE_API_URL || '/api'

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (method !== 'GET') {
    const csrfToken = getCookie('mc_csrf')
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const error = new Error(err.message || `Request failed (${res.status})`)
    error.status = res.status
    throw error
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get:  (path)       => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put:  (path, body) => request(path, { method: 'PUT', body }),
  del:  (path)        => request(path, { method: 'DELETE' }),
}
