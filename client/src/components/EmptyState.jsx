import { Link } from 'react-router-dom'

// Shown when a list has no items. The button is optional (shown only if actionTo is given).
export default function EmptyState({ title, text, actionTo, actionLabel }) {
  return (
    <div className="rounded-xl border border-dashed bg-white p-10 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
      {actionTo && (
        <Link
          to={actionTo}
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}