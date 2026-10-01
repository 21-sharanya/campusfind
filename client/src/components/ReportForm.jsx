import { useState } from 'react'
import { CATEGORIES, LOCATIONS } from '../constants'

const emptyForm = {
  type: 'lost',
  title: '',
  description: '',
  category: '',
  location: '',
  dateOccurred: '',
  contactName: '',
  contactPhone: '',
  verifyQuestion: '',
  pin: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

const today = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0]
}

// Checks every field and returns an object of error messages. An empty object means "all good".
function validate(form) {
  const errors = {}
  // trim() removes spaces at the ends, so "   " counts as empty.
  if (!form.title.trim()) errors.title = 'Title is required'
  if (!form.description.trim()) errors.description = 'Description is required'
  if (!form.category) errors.category = 'Choose a category'
  if (!form.location) errors.location = 'Choose a location'
  if (!form.dateOccurred) errors.dateOccurred = 'Pick a date'
  // Dates in YYYY-MM-DD format can be compared as plain text.
  else if (form.dateOccurred > today()) errors.dateOccurred = 'The date cannot be in the future'
  if (!form.contactName.trim()) errors.contactName = 'Your name is required'
  // ^\d{10}$ means exactly ten digits.
  if (!/^\d{10}$/.test(form.contactPhone)) errors.contactPhone = 'Enter a 10-digit phone number'
  if (form.type === 'found' && !form.verifyQuestion.trim()) {
    errors.verifyQuestion = 'Add a question so the real owner can prove it is theirs'
  }
  if (!/^\d{4}$/.test(form.pin)) errors.pin = 'PIN must be exactly 4 digits'
  return errors
}

function Field({ label, error, hint, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  )
}

// New props: submitting (true while the request is running) and serverError (a message from the server).
export default function ReportForm({
  initialValues = {},
  onSubmit,
  submitLabel = 'Submit',
  lockType = false,
  pinLabel = 'Choose a 4-digit PIN',
  submitting = false,
  serverError = '',
}) {
  const [form, setForm] = useState(() => {
    const start = { ...emptyForm }
    Object.keys(emptyForm).forEach((key) => {
      if (initialValues[key] !== undefined) start[key] = initialValues[key]
    })
    return start
  })
  // The error messages, one per field. Starts empty.
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    const cleaned = name === 'pin' || name === 'contactPhone' ? value.replace(/\D/g, '') : value
    setForm((prev) => ({ ...prev, [name]: cleaned }))
    // As soon as the user edits a field, clear that field's error message.
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Check all the fields.
    const found = validate(form)
    // Show the errors (an empty object clears them all).
    setErrors(found)
    // If there is at least one error, stop here and don't send anything.
    if (Object.keys(found).length > 0) return
    // All valid, so hand the data to the parent.
    onSubmit(form)
  }

  const isFound = form.type === 'found'

  return (
    // noValidate turns off the browser's own popups so our messages show instead.
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
      {lockType ? (
        <p className="text-sm text-slate-600">
          Type: <span className="font-semibold uppercase">{form.type}</span> (cannot be changed)
        </p>
      ) : (
        <div className="flex gap-2">
          {['lost', 'found'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: t }))}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold capitalize ${
                form.type === t
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              I {t} something
            </button>
          ))}
        </div>
      )}

      <Field label="Title" error={errors.title}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={80}
          placeholder="e.g. Black calculator"
          className={inputClass}
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          maxLength={500}
          placeholder="Colour, brand, any marks. Don't write anything only the owner would know."
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" error={errors.category}>
          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            <option value="">Select...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Location" error={errors.location}>
          <select name="location" value={form.location} onChange={handleChange} className={inputClass}>
            <option value="">Select...</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={isFound ? 'Date found' : 'Date lost'} error={errors.dateOccurred}>
        <input
          type="date"
          name="dateOccurred"
          value={form.dateOccurred}
          onChange={handleChange}
          max={today()}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" error={errors.contactName}>
          <input
            name="contactName"
            value={form.contactName}
            onChange={handleChange}
            maxLength={60}
            className={inputClass}
          />
        </Field>

        <Field label="Phone number" error={errors.contactPhone}>
          <input
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={10}
            placeholder="10 digits"
            className={inputClass}
          />
        </Field>
      </div>

      {isFound && (
        <Field
          label="Verification question"
          error={errors.verifyQuestion}
          hint="Something only the owner would know, e.g. “What is the wallpaper on the phone?”"
        >
          <input
            name="verifyQuestion"
            value={form.verifyQuestion}
            onChange={handleChange}
            maxLength={150}
            className={inputClass}
          />
        </Field>
      )}

      <Field
        label={pinLabel}
        error={errors.pin}
        hint="You will need this PIN to edit, delete or close your post. Remember it!"
      >
        <input
          name="pin"
          value={form.pin}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={4}
          placeholder="4 digits"
          className={inputClass}
        />
      </Field>

      {/* An error that came back from the server (for example "Incorrect PIN"). */}
      {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

      {/* disabled while the request is running, so the user can't click twice. */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}