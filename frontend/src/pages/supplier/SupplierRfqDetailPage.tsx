import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMyQuotations, fetchRfq, getErrorMessage, submitQuotation } from '../../api/marketplace';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorState } from '../../components/ErrorState';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { QuotationOutcomeBadge } from '../../components/QuotationOutcomeBadge';
import { Spinner } from '../../components/Spinner';
import { TextArea } from '../../components/TextArea';
import { StatusBadge } from '../../components/StatusBadge';
import { getQuotationOutcome } from '../../utils/rfqStatus';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function SupplierRfqDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [quotedPrice, setQuotedPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('7');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const rfqQuery = useQuery({
    queryKey: ['supplier-rfq', id],
    queryFn: () => fetchRfq(id),
    enabled: Boolean(id),
  });

  const quotesQuery = useQuery({
    queryKey: ['supplier-quotes'],
    queryFn: fetchMyQuotations,
  });

  const myQuote = quotesQuery.data?.items.find((quote) => quote.rfq_id === id);
  const data = rfqQuery.data;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitQuotation({
        rfq_id: id,
        quoted_price: Number(quotedPrice),
        estimated_delivery_days: Number(deliveryDays),
        message: message || undefined,
      });
      navigate('/supplier/quotes');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (rfqQuery.isLoading || quotesQuery.isLoading) return <Spinner label="Loading RFQ details..." />;
  if (rfqQuery.isError || !data) return <ErrorState message="RFQ not available" />;

  const canSubmit = data.status === 'OPEN' && !data.awarded_quotation_id && !myQuote;
  const outcome = myQuote ? getQuotationOutcome(myQuote) : null;

  return (
    <div className="space-y-8">
      <PageHeader title={data.product_name} description="Review the requirement and submit your quotation." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card strong>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <StatusBadge rfq={data} />
            {myQuote ? <QuotationOutcomeBadge quote={myQuote} /> : null}
          </div>
          <p className="text-sm leading-7 text-slate-300">{data.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="meta-chip">Qty {data.quantity}</span>
            <span className="meta-chip">{data.delivery_location}</span>
            <span className="meta-chip">Deadline {formatDate(data.deadline)}</span>
          </div>
          <div className="mt-8">
            <Link to="/supplier/rfqs">
              <Button variant="secondary">Back to Browse</Button>
            </Link>
          </div>
        </Card>

        <Card strong>
          {outcome === 'WON' ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-emerald-300">You got this requirement</h2>
              <p className="text-sm leading-6 text-slate-300">
                The buyer finalized your quotation. This RFQ is now closed and awarded to you.
              </p>
            </div>
          ) : outcome === 'NOT_SELECTED' ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-200">Not selected</h2>
              <p className="text-sm leading-6 text-slate-400">
                The buyer finalized another supplier for this requirement.
              </p>
            </div>
          ) : myQuote ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Quotation submitted</h2>
              <p className="text-sm leading-6 text-slate-400">
                You already submitted a quote for this RFQ. You can only submit once per requirement.
              </p>
              <Link to="/supplier/quotes">
                <Button variant="secondary">View My Quotes</Button>
              </Link>
            </div>
          ) : canSubmit ? (
            <>
              <h2 className="text-xl font-semibold text-white">Submit Quotation</h2>
              <p className="mt-2 text-sm text-slate-400">One quotation per supplier for each RFQ.</p>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <Input label="Quoted price (USD)" type="number" min="0.01" step="0.01" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} required />
                <Input label="Estimated delivery time (days)" type="number" min={1} value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} required />
                <TextArea label="Message / notes" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Optional notes about pricing, terms, or delivery." />
                {error ? <ErrorState message={error} /> : null}
                <Button type="submit" loading={loading} className="w-full">
                  Submit Quotation
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">RFQ closed</h2>
              <p className="text-sm leading-6 text-slate-400">This requirement is no longer accepting quotations.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
