import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1e21',
              color: '#f2ebe7',
              borderRadius: '12px',
              border: '1px solid #2a2a2e',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#1e1e21',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#f2ebe7',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
