import { supabase } from "@/integrations/supabase/client";
import pako from 'pako';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper to get the auth token from Supabase session
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Synchronous version for cases where we already have the token
function getStoredToken(): string | null {
  // Check localStorage first (for JWT token from login)
  const token = localStorage.getItem('supabase.auth.token');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      return parsed?.currentSession?.access_token || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Handle authentication failure
function handleAuthFailure() {
  // Redirect to auth page
  window.location.href = '/auth';
}

// Main request function that ALL API calls should use
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Always attach Bearer token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Handle 401 — token expired or invalid
  if (response.status === 401) {
    // Try to refresh the session
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (session && !error) {
      // Retry the original request with new token
      headers['Authorization'] = `Bearer ${session.access_token}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (!retryResponse.ok) {
        if (retryResponse.status === 401) {
          handleAuthFailure();
          throw new Error('Authentication failed');
        }
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${retryResponse.status}`);
      }
      
      // Handle empty responses
      const text = await retryResponse.text();
      if (!text) return undefined as T;
      return JSON.parse(text);
    } else {
      // Refresh failed, redirect to login
      handleAuthFailure();
      throw new Error('Authentication failed');
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  
  // Handle empty responses
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  
  post: <T = any>(endpoint: string, body?: any) => apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  }),
  
  put: <T = any>(endpoint: string, body?: any) => apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  }),
  
  patch: <T = any>(endpoint: string, body?: any) => apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  }),
  
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
  
  // For file uploads (multipart form data — no Content-Type header, let browser set it)
  upload: async <T = any>(endpoint: string, formData: FormData): Promise<T> => {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        handleAuthFailure();
        throw new Error('Authentication failed');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
    }
    
    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text);
  },
};

// Compression helpers using pako
export function compressData(data: any): Uint8Array {
  const jsonString = JSON.stringify(data);
  return pako.deflate(jsonString);
}

export function decompressData(compressed: Uint8Array): any {
  const decompressed = pako.inflate(compressed, { to: 'string' });
  return JSON.parse(decompressed);
}

export default api;
