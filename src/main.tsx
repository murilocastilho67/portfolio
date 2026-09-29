import { StrictMode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LangProvider } from './i18n/LangProvider'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root não encontrado')

createRoot(root).render(
  <StrictMode>
    <LangProvider>
      <App />
      <Analytics />
    </LangProvider>
  </StrictMode>,
)
