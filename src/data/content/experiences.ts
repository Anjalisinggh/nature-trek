import type { Experience, SoundTrack, ParkUpdate } from '../models';

/* Availability is modelled as dynamic data with a freshness envelope.
   Nothing here claims an operating schedule this app cannot verify. */
const unknownAvailability = {
  status: 'unverified' as const,
  lastUpdated: null,
  source: null,
};

export const experiences: Experience[] = [
  {
    id: 'e-boating',
    slug: 'boating',
    name: 'Boating',
    category: 'Water',
    description: 'Pedal boating on the lake in the park tourism zone.',
    details: [
      'Maharashtra eco-tourism material describes pedal boating on an artificial lake near the main entrance.',
      'Boating can be suspended in poor weather or high water. Confirm availability at the lake on the day.',
    ],
    heroImage: { id: 'm-e-boat', art: 'lake', alt: 'Illustrated still lake water surrounded by dark forest' },
    locationPlaceId: 'p-boating-lake',
    durationNote: 'Short. Suits a break between longer walks.',
    requirements: ['Follow all safety instructions given at the lake.'],
    bookingNote: 'Information coming soon. Not bookable through this app.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-boating-lake', 'p-main-entrance'],
  },
  {
    id: 'e-van-rani',
    slug: 'van-rani',
    name: 'Van Rani',
    category: 'Family',
    description: 'The park mini train, on a route associated with Gandhi Tekdi.',
    details: [
      'Van Rani is the park small-gauge mini train and one of its longest-running family attractions.',
      'Operating times vary. Check at the entrance.',
    ],
    heroImage: { id: 'm-e-train', art: 'forest', alt: 'An illustrated narrow track curving through dark trees' },
    locationPlaceId: 'p-van-rani',
    durationNote: 'A short ride.',
    requirements: ['Stay seated while the train is moving.'],
    bookingNote: 'Information coming soon. Not bookable through this app.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-van-rani', 'p-gandhi-tekdi'],
  },
  {
    id: 'e-safari',
    slug: 'tiger-lion-safari',
    name: 'Tiger & Lion Safari',
    category: 'Wildlife',
    description: 'Enclosure viewing conducted from enclosed vehicles.',
    details: [
      'Official material describes safari viewing from enclosed vehicles within a designated enclosure area.',
      'This is enclosure viewing, not a wild sighting experience.',
    ],
    heroImage: { id: 'm-e-safari', art: 'canopy', alt: 'Dense illustrated forest with a track running through it' },
    locationPlaceId: 'p-safari',
    durationNote: 'Information coming soon.',
    requirements: ['Remain inside the vehicle throughout.', 'Do not feed animals.', 'Follow staff instructions.'],
    bookingNote: 'Information coming soon. Not bookable through this app.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-safari'],
  },
  {
    id: 'e-butterfly-garden',
    slug: 'butterfly-garden',
    name: 'Butterfly Garden',
    category: 'Nature',
    description: 'A planted garden built around butterfly host and nectar plants.',
    details: [
      'Listed on the official SGNP website within the park nature information area.',
      'Activity is generally highest after the monsoon and in warm, still conditions.',
    ],
    heroImage: { id: 'm-e-butterfly', art: 'butterfly', alt: 'Illustrated butterflies among dark leaves' },
    locationPlaceId: 'p-butterfly-garden',
    durationNote: 'As long as you are willing to stand still.',
    requirements: ['Do not handle butterflies or pick plants.'],
    bookingNote: 'Information coming soon.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-butterfly-garden', 'p-garden-fragrance'],
  },
  {
    id: 'e-nature-trails',
    slug: 'nature-trails',
    name: 'Nature Trails',
    category: 'Trails',
    description: 'Walking trails, treks and guided nature and bird-watching walks.',
    details: [
      'SGNP offers nature trails, treks and guided nature experiences including bird-watching.',
      'Which routes are open, and whether a guide is required, is decided by the park.',
    ],
    heroImage: { id: 'm-e-trail', art: 'trail', alt: 'A pale path between dark illustrated trunks' },
    locationPlaceId: 'p-nature-trails',
    durationNote: 'Varies by route.',
    requirements: ['Covered shoes.', 'Water.', 'Stay on marked paths.'],
    bookingNote: 'Guided walk arrangements: information coming soon.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-nature-trails', 'p-kanheri'],
  },
  {
    id: 'e-cycling',
    slug: 'cycling',
    name: 'Cycling',
    category: 'Mobility',
    description: 'Bicycle facilities near the entrance for covering the visitor zone.',
    details: [
      'The park provides bicycle facilities near the main entrance.',
      'Cycle only on routes where the park permits it.',
    ],
    heroImage: { id: 'm-e-cycle', art: 'trail', alt: 'An illustrated road curving through forest' },
    locationPlaceId: 'p-bicycle',
    durationNote: 'Information coming soon.',
    requirements: ['Ride only on permitted routes.'],
    bookingNote: 'Hire information coming soon.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-bicycle', 'p-main-entrance'],
  },
  {
    id: 'e-kanheri',
    slug: 'kanheri-caves',
    name: 'Kanheri Caves',
    category: 'Heritage',
    description: 'An ancient Buddhist rock-cut complex described as comprising 109 caves.',
    details: [
      'A monastic complex of cells, prayer halls, stupas, sculpture, inscriptions and rock-cut water cisterns.',
      'Timings and entry are set by the site. Confirm before travelling.',
    ],
    heroImage: { id: 'm-e-kanheri', art: 'caves', alt: 'Illustrated cave openings in a dark hillside' },
    locationPlaceId: 'p-kanheri',
    durationNote: 'Allow a substantial part of the day.',
    requirements: ['Shoes with grip.', 'Water.', 'Do not touch carvings or inscriptions.'],
    bookingNote: 'Information coming soon.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-kanheri', 'p-nature-trails'],
  },
  {
    id: 'e-garden-fragrance',
    slug: 'garden-of-fragrance',
    name: 'Garden of Fragrance',
    category: 'Nature',
    description: 'A sensory garden identified on the tourism-zone route map.',
    details: [
      'A planted space built around scent, identified on the Maharashtra eco-tourism route map for the tourism zone.',
      'Scent is usually strongest early in the day and after rain.',
    ],
    heroImage: { id: 'm-e-fragrance', art: 'butterfly', alt: 'Illustrated flowering plants with pale blossoms' },
    locationPlaceId: 'p-garden-fragrance',
    durationNote: 'Short. Best taken slowly.',
    requirements: ['Do not pick flowers or leaves.'],
    bookingNote: 'Information coming soon.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-garden-fragrance', 'p-butterfly-garden'],
  },
  {
    id: 'e-star-gazing',
    slug: 'star-gazing',
    name: 'Star Gazing',
    category: 'Evening',
    description: 'A star-gazing experience listed among the park official offerings.',
    details: [
      'Listed on the official SGNP website. Sessions depend on scheduling, weather and park permissions.',
      'After-dark access inside the park is controlled by the park.',
    ],
    heroImage: { id: 'm-e-star', art: 'night', alt: 'A dark night sky above an illustrated tree line' },
    locationPlaceId: 'p-star-gazing',
    durationNote: 'Information coming soon.',
    requirements: ['Attend only officially arranged sessions.'],
    bookingNote: 'Session scheduling: information coming soon. Check official park channels.',
    availability: { ...unknownAvailability },
    relatedPlaceIds: ['p-star-gazing', 'p-gandhi-tekdi'],
  },
];

export const experienceById = (id: string) => experiences.find((e) => e.id === id);
export const experienceBySlug = (slug: string) => experiences.find((e) => e.slug === slug);

/* ── Sounds of the Forest ──────────────────────────────────────────────
   No audio ships with this prototype. Playback is simulated and every
   track is labelled as a placeholder — no copyrighted material is used
   or referenced.                                                      */
export const soundTracks: SoundTrack[] = [
  { id: 'a-dawn', name: 'First Light', category: 'Dawn', description: 'The forest waking, before the park opens.', durationSeconds: 204, src: null },
  { id: 'a-rain', name: 'Monsoon Canopy', category: 'Rain', description: 'Rain arriving on a canopy that has been waiting for it.', durationSeconds: 312, src: null },
  { id: 'a-birds', name: 'Morning Chorus', category: 'Birds', description: 'Layered calls from the forest interior.', durationSeconds: 245, src: null },
  { id: 'a-water', name: 'Still Lake', category: 'Water', description: 'Water at the edge of the boating lake.', durationSeconds: 188, src: null },
  { id: 'a-night', name: 'After Dark', category: 'Night', description: 'Insects, one distant owl, and a great deal of space.', durationSeconds: 274, src: null },
  { id: 'a-forest-ambience', name: 'Under the Trees', category: 'Forest ambience', description: 'Wind moving through the upper canopy.', durationSeconds: 360, src: null },
];

export const soundById = (id: string) => soundTracks.find((s) => s.id === id);

/* ── Park updates & notifications ──────────────────────────────────── */
export const parkUpdates: ParkUpdate[] = [
  {
    id: 'n-1',
    title: 'Carry water for longer trails',
    body: 'There is little shade on the open rock at Kanheri. Carry more water than you think you need.',
    severity: 'safety',
    createdAt: '2026-09-01T06:30:00+05:30',
    freshness: { status: 'open', lastUpdated: '2026-09-01', source: 'Forest note' },
  },
  {
    id: 'n-2',
    title: 'Park information may change without notice',
    body: 'Timings, fees and activity availability are set by the park. Always check official signage and channels on the day of your visit.',
    severity: 'park',
    createdAt: '2026-08-30T09:00:00+05:30',
    freshness: { status: 'unverified', lastUpdated: null, source: null },
  },
  {
    id: 'n-3',
    title: 'You saved Kanheri Caves',
    body: 'It is now in My Forest Journey, along with anything else you save.',
    severity: 'saved',
    createdAt: '2026-08-28T17:12:00+05:30',
    freshness: { status: 'open', lastUpdated: '2026-08-28', source: 'Your activity' },
  },
  {
    id: 'n-4',
    title: 'A new forest story',
    body: 'The Life of a Butterfly — a closer look at the park biodiversity.',
    severity: 'editorial',
    createdAt: '2026-08-25T08:00:00+05:30',
    freshness: { status: 'open', lastUpdated: '2026-08-25', source: 'Stories of the Forest' },
  },
];

/* ── Safety ────────────────────────────────────────────────────────── */
export const safetyGuidance = [
  'Stay on marked paths.',
  'Do not approach wildlife.',
  'Do not feed animals.',
  'Respect restricted areas.',
  'Carry water.',
  'Follow park instructions and signage.',
];
