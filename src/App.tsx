import React,{ useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/ui'
import AppLayout from './components/layouts/AppLayout'
import { CardsRouter } from './pages/cards'
import { LojinhaPage } from './pages/lojinha'
import { LanchonetePage } from './pages/lanchonete'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full relative" style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #fef3c7 25%, #faf5ff 50%, #f0f9ff 75%, #fdf2f8 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Bordas decorativas douradas */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-yellow-400 rounded-br-lg z-20"></div>
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-yellow-400 rounded-bl-lg z-20"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-b-4 border-yellow-400 rounded-t-lg z-20"></div>
        
        <div className="w-full px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto w-full">
            <Login onLogin={handleLogin} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/cards" replace />} />
        <Route path="/login" element={<Navigate to="/cards" replace />} />
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="/cards/*" element={<CardsRouter />} />
              <Route path="/lojinha" element={<LojinhaPage />} />
              <Route path="/lanchonete" element={<LanchonetePage />} />
            </Routes>
          </AppLayout>
        } />
      </Routes>
    </Router>
  )
}

export default App