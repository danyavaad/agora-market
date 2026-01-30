/*
 * File: composables/useAuth.ts
 * Purpose: Manage authentication state and actions
 */
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
}

export const useAuth = defineStore('auth', {
    state: (): AuthState => ({
        token: null,
        user: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isProducer: (state) => state.user?.role === 'producer',
    },
    actions: {
        initialize() {
            // Hydrate from localStorage
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    this.setToken(token);
                }
            }
        },
        setToken(token: string) {
            this.token = token;
            localStorage.setItem('auth_token', token);

            try {
                const decoded: any = jwtDecode(token);
                // We rely on the backend response for full user object, 
                // but can decode minimal info if needed.
                // For now, we expect login to return { access_token, user }
            } catch (e) {
                console.error('Invalid token', e);
                this.logout();
            }
        },
        setUser(user: User) {
            this.user = user;
            localStorage.setItem('auth_user', JSON.stringify(user));
        },
        async register(userData: any) {
            try {
                const response = await $fetch('http://localhost:3001/auth/register', {
                    method: 'POST',
                    body: userData,
                });
                return response;
            } catch (error) {
                throw new Error('Registration failed');
            }
        },

        async login(credentials: any) {
            const config = useRuntimeConfig();
            try {
                const response: any = await $fetch('http://localhost:3001/auth/login', {
                    method: 'POST',
                    body: credentials,
                });

                if (response) {
                    this.setToken(response.access_token);
                    this.setUser(response.user);
                }
            } catch (error) {
                throw new Error('Login failed');
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            navigateTo('/login');
        }
    },
});
