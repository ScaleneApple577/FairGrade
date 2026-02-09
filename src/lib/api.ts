import pako from 'pako';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fairgrade.onrender.com';
// ============ Role Mapping ============
// Backend uses "instructor" but frontend uses "teacher" for routing and display

export const ROLE_MAP: Record<string, string> = {
  // API value → Frontend display
  'instructor': 'teacher',
  'student': 'student',
};

export const API_ROLE_MAP: Record<string, string> = {
  // Frontend value → API value
  'teacher': 'instructor',
  'student': 'student',
};

export function toFrontendRole(apiRole: string | null | undefined): string | null {
  if (!apiRole) return null;
  return ROLE_MAP[apiRole] || apiRole;
}

export function toApiRole(frontendRole: string | null | undefined): string | null {
  if (!frontendRole) return null;
  return API_ROLE_MAP[frontendRole] || frontendRole;
}

// ============ User Normalization ============
// Backend returns: { id, email, first_name, last_name, role, created_at }
// Frontend expects: { id, email, name, role, first_name, last_name }

export interface NormalizedUser {
  id: string;
  email: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  created_at?: string;
}

export function normalizeUser(apiUser: any): NormalizedUser {
  const firstName = apiUser?.first_name || '';
  const lastName = apiUser?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return {
    id: apiUser?.id || '',
    email: apiUser?.email || '',
    name: fullName || apiUser?.email || '',
    first_name: firstName || null,
    last_name: lastName || null,
    role: toFrontendRole(apiUser?.role),
    created_at: apiUser?.created_at,
  };
}

// ============ Auth Token Helpers ============

// Helper to get the auth token from localStorage
async function getAuthToken(): Promise<string | null> {
  return localStorage.getItem('access_token');
}

// Handle authentication failure - redirect to login immediately
function handleAuthFailure() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_role');
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
  
  // Handle 401 — token expired or invalid — redirect immediately (no refresh token)
  if (response.status === 401) {
    handleAuthFailure();
    throw new Error('Authentication failed');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  
  // Handle empty responses and string responses
  const text = await response.text();
  if (!text) return undefined as T;
  
  // Try to parse as JSON, fall back to returning as string
  try {
    return JSON.parse(text);
  } catch {
    // Return as-is if not valid JSON (some endpoints return plain strings)
    return text as T;
  }
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

// Fetch projects with fallback logic for endpoint discovery
export async function fetchProjectsWithFallback<T = any>(): Promise<T[]> {
  try {
    const data = await api.get<T[]>('/api/projects');
    return data || [];
  } catch {
    try {
      const data = await api.get<T[]>('/api/projects/');
      return data || [];
    } catch {
      try {
        const data = await api.get<T[]>('/api/projects/projects');
        return data || [];
      } catch {
        console.error('Could not fetch projects from any endpoint');
        return [];
      }
    }
  }
}

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
