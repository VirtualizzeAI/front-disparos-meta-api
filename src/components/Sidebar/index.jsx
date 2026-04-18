
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const currentPath = location.pathname;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        // Handle root path mapping to dashboard
        if (path === '/dashboard' && (currentPath === '/' || currentPath === '/dashboard')) {
            return true;
        }
        return currentPath === path;
    };

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 2L4 8V14C4 21.5 9 28.5 16 30C23 28.5 28 21.5 28 14V8L16 2Z" fill="url(#gradient1)" />
                        <defs>
                            <linearGradient id="gradient1" x1="4" y1="2" x2="28" y2="30">
                                <stop offset="0%" stopColor="#667eea" />
                                <stop offset="100%" stopColor="#764ba2" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span>Fabrica Neural</span>
                </div>
            </div>

            <ul className="nav-menu">
                <li className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', color: 'inherit', textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M3 4C3 3.44772 3.44772 3 4 3H7C7.55228 3 8 3.44772 8 4V7C8 7.55228 7.55228 8 7 8H4C3.44772 8 3 7.55228 3 7V4Z"
                                fill="currentColor" />
                            <path
                                d="M3 13C3 12.4477 3.44772 12 4 12H7C7.55228 12 8 12.4477 8 13V16C8 16.5523 7.55228 17 7 17H4C3.44772 17 3 16.5523 3 16V13Z"
                                fill="currentColor" />
                            <path
                                d="M12 4C12 3.44772 12.4477 3 13 3H16C16.5523 3 17 3.44772 17 4V7C17 7.55228 16.5523 8 16 8H13C12.4477 8 12 7.55228 12 7V4Z"
                                fill="currentColor" />
                            <path
                                d="M12 13C12 12.4477 12.4477 12 13 12H16C16.5523 12 17 12.4477 17 13V16C17 16.5523 16.5523 17 16 17H13C12.4477 17 12 16.5523 12 16V13Z"
                                fill="currentColor" />
                        </svg>
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li className={`nav-item ${isActive('/new-blast') ? 'active' : ''}`}>
                    <Link to="/new-blast" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', color: 'inherit', textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M2 3L18 10L2 17V11L13 10L2 9V3Z" fill="currentColor" />
                        </svg>
                        <span>Novo Disparo</span>
                    </Link>
                </li>
                <li className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', color: 'inherit', textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M10 2C11.6569 2 13 3.34315 13 5C13 6.65685 11.6569 8 10 8C8.34315 8 7 6.65685 7 5C7 3.34315 8.34315 2 10 2Z"
                                fill="currentColor" />
                            <path d="M4 15C4 12.7909 5.79086 11 8 11H12C14.2091 11 16 12.7909 16 15V18H4V15Z"
                                fill="currentColor" />
                        </svg>
                        <span>Perfil</span>
                    </Link>
                </li>
                <li className={`nav-item ${isActive('/connected-number') ? 'active' : ''}`}>
                    <Link to="/connected-number" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', color: 'inherit', textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M2 3C2 2.44772 2.44772 2 3 2H5.15287C5.64171 2 6.0589 2.35341 6.13927 2.8356L6.87858 7.27147C6.95075 7.70451 6.73206 8.13397 6.3394 8.3303L4.79126 9.10437C5.90756 11.8783 8.12168 14.0924 10.8956 15.2087L11.6697 13.6606C11.866 13.2679 12.2955 13.0492 12.7285 13.1214L17.1644 13.8607C17.6466 13.9411 18 14.3583 18 14.8471V17C18 17.5523 17.5523 18 17 18H15C7.8203 18 2 12.1797 2 5V3Z"
                                fill="currentColor" />
                        </svg>
                        <span>Número Conectado</span>
                    </Link>
                </li>
            </ul>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" id="logout-btn" onClick={handleLogout}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M13 14L17 10M17 10L13 6M17 10H7M7 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H7"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Sair</span>
                </button>
            </div>
        </nav>
    );
}
