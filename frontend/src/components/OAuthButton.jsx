import '../styles/OAuthButton.css';

export default function OAuthButton() {
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const handleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <button className="oauth-button" onClick={handleLogin}>
      <img
        src="/media/google_logo.png"
        alt="Google Logo"
        className="oauth-logo"
      />
      Login with Google
    </button>
  );
}
