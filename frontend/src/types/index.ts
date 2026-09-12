export type UserRole = 'BUYER' | 'SUPPLIER';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RFQ {
  id: string;
  buyer_id: string;
  product_name: string;
  description: string;
  quantity: number;
  delivery_location: string;
  deadline: string;
  status: 'OPEN' | 'CLOSED';
  awarded_quotation_id?: string | null;
  awarded_supplier_name?: string | null;
  created_at: string;
  updated_at: string;
  quotation_count: number;
}

export interface RFQListResponse {
  items: RFQ[];
  total: number;
  page: number;
  limit: number;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  supplier_id: string;
  quoted_price: number;
  estimated_delivery_days: number;
  message: string | null;
  created_at: string;
  updated_at: string;
  supplier_name?: string | null;
  rfq_product_name?: string | null;
  is_awarded?: boolean;
  rfq_status?: 'OPEN' | 'CLOSED' | null;
}

export interface QuotationListResponse {
  items: Quotation[];
  total: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
