// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import Header from '../components/Header';
import WorldPage from '../pages/WorldPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import SuccessPage from '../pages/SuccessPage';
import MapView from '../pages/MapView'
import Credits from '../pages/Credits'

function RequireAuth({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RedirectIfAuth({ user, children }) {
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RequireUnsubscribed({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  } else if (user.subscribed) {
    return <Navigate to="/world" replace />;
  }
  return children;
}

export default function AppRouter({ user, setUser }) {
  return (
    <BrowserRouter>
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route
          path="/"
          element={<HomePage user={user} />}
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuth user={user}>
              <LoginPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/subscribe"
          element={
            <RequireUnsubscribed user={user}>
              <SubscriptionPage />
            </RequireUnsubscribed>
          }
        />
        <Route
          path="/world"
          element={
            <RequireAuth user={user}>
              <WorldPage />
            </RequireAuth>
          }
        />
        <Route
          path="/success"
          element={
            <RequireAuth user={user}>
              <SuccessPage user={user} />
            </RequireAuth>
          }
        />

        <Route path="/credits" element={<Credits />} />
      </Routes>
    </BrowserRouter>
  );
}
