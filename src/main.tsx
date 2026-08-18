import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { MemoirProvider } from './context/MemoirContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MemoirProvider>
        <App />
      </MemoirProvider>
    </BrowserRouter>
  </StrictMode>,
)
