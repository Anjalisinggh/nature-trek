import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Photo, NoPhoto } from '../media/Photo';
import { Icon } from '../ui/Icon';
import { useParallax } from '../motion';

/* Shared page opening: full-bleed photograph with the editorial block
   anchored low-left, and a breadcrumb back to its index. */

export function PageHero({
  slot, alt, kicker, title, tagline, breadcrumb, actions, noPhotoNote,
}: {
  slot: string | null;
  alt?: string;
  kicker: string;
  title: string;
  tagline?: string;
  breadcrumb?: { to: string; label: string };
  actions?: ReactNode;
  noPhotoNote?: string;
}) {
  const plane = useParallax(0.1, 18);

  return (
    <section className="page-hero">
      <div className="page-hero__art">
        <div className="hero__plane hero__planeIn" style={plane}>
          {slot ? (
            <Photo
              slot={slot}
              alt={alt}
              ratio={0.56}
              sizes="100vw"
              priority
              credit="none"
              className="page-hero__photo"
            />
          ) : (
            <NoPhoto label="No photograph" note={noPhotoNote} />
          )}
        </div>
        <div className="hero__veil" />
        <div className="hero__grain" />
      </div>

      <div className="page-hero__inner">
        {breadcrumb && (
          <Link to={breadcrumb.to} className="link stage d1" style={{ marginBottom: 28, border: 0, padding: 0, gap: 10 }}>
            <Icon name="arrow-left" size={13} /> {breadcrumb.label}
          </Link>
        )}
        <span className="label label--light stage d2">{kicker}</span>
        <h1 className="display stage d3" style={{ marginTop: 16, maxWidth: '18ch' }}>{title}</h1>
        {tagline && (
          <p className="stage d4 serif-italic" style={{ marginTop: 20, fontSize: 'var(--fs-h3)', color: 'var(--ivory-soft)', maxWidth: '32ch' }}>
            {tagline}
          </p>
        )}
        {actions && <div className="stage d5" style={{ marginTop: 34, display: 'flex', gap: 16, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </section>
  );
}

/** Opening block for index pages, which have no single hero image. */
export function IndexHead({
  index, kicker, title, lead, children,
}: { index: string; kicker: string; title: ReactNode; lead: string; children?: ReactNode }) {
  return (
    <div className="wrap" style={{ paddingTop: 'calc(var(--nav-h) + clamp(50px, 6vw, 96px))' }}>
      <div className="section-head">
        <span className="index">{index}</span>
        <span className="label">{kicker}</span>
        <span className="rule-inline" />
      </div>
      <div className="grid12" style={{ marginTop: 40, alignItems: 'end' }}>
        <h1 className="display c1-6">{title}</h1>
        <div className="c8-12">
          <p className="lead">{lead}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
