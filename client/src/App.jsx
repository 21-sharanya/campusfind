import { Routes, Route } from 'react-router-dom'
// The layout that wraps all pages.
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ItemDetail from './pages/ItemDetail'
import Report from './pages/Report'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* A Route with no path and an element is a "layout route": its child routes render inside its <Outlet />. */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/report" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}