import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';
import '../../styles/layout.css';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <Ghost color="#ff4500" />
        Rebbit
      </Link>
    </nav>
  );
};