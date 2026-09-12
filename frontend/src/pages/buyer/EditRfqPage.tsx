import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deleteRfq, fetchRfq, getErrorMessage, updateRfq } from '../../api/marketplace';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DateTimeInput } from '../../components/DateTimeInput';
import { ErrorState } from '../../components/ErrorState';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import { TextArea } from '../../components/TextArea';
import { getMinDeadlineInputValue, toDateTimeLocal, validateFutureDeadline } from '../../utils/deadline';

export function EditRfqPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rfq', id],
    queryFn: () => fetchRfq(id),
    enabled: Boolean(id),
  });

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    setProductName(data.product_name);
    setDescription(data.description);
    setQuantity(String(data.quantity));
    setDeliveryLocation(data.delivery_location);
    setDeadline(toDateTimeLocal(data.deadline));
  }, [data]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const deadlineError = validateFutureDeadline(deadline);
    if (deadlineError) {
      setError(deadlineError);
      return;
    }

    setLoading(true);

    try {
      await updateRfq(id, {
        product_name: productName,
        description,
        quantity: Number(quantity),
        delivery_location: deliveryLocation,
        deadline: new Date(deadline).toISOString(),
      });
      navigate('/buyer/rfqs');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this RFQ?')) return;
    setLoading(true);
    try {
      await deleteRfq(id);
      navigate('/buyer/rfqs');
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  if (isLoading) return <Spinner label="Loading RFQ..." />;
  if (isError || !data) return <ErrorState message="RFQ not found" />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Edit RFQ" description="Update your requirement details before the deadline." />

      <Card strong>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Product or service name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          <TextArea label="Requirement description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            <Input label="Delivery location" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} required />
          </div>
          <DateTimeInput label="RFQ deadline" value={deadline} min={getMinDeadlineInputValue()} onChange={(e) => setDeadline(e.target.value)} required />
          <p className="text-xs text-slate-400">Deadline must be in the future.</p>
          {error ? <ErrorState message={error} /> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
            <Link to="/buyer/rfqs">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
