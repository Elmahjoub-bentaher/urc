// src/components/AuthInitializer.tsx
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function AuthInitializer() {
    const { checkSessionStorage, session } = useAuthStore();

    useEffect(() => {
        console.log('AuthInitializer: Checking session storage...');
        checkSessionStorage();
    }, [checkSessionStorage]);

    return null;
}