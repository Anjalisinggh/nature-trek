import { useId, useMemo } from 'react';

/** Deterministic seeded RNG, so the plate is drawn the same every time. */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Illustrated cartography ───────────────────────────────────────────
   A naturalist's plate of SGNP: organic land shapes, contour hatching,
   basalt outcrops, irregular forest clumps, layered water and hand-drawn
   paths. Composed as one drawing rather than a grid of repeated symbols.

   The plate is laid out in the same 0–100 space the place records use,
   so the drawn features and the markers agree: Kanheri's outcrop sits
   under the Kanheri marker, the boating lake under the boating marker,
   and the paths actually connect the places they claim to.

   This is an IMPRESSION of the park, not a survey. It carries no
   geographic projection and must never be used to navigate.          */

const W = 1200;
const H = 820;

/** Place-record space (0–100) → plate space. */
const px = (x: number) => (x / 100) * W;
const py = (y: number) => (y / 100) * H;

/** An irregular closed shape — landmass, forest clump, rock, water. */
function blob(r: () => number, cx: number, cy: number, rx: number, ry: number, wobble = 0.28, points = 12) {
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (Math.PI * 2 * i) / points;
    const k = 1 - wobble / 2 + r() * wobble;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i <= points; i++) {
    const cur = pts[i % points];
    const prev = pts[i - 1];
    d += ` Q${prev[0].toFixed(1)} ${prev[1].toFixed(1)} ${((prev[0] + cur[0]) / 2).toFixed(1)} ${((prev[1] + cur[1]) / 2).toFixed(1)}`;
  }
  return `${d} Z`;
}

/** A basalt ridge seen from above: an organic spine with a shadowed
 *  scarp face on one side. Not a building, and not a polygon. */
function ridgeForm(r: () => number, cx: number, cy: number, len: number, wid: number, tilt: number) {
  const pts: [number, number][] = [];
  const steps = 11;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const swell = Math.sin(Math.PI * t);
    pts.push([cx - len / 2 + len * t, cy - (wid / 2) * swell * (0.62 + r() * 0.7) + tilt * (t - 0.5)]);
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const swell = Math.sin(Math.PI * t);
    pts.push([cx - len / 2 + len * t, cy + (wid / 2) * swell * (0.6 + r() * 0.66) + tilt * (t - 0.5)]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i <= pts.length; i++) {
    const cur = pts[i % pts.length];
    const prev = pts[i - 1];
    d += ` Q${prev[0].toFixed(1)} ${prev[1].toFixed(1)} ${((prev[0] + cur[0]) / 2).toFixed(1)} ${((prev[1] + cur[1]) / 2).toFixed(1)}`;
  }
  return `${d} Z`;
}

/** `phase` drives the discovery sequence: 1 land, 2 water, 3 paths. */
export function MapArt({ className, phase = 5 }: { className?: string; phase?: number }) {
  const uid = useId().replace(/:/g, '');

  const art = useMemo(() => {
    const r = rng('sgnp-plate-02');

    /* Canopy from above: clumps of varying size, clustered into groves
       and thinned deliberately around the visitor zone in the south. */
    const clumps: { d: string; tone: number }[] = [];
    const groves = [
      { x: px(24), y: py(18), rx: 190, ry: 120, n: 87 },
      { x: px(70), y: py(14), rx: 210, ry: 105, n: 87 },
      { x: px(84), y: py(34), rx: 150, ry: 140, n: 38 },
      { x: px(16), y: py(46), rx: 150, ry: 150, n: 38 },
      { x: px(52), y: py(40), rx: 170, ry: 120, n: 34 },
      { x: px(78), y: py(66), rx: 180, ry: 130, n: 38 },
      { x: px(22), y: py(72), rx: 160, ry: 120, n: 34 },
      { x: px(58), y: py(76), rx: 130, ry: 90, n: 23 },
      { x: px(38), y: py(92), rx: 190, ry: 70, n: 27 },
    ];
    for (const g of groves) {
      for (let i = 0; i < g.n; i++) {
        const a = r() * Math.PI * 2;
        const rad = Math.sqrt(r());
        const cx = g.x + Math.cos(a) * g.rx * rad;
        const cy = g.y + Math.sin(a) * g.ry * rad;
        const s = 7 + Math.pow(r(), 2.1) * 40;
        clumps.push({ d: blob(r, cx, cy, s, s * (0.6 + r() * 0.45), 0.5, 9), tone: r() });
      }
    }

    /* Contour hatching over the higher ground: the Kanheri ridge and
       the hillock at Gandhi Tekdi. */
    const contours: string[] = [];
    const hills = [
      { x: px(58), y: py(26), rx: 230, ry: 130 },
      { x: px(62), y: py(63), rx: 120, ry: 78 },
      { x: px(20), y: py(40), rx: 160, ry: 110 },
    ];
    for (const c of hills) {
      for (let i = 0; i < 3; i++) {
        const k = 1 - i * 0.26;
        contours.push(blob(r, c.x, c.y, c.rx * k, c.ry * k, 0.3, 13));
      }
    }

    const rocks = [
      ridgeForm(r, px(58), py(27), 210, 74, -14),  // the Kanheri ridge
      ridgeForm(r, px(62), py(63), 118, 46, 8),    // Gandhi Tekdi
      ridgeForm(r, px(84), py(46), 132, 44, -6),
    ];

    const forestEdge = blob(r, px(50), py(46), 545, 355, 0.15, 22);

    /* Open ground: the tourism zone clearings in the south. */
    const clearings = [
      blob(r, px(50), py(88), 120, 52, 0.32, 12),
      blob(r, px(45), py(84), 70, 34, 0.34, 11),
      blob(r, px(36), py(62), 62, 40, 0.34, 11),
      blob(r, px(44), py(58), 54, 34, 0.34, 11),
    ];

    return { clumps, contours, rocks, forestEdge, clearings };
  }, []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ width: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id={`ground-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#293A22" />
          <stop offset="100%" stopColor="#18261A" />
        </linearGradient>
        <linearGradient id={`lake-${uid}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#33565D" />
          <stop offset="100%" stopColor="#213F46" />
        </linearGradient>
        <radialGradient id={`vig-${uid}`} cx="0.5" cy="0.44" r="0.74">
          <stop offset="62%" stopColor="#0D1712" stopOpacity="0" />
          <stop offset="100%" stopColor="#0D1712" stopOpacity="0.34" />
        </radialGradient>
        <radialGradient id={`glow-${uid}`} cx="0.58" cy="0.27" r="0.5">
          <stop offset="0%" stopColor="#E8C88A" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#E8C88A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Land beyond the park boundary */}
      <rect width={W} height={H} fill="#131E17" />

      {/* The park */}
      <g className={"plate-layer" + (phase >= 1 ? "" : " is-off")}>
      <path d={art.forestEdge} fill="#1C2C1E" />
      <path d={art.forestEdge} fill={`url(#ground-${uid})`} opacity="0.7" />
      <path d={art.forestEdge} fill="none" stroke="#5E6B4A" strokeWidth="1.4" opacity="0.35" strokeDasharray="14 10" />

      {/* Terrain */}
      <g fill="none" stroke="#3F5137" strokeWidth="1.1" opacity="0.42">
        {art.contours.map((d, i) => <path key={i} d={d} />)}
      </g>

      {/* Open ground in the visitor zone */}
      <g fill="#35442C" opacity="0.55">
        {art.clearings.map((d, i) => <path key={i} d={d} />)}
      </g>

      {/* Basalt outcrops */}
      <g>
        {art.rocks.map((d, i) => (
          <g key={i}>
            <path d={d} fill="#3A4433" />
            <path d={d} fill="none" stroke="#0F1712" strokeWidth="1.4" opacity="0.42" />
            <path d={d} fill="#8B9A70" opacity="0.1" transform="translate(-3 -4)" />
          </g>
        ))}
        {/* Kanheri: rock-cut openings in the ridge face */}
        <g fill="#0A0F0B" opacity="0.9">
          {[[-64, 3], [-41, -2], [-22, 5], [6, 0], [27, 6], [52, 1], [71, 7]].map(([dx, dy], i) => (
            <ellipse key={i} cx={px(58) + dx} cy={py(27) + dy} rx={3.6 + (i % 3)} ry={5 + (i % 2) * 2} />
          ))}
        </g>
      </g>

      {/* Canopy clumps */}
      <g>
        {art.clumps.map((c, i) => (
          <path
            key={i}
            d={c.d}
            fill={c.tone > 0.72 ? '#46593A' : c.tone > 0.4 ? '#33472C' : '#273923'}
            opacity="0.88"
          />
        ))}
      </g>

      </g>

      {/* Water — Tulsi, Vihar, the boating lake, and the Mithi */}
      <g className={"plate-layer" + (phase >= 2 ? "" : " is-off")} style={{ transitionDelay: "120ms" }}>
        <path d={blob(rng('tulsi'), px(40), py(33), 104, 74, 0.3, 15)} fill={`url(#lake-${uid})`} />
        <path d={blob(rng('tulsi2'), px(40), py(33), 84, 56, 0.3, 15)} fill="#517F86" opacity="0.16" />
        <path d={blob(rng('vihar'), px(66), py(44), 80, 58, 0.32, 14)} fill={`url(#lake-${uid})`} />
        <path d={blob(rng('vihar2'), px(66), py(44), 62, 42, 0.32, 14)} fill="#517F86" opacity="0.14" />
        <path d={blob(rng('boating'), px(40), py(79), 44, 28, 0.26, 12)} fill={`url(#lake-${uid})`} />
        <g fill="none" stroke="#6E9AA0" strokeWidth="1.2" opacity="0.3">
          <path d={blob(rng('tulsi'), px(40), py(33), 104, 74, 0.3, 15)} />
          <path d={blob(rng('vihar'), px(66), py(44), 80, 58, 0.32, 14)} />
          <path d={blob(rng('boating'), px(40), py(79), 44, 28, 0.26, 12)} />
        </g>

        <path
          d={`M${px(34)} ${py(38)} C ${px(28)} ${py(46)}, ${px(32)} ${py(50)}, ${px(30)} ${py(56)}
              S ${px(26)} ${py(68)}, ${px(29)} ${py(76)} S ${px(25)} ${py(88)}, ${px(27)} ${py(100)}`}
          fill="none" stroke="#2C4A50" strokeWidth="5" strokeLinecap="round" opacity="0.9"
        />
        <path
          d={`M${px(34)} ${py(38)} C ${px(28)} ${py(46)}, ${px(32)} ${py(50)}, ${px(30)} ${py(56)}
              S ${px(26)} ${py(68)}, ${px(29)} ${py(76)} S ${px(25)} ${py(88)}, ${px(27)} ${py(100)}`}
          fill="none" stroke="#5E8F96" strokeWidth="1.4" strokeLinecap="round" opacity="0.22"
        />
      </g>

      {/* Paths — the only warm lines on the plate, connecting real stops */}
      <g className={"plate-layer" + (phase >= 3 ? "" : " is-off")} fill="none" stroke="#C9BE9B" strokeLinecap="round" strokeLinejoin="round">
        {/* Main gate → boating → Van Rani → Gandhi Tekdi → trails → Kanheri */}
        <path
          d={`M${px(50)} ${py(97)} C ${px(48)} ${py(93)}, ${px(43)} ${py(85)}, ${px(40)} ${py(79)}
              C ${px(45)} ${py(75)}, ${px(52)} ${py(75)}, ${px(55)} ${py(71)}
              C ${px(59)} ${py(68)}, ${px(60)} ${py(66)}, ${px(62)} ${py(63)}
              C ${px(60)} ${py(57)}, ${px(53)} ${py(53)}, ${px(52)} ${py(47)}
              C ${px(52)} ${py(40)}, ${px(56)} ${py(34)}, ${px(58)} ${py(29)}`}
          strokeWidth="3.6" opacity="0.62"
        />
        {/* Safari and the gardens */}
        <path
          d={`M${px(40)} ${py(79)} C ${px(36)} ${py(74)}, ${px(33)} ${py(71)}, ${px(33)} ${py(68)}
              C ${px(34)} ${py(65)}, ${px(35)} ${py(64)}, ${px(36)} ${py(62)}
              C ${px(39)} ${py(60)}, ${px(42)} ${py(59)}, ${px(44)} ${py(58)}`}
          strokeWidth="2.6" opacity="0.44" strokeDasharray="10 8"
        />
        {/* Trails east toward the Vihar landscape and the stargazing ground */}
        <path
          d={`M${px(52)} ${py(47)} C ${px(58)} ${py(48)}, ${px(64)} ${py(50)}, ${px(68)} ${py(52)}`}
          strokeWidth="2.4" opacity="0.4" strokeDasharray="10 8"
        />
        {/* Cycling loop near the entrance */}
        <path
          d={`M${px(50)} ${py(97)} C ${px(47)} ${py(90)}, ${px(45)} ${py(87)}, ${px(45)} ${py(84)}
              C ${px(47)} ${py(81)}, ${px(49)} ${py(80)}, ${px(50)} ${py(78)}`}
          strokeWidth="2.2" opacity="0.34" strokeDasharray="7 9"
        />
      </g>

      <rect width={W} height={H} fill={`url(#glow-${uid})`} />
      <rect width={W} height={H} fill={`url(#vig-${uid})`} />
    </svg>
  );
}
