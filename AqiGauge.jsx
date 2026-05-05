import { Routes, Route } from 'react-router-dom'
import Sidebar       from './components/Sidebar'
import Dashboard     from './pages/Dashboard'
import Predict       from './pages/Predict'
import Forecast      from './pages/Forecast'
import ModelInsights from './pages/ModelInsights'

export default function App() {
  return (
    <div className="flex min-h-screen bg-carbon-950">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-50 pointer-events-none" />

      <Sidebar />

      <main className="flex-1 min-w-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/"        element={<Dashboard />}     />
            <Route path="/predict" element={<Predict />}       />
            <Route path="/forecast"element={<Forecast />}      />
            <Route path="/model"   element={<ModelInsights />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
