import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMyRfqs, getErrorMessage } from '../../api/marketplace';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import { StatusBadge } from '../../components/StatusBadge';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function BuyerRfqsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['buyer-rfqs'],
    queryFn: fetchMyRfqs,
  });

  if (isLoading) return <Spinner label="Loading your RFQs..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} />;

  const totalQuotes = data?.reduce((sum, rfq) => sum + rfq.quotation_count, 0) ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="My RFQs"
        description="Manage business requirements and review competitive supplier quotations."
        action={
          <Link to="/buyer/rfqs/new">
            <Button>+ Create RFQ</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total RFQs', String(data?.length ?? 0)],
          ['Open RFQs', String(data?.filter((rfq) => rfq.status === 'OPEN').length ?? 0)],
          ['Awarded RFQs', String(data?.filter((rfq) => rfq.awarded_quotation_id).length ?? 0)],
          ['Quotes Received', String(totalQuotes)],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          </Card>
        ))}
      </div>

      {!data?.length ? (
        <EmptyState
          title="No RFQs yet"
          description="Create your first request for quotation to start receiving supplier bids."
        />
      ) : (
        <div className="grid gap-5">
          {data.map((rfq) => (
            <Card key={rfq.id} strong>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-white">{rfq.product_name}</h2>
                    <StatusBadge rfq={rfq} />
                  </div>
                  <p className="max-w-3xl text-sm leading-6 text-slate-300">{rfq.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="meta-chip">Qty {rfq.quantity}</span>
                    <span className="meta-chip">{rfq.delivery_location}</span>
                    <span className="meta-chip">Deadline {formatDate(rfq.deadline)}</span>
                    <span className="meta-chip">{rfq.quotation_count} quotes</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link to={`/buyer/rfqs/${rfq.id}/quotes`}>
                    <Button variant="secondary">View Quotes</Button>
                  </Link>
                  <Link to={`/buyer/rfqs/${rfq.id}/edit`}>
                    <Button variant="ghost">Edit</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button variant="ghost" onClick={() => refetch()}>
        Refresh list
      </Button>
    </div>
  );
}
