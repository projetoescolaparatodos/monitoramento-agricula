
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              Home
            </Link>
            <Link to="/agriculture" className="ml-8 flex items-center">
              Agricultura
            </Link>
            <Link to="/fishing" className="ml-8 flex items-center">
              Pesca
            </Link>
            <Link to="/paa" className="ml-8 flex items-center">
              PAA
            </Link>
          </div>
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
