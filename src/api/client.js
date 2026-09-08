// Always relative: the Vite dev proxy handles this in dev, and vercel.json's
// rewrite handles it in prod, forwarding to the Render backend server-side.
// Routing through an absolute cross-origin URL (the old approach) made the
// session cookie cross-site, which Safari's ITP silently blocks/purges on
// iOS — breaking both "stay logged in after refresh" and any authenticated
// request (e.g. photo upload) with no more specific error than a 401.
const BASE_URL = '/api'

// The CSRF token is delivered as a same-origin-readable cookie AND echoed in
// the JSON body of auth responses. Now that /api is always same-origin (dev
// proxy, or the prod rewrite to Render), the cookie is readable in both —
// but the in-memory value is kept as the primary source of truth regardless,
// with the cookie only as a fallback (e.g. a fresh tab before any request
// has populated the in-memory value yet).
let csrfToken = null

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Render's free tier spins the backend down after inactivity; the first
// request that wakes it can have its connection dropped mid-handshake
// (ERR_CONNECTION_CLOSED / "Failed to fetch") before the container is fully
// up. That's a network-level failure, not a real HTTP error response, so one
// short-delay retry smooths over it without masking actual API errors.
async function fetchWithRetry(url, options) {
  try {
    return await fetch(url, options)
  } catch (err) {
    await new Promise(r => setTimeout(r, 1500))
    return fetch(url, options)
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (method !== 'GET') {
    const token = csrfToken || getCookie('mc_csrf')
    if (token) headers['X-CSRF-Token'] = token
  }

  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const fallbackMessage = res.status === 502
      ? 'Request failed (502). The API gateway reached the app, but the backend is unavailable or cannot reach its database.'
      : `Request failed (${res.status})`
    const error = new Error(err.message || fallbackMessage)
    error.status = res.status
    throw error
  }
  if (res.status === 204) return null
  const data = await res.json()
  if (data?.csrfToken) csrfToken = data.csrfToken
  return data
}

export const api = {
  get:  (path)       => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put:  (path, body) => request(path, { method: 'PUT', body }),
  del:  (path)        => request(path, { method: 'DELETE' }),
}

// Called on logout so a stale token from the previous session can never be
// reused if a different account logs in within the same tab afterward.
export function clearCsrfToken() {
  csrfToken = null
}
