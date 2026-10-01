import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getItems } from '../api'
import ItemGrid from '../components/ItemGrid'

export default function Home() {
  // Home is the PARENT here: it owns the items data and passes pieces of it to children.
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch all items once when the page opens (same pattern as Browse).
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const data = await getItems({}, controller.signal)
        setItems(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()

    return () => controller.abort()
  }, [])

  // Values worked out from the data. The API returns newest first, so slice(0, 3) = 3 most recent.
  const recent = items.slice(0, 3)
  // filter keeps only the items matching a condition. .length counts them.
  const openCount = items.filter((item) => item.status === 'open').length
  const returnedCount = items.filter((item) => item.status === 'returned').length

  return (
    <div className="space-y-10">
      {/* Hero section with the two main actions. */}
      <section className="rounded-2xl bg-indigo-600 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Lost something on campus? Found something?</h1>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">
          Post it here so the right person can find it. Every post is matched against others automatically.
        </p>
        {/* ?type=lost is a query string. The Report form will read it on Day 3. */}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/report?type=lost"
            className="rounded-lg bg-white px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            I lost something
          </Link>
          <Link
            to="/report?type=found"
            className="rounded-lg border border-white px-5 py-3 font-semibold hover:bg-indigo-500"
          >
            I found something
          </Link>
        </div>
      </section>

      {/* Three small stat boxes. */}
      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{items.length}</p>
          <p className="text-sm text-slate-500">Total posts</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{openCount}</p>
          <p className="text-sm text-slate-500">Still open</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{returnedCount}</p>
          <p className="text-sm text-slate-500">Returned</p>
        </div>
      </section>

      {/* Recent items section. */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent posts</h2>
          <Link to="/browse" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        {/* Show only the state that applies: loading, error, empty, or the grid. */}
        {loading && <p className="text-slate-500">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && recent.length === 0 && (
          <p className="text-slate-500">Nothing posted yet. Be the first!</p>
        )}
        {/* Parent to child: Home passes "recent" down as the "items" prop of ItemGrid. */}
        {recent.length > 0 && <ItemGrid items={recent} />}
      </section>
    </div>
  )
}