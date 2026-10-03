import { useEffect, useState } from 'react'
import { getItems } from '../api'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import FilterBar from '../components/FilterBar'
import ItemGrid from '../components/ItemGrid'
import Spinner from '../components/Spinner'

const defaultFilters = { q: '', type: '', category: '', location: '', status: '' }

export default function Browse() {
  const [filters, setFilters] = useState(defaultFilters)
  // NEW: the search text AFTER the user pauses typing. Only this value triggers a request.
  const [debouncedQ, setDebouncedQ] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { q, type, category, location, status } = filters

  const handleChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setFilters(defaultFilters)
    // Also reset the debounced text right away, so we don't wait 400 ms after clearing.
    setDebouncedQ('')
  }

  // EFFECT 1 (debounce): copy q into debouncedQ, but only after 400 ms with no typing.
  useEffect(() => {
    // Start a timer each time q changes.
    const timer = setTimeout(() => setDebouncedQ(q), 400)
    // Cleanup runs BEFORE the next effect, and when the component closes.
    // If the user types again within 400 ms, this cancels the old timer, so only the last one fires.
    return () => clearTimeout(timer)
  }, [q])

  // EFFECT 2 (fetch): runs when the debounced text or any dropdown/chip filter changes.
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      try {
        // Note: debouncedQ here, NOT q.
        const data = await getItems({ q: debouncedQ, type, category, location, status }, controller.signal)
        setItems(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()

    return () => controller.abort()
  }, [debouncedQ, type, category, location, status])

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Browse items</h1>

      <FilterBar filters={filters} onChange={handleChange} onClear={handleClear} />

      <p className="text-sm text-slate-500">
        {loading ? 'Searching...' : `${items.length} result${items.length === 1 ? '' : 's'}`}
      </p>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          title={hasFilters ? 'No items match your filters' : 'No items posted yet'}
          text={hasFilters ? 'Try different words or clear some filters.' : 'Be the first to report an item.'}
          actionTo={hasFilters ? undefined : '/report'}
          actionLabel="Report an item"
        />
      )}
      {!loading && !error && items.length > 0 && <ItemGrid items={items} />}
    </div>
  )
}