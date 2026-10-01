// The card component we are testing.
import ItemCard from '../components/ItemCard'

// A fake item, shaped like the data your API returns.
const sample = {
  _id: '123',
  type: 'found',
  title: 'Black calculator',
  description: 'Found on a bench near the library entrance.',
  category: 'Electronics',
  location: 'Library',
  dateOccurred: '2026-09-29',
  status: 'open',
}

export default function Browse() {
  return (
    // max-w-sm keeps the card at a sensible width.
    <div className="max-w-sm">
      <ItemCard item={sample} />
    </div>
  )
}