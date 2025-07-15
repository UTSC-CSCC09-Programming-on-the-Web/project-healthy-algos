import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessPage.css';

export default function SuccessPage({ user }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const cameFromSubscription = sessionStorage.getItem('fromSubscription');

    if (!user) {
      navigate('/login');
    } else if (cameFromSubscription) {
      sessionStorage.removeItem('fromSubscription');
      setAuthorized(true);
    } else {
      navigate('/world');
    }
  }, [user, navigate]);

  if (!authorized) return null;

  return (
    <div className="success-page">
      <div className="success-container">
        <h1 className="success-heading">🎉 Subscription Successful! 🎉</h1>
        <p className="success-description">
          Thank you for subscribing. You're now ready to explore the world of
        </p>

        <img
          src="/media/iSim_txt.png"
          alt="iSim Logo"
          className="success-logo"
        />

        <button
          className="success-button"
          onClick={() => navigate('/world')}
        >
          ENTER THE WORLD
        </button>
      </div>
    </div>
  );
}