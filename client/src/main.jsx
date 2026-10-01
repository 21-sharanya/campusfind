import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Without BrowserRouter, every routing feature crashes and the page goes blank.
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)