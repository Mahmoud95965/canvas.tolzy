import React, { useState } from 'react'
import Dashboard from './views/Dashboard'
import CanvasEditor from './views/CanvasEditor'

function App() {
  const [view, setView] = useState('dashboard') // 'dashboard' or 'canvas'

  return (
    <div className="app-container">
      {view === 'dashboard' ? (
        <Dashboard onOpenProject={() => setView('canvas')} />
      ) : (
        <CanvasEditor onBack={() => setView('dashboard')} />
      )}
    </div>
  )
}

export default App
