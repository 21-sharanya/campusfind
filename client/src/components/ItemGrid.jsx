import ItemCard from './ItemCard'

// PARENT to ItemCard: receives the whole list as a prop and passes each item down to a card.
export default function ItemGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </div>
  )
}