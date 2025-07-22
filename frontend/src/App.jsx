import { useState, useEffect } from 'react';
import './styles/App.css';
import AppRouter from './routes/AppRouter';

// Router setup for the application
function App() {
  const [user, setUser] = useState(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Not logged in');
      }
    };

    checkAuth();
  }, []);

  return <AppRouter user={user} setUser={setUser} />;
}

export default App;
