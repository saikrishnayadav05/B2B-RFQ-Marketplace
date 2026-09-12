import { getQuotationOutcome } from '../utils/rfqStatus';
import type { Quotation } from '../types';

const styles = {
  WON: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  PENDING: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  NOT_SELECTED: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
};

const labels = {
  WON: 'Won',
  PENDING: 'Pending',
  NOT_SELECTED: 'Not selected',
};

export function QuotationOutcomeBadge({ quote }: { quote: Pick<Quotation, 'is_awarded' | 'rfq_status'> }) {
  const outcome = getQuotationOutcome(quote);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles[outcome]}`}>
      {labels[outcome]}
    </span>
  );
}
