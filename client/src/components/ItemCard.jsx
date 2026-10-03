import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

// Props: "item" is one item object from the API.
export default function ItemCard({ item }) {
  // True when the item was lost, so we can colour its label differently.
  const isLost = item.type === 'lost'
  // Turn the ISO date string into something readable like "29 Sept 2026".
  const date = new Date(item.dateOccurred).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    // The whole card is a link to this item's detail page. item._id is MongoDB's id.
    <Link
      to={`/items/${item._id}`}
      className="block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* Top row: Lost/Found label on the left, status badge on the right. */}
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
            isLost ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {item.type}
        </span>
        {/* Child component: we pass the status down as a prop. */}
        <StatusBadge status={item.status} />
      </div>

      {/* Title and a description limited to 2 lines (line-clamp-2). */}
            <h3 className="break-words text-lg font-semibold">{item.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>

      {/* Small details row. flex-wrap lets it wrap on narrow screens. */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>📍 {item.location}</span>
        <span>🏷️ {item.category}</span>
        <span>📅 {date}</span>
      </div>
    </Link>
  )
}