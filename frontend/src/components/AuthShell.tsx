import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="auth-grid px-4 py-8 sm:px-6 lg:px-8">
      <section className="hidden lg:block">
        <div className="glass-panel-strong p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">B2B Marketplace</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white">
            Connect buyers and suppliers with <span className="gradient-text">smart RFQs</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-400">
            Post requirements, receive competitive quotations, and manage procurement in one modern workspace.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Secure', 'JWT auth and role-based access'],
              ['Fast', 'Create RFQs in minutes'],
              ['Transparent', 'Compare supplier quotes easily'],
            ].map(([heading, text]) => (
              <div key={heading} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{heading}</p>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md">
        <Card strong>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>
        </Card>
      </section>
    </div>
  );
}

function Card({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return <div className={strong ? 'glass-panel-strong p-8' : 'glass-panel p-8'}>{children}</div>;
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-semibold text-indigo-300 hover:text-indigo-200">
      {children}
    </Link>
  );
}
