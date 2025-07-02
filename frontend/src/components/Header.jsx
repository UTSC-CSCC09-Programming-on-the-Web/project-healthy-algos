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
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: '1px solid #ccc',
        alignItems: 'center'
      }}
    >

      <div>
        <button onClick={() => navigate('/')} style={{ marginRight: '1rem' }}>Home</button>
        <button onClick={() => navigate('/world')}>World</button>
      </div>

      <div>
        {user ? (
          <>
            <span style={{ marginRight: '1rem' }}>{user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')}>Login</button>
        )}
      </div>
    </header>
  );
}
