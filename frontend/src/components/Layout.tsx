import type { ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);
  return (
    <Link to={to} className={active ? 'nav-link nav-link-active' : 'nav-link'}>
      {children}
    </Link>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen">
      {!isAuthPage ? (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <Link to="/" className="text-xl font-bold tracking-tight text-white">
                RFQ<span className="gradient-text">Market</span>
              </Link>
              {user ? (
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                  <span>{user.full_name}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                    {user.role}
                  </span>
                </div>
              ) : null}
            </div>

            {user ? (
              <nav className="flex flex-wrap items-center gap-2">
                {user.role === 'BUYER' ? (
                  <>
                    <NavLink to="/buyer/rfqs">My RFQs</NavLink>
                    <NavLink to="/buyer/rfqs/new">Create RFQ</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/supplier/rfqs">Browse RFQs</NavLink>
                    <NavLink to="/supplier/quotes">My Quotes</NavLink>
                  </>
                )}
                <Button variant="secondary" onClick={logout}>
                  Logout
                </Button>
              </nav>
            ) : null}
          </div>
        </header>
      ) : null}

      <main className={isAuthPage ? '' : 'page-shell'}>
        <Outlet />
      </main>
    </div>
  );
}

export function ProtectedRoute({ role }: { role?: 'BUYER' | 'SUPPLIER' }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400">Checking session...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'BUYER' ? '/buyer/rfqs' : '/supplier/rfqs'} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400">Loading...</div>;
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'BUYER' ? '/buyer/rfqs' : '/supplier/rfqs'} replace />;
  }

  return <Outlet />;
}
