// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';

export default function Header({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      credentials: 'include',
    });
    setUser(null);
    navigate('/login');
  } catch (err) {
    console.error('Logout failed', err);
  }
};

  return (
    <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
      {user ? (
        <div>
          <span style={{ marginRight: '1rem' }}>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => navigate('/login')}>Login</button>
      )}
    </header>
  );
}
