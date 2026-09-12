import axios from 'axios';
import type {
  AuthResponse,
  Quotation,
  QuotationListResponse,
  RFQ,
  RFQListResponse,
  User,
} from '../types';
import {
  apiBaseUrl,
  clearAuthToken,
  clearStoredUser,
  getAuthToken,
  setAuthToken,
  setStoredUser,
} from './client';

const api = axios.create({
  baseURL: `${apiBaseUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      clearStoredUser();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export async function registerUser(payload: {
  email: string;
  password: string;
  full_name: string;
  role: 'BUYER' | 'SUPPLIER';
}): Promise<User> {
  const { data } = await api.post<User>('/auth/register', payload);
  return data;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  setAuthToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  setStoredUser(data);
  return data;
}

export async function createRfq(payload: {
  product_name: string;
  description: string;
  quantity: number;
  delivery_location: string;
  deadline: string;
}): Promise<RFQ> {
  const { data } = await api.post<RFQ>('/rfqs/', payload);
  return data;
}

export async function fetchMyRfqs(): Promise<RFQ[]> {
  const { data } = await api.get<RFQ[]>('/rfqs/mine');
  return data;
}

export async function fetchRfq(id: string): Promise<RFQ> {
  const { data } = await api.get<RFQ>(`/rfqs/${id}`);
  return data;
}

export async function updateRfq(
  id: string,
  payload: Partial<{
    product_name: string;
    description: string;
    quantity: number;
    delivery_location: string;
    deadline: string;
  }>,
): Promise<RFQ> {
  const { data } = await api.put<RFQ>(`/rfqs/${id}`, payload);
  return data;
}

export async function deleteRfq(id: string): Promise<void> {
  await api.delete(`/rfqs/${id}`);
}

export async function finalizeQuotation(rfqId: string, quotationId: string): Promise<RFQ> {
  const { data } = await api.post<RFQ>(`/rfqs/${rfqId}/finalize`, { quotation_id: quotationId });
  return data;
}

export async function browseRfqs(params: {
  search?: string;
  location?: string;
  deadline_before?: string;
  page?: number;
  limit?: number;
}): Promise<RFQListResponse> {
  const { data } = await api.get<RFQListResponse>('/rfqs/browse', { params });
  return data;
}

export async function submitQuotation(payload: {
  rfq_id: string;
  quoted_price: number;
  estimated_delivery_days: number;
  message?: string;
}): Promise<Quotation> {
  const { data } = await api.post<Quotation>('/quotations/', payload);
  return data;
}

export async function fetchMyQuotations(): Promise<QuotationListResponse> {
  const { data } = await api.get<QuotationListResponse>('/quotations/mine');
  return data;
}

export async function fetchRfqQuotations(rfqId: string): Promise<QuotationListResponse> {
  const { data } = await api.get<QuotationListResponse>(`/quotations/rfq/${rfqId}`);
  return data;
}

export function logoutUser(): void {
  clearAuthToken();
  clearStoredUser();
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail[0]?.msg || 'Request failed';
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the API. Check that the backend is running and CORS is configured.';
    }
  }
  return 'Something went wrong. Please try again.';
}
