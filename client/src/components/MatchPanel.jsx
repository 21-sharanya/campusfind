import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMatches } from '../api'

// The highest possible score on the server (3 + 2 + 3 + 1). Keep this in sync with matchScore.js.
const MAX_SCORE = 9

// Props: itemId (which item to find matches for) and itemType ('lost' or 'found', used only for the wording).
export default function MatchPanel({ itemId, itemType }) {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const data = await getMatches(itemId, controller.signal)
        setMatches(data)
      } catch {
        // If matching fails, quietly show nothing. The rest of the page should still work.
        setMatches([])
      }
    }
    load()

    return () => controller.abort()
  }, [itemId])

  // No matches means no panel at all.
  if (matches.length === 0) return null

  return (
    <section className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <h2 className="text-lg font-bold text-indigo-900">Possible matches</h2>
      <p className="mt-1 text-sm text-indigo-800">
        {itemType === 'lost'
          ? 'These found items look similar to what you lost.'
          : 'These lost reports look similar to what you found.'}
      </p>

      <ul className="mt-4 space-y-3">
        {/* Each match is { item, score, reasons } straight from the API. We pull them apart here. */}
        {matches.map(({ item, score, reasons }) => (
          <li key={item._id}>
            <Link
              to={`/items/${item._id}`}
              className="block rounded-lg border bg-white p-3 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{item.title}</p>
                <span className="text-xs font-bold uppercase text-slate-500">{item.type}</span>
              </div>
              <p className="text-xs text-slate-500">
                📍 {item.location} · 🏷️ {item.category}
              </p>

              {/* A bar showing how strong the match is. Width is calculated, so we use an inline style. */}
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-indigo-600"
                  style={{ width: `${Math.round((score / MAX_SCORE) * 100)}%` }}
                />
              </div>

              {/* Small chips explaining WHY these two items were matched. */}
              <div className="mt-2 flex flex-wrap gap-1">
                {reasons.map((reason) => (
                  <span key={reason} className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                    {reason}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}