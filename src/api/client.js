const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// The CSRF token is delivered as a same-origin-readable cookie AND echoed in
// the JSON body of auth responses. The cookie approach only works when
// frontend and backend share an origin (e.g. the dev proxy) — cookies set by
// a different origin (e.g. the deployed API on Render vs the app on Vercel)
// are invisible to this page's document.cookie no matter what SameSite says.
// So the in-memory value from the response body is the source of truth;
// falling back to the cookie only helps in the same-origin dev case.
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
    const error = new Error(err.message || `Request failed (${res.status})`)
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
