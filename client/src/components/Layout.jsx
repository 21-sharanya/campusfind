// useLocation tells us the current URL path.
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ErrorBoundary from './ErrorBoundary'

export default function Layout() {
  // location.pathname is e.g. "/browse".
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {/* key={pathname} makes React create a fresh ErrorBoundary on every page change, so an error on one page doesn't stay stuck on the next. */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}