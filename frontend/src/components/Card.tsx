import type { ReactNode } from 'react';

export function Card({ children, className = '', strong = false }: { children: ReactNode; className?: string; strong?: boolean }) {
  return <div className={`${strong ? 'glass-panel-strong' : 'glass-panel'} p-5 sm:p-6 ${className}`}>{children}</div>;
}
