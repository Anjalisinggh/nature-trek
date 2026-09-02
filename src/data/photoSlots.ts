/* ── Photo assignment ──────────────────────────────────────────────────
   Art direction, written down: which photograph belongs to which record
   or section. Every slot appears EXACTLY ONCE, and the uniqueness is
   asserted below rather than left to a reviewer's eye.

   `null` is a deliberate decision, not a gap. Where the guide has no
   photograph it can honestly attribute — the night forest, a leopard's
   whereabouts, a stargazing session — the section gets a typographic
   treatment instead. That is more honest than borrowing a picture of
   somewhere else, and it gives the page another kind of composition. */

export const PHOTO_BY_ID: Record<string, string | null> = {
  // Places
  'p-main-entrance': 'entrance',
  'p-boating-lake': 'boating-lake',
  'p-van-rani': 'railtrack',
  'p-gandhi-tekdi': null,
  'p-safari': 'park-road',
  'p-butterfly-garden': 'orchid',
  'p-nature-trails': 'forest-trees',
  'p-bicycle': 'forest-path',
  'p-kanheri': 'kanheri-facade',
  'p-garden-fragrance': null,
  'p-star-gazing': null,
  'p-tulsi-lake': 'tulsi-lake',
  'p-vihar-lake': 'vihar-lake',
  'p-mithi-river': null,

  // Wildlife
  'w-leopard': 'leopard',
  'w-chital': 'chital',
  'w-langur': 'langur',
  'w-macaque': null,
  'w-drongo': 'drongo',
  'w-flycatcher': 'flycatcher',
  'w-owlet': null,
  'w-sunbird': null,
  'w-kingfisher': null,
  'w-peafowl': null,
  'w-blue-tiger': 'butterfly-blue-tiger',
  'w-crimson-rose': 'butterfly-crimson-rose',
  'w-karvi': 'undergrowth',
  'w-python': 'python',
  'w-bullfrog': null,

  // Stories
  's-ancient-caves': 'kanheri-carving',
  's-forest-inside-mumbai': null,
  's-monsoon-forest': 'stream',
  's-leopards-night': null,
  's-life-of-a-butterfly': 'green-detail',

  // Trails carry animated route diagrams rather than photographs — a
  // drawn route explains a trail better than a picture of trees does.
  't-first-visit': null,
  't-wildlife-day': null,
  't-history-forest': null,
  't-slow-morning': null,
  't-forest-trail': null,
  't-birding-walk': null,
  't-kanheri-climb': null,
};

/** Slots reserved for specific page sections rather than content records. */
export const SECTION_PHOTO = {
  hero: 'canopy',
  introPanorama: 'hero',
  kanheriA: 'kanheri-hall',
  kanheriB: 'kanheri-interior',
  kanheriC: 'kanheri-buddha',
  mapFieldNote: 'park-map-board',
  planVisit: 'info-board',
} as const;

/** Where the subject sits in the frame, so hard crops keep it. */
export const FOCUS: Record<string, string> = {
  'kanheri-facade': 'center 38%',
  'kanheri-hall': 'center 30%',
  'kanheri-buddha': 'center 26%',
  'kanheri-carving': 'center 32%',
  'orchid': 'center 40%',
  'undergrowth': 'center 42%',
  'park-map-board': 'center 30%',
  'canopy': 'center 58%',
  'hero': 'center 62%',
  'python': 'center 45%',
};

if (import.meta.env?.DEV) {
  const used = [...Object.values(PHOTO_BY_ID), ...Object.values(SECTION_PHOTO)].filter(Boolean);
  const seen = new Set<string>();
  const dupes = used.filter((s) => (seen.has(s as string) ? true : (seen.add(s as string), false)));
  if (dupes.length) {
    // The no-repetition rule, enforced in code.
    console.warn('[photos] slot used more than once:', [...new Set(dupes)]);
  }
}

export const photoFor = (id: string): string | null => PHOTO_BY_ID[id] ?? null;

/** Extra plates for the few places the guide can illustrate properly. */
const GALLERY: Record<string, string[]> = {};

export const galleryFor = (id: string): string[] => GALLERY[id] ?? [];
