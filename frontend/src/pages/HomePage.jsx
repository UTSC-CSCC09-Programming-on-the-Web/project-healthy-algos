import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage({ user }) {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    if (user) {
      navigate('/world');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-page">
      <img
        src="/media/iSim_txt.png"
        alt="Game Title"
        className="home-logo"
      />
      <p className="home-subtext">
        A whole new world to explore
      </p>
      <button className="home-button" onClick={handlePlayClick}>
        PLAY NOW
      </button>
    </div>
  );
}