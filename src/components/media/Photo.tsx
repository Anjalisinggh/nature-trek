import { useState } from 'react';
import manifest from '../../data/photos.json';
import { FOCUS } from '../../data/photoSlots';

/* ── Photography ───────────────────────────────────────────────────────
   Every photograph is a real, licensed image from Wikimedia Commons,
   downloaded into /public/photos by `npm run photos`, with the
   photographer and licence recorded in the manifest.

   Two facts this component refuses to blur:

   1. Provenance. Images taken in Sanjay Gandhi National Park are
      captioned as such. Images that merely show the species or subject
      are labelled "representative" — captioning them as SGNP would be
      a fabrication.
   2. Attribution. CC licences require credit, so the credit travels
      with the image rather than living in a footer nobody reads.      */

export type PhotoSlot = keyof typeof manifest;

interface Entry {
  file: string;
  card: string;
  width: number;
  height: number;
  alt: string;
  place: 'sgnp' | 'repr';
  credit: {
    title: string;
    artist: string;
    license: string;
    licenseUrl: string | null;
    source: string;
  };
}

const photos = manifest as unknown as Record<string, Entry>;

export const getPhoto = (slot: string | null | undefined): Entry | null =>
  (slot && photos[slot]) || null;

export const hasPhoto = (slot: string | null | undefined) => !!getPhoto(slot);

interface Props {
  slot: string | null | undefined;
  /** Overrides the manifest alt text where the context needs something else. */
  alt?: string;
  /** height / width */
  ratio?: number;
  sizes?: string;
  /** Above-the-fold images load eagerly and get fetch priority. */
  priority?: boolean;
  className?: string;
  /** Where the subject sits, so art-directed crops keep it in frame. */
  position?: string;
  credit?: 'none' | 'inline' | 'corner';
  /** Rendered when the slot has no photograph. */
  fallback?: React.ReactNode;
}

export function Photo({
  slot, alt, ratio = 0.66, sizes = '(max-width: 900px) 100vw, 50vw',
  priority = false, className = '', position, credit = 'corner', fallback,
}: Props) {
  const entry = getPhoto(slot);
  const [loaded, setLoaded] = useState(false);

  if (!entry) {
    return (
      <div className={`photo photo--empty ${className}`} style={{ aspectRatio: `1 / ${ratio}` }}>
        {fallback ?? <NoPhoto />}
      </div>
    );
  }

  return (
    <figure className={`photo ${className}`} style={{ aspectRatio: `1 / ${ratio}` }}>
      <img
        src={entry.file}
        srcSet={`${entry.card} 760w, ${entry.file} ${entry.width}w`}
        sizes={sizes}
        alt={alt ?? entry.alt}
        width={entry.width}
        height={entry.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={`photo__img${loaded ? ' is-loaded' : ''}`}
        style={{ objectPosition: position ?? FOCUS[slot as string] ?? 'center' }}
      />

      {credit !== 'none' && (
        <figcaption className={`photo__credit photo__credit--${credit}`}>
          {entry.place === 'repr' && <span className="photo__badge">Representative</span>}
          <span className="photo__by">
            {entry.credit.artist} ·{' '}
            <a href={entry.credit.source} target="_blank" rel="noreferrer noopener">
              {entry.credit.license}
            </a>
          </span>
        </figcaption>
      )}
    </figure>
  );
}

/** A deliberate absence, not a broken image. Used where the guide has no
 *  photograph it can honestly attribute — which is itself information. */
export function NoPhoto({ label = 'No photograph', note }: { label?: string; note?: string }) {
  return (
    <div className="nophoto">
      <svg viewBox="0 0 120 120" aria-hidden="true" className="nophoto__mark">
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <path d="M60 104V44" />
          <path d="M60 62c-9-14-24-17-31-9-7 8-2 22 8 27" />
          <path d="M60 62c9-14 24-17 31-9 7 8 2 22-8 27" />
          <path d="M60 44c-6-9-4-19 0-24 4 5 6 15 0 24Z" />
          <path d="M38 104h44" />
        </g>
      </svg>
      <span className="nophoto__label">{label}</span>
      {note && <span className="nophoto__note">{note}</span>}
    </div>
  );
}

/** Every photograph used on the site, for the colophon. */
export const allPhotos = () =>
  Object.entries(photos).map(([slot, e]) => ({ slot, ...e }));
