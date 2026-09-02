import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Memory, SavedItem, SavedKind, UserProfile, Visit } from '../../data/models';
import { network } from '../../data/repositories';

/* ── Persistent user state ─────────────────────────────────────────────
   Kept deliberately separate from server state (content, which lives in
   the repositories) and from local UI state (filters, sheets, which
   live in the screens that own them).                                 */

const KEY = 'sgnp.user.v1';

interface Persisted {
  profile: UserProfile;
  saved: SavedItem[];
  memories: Memory[];
  visits: Visit[];
  reducedMotion: boolean;
  locationPermission: 'unasked' | 'granted' | 'denied';
}

const seedMemories: Memory[] = [
  { id: 'mem-1', title: 'Kanheri', placeId: 'p-kanheri', date: '2026-08-14', art: 'caves', note: 'Sat in the great hall until everyone else had gone.', span: 'tall' },
  { id: 'mem-2', title: 'Boating Lake', placeId: 'p-boating-lake', date: '2026-08-14', art: 'lake', note: 'Flat water, before the wind.', span: 'square' },
  { id: 'mem-3', title: 'Butterfly Garden', placeId: 'p-butterfly-garden', date: '2026-07-30', art: 'butterfly', note: 'Stood still for ten minutes. Worth it.', span: 'wide' },
  { id: 'mem-4', title: 'Gandhi Tekdi', placeId: 'p-gandhi-tekdi', date: '2026-07-30', art: 'hills', note: 'The city, from inside the forest.', span: 'square' },
  { id: 'mem-5', title: 'Forest Trail', placeId: 'p-nature-trails', date: '2026-06-21', art: 'monsoon', note: 'Rain the whole way. No regrets.', span: 'tall' },
];

const defaults: Persisted = {
  profile: { name: 'Jade', interests: [], onboarded: false },
  saved: [
    { id: 'p-kanheri', kind: 'place', savedAt: '2026-08-28T17:12:00+05:30' },
    { id: 'p-butterfly-garden', kind: 'place', savedAt: '2026-08-20T09:02:00+05:30' },
    { id: 't-history-forest', kind: 'trail', savedAt: '2026-08-20T09:05:00+05:30' },
    { id: 'w-leopard', kind: 'wildlife', savedAt: '2026-08-12T21:40:00+05:30' },
    { id: 's-ancient-caves', kind: 'story', savedAt: '2026-08-12T21:44:00+05:30' },
  ],
  memories: seedMemories,
  visits: [
    {
      id: 'v-1', date: '2026-09-19', visitors: 2,
      experienceIds: ['e-kanheri', 'e-nature-trails', 'e-boating'],
      reference: 'SGNP-PLAN-4F92', status: 'upcoming', bookingKind: 'prototype-plan',
    },
    {
      id: 'v-2', date: '2026-08-14', visitors: 2,
      experienceIds: ['e-kanheri'],
      reference: 'SGNP-PLAN-2A17', status: 'past', bookingKind: 'prototype-plan',
    },
  ],
  reducedMotion: false,
  locationPermission: 'unasked',
};

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<Persisted>) };
  } catch {
    return defaults;
  }
}

interface AppStateValue extends Persisted {
  isSaved: (kind: SavedKind, id: string) => boolean;
  toggleSave: (kind: SavedKind, id: string) => void;
  savedOf: (kind: SavedKind) => SavedItem[];
  addMemory: (m: Omit<Memory, 'id'>) => void;
  removeMemory: (id: string) => void;
  addVisit: (v: Omit<Visit, 'id' | 'reference' | 'status' | 'bookingKind'>) => Visit;
  setProfile: (p: Partial<UserProfile>) => void;
  setLocationPermission: (p: Persisted['locationPermission']) => void;
  setReducedMotion: (v: boolean) => void;
  offline: boolean;
  setOffline: (v: boolean) => void;
}

const Ctx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  const [offline, setOfflineState] = useState(() => !navigator.onLine);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage may be unavailable */ }
  }, [state]);

  useEffect(() => {
    const on = () => setOfflineState(false);
    const off = () => setOfflineState(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => { network.setOffline(offline); }, [offline]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = state.reducedMotion ? 'true' : 'false';
  }, [state.reducedMotion]);

  const isSaved = useCallback(
    (kind: SavedKind, id: string) => state.saved.some((s) => s.kind === kind && s.id === id),
    [state.saved],
  );

  const toggleSave = useCallback((kind: SavedKind, id: string) => {
    setState((s) => {
      const exists = s.saved.some((i) => i.kind === kind && i.id === id);
      return {
        ...s,
        saved: exists
          ? s.saved.filter((i) => !(i.kind === kind && i.id === id))
          : [{ id, kind, savedAt: new Date().toISOString() }, ...s.saved],
      };
    });
  }, []);

  const value = useMemo<AppStateValue>(() => ({
    ...state,
    offline,
    isSaved,
    toggleSave,
    savedOf: (kind) => state.saved.filter((s) => s.kind === kind),
    addMemory: (m) => setState((s) => ({ ...s, memories: [{ ...m, id: `mem-${Date.now()}` }, ...s.memories] })),
    removeMemory: (id) => setState((s) => ({ ...s, memories: s.memories.filter((m) => m.id !== id) })),
    addVisit: (v) => {
      const visit: Visit = {
        ...v,
        id: `v-${Date.now()}`,
        reference: `SGNP-PLAN-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        status: 'upcoming',
        bookingKind: 'prototype-plan',
      };
      setState((s) => ({ ...s, visits: [visit, ...s.visits] }));
      return visit;
    },
    setProfile: (p) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    setLocationPermission: (p) => setState((s) => ({ ...s, locationPermission: p })),
    setReducedMotion: (v) => setState((s) => ({ ...s, reducedMotion: v })),
    setOffline: setOfflineState,
  }), [state, offline, isSaved, toggleSave]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used inside AppStateProvider');
  return v;
}
