import { useState } from 'react'

// Turn a stored timestamp into something like "3 Oct 2026, 4:15 pm".
const formatTime = (value) =>
  new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

// Show a 10-digit phone number as a tappable link, and anything else (an email) as plain text.
function Contact({ value }) {
  return /^\d{10}$/.test(value) ? (
    <a href={`tel:${value}`} className="font-semibold text-indigo-600">
      {value}
    </a>
  ) : (
    <span className="font-semibold">{value}</span>
  )
}

// Props: question (the verification question), claims (the list), canReturn (show the button?),
// onMarkReturned (async function), onClose.
export default function ClaimsList({ question, claims, canReturn, onMarkReturned, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleReturn = async () => {
    setBusy(true)
    setError('')
    try {
      await onMarkReturned()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    // Dark backdrop. Clicking it closes the pop-up.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      {/* Clicks inside the white box must not reach the backdrop. max-h + overflow-y-auto lets long lists scroll. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold">Claims on your item</h2>
        {question && (
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-medium">Your question:</span> {question}
          </p>
        )}

        {claims.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No claims yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {claims.map((claim) => (
              <li key={claim._id} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-semibold">{claim.claimerName}</span>
                  <span className="text-xs text-slate-500">{formatTime(claim.createdAt)}</span>
                </div>
                {/* The answer stands out, because it is what the poster must judge. */}
                <p className="mt-2 rounded bg-indigo-50 px-2 py-1.5">
                  <span className="text-xs font-semibold uppercase text-indigo-700">Answer: </span>
                  {claim.answer}
                </p>
                <p className="mt-2">
                  Contact: <Contact value={claim.contact} />
                </p>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Only hand the item over to someone whose answer is right. Then mark it as returned.
        </p>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Close
          </button>
          {canReturn && (
            <button
              onClick={handleReturn}
              disabled={busy}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {busy ? 'Saving...' : 'Mark as returned'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}