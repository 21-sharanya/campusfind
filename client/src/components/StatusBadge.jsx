// A lookup object: each status maps to its own colour classes.
const styles = {
  open: 'bg-green-100 text-green-800',
  claimed: 'bg-yellow-100 text-yellow-800',
  returned: 'bg-slate-200 text-slate-700',
}

// A component with PROPS: the parent passes { status } and this component displays it.
export default function StatusBadge({ status }) {
  return (
    // styles[status] picks the colours. "|| styles.open" is a safe fallback for unknown values.
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        styles[status] || styles.open
      }`}
    >
      {status}
    </span>
  )
}