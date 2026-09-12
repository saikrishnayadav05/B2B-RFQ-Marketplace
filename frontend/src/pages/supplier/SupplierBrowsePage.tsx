import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { browseRfqs, getErrorMessage } from '../../api/marketplace';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DateTimeInput } from '../../components/DateTimeInput';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import { StatusBadge } from '../../components/StatusBadge';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function SupplierBrowsePage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['browse-rfqs', search, location, deadlineBefore, page],
    queryFn: () =>
      browseRfqs({
        search: search || undefined,
        location: location || undefined,
        deadline_before: deadlineBefore ? new Date(deadlineBefore).toISOString() : undefined,
        page,
        limit: 10,
      }),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Browse RFQs"
        description="Discover open business requirements and submit your best quotation."
      />

      <Card strong>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Search" placeholder="Product or description" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Input label="Location" placeholder="e.g. Hyderabad or hyd" value={location} onChange={(e) => setLocation(e.target.value)} />
          <DateTimeInput label="Deadline before" value={deadlineBefore} onChange={(e) => setDeadlineBefore(e.target.value)} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setPage(1);
              refetch();
            }}
          >
            Apply Filters
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setLocation('');
              setDeadlineBefore('');
              setPage(1);
            }}
          >
            Clear
          </Button>
        </div>
      </Card>

      {isLoading || isFetching ? <Spinner label="Searching RFQs..." /> : null}
      {isError ? <ErrorState message={getErrorMessage(error)} /> : null}

      {!isLoading && !isError && !data?.items.length ? (
        <EmptyState title="No RFQs found" description="Try adjusting your search or filters." />
      ) : null}

      {!isLoading && !isError && data?.items.length ? (
        <>
          <div className="grid gap-5">
            {data.items.map((rfq) => (
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
                    </div>
                  </div>
                  <Link to={`/supplier/rfqs/${rfq.id}`}>
                    <Button variant="secondary">View & Quote</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <span className="text-sm text-slate-400">
              Page {data.page} · {data.total} total
            </span>
            <Button variant="ghost" disabled={page * data.limit >= data.total} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
