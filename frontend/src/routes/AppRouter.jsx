// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import Header from '../components/Header';
import WorldPage from '../pages/WorldPage';
import SubscriptionPage from '../pages/SubscriptionPage';

export default function AppRouter({ user, setUser }) {
  return (
    <BrowserRouter>
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
