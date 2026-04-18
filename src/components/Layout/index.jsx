
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { useAuth } from '../../context/AuthContext';

export function Layout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ flex: 1 }}>
                <Outlet />
            </main>
        </div>
    );
}
