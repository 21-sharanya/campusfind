// Routes holds all the page rules. Route is one rule: "this URL shows that page".
import { Routes, Route } from 'react-router-dom'
// The five pages we are about to create.
import Home from './pages/Home'
import Browse from './pages/Browse'
import ItemDetail from './pages/ItemDetail'
import Report from './pages/Report'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    // Routes shows only the ONE Route whose path matches the current URL.
    <Routes>
      {/* "/" is the home page. */}
      <Route path="/" element={<Home />} />
      {/* "/browse" lists all items. */}
      <Route path="/browse" element={<Browse />} />
      {/* ":id" is a URL parameter, so /items/abc123 shows the detail page for item abc123. */}
      <Route path="/items/:id" element={<ItemDetail />} />
      {/* "/report" shows the form to post a lost or found item. */}
      <Route path="/report" element={<Report />} />
      {/* "*" matches any URL not matched above, so it works as our 404 page. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}