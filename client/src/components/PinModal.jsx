import { useState } from 'react'

// A pop-up that asks for the 4-digit PIN.
// Props: title, confirmLabel, danger (red button), onConfirm(pin) (async), onClose.
export default function PinModal({ title, confirmLabel = 'Confirm', danger = false, onConfirm, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  // True while we wait for the server.
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Quick check before bothering the server.
    if (!/^\d{4}$/.test(pin)) {
      setError('Enter your 4-digit PIN')
      return
    }
    setBusy(true)
    setError('')
    try {
      // The parent does the real work (delete or update) and closes the modal on success.
      await onConfirm(pin)
    } catch (err) {
      // For example "Incorrect PIN" from the server.
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    // The dark backdrop. Clicking it closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      {/* stopPropagation: clicks inside the box must NOT reach the backdrop and close it. */}
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">Enter the 4-digit PIN you chose when you posted this item.</p>

        <input
          autoFocus
          value={pin}
          // Keep digits only.
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}