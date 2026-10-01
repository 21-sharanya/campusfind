// useParams reads the ":id" part of the URL.
import { useParams } from 'react-router-dom'

export default function ItemDetail() {
  // For /items/abc123, this gives { id: 'abc123' }.
  const { id } = useParams()
  return <h1 className="p-6 text-2xl font-bold">Item details: {id}</h1>
}