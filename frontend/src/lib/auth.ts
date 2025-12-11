
const API_URL = 'http://localhost:8000';

export interface User {
    id: number;
    email: string;
    username: string;
    avatar_url?: string;
}

interface AuthResponse {
    access_token: string;
    token_type: string;
}

export const authService = {
    async register(email: string, username: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }

        return response.json();
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        return response.json();
    },

    async getProfile(): Promise<User> {
        const token = this.getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return response.json();
    },

    setToken(token: string) {
        localStorage.setItem('token', token);
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    logout() {
        localStorage.removeItem('token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};
