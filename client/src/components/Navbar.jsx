// useState lets a component remember a value (here: is the mobile menu open?).
import { useState } from 'react'
// Link is a normal link without a page reload. NavLink also knows whether it is the active page.
import { Link, NavLink } from 'react-router-dom'

// The menu items, kept in one array so we write the link markup only once.
const links = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse' },
  { to: '/report', label: 'Report an Item' },
]

export default function Navbar() {
  // open = current value, setOpen = function to change it. It starts as false (menu closed).
  const [open, setOpen] = useState(false)

  // NavLink passes { isActive } to this function. We return different classes for the active page.
  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-indigo-50'
    }`

  return (
    <header className="border-b bg-white">
      {/* The top bar: logo on the left, menu on the right. */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Clicking the logo goes home. */}
        <Link to="/" className="text-xl font-bold text-indigo-600">
          CampusFind
        </Link>

        {/* Hamburger button. md:hidden hides it on medium and larger screens. */}
        <button
          className="rounded-md border px-3 py-1 text-sm md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {/* Show an X when the menu is open, and a hamburger icon when it is closed. */}
          {open ? '✕' : '☰'}
        </button>

        {/* Desktop menu. hidden by default, and md:flex shows it from medium screens up. */}
        <div className="hidden gap-2 md:flex">
          {links.map((link) => (
            // "end" on Home stops "/" from counting as active on every page.
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile menu: only rendered when open is true. */}
      {open && (
        <div className="flex flex-col gap-1 border-t px-4 py-2 md:hidden">
          {links.map((link) => (
            // onClick closes the menu after a link is chosen.
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}