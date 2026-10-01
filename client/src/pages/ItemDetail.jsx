import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getItem } from '../api'
import StatusBadge from '../components/StatusBadge'

// Turns "2026-09-29T00:00:00.000Z" into "29 September 2026".
const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

// A tiny component for one "label: value" pair in the details grid.
function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}

export default function ItemDetail() {
  // The id from the URL, e.g. /items/abc123 gives "abc123".
  const { id } = useParams()
  // The item data. null until the server answers.
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch the item whenever the id changes. [id] is the dependency list.
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getItem(id, controller.signal)
        setItem(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()

    return () => controller.abort()
  }, [id])

  if (loading) return <p className="text-slate-500">Loading item...</p>

  if (error)
    return (
      <div>
        <p className="text-red-600">Error: {error}</p>
        <Link to="/browse" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
          ← Back to browse
        </Link>
      </div>
    )

  // Safety net: if for any reason there's no item, draw nothing.
  if (!item) return null

  const isFound = item.type === 'found'

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/browse" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Back to browse
      </Link>

      <article className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
        {/* Top row: LOST/FOUND label and the status badge. */}
        <div className="flex items-center justify-between">
          <span
            className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
              isFound ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {item.type}
          </span>
          <StatusBadge status={item.status} />
        </div>

        <h1 className="mt-3 text-2xl font-bold">{item.title}</h1>
        {/* whitespace-pre-line keeps any line breaks the poster typed. */}
        <p className="mt-2 whitespace-pre-line text-slate-600">{item.description}</p>

        {/* A grid of facts: 1 column on phones, 2 on wider screens. */}
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail label="Category" value={item.category} />
          <Detail label="Location" value={item.location} />
          <Detail label={isFound ? 'Date found' : 'Date lost'} value={formatDate(item.dateOccurred)} />
          <Detail label="Posted by" value={item.contactName} />
        </dl>

        {/* Contact info. Found items hide the phone until ownership is verified (built on Day 5). */}
        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm">
          {isFound ? (
            <>
              <p className="font-medium">Is this yours?</p>
              <p className="mt-1 text-slate-600">
                Ownership is checked with a question. The finder's contact details are shared after your answer is
                verified.
              </p>
              {item.verifyQuestion && (
                <p className="mt-2">
                  <span className="font-medium">Verification question:</span> {item.verifyQuestion}
                </p>
              )}
              <p className="mt-2 text-slate-500">Claims so far: {item.claimsCount}</p>
            </>
          ) : (
            <>
              <p className="font-medium">Found this item?</p>
              <p className="mt-1 text-slate-600">
                Please call {item.contactName} on{' '}
                <a href={`tel:${item.contactPhone}`} className="font-semibold text-indigo-600">
                  {item.contactPhone}
                </a>
                .
              </p>
            </>
          )}
        </div>
      </article>
    </div>
  )
}