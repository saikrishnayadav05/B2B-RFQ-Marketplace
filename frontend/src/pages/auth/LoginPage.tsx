import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, loginUser } from '../../api/marketplace';
import { AuthLink, AuthShell } from '../../components/AuthShell';
import { Button } from '../../components/Button';
import { ErrorState } from '../../components/ErrorState';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      setUser(response.user);
      navigate(response.user.role === 'BUYER' ? '/buyer/rfqs' : '/supplier/rfqs');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your buyer or supplier workspace."
      footer={
        <>
          No account yet? <AuthLink to="/register">Create one</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <ErrorState message={error} /> : null}
        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
