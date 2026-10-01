// A small spinning circle with a label. role="status" tells screen readers it's a loading message.
export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-500" role="status">
      {/* animate-spin rotates it forever. border-t-transparent leaves a gap so the rotation is visible. */}
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      {label}
    </div>
  )
}