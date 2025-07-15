import '../styles/OAuthButton.css';

export default function OAuthButton() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
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
