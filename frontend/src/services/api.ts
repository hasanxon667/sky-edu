// API service configuration for Skyline Education Backend
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('sky_edu_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Xatolik yuz berdi' }));
      throw new Error(errData.error || `Server xatosi: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}
