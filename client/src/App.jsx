import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ItemDetail from './pages/ItemDetail'
import EditItem from './pages/EditItem'
import Report from './pages/Report'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        {/* The edit page for one item. */}
        <Route path="/items/:id/edit" element={<EditItem />} />
        <Route path="/report" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}