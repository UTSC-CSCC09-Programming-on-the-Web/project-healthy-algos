import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

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
    <header className="header">
      <div className="header-left">
        <img
          src="/media/iSim.png"
          alt="Logo"
          className="header-logo"
          onClick={() => navigate('/')}
        />
        <button onClick={() => navigate('/')} className="header-button">
          Home
        </button>
        <button onClick={() => navigate('/world')} className="header-button">
          World
        </button>
      </div>

      <div className="header-right">
        {user ? (
          <>
            <span className="header-username">{user.name}</span>
            <button onClick={handleLogout} className="header-button">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="header-button">
            Login
          </button>
        )}
      </div>
    </header>
  );
}
