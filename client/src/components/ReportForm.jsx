// useState lets the form remember what the user has typed.
import { useState } from 'react'
// The shared category and location lists (same as the server's).
import { CATEGORIES, LOCATIONS } from '../constants'

// The starting (empty) value of every field in the form.
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

// Tailwind classes shared by all inputs, written once so every field looks the same.
const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

// Returns today's date as YYYY-MM-DD in the user's own time zone. Used to block future dates.
const today = () => {
  const now = new Date()
  // getTimezoneOffset is in minutes. Convert to milliseconds and shift so toISOString shows the local date.
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0]
}

// A small helper component: a label wrapped around an input, plus an optional hint or error message.
// Wrapping the input in <label> means clicking the text focuses the input.
function Field({ label, error, hint, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {/* children is whatever we put between <Field> and </Field>, usually an input. */}
      {children}
      {/* Show the hint only when there is no error. */}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  )
}

// Props: initialValues (starting data), onSubmit (called with the form data), submitLabel (button text),
// lockType and pinLabel are used by the edit page later.
export default function ReportForm({
  initialValues = {},
  onSubmit,
  submitLabel = 'Submit',
  lockType = false,
  pinLabel = 'Choose a 4-digit PIN',
}) {
  // The whole form lives in ONE state object. The function form runs only once, on the first render.
  const [form, setForm] = useState(() => {
    // Start from the empty form...
    const start = { ...emptyForm }
    // ...then copy over only the known fields that were passed in initialValues.
    Object.keys(emptyForm).forEach((key) => {
      if (initialValues[key] !== undefined) start[key] = initialValues[key]
    })
    return start
  })

  // One change handler for every input. It uses the input's "name" to know which field to update.
  const handleChange = (e) => {
    const { name, value } = e.target
    // PIN and phone accept digits only, so strip every other character.
    const cleaned = name === 'pin' || name === 'contactPhone' ? value.replace(/\D/g, '') : value
    // Copy the old form and replace just this one field. [name] is a computed key.
    setForm((prev) => ({ ...prev, [name]: cleaned }))
  }

  // Runs when the form is submitted (Enter key or the submit button).
  const handleSubmit = (e) => {
    // Stop the browser's default behaviour, which would reload the page.
    e.preventDefault()
    // Give the form data to the parent component.
    onSubmit(form)
  }

  // True when the user is reporting a found item. Only then do we ask the verification question.
  const isFound = form.type === 'found'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
      {/* Lost / Found switch. When locked (edit page) just show the type as text. */}
      {lockType ? (
        <p className="text-sm text-slate-600">
          Type: <span className="font-semibold uppercase">{form.type}</span> (cannot be changed)
        </p>
      ) : (
        <div className="flex gap-2">
          {['lost', 'found'].map((t) => (
            // type="button" stops these from submitting the form.
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

      <Field label="Title">
        {/* value + onChange = a "controlled input": React state is the single source of truth. */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={80}
          placeholder="e.g. Black calculator"
          className={inputClass}
        />
      </Field>

      <Field label="Description">
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

      {/* Two columns on screens wider than the "sm" breakpoint, one column on phones. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category">
          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            <option value="">Select...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Location">
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

      <Field label={isFound ? 'Date found' : 'Date lost'}>
        {/* max stops the user choosing a date in the future. */}
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
        <Field label="Your name">
          <input
            name="contactName"
            value={form.contactName}
            onChange={handleChange}
            maxLength={60}
            className={inputClass}
          />
        </Field>

        <Field label="Phone number">
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

      {/* Only shown for found items. The finder sets a question that only the real owner can answer. */}
      {isFound && (
        <Field
          label="Verification question"
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

      <Field label={pinLabel} hint="You will need this PIN to edit, delete or close your post. Remember it!">
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

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
      >
        {submitLabel}
      </button>
    </form>
  )
}