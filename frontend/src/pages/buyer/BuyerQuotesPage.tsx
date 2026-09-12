import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRfq, fetchRfqQuotations, finalizeQuotation, getErrorMessage } from '../../api/marketplace';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { QuotationOutcomeBadge } from '../../components/QuotationOutcomeBadge';
import { Spinner } from '../../components/Spinner';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function BuyerQuotesPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [pendingFinalize, setPendingFinalize] = useState<{ quotationId: string; supplierName: string } | null>(null);

  const rfqQuery = useQuery({
    queryKey: ['rfq', id],
    queryFn: () => fetchRfq(id),
    enabled: Boolean(id),
  });

  const quotesQuery = useQuery({
    queryKey: ['rfq-quotes', id],
    queryFn: () => fetchRfqQuotations(id),
    enabled: Boolean(id),
  });

  async function handleFinalizeConfirm() {
    if (!pendingFinalize) return;

    setError('');
    setFinalizingId(pendingFinalize.quotationId);
    try {
      await finalizeQuotation(id, pendingFinalize.quotationId);
      setPendingFinalize(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rfq', id] }),
        queryClient.invalidateQueries({ queryKey: ['rfq-quotes', id] }),
        queryClient.invalidateQueries({ queryKey: ['buyer-rfqs'] }),
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFinalizingId(null);
    }
  }

  if (rfqQuery.isLoading || quotesQuery.isLoading) {
    return <Spinner label="Loading quotations..." />;
  }

  if (rfqQuery.isError || quotesQuery.isError || !rfqQuery.data) {
    return <ErrorState message="Unable to load quotations for this RFQ." />;
  }

  const rfq = rfqQuery.data;
  const quotes = quotesQuery.data?.items ?? [];
  const isOpen = rfq.status === 'OPEN' && !rfq.awarded_quotation_id;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quotations Received"
        description={`Review supplier responses for ${rfq.product_name}.`}
        action={
          <Link to="/buyer/rfqs">
            <Button variant="secondary">Back to RFQs</Button>
          </Link>
        }
      />

      {rfq.awarded_quotation_id ? (
        <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-4 text-sm text-indigo-100">
          Requirement closed — awarded to <span className="font-semibold">{rfq.awarded_supplier_name}</span>.
        </div>
      ) : null}

      {error ? <ErrorState message={error} /> : null}

      {!quotes.length ? (
        <EmptyState
          title="No quotations yet"
          description="Suppliers can submit quotes until the RFQ deadline passes."
        />
      ) : (
        <div className="grid gap-5">
          {quotes.map((quote) => (
            <Card key={quote.id} strong>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">{quote.supplier_name}</h2>
                    <QuotationOutcomeBadge quote={quote} />
                  </div>
                  <p className="text-sm text-slate-400">Submitted {formatDate(quote.created_at)}</p>
                  {quote.message ? <p className="text-sm leading-6 text-slate-300">{quote.message}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-right">
                    <p className="text-2xl font-bold text-emerald-300">${Number(quote.quoted_price).toFixed(2)}</p>
                    <p className="mt-1 text-sm text-emerald-100/80">{quote.estimated_delivery_days} day delivery</p>
                  </div>
                  {isOpen ? (
                    <Button
                      loading={finalizingId === quote.id}
                      onClick={() =>
                        setPendingFinalize({
                          quotationId: quote.id,
                          supplierName: quote.supplier_name || 'this supplier',
                        })
                      }
                    >
                      Finalize
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingFinalize)}
        title="Finalize quotation?"
        description={
          pendingFinalize
            ? `Award this RFQ to ${pendingFinalize.supplierName}. The requirement will be marked as closed and other suppliers will see they were not selected.`
            : ''
        }
        confirmLabel="Yes, finalize"
        cancelLabel="Not yet"
        loading={Boolean(finalizingId)}
        onConfirm={handleFinalizeConfirm}
        onCancel={() => {
          if (!finalizingId) setPendingFinalize(null);
        }}
      />
    </div>
  );
}
