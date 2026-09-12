import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, loginUser, registerUser } from '../../api/marketplace';
import { AuthLink, AuthShell } from '../../components/AuthShell';
import { Button } from '../../components/Button';
import { ErrorState } from '../../components/ErrorState';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('BUYER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser({ email, password, full_name: fullName, role });
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
      title="Create account"
      subtitle="Join the marketplace as a buyer or supplier."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <div className="space-y-2">
          <span className="block text-sm font-medium text-slate-200">Role</span>
          <div className="grid grid-cols-2 gap-3">
            {(['BUYER', 'SUPPLIER'] as UserRole[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  role === option
                    ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200 shadow-lg shadow-indigo-500/10'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {error ? <ErrorState message={error} /> : null}
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
