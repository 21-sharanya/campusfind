// useState stores data. useEffect runs code after the page appears (here: to fetch data).
import { useEffect, useState } from 'react'
import { getItems } from '../api'
import ItemCard from '../components/ItemCard'

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
      {/* A responsive grid: 1 column on phones, 2 on small screens, 3 on large. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* map turns each item into a card. "key" helps React track each one. */}
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  )
}