import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <p>Team Healthy-Algos</p>
      <Link to="/credits" className="credits-link">Credits</Link>
    </footer>
  );
}