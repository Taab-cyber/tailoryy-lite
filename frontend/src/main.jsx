// main.jsx — App entry point, wraps with all providers
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                background: '#FAF7F2',
                color: '#2C1810',
                border: '1px solid #E8DDD4',
                borderRadius: '6px',
                boxShadow: '0 2px 16px rgba(44,24,16,0.08)',
              },
              success: {
                iconTheme: { primary: '#3D7A4F', secondary: '#FAF7F2' },
              },
              error: {
                iconTheme: { primary: '#C0392B', secondary: '#FAF7F2' },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
)
