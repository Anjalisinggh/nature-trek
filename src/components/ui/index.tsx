import type { ReactNode } from 'react';

export { Reveal, Stagger } from '../motion';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import type { Freshness, InfoRow as InfoRowModel } from '../../data/models';

/* ── Shared UI ─────────────────────────────────────────────────────── */

export function Button({
  variant = 'primary', to, href, onClick, icon = 'arrow-right', children, small, type = 'button', disabled,
}: {
  variant?: 'primary' | 'ghost' | 'moss';
  to?: string;
  href?: string;
  onClick?: () => void;
  icon?: IconName | null;
  children: ReactNode;
  small?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const cls = `btn btn--${variant}${small ? ' btn--sm' : ''}`;
  const inner = <>{children}{icon && <Icon name={icon} size={15} />}</>;
  if (to) return <Link className={cls} to={to}>{inner}</Link>;
  if (href) return <a className={cls} href={href}>{inner}</a>;
  return <button className={cls} type={type} onClick={onClick} disabled={disabled}>{inner}</button>;
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="link" to={to}>{children}<Icon name="arrow-right" size={13} /></Link>;
}

export function SectionHead({
  index, title, kicker,
}: { index?: string; title?: string; kicker?: string }) {
  return (
    <div className="section-head">
      {index && <span className="index">{index}</span>}
      <span className="label">{kicker}</span>
      <span className="rule-inline" />
      {title && <span className="label">{title}</span>}
    </div>
  );
}

export function Notice({ children, quiet, icon = 'info' }: { children: ReactNode; quiet?: boolean; icon?: IconName }) {
  return (
    <div className={`notice${quiet ? ' notice--quiet' : ''}`} role="note">
      <Icon name={icon} size={16} />
      <div>{children}</div>
    </div>
  );
}

export function InfoRows({ rows }: { rows: InfoRowModel[] }) {
  return (
    <dl style={{ margin: 0 }}>
      {rows.map((r) => (
        <div className="info-row" key={r.label}>
          <dt>{r.label}</dt>
          <dd>
            {r.unverified
              ? <span className="unverified"><Icon name="info" size={13} />{r.value}</span>
              : r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function LeafList({ items }: { items: string[] }) {
  return <ul className="leaf-list">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

export function Tags({ items }: { items: string[] }) {
  return <div className="tags">{items.map((i) => <span className="tag" key={i}>{i}</span>)}</div>;
}

/** Provenance for anything that changes in the real world. */
export function FreshnessNote({ freshness, subject }: { freshness: Freshness; subject: string }) {
  if (freshness.status === 'unverified' || !freshness.lastUpdated) {
    return (
      <Notice quiet>
        <strong style={{ color: 'var(--ivory)', fontWeight: 500 }}>Not verified by this guide.</strong>{' '}
        {subject} changes. Check official park signage and channels on the day of your visit.
      </Notice>
    );
  }
  return (
    <Notice quiet icon="check">
      {freshness.status} · last verified {freshness.lastUpdated}
      {freshness.source ? ` · ${freshness.source}` : ''}
    </Notice>
  );
}

export function SaveButton({ saved, onToggle, label }: { saved: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      className="btn btn--ghost btn--sm"
      aria-pressed={saved}
      onClick={onToggle}
      style={saved ? { borderColor: 'var(--sun)', color: 'var(--sun)' } : undefined}
    >
      {saved ? 'Saved' : 'Save'}
      <Icon name="heart" size={14} />
      <span className="sr-only">{saved ? `Remove ${label} from your journey` : `Save ${label} to your journey`}</span>
    </button>
  );
}

/* ── States ────────────────────────────────────────────────────────── */

export function EmptyState({ icon = 'leaf', title, body, action }: {
  icon?: IconName; title: string; body: string; action?: ReactNode;
}) {
  return (
    <div className="state">
      <span style={{ color: 'var(--moss)' }}><Icon name={icon} size={32} /></span>
      <h3 className="h3">{title}</h3>
      <p className="body" style={{ maxWidth: '42ch' }}>{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state" role="alert">
      <span style={{ color: 'var(--sun)' }}><Icon name="alert" size={32} /></span>
      <h3 className="h3">Something did not load</h3>
      <p className="body" style={{ maxWidth: '42ch' }}>{message}</p>
      {onRetry && <Button variant="ghost" onClick={onRetry} icon={null}>Try again</Button>}
    </div>
  );
}

export function OfflineState() {
  return (
    <div className="state">
      <span style={{ color: 'var(--sun)' }}><Icon name="alert" size={32} /></span>
      <h3 className="h3">You are exploring offline</h3>
      <p className="body" style={{ maxWidth: '46ch' }}>
        This part of the guide needs a connection. Saved places, saved trails, your upcoming visit and the
        safety information are still available.
      </p>
    </div>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="skeleton" style={{ height: 320 }} />
      <div className="skeleton" style={{ height: 20, width: '38%', marginTop: 34 }} />
      <div className="skeleton" style={{ height: 13, width: '62%', marginTop: 16 }} />
      <div className="skeleton" style={{ height: 13, width: '48%', marginTop: 10 }} />
    </div>
  );
}

