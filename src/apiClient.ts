// src/apiClient.ts

export interface ApiError {
  status: number;
  code?: string;
  message: string;
  details?: any;
  retryAfter?: number;
  requestId?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: string;
  mileage?: number;
  color?: string;
  stockNumber?: string;
}

export interface VehicleCreate extends Omit<Vehicle, 'id'> {}
export interface VehicleUpdate extends Partial<Omit<Vehicle, 'id'>> {}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  source?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface LeadCreate extends Omit<Lead, 'id' | 'createdAt'> {}

export interface Activity {
  id: string;
  leadId: string;
  type: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'document';
  timestamp: string;
  read: boolean;
}

export interface DocumentMeta {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url?: string;
  category?: string;
  vehicleId?: string;
  leadId?: string;
}

export class DealersCloudClient {
  private baseUrl: string;
  private token?: string;

  constructor(options?: { baseUrl?: string; token?: string }) {
    this.baseUrl = options?.baseUrl || process.env.API_BASE_URL || 'http://localhost:5000';
    this.token = options?.token || process.env.AUTH_TOKEN;
  }

  setToken(token: string): void {
    this.token = token;
  }

  private async request<T>(path: string, init?: RequestInit & { signal?: AbortSignal }): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      ...(!(init?.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...init?.headers
    };

    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      try {
        const response = await fetch(url, {
          ...init,
          headers,
          signal: init?.signal
        });

        if (response.status === 429 && attempt < maxAttempts - 1) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? Math.min(parseInt(retryAfter) * 1000, 2000) : 400 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
          continue;
        }

        if (response.status === 204) {
          return undefined as T;
        }

        const contentType = response.headers.get('content-type');
        const data = contentType?.includes('application/json') ? await response.json() : await response.text();

        if (!response.ok) {
          const error: ApiError = {
            status: response.status,
            message: typeof data === 'object' ? data.message || response.statusText : response.statusText,
            details: typeof data === 'object' ? data : undefined,
            retryAfter: response.headers.get('Retry-After') ? parseInt(response.headers.get('Retry-After')!) : undefined,
            requestId: response.headers.get('x-request-id') || undefined
          };
          throw error;
        }

        return data;
      } catch (error) {
        if (attempt >= maxAttempts - 1 || (error as ApiError).status) {
          throw error;
        }
        attempt++;
      }
    }
    throw new Error('Request failed');
  }

  health = {
    get: (): Promise<{ status: string }> => 
      this.request('/health')
  };

  auth = {
    getProfile: (): Promise<{ success: boolean; data: any }> => 
      this.request('/api/auth/profile'),
    verifyToken: (): Promise<{ success: boolean; data: { valid: boolean } }> => 
      this.request('/api/auth/verify-token')
  };

  vehicles = {
    list: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      make?: string;
      model?: string;
      year?: number;
      priceMin?: number;
      priceMax?: number;
      search?: string;
    }): Promise<{ success: boolean; data: { vehicles: Vehicle[]; pagination: Pagination } }> => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            query.append(key, String(value));
          }
        });
      }
      return this.request(`/api/vehicles${query.toString() ? `?${query}` : ''}`);
    },
    get: (id: string): Promise<{ success: boolean; data: { vehicle: Vehicle } }> => 
      this.request(`/api/vehicles/${id}`),
    create: (input: VehicleCreate): Promise<{ success: boolean; data: { vehicle: Vehicle } }> => 
      this.request('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    update: (id: string, input: VehicleUpdate): Promise<{ success: boolean; data: { vehicle: Vehicle } }> => 
      this.request(`/api/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input)
      }),
    delete: (id: string): Promise<{ success: boolean }> => 
      this.request(`/api/vehicles/${id}`, { method: 'DELETE' })
  };

  crm = {
    listLeads: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      source?: string;
      assignedTo?: string;
    }): Promise<{ success: boolean; data: { leads: Lead[]; pagination: Pagination } }> => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            query.append(key, String(value));
          }
        });
      }
      return this.request(`/api/crm/leads${query.toString() ? `?${query}` : ''}`);
    },
    createLead: (input: LeadCreate): Promise<{ success: boolean; data: { lead: Lead } }> => 
      this.request('/api/crm/leads', {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    activities: (): Promise<{ success: boolean; data: { activities: Activity[] } }> => 
      this.request('/api/crm/activities')
  };

  messaging = {
    listConversations: (): Promise<{ success: boolean; data: { conversations: Conversation[] } }> => 
      this.request('/api/messaging/conversations'),
    getMessages: (conversationId: string): Promise<{ success: boolean; data: { messages: Message[] } }> => 
      this.request(`/api/messaging/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, input: {
      content: string;
      type?: 'text' | 'image' | 'document';
    }): Promise<{ success: boolean; data: { message: Message } }> => 
      this.request(`/api/messaging/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(input)
      })
  };

  documents = {
    upload: async (file: Blob | File | Buffer, meta?: {
      category?: string;
      vehicleId?: string;
      leadId?: string;
    }): Promise<{ success: boolean; data: { document: DocumentMeta } }> => {
      const formData = new FormData();
      
      if (Buffer.isBuffer(file)) {
        formData.append('document', new Blob([file]));
      } else {
        formData.append('document', file);
      }
      
      if (meta) {
        Object.entries(meta).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });
      }

      return this.request('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
    },
    list: (): Promise<{ success: boolean; data: { documents: DocumentMeta[] } }> => 
      this.request('/api/documents')
  };
}