import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// When running in a browser (not Electron), provide no-op stubs for window.api
if (typeof window !== 'undefined' && !window.api) {
  window.api = {
    minimizeWindow: () => {},
    maximizeWindow: () => {},
    closeWindow: () => window.close()
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
