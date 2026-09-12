import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMyQuotations, getErrorMessage } from '../../api/marketplace';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { QuotationOutcomeBadge } from '../../components/QuotationOutcomeBadge';
import { Spinner } from '../../components/Spinner';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function SupplierQuotesPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['supplier-quotes'],
    queryFn: fetchMyQuotations,
  });

  if (isLoading) return <Spinner label="Loading your quotations..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} />;

  const quotes = data?.items ?? [];
  const wonCount = quotes.filter((quote) => quote.is_awarded).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Quotations"
        description="Track every quotation you have submitted and see which requirements you won."
        action={
          <Link to="/supplier/rfqs">
            <Button>Browse RFQs</Button>
          </Link>
        }
      />

      {quotes.length ? (
        <Card>
          <p className="text-sm text-slate-400">Requirements won</p>
          <p className="mt-2 text-3xl font-bold text-white">{wonCount}</p>
        </Card>
      ) : null}

      {!quotes.length ? (
        <EmptyState title="No quotations submitted" description="Browse open RFQs and submit your first quotation." />
      ) : (
        <div className="grid gap-5">
          {quotes.map((quote) => (
            <Card key={quote.id} strong>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-white">{quote.rfq_product_name}</h2>
                    <QuotationOutcomeBadge quote={quote} />
                  </div>
                  <p className="text-sm text-slate-400">Submitted {formatDate(quote.created_at)}</p>
                  {quote.message ? <p className="text-sm leading-6 text-slate-300">{quote.message}</p> : null}
                  {quote.is_awarded ? (
                    <p className="text-sm font-medium text-emerald-300">You got this requirement from the buyer.</p>
                  ) : null}
                  <Link to={`/supplier/rfqs/${quote.rfq_id}`} className="inline-block text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                    View RFQ
                  </Link>
                </div>
                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-5 py-4 text-right">
                  <p className="text-2xl font-bold text-sky-300">${Number(quote.quoted_price).toFixed(2)}</p>
                  <p className="mt-1 text-sm text-sky-100/80">{quote.estimated_delivery_days} day delivery</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
