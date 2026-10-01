// StrictMode helps find bugs during development. It does nothing in production.
import { StrictMode } from 'react'
// createRoot connects React to the <div id="root"> in index.html.
import { createRoot } from 'react-dom/client'
// BrowserRouter turns on client-side routing: the URL changes without reloading the page.
import { BrowserRouter } from 'react-router-dom'
// Loads Tailwind (the file contains only: @import "tailwindcss";).
import './index.css'
// Our main component.
import App from './App.jsx'

// Find the root div and render our app inside it.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Everything inside BrowserRouter can use routing features (Link, useParams, etc). */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)