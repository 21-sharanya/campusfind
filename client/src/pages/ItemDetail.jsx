import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteItem, getItem, updateItem } from '../api'
import PinModal from '../components/PinModal'
import StatusBadge from '../components/StatusBadge'

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Which modal is open: null (none), 'returned' or 'delete'.
  const [modal, setModal] = useState(null)

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

  // Called by the modal with the PIN. If it throws, the modal shows the error message.
  const handleMarkReturned = async (pin) => {
    // PUT only the field we want to change.
    const updated = await updateItem(id, { status: 'returned' }, pin)
    // Replace the item in state so the badge changes right away.
    setItem(updated)
    // Close the modal.
    setModal(null)
  }

  const handleDelete = async (pin) => {
    await deleteItem(id, pin)
    // The item is gone, so go back to the list.
    navigate('/browse')
  }

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

  if (!item) return null

  const isFound = item.type === 'found'

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/browse" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Back to browse
      </Link>

      <article className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
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
        <p className="mt-2 whitespace-pre-line text-slate-600">{item.description}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail label="Category" value={item.category} />
          <Detail label="Location" value={item.location} />
          <Detail label={isFound ? 'Date found' : 'Date lost'} value={formatDate(item.dateOccurred)} />
          <Detail label="Posted by" value={item.contactName} />
        </dl>

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

        {/* Manage section: every action asks for the PIN, so only the poster can use it. */}
        <div className="mt-6 border-t pt-4">
          <p className="mb-3 text-sm font-medium text-slate-500">Posted this? Manage it with your PIN</p>
          <div className="flex flex-wrap gap-2">
            {/* Hide "Mark returned" once the item is already returned. */}
            {item.status !== 'returned' && (
              <button
                onClick={() => setModal('returned')}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Mark as returned
              </button>
            )}
            {/* The edit page itself is built in Commit 6. */}
            <Link
              to={`/items/${id}/edit`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Edit
            </Link>
            <button
              onClick={() => setModal('delete')}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </article>

      {/* Render a modal only when its name is stored in the "modal" state. */}
      {modal === 'returned' && (
        <PinModal
          title="Mark this item as returned?"
          confirmLabel="Mark returned"
          onConfirm={handleMarkReturned}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'delete' && (
        <PinModal
          title="Delete this post?"
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}