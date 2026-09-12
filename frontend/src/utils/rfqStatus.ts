import type { Quotation, RFQ } from '../types';

export function getRfqStatusLabel(rfq: Pick<RFQ, 'status' | 'awarded_quotation_id'>) {
  if (rfq.status === 'OPEN') return 'OPEN';
  if (rfq.awarded_quotation_id) return 'AWARDED';
  return 'EXPIRED';
}

export function getQuotationOutcome(quote: Pick<Quotation, 'is_awarded' | 'rfq_status'>) {
  if (quote.is_awarded) return 'WON';
  if (quote.rfq_status === 'OPEN') return 'PENDING';
  return 'NOT_SELECTED';
}
