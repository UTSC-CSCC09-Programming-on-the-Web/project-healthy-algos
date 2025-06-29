import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MapView from './pages/MapView'

// Router setup for the application
function App() {
  const user = true;
  return (
    <Router>
      <Routes>
        <Route path="/map" element={user ? <MapView /> : <h1>Please log in</h1>} />
        {/* Login, checkout, profile, etc. */}
      </Routes>
    </Router>
  )
}

export default App