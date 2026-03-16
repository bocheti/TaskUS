import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/AuthContext'

import '@fontsource/league-spartan/400.css'  
import '@fontsource/league-spartan/700.css'  
import '@fontsource/geologica/400.css'       
import '@fontsource/geologica/700.css'       

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)