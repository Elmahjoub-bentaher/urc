// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Session, User } from '../model/common'
import { CustomError } from '../model/CustomError'
import { loginUser } from '../user/loginApi'
import {registerUser} from "../user/registerApi";

interface AuthState {
    user: User | null
    session: Session | null
    error: CustomError | null
    isAuthenticated: boolean
    isLoading: boolean

    // Actions
    login: (username: string, password: string) => Promise<void>
    logout: () => void
    clearError: () => void
    setSession: (session: Session) => void
    checkSessionStorage: () => void // ✅ Nouvelle action
    register: (username: string, email: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            error: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (username: string, password: string) => {
                set({ isLoading: true, error: null })

                return new Promise((resolve, reject) => {
                    loginUser(
                        { user_id: -1, username, password },
                        (result: Session) => {
                            console.log('Réponse complète du login:', result);
                            const actualUserId = result.user_id !== undefined ? result.user_id : -2;
                            sessionStorage.setItem('user_id', actualUserId.toString());
                            sessionStorage.setItem('token', result.token);
                            sessionStorage.setItem('externalId', result.externalId);
                            sessionStorage.setItem('username', result.username || "");

                            set({
                                session: result,
                                user: {
                                    user_id: result.user_id || -1,
                                    username: result.username || '',
                                    password: ''
                                },
                                isAuthenticated: true,
                                isLoading: false,
                                error: null
                            })
                            resolve()
                        },
                        (loginError: CustomError) => {
                            set({
                                error: loginError,
                                session: null,
                                isAuthenticated: false,
                                isLoading: false
                            })
                            reject(loginError)
                        }
                    )
                })
            },

            logout: () => {
                set({
                    user: null,
                    session: null,
                    isAuthenticated: false,
                    error: null,
                    isLoading: false
                })
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('externalId');
                sessionStorage.removeItem('username');
            },

            clearError: () => {
                set({ error: null })
            },

            setSession: (session: Session) => {
                set({
                    session,
                    isAuthenticated: !!session.token
                })
            },

            checkSessionStorage: () => {
                const token = sessionStorage.getItem('token');
                const username = sessionStorage.getItem('username');
                const externalId = sessionStorage.getItem('externalId');

                const user_id_str = sessionStorage.getItem('user_id');
                const user_id = user_id_str ? parseInt(user_id_str, 10) : -1;

                if (token && username) {
                    const session: Session = {
                        token,
                        username,
                        externalId: externalId || '',
                        user_id: user_id
                    };
                    set({
                        session,
                        user: {
                            user_id: -1,
                            username,
                            password: ''
                        },
                        isAuthenticated: true
                    });
                }
            },
            register: async (username: string, email: string, password: string) => {
                set({ isLoading: true, error: null });

                return new Promise((resolve, reject) => {
                    registerUser(
                        { username, email, password },
                        (result: Session) => {
                            set({
                                session: result,
                                user: {
                                    user_id: result.user_id || -1,
                                    username: result.username || '',
                                    password: ''
                                },
                                isAuthenticated: true,
                                isLoading: false,
                                error: null
                            });
                            resolve();
                        },
                        (registerError: CustomError) => {
                            set({
                                error: registerError,
                                isLoading: false
                            });
                            reject(registerError);
                        }
                    );
                });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
)