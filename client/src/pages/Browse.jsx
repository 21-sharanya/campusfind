import { useEffect, useState } from 'react'
import { getItems } from '../api'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import FilterBar from '../components/FilterBar'
import ItemGrid from '../components/ItemGrid'
import Spinner from '../components/Spinner'

// The "no filter" state. Every value is an empty string.
const defaultFilters = { q: '', type: '', category: '', location: '', status: '' }

export default function Browse() {
  // Browse OWNS the filter values (the parent). FilterBar only displays and changes them via props.
  const [filters, setFilters] = useState(defaultFilters)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pull each filter into its own variable. We list them separately in the effect's dependency list below.
  const { q, type, category, location, status } = filters

  // Called by FilterBar with the name of the filter and its new value.
  const handleChange = (name, value) => {
    // Copy the old filters and replace just one value.
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Reset every filter.
  const handleClear = () => setFilters(defaultFilters)

  // Re-fetch whenever ANY filter changes, because they are all in the dependency list.
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      try {
        // getItems turns this object into ?q=...&type=... and skips empty values.
        const data = await getItems({ q, type, category, location, status }, controller.signal)
        setItems(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()

    // If a filter changes again before this request finishes, cancel the old one.
    return () => controller.abort()
  }, [q, type, category, location, status])

  // True if the user has applied any filter. Used to choose the right "empty" message.
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Browse items</h1>

      <FilterBar filters={filters} onChange={handleChange} onClear={handleClear} />

      {/* A live result count. */}
      <p className="text-sm text-slate-500">
        {loading ? 'Searching...' : `${items.length} result${items.length === 1 ? '' : 's'}`}
      </p>

      {/* Only one of these four lines shows at a time. */}
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