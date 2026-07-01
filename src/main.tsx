import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PulseProvider } from './context/PulseContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PulseProvider>
      <App />
    </PulseProvider>
  </StrictMode>,
)
