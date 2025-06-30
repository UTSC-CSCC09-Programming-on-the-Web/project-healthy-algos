import { Link } from 'react-router-dom';
import '../styles/Header.css';

export default function Header() {
  return (
    <header className="header">
      <h1>
        <Link to="/">Healthy Algos</Link>
        {/* Currently don't have a page to route to at '/', but we'll design landing page separately */}
      </h1>
    </header>
  );
}