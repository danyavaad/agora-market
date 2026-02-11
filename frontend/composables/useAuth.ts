/*
 * File: composables/useAuth.ts
 * Purpose: Manage authentication state and actions
 */
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { useCartStore } from '~/stores/cart';

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
    isInitialized: boolean;
}

export const useAuth = defineStore('auth', {
    state: (): AuthState => ({
        token: null,
        user: null,
        isInitialized: false,
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
                const user = localStorage.getItem('auth_user');
                if (token) {
                    this.setToken(token);
                }
                if (user) {
                    this.user = JSON.parse(user);
                }
            }
            this.isInitialized = true;
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
            const config = useRuntimeConfig();
            const apiBase = config.public.apiBase || 'http://localhost:3001';
            try {
                const response = await $fetch(`${apiBase}/auth/register`, {
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
            const apiBase = config.public.apiBase || 'http://localhost:3001';
            try {
                const response: any = await $fetch(`${apiBase}/auth/login`, {
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
            const cartStore = useCartStore();
            cartStore.clear();
            this.token = null;
            this.user = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            navigateTo('/login');
        }
    },
});
