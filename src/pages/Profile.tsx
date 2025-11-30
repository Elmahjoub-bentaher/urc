// src/pages/Profile.tsx
import { useAuthStore } from '../store/authStore';
import {Navigate, useNavigate} from 'react-router-dom';

export function Profile() {
    const { session, logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();



    // console.log('session', session);
    // console.log('isAuthenticated', isAuthenticated);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (session === undefined || session === null) {
        return <div>Chargement...</div>;
    }

    if (!isAuthenticated || !session?.token) {
        return <Navigate to="/login" replace />;
    }



    return (
        <div>
            <h1>Profil Utilisateur</h1>
            <div>
                <p><strong>Username:</strong> {session.username}</p>
                <p><strong>Token:</strong> {session.token.substring(0, 20)}...</p>
                <p><strong>External ID:</strong> {session.externalId}</p>
            </div>
            <button onClick={handleLogout}>Déconnexion</button>
        </div>
    );
}