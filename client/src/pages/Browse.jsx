import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
// useState stores data. useEffect runs code after the page appears (here: to fetch data).
import { useEffect, useState } from 'react'
// Our helper that calls GET /api/items.
import { getItems } from '../api'
// The grid component that receives the list and draws one card per item.
import ItemGrid from '../components/ItemGrid'

export default function Browse() {
  // The list of items. It starts empty.
  const [items, setItems] = useState([])
  // True while we wait for the server.
  const [loading, setLoading] = useState(true)
  // Holds an error message if the request fails.
  const [error, setError] = useState('')

  // The effect runs once, after the first render, because the dependency list [] is empty.
  useEffect(() => {
    // AbortController lets us cancel the request if the page closes before it finishes.
    const controller = new AbortController()

    // Effects can't be async themselves, so we define an async function inside and call it.
    async function load() {
      try {
        // Ask the API for items. controller.signal connects this request to the controller.
        const data = await getItems({}, controller.signal)
        // Store the items. React re-renders the page with them.
        setItems(data)
      } catch (err) {
        // An abort is expected when leaving the page, so don't treat it as an error.
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        // Stop the loading state, unless the request was cancelled.
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()

    // The cleanup function runs when the component is removed. It cancels any request still running.
    return () => controller.abort()
  }, [])

  // While loading, show a message and stop here.
  if (loading) return <p className="text-slate-500">Loading items...</p>
  // If something failed, show the error.
  if (error) return <p className="text-red-600">Error: {error}</p>
  // If the list is empty, say so.
  if (items.length === 0) return <p className="text-slate-500">No items posted yet.</p>

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Browse items</h1>
      {/* Parent to child: Browse passes the whole list down as the "items" prop. ItemGrid draws the cards. */}
      <ItemGrid items={items} />
    </div>
  )
}