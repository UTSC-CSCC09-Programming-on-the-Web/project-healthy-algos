import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import MapView from './pages/MapView'
import Header from './components/Header'
import Credits from './pages/Credits'
import Footer from './components/Footer'

// Router setup for the application
function App() {
  const user = true;
  return (
    <Router>
      <div className="app-content">
        <Header />
        <Routes>
          <Route path="/" element={user ? <MapView /> : <h1>Please log in</h1>} />
          {/* At root for now, will want landing screen later */}
          <Route path="/credits" element={<Credits />} />
          {/* Login, checkout, profile, etc. */}
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App