// src/pages/Home.tsx
import { Link } from 'react-router-dom';

export function Home() {
    return (
        <div>
            <h1>Page d'Accueil</h1>
            <p>Bienvenue sur notre application !</p>
            <Link to="/login">Se connecter</Link>
        </div>
    );
}