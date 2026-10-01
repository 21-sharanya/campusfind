import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getItem, updateItem } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import ReportForm from '../components/ReportForm'
import Spinner from '../components/Spinner'

export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  // Load the current item so we can pre-fill the form.
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const data = await getItem(id, controller.signal)
        setItem(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()

    return () => controller.abort()
  }, [id])

  const handleSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    // The PIN goes in the request header, and the type can't be changed, so neither is sent in the body.
    // "...changes" collects every remaining field.
    // eslint-disable-next-line no-unused-vars
    const { pin, type, ...changes } = values
    try {
      await updateItem(id, changes, pin)
      // Success: go back to the item's page.
      navigate(`/items/${id}`)
    } catch (err) {
      // Typically "Incorrect PIN". The user can correct it and try again.
      setServerError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner label="Loading item..." />
  if (error)
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <ErrorMessage message={error} />
        <Link to="/browse" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
          ← Back to browse
        </Link>
      </div>
    )
  if (!item) return null

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Edit your post</h1>
      <p className="mb-6 text-sm text-slate-500">Change anything you like, then enter your PIN to save.</p>
      {/* Same form as the Report page, reused in "edit mode" through props. */}
      <ReportForm
        key={item._id}
        // dateOccurred arrives as a full timestamp, but a date input needs only YYYY-MM-DD, so cut it to 10 characters.
        // pin starts empty because the server never sends it.
        initialValues={{ ...item, dateOccurred: item.dateOccurred.slice(0, 10), pin: '' }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        lockType
        pinLabel="Enter your PIN to save changes"
        submitting={submitting}
        serverError={serverError}
      />
    </div>
  )
}