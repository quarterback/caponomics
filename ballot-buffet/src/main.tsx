import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/fonts.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './ui/theme.css'
import './ui/base.css'
import './ui/app.css'
import { App } from './App'
import { loadFromHash } from './ui/store'

loadFromHash(location.hash)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
