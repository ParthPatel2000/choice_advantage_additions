import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Settings from './Settings';
import Watchlist from './Watchlist';
import './Options.css';

export default function Options() {
  return (
    <Router>
      <div className="p-4">
        {/* Horizontal Nav Bar */}
        <nav className="navbar">
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            Settings
          </NavLink>
          <NavLink to="/watchlist" className={({ isActive }) => isActive ? 'active' : ''}>
            Watchlist
          </NavLink>
        </nav>

        {/* Main content */}
        <div className="main-content">
          <Routes>
            <Route path="/settings" element={<Settings />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="*" element={<Settings />} /> {/* fallback */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
