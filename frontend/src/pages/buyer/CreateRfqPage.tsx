import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createRfq, getErrorMessage } from '../../api/marketplace';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DateTimeInput } from '../../components/DateTimeInput';
import { ErrorState } from '../../components/ErrorState';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { TextArea } from '../../components/TextArea';
import { getMinDeadlineInputValue, validateFutureDeadline } from '../../utils/deadline';

export function CreateRfqPage() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      await createRfq({
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Create RFQ"
        description="Publish a clear requirement so suppliers can respond with competitive quotations."
      />

      <Card strong>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Product or service name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          <TextArea label="Requirement description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            <Input label="Delivery location" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} required />
          </div>
          <DateTimeInput
            label="RFQ deadline"
            value={deadline}
            min={getMinDeadlineInputValue()}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
          <p className="text-xs text-slate-400">Deadline must be in the future.</p>
          {error ? <ErrorState message={error} /> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={loading}>
              Publish RFQ
            </Button>
            <Link to="/buyer/rfqs">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
