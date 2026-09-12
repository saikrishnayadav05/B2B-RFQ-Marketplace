import { getRfqStatusLabel } from '../utils/rfqStatus';
import type { RFQ } from '../types';

const styles = {
  OPEN: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  AWARDED: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-200',
  EXPIRED: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
};

const labels = {
  OPEN: 'Open',
  AWARDED: 'Awarded',
  EXPIRED: 'Closed',
};

export function StatusBadge({ rfq }: { rfq: Pick<RFQ, 'status' | 'awarded_quotation_id'> }) {
  const label = getRfqStatusLabel(rfq);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles[label]}`}>
      {labels[label]}
    </span>
  );
}
