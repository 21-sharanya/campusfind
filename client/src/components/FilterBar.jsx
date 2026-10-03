import { CATEGORIES, LOCATIONS } from '../constants'

// The three buttons for the lost/found filter. An empty value means "no filter".
const typeOptions = [
  { value: '', label: 'All' },
  { value: 'lost', label: 'Lost' },
  { value: 'found', label: 'Found' },
]

// Shared Tailwind classes for the dropdowns.
const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

// This component owns NO state. The filter values live in the parent (Browse) and arrive as props.
// onChange(name, value) tells the parent which filter changed. This pattern is called "lifting state up".
export default function FilterBar({ filters, onChange, onClear }) {
  // True if at least one filter has a value. Only then do we show the Clear button.
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
      {/* type="search" gives a search-style box with a built-in clear (x) button in some browsers. */}
      <input
        type="search"
        value={filters.q}
        onChange={(e) => onChange('q', e.target.value)}
        placeholder="Search by title or description..."
        className={selectClass}
      />

      {/* Lost / Found chips. The active one is filled in. */}
      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange('type', option.value)}
            className={`rounded-full border px-4 py-1 text-sm font-medium ${
              filters.type === option.value
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Three dropdowns side by side on wider screens, stacked on phones. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
          className={selectClass}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.location}
          onChange={(e) => onChange('location', e.target.value)}
          className={selectClass}
        >
          <option value="">All locations</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          className={selectClass}
        >
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="claimed">Claimed</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {hasFilters && (
        <button type="button" onClick={onClear} className="text-sm font-medium text-indigo-600 hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  )
}