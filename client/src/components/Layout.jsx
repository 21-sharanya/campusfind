// Outlet is the spot where the matched child page gets drawn.
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    // min-h-screen = at least the full screen height. flex-col stacks the pieces vertically.
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {/* Navbar appears on every page. */}
      <Navbar />
      {/* flex-1 makes main grow so the footer is pushed to the bottom. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {/* The current page (Home, Browse, ...) is drawn here. */}
        <Outlet />
      </main>
      {/* Footer appears on every page. */}
      <Footer />
    </div>
  )
}