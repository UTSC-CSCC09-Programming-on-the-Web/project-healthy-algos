// frontend/src/components/Login.jsx
import OAuthButton from './OAuthButton'

export default function Login() {
  return (
    <div className="login-container">
      <h1>Welcome to iSim</h1>
      <p className="login-description">
        Sign in with Google to access the app.<br />
        A $10/month subscription is required after login.
      </p>
      <OAuthButton />
    </div>
  )
}