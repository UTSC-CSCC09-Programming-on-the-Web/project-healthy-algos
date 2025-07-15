import OAuthButton from './OAuthButton';
import '../styles/Login.css';

export default function Login() {
  return (
    <div className="login-container">
      <h1>Welcome to</h1>
      <img
        src="/media/iSim_txt.png"
        alt="iSim Logo"
        className="login-logo"
      />
      <p className="login-description">
        Sign in with Google to access the app.
      </p>
      <OAuthButton />
    </div>
  );
}
