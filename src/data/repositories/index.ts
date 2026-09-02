import { places, placeById, placeBySlug } from '../content/places';
import { trails, trailById, trailBySlug, curatedRoutes } from '../content/trails';
import { wildlife, wildlifeById, wildlifeBySlug } from '../content/wildlife';
import { stories, storyById, storyBySlug } from '../content/stories';
import {
  experiences, experienceById, experienceBySlug,
  soundTracks, soundById, parkUpdates, safetyGuidance,
} from '../content/experiences';
import type { Place, Trail, Wildlife, Story, Experience, SavedKind } from '../models';

/* ── Repositories ──────────────────────────────────────────────────────
   The UI never imports content modules directly. Everything goes
   through this layer so the bundled dataset can later be swapped for a
   real API without touching a single screen. Reads are async and can
   fail, which is what lets the screens have honest loading, error and
   offline states rather than only a happy path.                       */

export class OfflineError extends Error {
  constructor() {
    super('offline');
    this.name = 'OfflineError';
  }
}

let simulateOffline = false;
let simulateFailure = false;

export const network = {
  setOffline(v: boolean) { simulateOffline = v; },
  isOffline() { return simulateOffline; },
  setFailure(v: boolean) { simulateFailure = v; },
};

/** Content available without a connection — see the offline strategy. */
const CACHED_OFFLINE = new Set<string>(['places', 'trails', 'safety', 'visits']);

async function read<T>(key: string, value: T, delay = 240): Promise<T> {
  await new Promise((r) => setTimeout(r, delay));
  if (simulateFailure) throw new Error('Could not reach the park information service.');
  if (simulateOffline && !CACHED_OFFLINE.has(key)) throw new OfflineError();
  return value;
}

export const placesRepo = {
  all: () => read('places', places),
  byId: (id: string) => read('places', placeById(id) ?? null),
  bySlug: (slug: string) => read('places', placeBySlug(slug) ?? null),
  sync: { all: () => places, byId: placeById, bySlug: placeBySlug },
};

export const trailsRepo = {
  all: () => read('trails', trails),
  curated: () => read('trails', curatedRoutes),
  bySlug: (slug: string) => read('trails', trailBySlug(slug) ?? null),
  sync: { all: () => trails, byId: trailById, bySlug: trailBySlug, curated: () => curatedRoutes },
};

export const wildlifeRepo = {
  all: () => read('wildlife', wildlife),
  bySlug: (slug: string) => read('wildlife', wildlifeBySlug(slug) ?? null),
  sync: { all: () => wildlife, byId: wildlifeById, bySlug: wildlifeBySlug },
};

export const storiesRepo = {
  all: () => read('stories', stories),
  bySlug: (slug: string) => read('stories', storyBySlug(slug) ?? null),
  sync: { all: () => stories, byId: storyById, bySlug: storyBySlug },
};

export const experiencesRepo = {
  all: () => read('experiences', experiences),
  bySlug: (slug: string) => read('experiences', experienceBySlug(slug) ?? null),
  sync: { all: () => experiences, byId: experienceById, bySlug: experienceBySlug },
};

export const soundsRepo = {
  all: () => read('sounds', soundTracks),
  sync: { all: () => soundTracks, byId: soundById },
};

export const updatesRepo = {
  all: () => read('updates', parkUpdates),
  sync: { all: () => parkUpdates },
};

export const safetyRepo = {
  sync: { all: () => safetyGuidance },
};

/* ── Cross-entity lookup ───────────────────────────────────────────── */

export interface Resolved {
  kind: SavedKind;
  id: string;
  name: string;
  meta: string;
  href: string;
  art: string;
}

export function resolve(kind: SavedKind, id: string): Resolved | null {
  switch (kind) {
    case 'place': {
      const p = placeById(id);
      return p ? { kind, id, name: p.name, meta: `Place · ${label(p.category)}`, href: `/places/${p.slug}`, art: p.heroImage.art } : null;
    }
    case 'trail': {
      const t = trailById(id);
      return t ? { kind, id, name: t.name, meta: `Trail · ${label(t.difficulty)}`, href: `/trails/${t.slug}`, art: t.heroImage.art } : null;
    }
    case 'wildlife': {
      const w = wildlifeById(id);
      return w ? { kind, id, name: w.name, meta: `Wildlife · ${label(w.category)}`, href: `/wildlife/${w.slug}`, art: w.heroImage.art } : null;
    }
    case 'story': {
      const s = storyById(id);
      return s ? { kind, id, name: s.title, meta: `Story · ${s.category}`, href: `/stories/${s.slug}`, art: s.heroImage.art } : null;
    }
    case 'experience': {
      const e = experienceById(id);
      return e ? { kind, id, name: e.name, meta: `Experience · ${e.category}`, href: `/experiences/${e.slug}`, art: e.heroImage.art } : null;
    }
    default:
      return null;
  }
}

export const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

/* ── Global search ─────────────────────────────────────────────────── */

export interface SearchResult extends Resolved {
  snippet: string;
}

export async function search(query: string): Promise<SearchResult[]> {
  await new Promise((r) => setTimeout(r, 300));
  if (simulateFailure) throw new Error('Search is unavailable right now.');
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SearchResult[] = [];
  const push = (r: Resolved | null, snippet: string) => { if (r) hits.push({ ...r, snippet }); };
  const match = (...fields: (string | null | undefined)[]) =>
    fields.some((f) => f?.toLowerCase().includes(q));

  for (const p of places) {
    if (match(p.name, p.shortDescription, p.tagline, p.category, ...p.tags)) {
      push(resolve('place', p.id), p.shortDescription);
    }
  }
  for (const t of trails) {
    if (match(t.name, t.tagline, t.difficulty, ...t.interests)) {
      push(resolve('trail', t.id), t.tagline);
    }
  }
  for (const w of wildlife) {
    if (match(w.name, w.scientificName, w.tagline, w.category)) {
      push(resolve('wildlife', w.id), w.tagline);
    }
  }
  for (const s of stories) {
    if (match(s.title, s.subtitle, s.category, s.intro)) {
      push(resolve('story', s.id), s.subtitle);
    }
  }
  for (const e of experiences) {
    if (match(e.name, e.description, e.category)) {
      push(resolve('experience', e.id), e.description);
    }
  }
  return hits;
}

export { places, trails, wildlife, stories, experiences, soundTracks, parkUpdates, safetyGuidance };
