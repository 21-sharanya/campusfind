import { useState } from 'react'
import { addClaim } from '../api'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

// Props: item (the found item being claimed) and onClaimed (a function the parent runs after a claim is saved).
export default function ClaimForm({ item, onClaimed }) {
  // The three fields the claimer fills in.
  const [form, setForm] = useState({ claimerName: '', contact: '', answer: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  // True after a successful claim. We then replace the form with a thank-you message.
  const [sent, setSent] = useState(false)

  // One change handler for all three inputs, using the input's name.
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Quick check before calling the server.
    if (!form.claimerName.trim() || !form.contact.trim() || !form.answer.trim()) {
      setError('Please fill in all three fields')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await addClaim(item._id, form)
      // Show the thank-you message...
      setSent(true)
      // ...and tell the parent so it can update the claim counter and status on screen.
      onClaimed()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // After a successful claim, show this instead of the form.
  if (sent) {
    return (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Your claim has been sent. If your answer is correct, the finder will contact you on{' '}
        <span className="font-semibold">{form.contact}</span>.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-indigo-200 bg-white p-4">
      <h3 className="font-semibold text-indigo-900">Claim this item</h3>

      {/* The finder's question. If an older item has none, show a general instruction instead. */}
      <p className="text-sm text-slate-700">
        <span className="font-medium">Question:</span>{' '}
        {item.verifyQuestion || 'Describe something only the owner would know about this item.'}
      </p>

      <label className="block text-sm font-medium text-slate-700">
        Your answer
        <input name="answer" value={form.answer} onChange={handleChange} maxLength={200} className={inputClass} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Your name
          <input
            name="claimerName"
            value={form.claimerName}
            onChange={handleChange}
            maxLength={60}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Your phone or email
          <input name="contact" value={form.contact} onChange={handleChange} maxLength={60} className={inputClass} />
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? 'Sending...' : 'Send claim'}
      </button>
    </form>
  )
}