// The API address from client/.env. If it's missing, fall back to the local server.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// One helper that every API call goes through, so errors are handled in a single place.
// We separate "headers" from the other options so merging them can't accidentally replace our JSON header.
async function request(path, { headers, ...options } = {}) {
  // fetch sends the HTTP request. "await" waits for the response.
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
  // Read the JSON body. If there is no valid JSON, use null instead of crashing.
  const data = await res.json().catch(() => null)
  // res.ok is false for 4xx and 5xx statuses. Throw an Error using the server's message.
  if (!res.ok) throw new Error(data?.message || 'Request failed')
  // Otherwise return the data.
  return data
}

// Get a list of items. params is an object like { type: 'lost' } that becomes ?type=lost.
// signal lets us cancel the request (we use it inside useEffect).
export const getItems = (params = {}, signal) => {
  // Remove empty values, then convert the rest into a query string.
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value)
  ).toString()
  // Only add "?" when there is something to add.
  return request(`/items${query ? `?${query}` : ''}`, { signal })
}

// Get one item by id.
export const getItem = (id, signal) => request(`/items/${id}`, { signal })