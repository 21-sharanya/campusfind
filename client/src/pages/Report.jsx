// useSearchParams reads the part after "?" in the URL, e.g. /report?type=found.
import { useSearchParams } from 'react-router-dom'
import ReportForm from '../components/ReportForm'

export default function Report() {
  const [searchParams] = useSearchParams()
  // If the URL says type=found use "found", otherwise default to "lost".
  const type = searchParams.get('type') === 'found' ? 'found' : 'lost'

  // For now we only print the data. Commit 2 sends it to the server.
  const handleSubmit = (values) => {
    console.log('Form values:', values)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Report an item</h1>
      <p className="mb-6 text-sm text-slate-500">Fill in the details so the right person can find it.</p>
      {/* key={type} makes React rebuild the form when the URL type changes (e.g. from the Home buttons). */}
      <ReportForm key={type} initialValues={{ type }} onSubmit={handleSubmit} submitLabel="Post item" />
    </div>
  )
}