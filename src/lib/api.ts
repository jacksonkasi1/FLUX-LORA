const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data.data as T;
  }

  // Auth methods
  async register(email: string, password: string, displayName?: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async updateProfile(updates: any) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Settings methods
  async getSettings() {
    return this.request<any>('/settings');
  }

  async updateSettings(updates: any) {
    return this.request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Training models methods
  async getTrainingModels() {
    return this.request<any[]>('/models');
  }

  async createTrainingModel(model: any) {
    return this.request<any>('/models', {
      method: 'POST',
      body: JSON.stringify(model),
    });
  }

  async getTrainingModel(id: string) {
    return this.request<any>(`/models/${id}`);
  }

  async updateTrainingModel(id: string, updates: any) {
    return this.request<any>(`/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTrainingModel(id: string) {
    return this.request<any>(`/models/${id}`, {
      method: 'DELETE',
    });
  }

  // Training images methods
  async getTrainingImages(modelId: string) {
    return this.request<any[]>(`/models/${modelId}/images`);
  }

  async uploadTrainingImage(modelId: string, imageData: any) {
    return this.request<any>(`/models/${modelId}/images`, {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
  }

  async deleteTrainingImage(imageId: string) {
    return this.request<any>(`/images/${imageId}`, {
      method: 'DELETE',
    });
  }

  // Generated images methods
  async getGeneratedImages() {
    return this.request<any[]>('/generated-images');
  }

  async createGeneratedImage(imageData: any) {
    return this.request<any>('/generated-images', {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
  }

  async updateGeneratedImage(id: string, updates: any) {
    return this.request<any>(`/generated-images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGeneratedImage(id: string) {
    return this.request<any>(`/generated-images/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload methods
  async getPresignedUploadUrl(filename: string, contentType: string, type: 'training' | 'generated' = 'training') {
    return this.request<{ uploadUrl: string; publicUrl: string; key: string }>('/upload/presigned', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType, type }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
