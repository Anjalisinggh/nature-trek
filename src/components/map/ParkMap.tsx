import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapArt } from './MapArt';
import { Photo, NoPhoto } from '../media/Photo';
import { Icon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';
import { Notice, TextLink } from '../ui';
import { useInView, useCursorLabel, usePrefersReducedMotion } from '../motion';
import { label } from '../../data/repositories';
import { photoFor } from '../../data/photoSlots';
import type { MapLayer, MarkerIcon, Place, Trail } from '../../data/models';

/* ── The illustrated map ───────────────────────────────────────────────
   The map discovers itself: the land appears, then the water, then the
   paths draw on, then the markers arrive, then their labels. Clicking a
   marker moves the camera toward it and opens the place beside it — the
   map is the transition, not a link away from it.

   Two layers, kept honest about which is which: the PLATE is an
   illustrated impression; the RECORDS carry the coordinates and access
   status. The drawing never overrides the record.                     */

export const LAYERS: { id: MapLayer; label: string; icon: IconName }[] = [
  { id: 'attractions', label: 'Attractions', icon: 'compass' },
  { id: 'trails', label: 'Trails', icon: 'footsteps' },
  { id: 'wildlife', label: 'Wildlife', icon: 'paw' },
  { id: 'heritage', label: 'Heritage', icon: 'cave' },
  { id: 'water', label: 'Water', icon: 'ripple' },
  { id: 'experiences', label: 'Experiences', icon: 'star' },
  { id: 'facilities', label: 'Facilities', icon: 'info' },
];

const markerIcons: Record<MarkerIcon, IconName> = {
  gate: 'gate', boat: 'boat', train: 'train', hill: 'hill', paw: 'paw',
  butterfly: 'butterfly', footsteps: 'footsteps', bicycle: 'bicycle',
  cave: 'cave', flower: 'flower', star: 'star', ripple: 'ripple',
  river: 'river', info: 'info',
};

function tone(p: Place) {
  if (p.category === 'heritage') return 'heritage';
  if (p.category === 'water') return 'water';
  if (p.layers.includes('wildlife')) return 'wildlife';
  return 'default';
}

/** Phases of the discovery sequence. */
const PHASE = { land: 350, water: 900, paths: 1500, markers: 2400, labels: 3000 };

export function ParkMap({
  places, routeTrail, initialSelected,
}: { places: Place[]; routeTrail?: Trail | null; initialSelected?: string | null }) {
  const [wrapRef, inView] = useInView('0px 0px -20% 0px');
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState(reduced ? 5 : 0);
  const [active, setActive] = useState<Set<MapLayer>>(() => new Set(LAYERS.map((l) => l.id)));
  const [selectedId, setSelectedId] = useState<string | null>(initialSelected ?? null);
  const cursor = useCursorLabel('Explore');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!inView || reduced) { if (reduced) setPhase(5); return; }
    timers.current = [PHASE.land, PHASE.water, PHASE.paths, PHASE.markers, PHASE.labels]
      .map((t, i) => window.setTimeout(() => setPhase(i + 1), t));
    return () => timers.current.forEach(clearTimeout);
  }, [inView, reduced]);

  const visible = useMemo(
    () => places.filter((p) => p.layers.some((l) => active.has(l))),
    [places, active],
  );
  const selected = visible.find((p) => p.id === selectedId) ?? null;

  const toggle = (l: MapLayer) =>
    setActive((s) => {
      const n = new Set(s);
      if (n.has(l)) n.delete(l); else n.add(l);
      setSelectedId(null);
      return n;
    });

  // The camera: zoom toward the selected place rather than jump to a page.
  const camera = selected && !reduced
    ? `scale(1.7) translate(${(50 - selected.coordinates.x).toFixed(2)}%, ${(48 - selected.coordinates.y).toFixed(2)}%)`
    : 'scale(1) translate(0, 0)';

  const route = routeTrail
    ? routeTrail.waypoints.map((w) => `${w.coordinates.x},${w.coordinates.y}`).join(' ')
    : null;

  return (
    <div className="map-layout" ref={wrapRef as React.RefObject<HTMLDivElement>}>
      <div className="map-plate">
        <div className="map-viewport">
          <div className="map-camera" style={{ transform: camera }}>
            <div className="map-plate__inner" {...cursor}>
              <MapArt phase={phase} />

              {route && (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
                  <polyline
                    points={route}
                    fill="none"
                    stroke="var(--sun)"
                    strokeWidth="0.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 220,
                      strokeDashoffset: phase >= 3 ? 0 : 220,
                      transition: 'stroke-dashoffset 2000ms cubic-bezier(0.22,0.61,0.36,1)',
                    }}
                  />
                </svg>
              )}

              {visible.map((p, i) => (
                <button
                  key={p.id}
                  className={[
                    'marker',
                    `marker--${tone(p)}`,
                    p.accessStatus !== 'public' ? 'marker--restricted' : '',
                    phase >= 4 ? '' : 'is-off',
                  ].filter(Boolean).join(' ')}
                  style={{
                    left: `${p.coordinates.x}%`,
                    top: `${p.coordinates.y}%`,
                    transitionDelay: phase >= 4 ? `${i * 70}ms` : '0ms',
                  }}
                  aria-pressed={selectedId === p.id}
                  aria-label={`${p.name}. ${label(p.category)}${p.accessStatus !== 'public' ? '. Access restricted' : ''}`}
                  onClick={() => setSelectedId((s) => (s === p.id ? null : p.id))}
                >
                  <span className="marker__dot"><Icon name={markerIcons[p.markerIcon]} size={17} /></span>
                  <span className="marker__tip">{p.name.split(' · ')[0]}</span>
                  <span className="marker__label" style={{ opacity: phase >= 5 ? undefined : 0 }}>
                    {p.name.split(' · ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <span className="map-corner map-corner--tl">Sanjay Gandhi National Park</span>
        <span className="map-corner map-corner--tr">Plate 01 · Mumbai</span>
        <span className="map-corner map-corner--bl">Illustrated · not to scale</span>
      </div>

      <aside className="map-panel">
        {selected ? (
          <>
            <Photo
              slot={photoFor(selected.id)}
              ratio={0.66}
              sizes="360px"
              fallback={<NoPhoto label="Not pictured" note={selected.tagline} />}
            />
            <div className="map-panel__body">
              <span className="label">{label(selected.category)}</span>
              <h3 className="h3" style={{ marginTop: 10 }}>{selected.name}</h3>
              <p className="small" style={{ marginTop: 12 }}>{selected.shortDescription}</p>

              {selected.accessStatus !== 'public' && (
                <div style={{ marginTop: 18 }}>
                  <Notice icon="alert">
                    {selected.accessStatus === 'restricted'
                      ? 'Access may be restricted. Not a public visitor destination.'
                      : selected.accessStatus === 'view-only'
                        ? 'A landscape feature, not a place to enter.'
                        : 'Public access has not been verified.'}
                  </Notice>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextLink to={`/places/${selected.slug}`}>Open this place</TextLink>
                <button className="filter" onClick={() => setSelectedId(null)}>Back to the map</button>
              </div>
            </div>
          </>
        ) : (
          <div className="map-panel__empty">
            <span className="label">The plate</span>
            <h3 className="h3" style={{ marginTop: 12 }}>Follow the paths</h3>
            <p className="small" style={{ marginTop: 12 }}>
              Choose a marker and the map will move toward it. Turn layers off to quieten the drawing.
            </p>

            <div style={{ marginTop: 28 }}>
              <span className="label">Layers</span>
              <div className="filters" style={{ marginTop: 14 }}>
                {LAYERS.map((l) => (
                  <button key={l.id} className="filter" aria-pressed={active.has(l.id)} onClick={() => toggle(l.id)}>
                    <span className="filter__tick"><Icon name="check" size={11} /></span>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <ul className="legend">
              <li><i style={{ background: '#2E4029', height: 9, borderRadius: 3 }} /> Forest</li>
              <li><i style={{ background: '#33565D' }} /> Water</li>
              <li><i style={{ background: '#C9BE9B' }} /> Path</li>
              <li><i style={{ background: '#3A4433', height: 8 }} /> Basalt ridge</li>
              <li><i style={{ border: '1px dashed var(--rule)', height: 8, background: 'none' }} /> Restricted</li>
            </ul>

            <div style={{ marginTop: 26 }}>
              <Notice quiet icon="alert">
                An illustrated impression of the park. Not for navigation — follow park signage on the ground.
              </Notice>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

/** Every map needs a non-visual equivalent. */
export function PlaceIndex({ places }: { places: Place[] }) {
  return (
    <div className="grid-3" style={{ marginTop: 40 }}>
      {places.map((p) => (
        <Link key={p.id} to={`/places/${p.slug}`} className="story-row" style={{ borderBottom: 0, paddingBottom: 0 }}>
          <div className="story-row__media" style={{ display: 'grid', placeItems: 'center', background: 'var(--surface-2)', aspectRatio: '1 / 0.82', borderRadius: 'var(--r-sm)' }}>
            <Icon name={markerIcons[p.markerIcon]} size={22} />
          </div>
          <div>
            <span className="label">
              {label(p.category)}{p.accessStatus !== 'public' && ' · Restricted'}
            </span>
            <h4 className="h3 mag-item__title" style={{ marginTop: 8, fontSize: 21 }}>{p.name}</h4>
          </div>
        </Link>
      ))}
    </div>
  );
}
