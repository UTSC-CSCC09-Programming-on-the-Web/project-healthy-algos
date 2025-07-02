export default function OAuthButton() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <button className="oauth-button" onClick={handleLogin}>
      Login with Google
    </button>
  );
}
