
import { authService, type User } from './auth';

const API_URL = 'http://localhost:8000';

export interface Product {
    id: number;
    name: string;
    brand?: string;
    price: number;
    currency: string;
    image_url?: string;
    specs?: Record<string, any>;
}

export interface TemplateItem {
    product: Product;
    position_x: number;
    position_y: number;
}

export interface Template {
    id: number;
    title: string;
    description?: string;
    style: string;
    cover_image_url?: string;
    views: number;
    clicks: number;
    created_at: string;
    items: TemplateItem[];
    creator?: User;
}

export interface TemplateItemCreate {
    product_id: number;
    position_x: number;
    position_y: number;
}

export interface TemplateCreate {
    title: string;
    description?: string;
    style: string;
    cover_image_url?: string;
    items: TemplateItemCreate[];
}

export const templateService = {
    async getTemplates(skip = 0, limit = 20): Promise<Template[]> {
        const response = await fetch(`${API_URL}/templates/?skip=${skip}&limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch templates');
        }
        return response.json();
    },

    async createTemplate(data: TemplateCreate): Promise<Template> {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/templates/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create template');
        }
        return response.json();
    },
    async getTemplate(id: string): Promise<Template> {
        const response = await fetch(`${API_URL}/templates/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch template');
        }
        return response.json();
    },

    async updateTemplate(id: string, data: TemplateCreate): Promise<Template> {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/templates/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update template');
        }
        return response.json();
    },

    async deleteTemplate(id: number): Promise<void> {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/templates/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete template');
        }
    }
};

export interface ProductCreate {
    name: string;
    brand?: string;
    price: number;
    currency?: string;
    image_url?: string;
    category_id: number;
    specs?: Record<string, any>;
}

export interface ProductUpdate {
    name?: string;
    brand?: string;
    price?: number;
    currency?: string;
    image_url?: string;
    category_id?: number;
    specs?: Record<string, any>;
}

export const productService = {
    async getProducts(limit = 50, skip = 0): Promise<Product[]> {
        const response = await fetch(`${API_URL}/products/?limit=${limit}&offset=${skip}`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        return response.json();
    },

    async createProduct(data: ProductCreate): Promise<Product> {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/products/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create product');
        }
        return response.json();
    },

    async updateProduct(id: number, data: ProductUpdate): Promise<Product> {
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update product');
        }
        return response.json();
    }
};
