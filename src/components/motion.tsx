import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import type { CSSProperties, ReactNode } from 'react';

/* ── Motion ────────────────────────────────────────────────────────────
   Everything here animates `transform`, `opacity` or `clip-path` only,
   runs off IntersectionObserver or rAF, and switches itself off when the
   visitor asks for reduced motion.                                    */

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/* ── Reveal ────────────────────────────────────────────────────────────
   Several distinct entrances, so the page does not perform the same
   trick nine times: text rises, images wipe open, wide shots scale in
   very slightly, side panels slide.                                   */

export type RevealKind = 'rise' | 'fade' | 'wipe-up' | 'wipe-left' | 'wipe-right' | 'scale' | 'slide-left' | 'slide-right';

export function Reveal({
  children, kind = 'rise', delay = 0, className = '', as: As = 'div', style, once = true,
}: {
  children: ReactNode;
  kind?: RevealKind;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'figure' | 'li' | 'span';
  style?: CSSProperties;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setInView(true); if (once) io.disconnect(); }
        else if (!once) setInView(false);
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <As
      ref={ref as never}
      className={`rv rv--${kind}${inView ? ' is-in' : ''} ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </As>
  );
}

/** Reveals each child in sequence — used for stat rows and waypoints. */
export function Stagger({
  children, step = 90, kind = 'rise', className = '',
}: { children: ReactNode[]; step?: number; kind?: RevealKind; className?: string }) {
  return (
    <>
      {children.map((child, i) => (
        <Reveal key={i} kind={kind} delay={i * step} className={className}>{child}</Reveal>
      ))}
    </>
  );
}

/* ── Parallax ──────────────────────────────────────────────────────────
   Depth comes from planes moving at different rates. Scroll drives the
   vertical component, the pointer adds a small lateral drift.         */

interface ParallaxState { scrollY: number; px: number; py: number }
const ParallaxCtx = createContext<ParallaxState>({ scrollY: 0, px: 0, py: 0 });

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ParallaxState>({ scrollY: 0, px: 0, py: 0 });
  const raf = useRef(0);
  const target = useRef({ px: 0, py: 0 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setState((s) => ({ ...s, scrollY: window.scrollY }));
      });
    };

    const onMove = (e: PointerEvent) => {
      target.current = {
        px: (e.clientX / window.innerWidth - 0.5) * 2,
        py: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    // The pointer term is eased so the scene drifts rather than snaps.
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setState((s) => {
        const px = s.px + (target.current.px - s.px) * 0.06;
        const py = s.py + (target.current.py - s.py) * 0.06;
        return Math.abs(px - s.px) < 0.0005 && Math.abs(py - s.py) < 0.0005 ? s : { ...s, px, py };
      });
      requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduced]);

  return <ParallaxCtx.Provider value={state}>{children}</ParallaxCtx.Provider>;
}

/**
 * @param depth  vertical scroll factor — background small, foreground large
 * @param drift  pointer factor, in pixels of lateral travel
 */
export function useParallax(depth: number, drift = 0) {
  const { scrollY, px, py } = useContext(ParallaxCtx);
  const reduced = usePrefersReducedMotion();
  if (reduced) return { transform: 'none' };
  return {
    transform: `translate3d(${(px * drift).toFixed(2)}px, ${(scrollY * depth + py * drift * 0.5).toFixed(2)}px, 0)`,
  };
}

/* ── Custom cursor ─────────────────────────────────────────────────────
   A small label that names the action under the pointer. Pointer-only:
   it never appears on touch, and it never blocks a click.             */

interface CursorState { label: string | null; set: (l: string | null) => void }
const CursorCtx = createContext<CursorState>({ label: null, set: () => {} });

export function CursorProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);
  const dot = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [fine, setFine] = useState(false);

  useEffect(() => {
    setFine(typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!fine) return;
    const onMove = (e: PointerEvent) => {
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [fine]);

  const set = useCallback((l: string | null) => setLabel(l), []);
  const value = useMemo(() => ({ label, set }), [label, set]);

  return (
    <CursorCtx.Provider value={value}>
      {children}
      {fine && !reduced && (
        <div ref={dot} className={`cursor${label ? ' is-on' : ''}`} aria-hidden="true">
          <span className="cursor__label">{label}</span>
        </div>
      )}
    </CursorCtx.Provider>
  );
}

/** Spread onto any element that should name its own action. */
export function useCursorLabel(label: string) {
  const { set } = useContext(CursorCtx);
  return {
    onPointerEnter: () => set(label),
    onPointerLeave: () => set(null),
    onBlur: () => set(null),
  };
}

/* ── Line drawing ──────────────────────────────────────────────────────
   Draws an SVG path on when it scrolls into view, by animating
   stroke-dashoffset from its own measured length.                     */

export function useDrawIn<T extends SVGGeometryElement>(active: boolean, duration = 1600, delay = 0) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength?.() ?? 0;
    if (!len) return;

    if (reduced) {
      el.style.strokeDasharray = 'none';
      el.style.strokeDashoffset = '0';
      return;
    }

    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = active ? '0' : `${len}`;
    el.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.22,0.61,0.36,1) ${delay}ms`;
  }, [active, duration, delay, reduced]);

  return ref;
}

/** True once the element has been scrolled into view. */
export function useInView<T extends Element>(rootMargin = '0px 0px -15% 0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { rootMargin, threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
}
