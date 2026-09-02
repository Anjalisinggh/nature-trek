import { useDrawIn, useInView } from '../motion';
import type { Trail } from '../../data/models';

/* ── Route diagram ─────────────────────────────────────────────────────
   A trail is better explained by a drawn route than by another picture
   of trees, so trails carry a diagram rather than a photograph. The line
   draws itself when it scrolls into view and the waypoints arrive one at
   a time, which is the trail explaining itself.

   Positions come from the trail's own waypoint coordinates (illustrated
   map space, 0–100). Not a navigational route.                        */

const W = 560;
const H = 340;

export function RouteDiagram({ trail }: { trail: Trail }) {
  const [wrapRef, inView] = useInView('0px 0px -18% 0px');
  const pathRef = useDrawIn<SVGPathElement>(inView, 1900, 250);

  const pts = trail.waypoints.map((w) => ({
    ...w,
    x: 60 + (w.coordinates.x / 100) * (W - 130),
    y: H - 50 - ((100 - w.coordinates.y) / 100) * (H - 110),
  }));

  // A hand-drawn line through the stops rather than straight segments.
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const mx = (prev.x + p.x) / 2;
    const my = (prev.y + p.y) / 2;
    const bow = (i % 2 ? 1 : -1) * 26;
    return `${acc} Q ${(mx + bow).toFixed(1)} ${(my - bow * 0.6).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  return (
    <div className="route" ref={wrapRef as React.RefObject<HTMLDivElement>}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Route diagram: ${trail.waypoints.map((w) => w.name).join(', then ')}.`}>
        {/* Contour ground, so the route sits in terrain rather than on nothing */}
        <g fill="none" stroke="var(--forest-600)" strokeWidth="1" opacity="0.5">
          <path d={`M20 ${H - 40} q 110 -34 210 -12 t 300 -26`} />
          <path d={`M20 ${H - 76} q 130 -30 240 -14 t 280 -22`} />
          <path d={`M20 ${H - 112} q 150 -26 250 -16 t 270 -18`} />
        </g>

        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="var(--sun)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {pts.map((p, i) => (
          <g
            key={p.id}
            className={`route__node${inView ? '' : ' is-off'}`}
            style={{ transitionDelay: `${700 + i * 260}ms` }}
          >
            <circle cx={p.x} cy={p.y} r="6.5" fill="var(--forest-900)" stroke="var(--sun)" strokeWidth="1.8" />
            {i === 0 && <circle cx={p.x} cy={p.y} r="2.4" fill="var(--sun)" />}
            <text
              className="route__label"
              x={p.x}
              y={p.y - 16}
              textAnchor={i === pts.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
            >
              {p.name}
            </text>
          </g>
        ))}
      </svg>

      <p className="small muted" style={{ marginTop: 14 }}>
        Illustrative route diagram · not for navigation
      </p>
    </div>
  );
}
