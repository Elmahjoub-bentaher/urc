// src/pages/Profile.tsx
import { useAuthStore } from '../store/authStore';
import {Navigate, useNavigate} from 'react-router-dom';
import {Messaging} from "../components/chat/Messaging";

export function Dashboard() {
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
        <Messaging/>
    );
}