import { useState } from 'react'
// useNavigate lets code change the page (the form doesn't use a Link for this).
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createItem } from '../api'
import ReportForm from '../components/ReportForm'

export default function Report() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') === 'found' ? 'found' : 'lost'
  const navigate = useNavigate()
  // True while the request is running.
  const [submitting, setSubmitting] = useState(false)
  // A message if the server rejects the data.
  const [serverError, setServerError] = useState('')

  // Called by the form after its own validation passes. "values" is the form data.
  const handleSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    try {
      // Send it to POST /api/items. The server answers with the saved item.
      const item = await createItem(values)
      // Go to the new item's page using the id the database gave it.
      navigate(`/items/${item._id}`)
    } catch (err) {
      // Show the server's message under the form and let the user try again.
      setServerError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Report an item</h1>
      <p className="mb-6 text-sm text-slate-500">Fill in the details so the right person can find it.</p>
      <ReportForm
        key={type}
        initialValues={{ type }}
        onSubmit={handleSubmit}
        submitLabel="Post item"
        submitting={submitting}
        serverError={serverError}
      />
    </div>
  )
}