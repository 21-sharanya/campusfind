import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteItem, getClaims, getItem, updateItem } from '../api'
import ClaimForm from '../components/ClaimForm'
import ClaimsList from '../components/ClaimsList'
import ErrorMessage from '../components/ErrorMessage'
import MatchPanel from '../components/MatchPanel'
import PinModal from '../components/PinModal'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words font-medium">{value}</dd>
    </div>
  )
}

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Which pop-up is open: null, 'returned', 'delete', 'claims' (asking for the PIN) or 'claimsList' (showing the claims).
  const [modal, setModal] = useState(null)
  // The claims we fetched, plus the PIN that unlocked them (so "Mark as returned" doesn't ask again).
  const [claimData, setClaimData] = useState(null)

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

  const handleMarkReturned = async (pin) => {
    const updated = await updateItem(id, { status: 'returned' }, pin)
    setItem(updated)
    setModal(null)
  }

  const handleDelete = async (pin) => {
    await deleteItem(id, pin)
    navigate('/browse')
  }

  // Called by ClaimForm after a claim is saved. Update the counter and status on screen without reloading.
  const handleClaimed = () => {
    setItem((prev) => ({
      ...prev,
      claimsCount: prev.claimsCount + 1,
      status: prev.status === 'open' ? 'claimed' : prev.status,
    }))
  }

  // Called by the PIN pop-up. If the PIN is wrong, getClaims throws and the pop-up shows the message.
  const handleViewClaims = async (pin) => {
    const list = await getClaims(id, pin)
    // Keep both the list and the PIN, then switch to the claims pop-up.
    setClaimData({ list, pin })
    setModal('claimsList')
  }

  // Close the claims pop-up and forget the PIN.
  const closeClaims = () => {
    setModal(null)
    setClaimData(null)
  }

  // "Mark as returned" from inside the claims pop-up, reusing the PIN we already have.
  const handleReturnFromClaims = async () => {
    const updated = await updateItem(id, { status: 'returned' }, claimData.pin)
    setItem(updated)
    closeClaims()
  }

  if (loading) return <Spinner label="Loading item..." />

  if (error)
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <ErrorMessage message={error} />
        <Link to="/browse" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
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

        {/* break-words stops very long words from pushing the page wider than a phone screen. */}
        <h1 className="mt-3 break-words text-2xl font-bold">{item.title}</h1>
        <p className="mt-2 whitespace-pre-line break-words text-slate-600">{item.description}</p>

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
              <p className="mt-2 text-slate-500">Claims so far: {item.claimsCount}</p>
              {/* key={item._id} resets the form when you open a different item. */}
              {item.status !== 'returned' && <ClaimForm key={item._id} item={item} onClaimed={handleClaimed} />}
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

        <div className="mt-6 border-t pt-4">
          <p className="mb-3 text-sm font-medium text-slate-500">Posted this? Manage it with your PIN</p>
          <div className="flex flex-wrap gap-2">
            {item.status !== 'returned' && (
              <button
                onClick={() => setModal('returned')}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Mark as returned
              </button>
            )}
            {/* Only found items receive claims, so only they get this button. */}
            {isFound && (
              <button
                onClick={() => setModal('claims')}
                className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                View claims ({item.claimsCount})
              </button>
            )}
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

      {/* Smart Match panel from Day 4. */}
      {item.status !== 'returned' && <MatchPanel key={item._id} itemId={item._id} itemType={item.type} />}

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
      {/* Step 1: ask for the PIN. */}
      {modal === 'claims' && (
        <PinModal
          title="View claims on this item"
          confirmLabel="View claims"
          onConfirm={handleViewClaims}
          onClose={() => setModal(null)}
        />
      )}
      {/* Step 2: once the PIN was accepted, show the claims. */}
      {modal === 'claimsList' && claimData && (
        <ClaimsList
          question={item.verifyQuestion}
          claims={claimData.list}
          canReturn={item.status !== 'returned'}
          onMarkReturned={handleReturnFromClaims}
          onClose={closeClaims}
        />
      )}
    </div>
  )
}