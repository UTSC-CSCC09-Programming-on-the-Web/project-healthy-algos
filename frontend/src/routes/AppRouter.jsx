// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import Header from '../components/Header';
import WorldPage from '../pages/WorldPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import SuccessPage from '../pages/SuccessPage';
import MapView from '../pages/MapView'
import Credits from '../pages/Credits'

export default function AppRouter({ user, setUser }) {
  return (
    <BrowserRouter>
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/world" element={<MapView />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/success" element={<SuccessPage />} />
        {/* <Route path="/world" element={<MapView />} />  */}
        <Route path="/credits" element={<Credits />} />{/* Login, checkout, profile, etc. */}
      </Routes>
    </BrowserRouter>
  );
}
