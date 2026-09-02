/* ── Domain models ───────────────────────────────────────────────────
   Every operational record carries a freshness envelope so that
   frequently-changing park information is never presented as settled
   fact baked into the app binary. See `Freshness`.                    */

export type PlaceCategory =
  | 'entrance' | 'attraction' | 'heritage' | 'nature'
  | 'wildlife' | 'water' | 'viewpoint' | 'trail'
  | 'experience' | 'facility';

export type MapLayer =
  | 'attractions' | 'trails' | 'wildlife'
  | 'heritage' | 'water' | 'experiences' | 'facilities';

export type AccessStatus =
  | 'public'          // open to visitors
  | 'restricted'      // not a public visitor destination
  | 'view-only'       // visible in the landscape, not enterable
  | 'unknown';        // access not verified — never presented as open

export type OperationalStatus = 'open' | 'closed' | 'seasonal' | 'unverified';

/** Provenance + validity for anything that changes in the real world. */
export interface Freshness {
  status: OperationalStatus;
  /** ISO date the value was last checked against an official source. */
  lastUpdated: string | null;
  /** Human-readable attribution, e.g. "Official park information". */
  source: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
}

export interface Coordinates {
  /** Illustrated-map space, 0–100 on both axes. Not geographic. */
  x: number;
  y: number;
  /** Real WGS84 coordinates, only when verified. `null` otherwise. */
  lat: number | null;
  lng: number | null;
}

export interface MediaRef {
  id: string;
  /** Seed for the procedural forest illustration used in place of photography. */
  art: ArtVariant;
  alt: string;
  caption?: string;
}

export type ArtVariant =
  | 'forest' | 'canopy' | 'lake' | 'caves' | 'hills'
  | 'trail' | 'butterfly' | 'night' | 'monsoon' | 'gate';

export interface Place {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  tags: PlaceCategory[];
  layers: MapLayer[];
  markerIcon: MarkerIcon;
  tagline: string;
  shortDescription: string;
  about: string[];
  heroImage: MediaRef;
  gallery: MediaRef[];
  coordinates: Coordinates;
  accessStatus: AccessStatus;
  /** Rendered under GOOD TO KNOW. Anything unverified says so plainly. */
  goodToKnow: InfoRow[];
  whatYouMaySee: string[];
  openingInfo: Freshness;
  facilities: string[];
  relatedPlaceIds: string[];
  relatedTrailIds: string[];
  relatedWildlifeIds: string[];
  relatedStoryIds: string[];
}

export interface InfoRow {
  label: string;
  value: string;
  /** True when we could not verify the value from an official source. */
  unverified?: boolean;
}

export type MarkerIcon =
  | 'gate' | 'boat' | 'train' | 'hill' | 'paw' | 'butterfly'
  | 'footsteps' | 'bicycle' | 'cave' | 'flower' | 'star'
  | 'ripple' | 'river' | 'info';

export type Difficulty = 'easy' | 'moderate' | 'long';

export interface TrailWaypoint {
  id: string;
  name: string;
  placeId?: string;
  note?: string;
  coordinates: Pick<Coordinates, 'x' | 'y'>;
}

export interface Trail {
  id: string;
  slug: string;
  name: string;
  kind: 'curated' | 'trail';
  tagline: string;
  difficulty: Difficulty;
  /** Kilometres. `null` where no verified measurement exists. */
  distanceKm: number | null;
  durationMinutes: number | null;
  startPointPlaceId: string;
  waypoints: TrailWaypoint[];
  description: string[];
  highlights: string[];
  whatYouMaySee: string[];
  safetyInfo: string[];
  accessNote: string;
  accessStatus: AccessStatus;
  interests: string[];
  heroImage: MediaRef;
  access: Freshness;
  relatedPlaceIds: string[];
  relatedWildlifeIds: string[];
  relatedStoryIds: string[];
}

export type WildlifeCategory =
  | 'mammals' | 'birds' | 'butterflies' | 'reptiles' | 'amphibians' | 'plants';

export interface Wildlife {
  id: string;
  slug: string;
  name: string;
  scientificName: string | null;
  category: WildlifeCategory;
  tagline: string;
  description: string[];
  identification: string[];
  /** Deliberately broad. Never a precise sighting coordinate. */
  habitat: string;
  didYouKnow: string[];
  safetyInfo: string[];
  heroImage: MediaRef;
  relatedPlaceIds: string[];
  relatedStoryIds: string[];
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  readMinutes: number;
  heroImage: MediaRef;
  intro: string;
  content: StoryBlock[];
  audioId: string | null;
  relatedPlaceIds: string[];
  relatedWildlifeIds: string[];
  relatedTrailIds: string[];
  publishedAt: string;
}

export type StoryBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'pullquote'; text: string }
  | { type: 'figure'; media: MediaRef };

export interface Experience {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  details: string[];
  heroImage: MediaRef;
  locationPlaceId: string | null;
  durationNote: string;
  requirements: string[];
  bookingNote: string;
  availability: Freshness;
  relatedPlaceIds: string[];
}

export interface SoundTrack {
  id: string;
  name: string;
  category: 'Dawn' | 'Rain' | 'Birds' | 'Water' | 'Night' | 'Forest ambience';
  description: string;
  durationSeconds: number;
  /** No audio file ships with the prototype — playback is simulated. */
  src: string | null;
}

export interface ParkUpdate {
  id: string;
  title: string;
  body: string;
  severity: 'safety' | 'visit' | 'park' | 'saved' | 'editorial';
  createdAt: string;
  freshness: Freshness;
}

/* ── User-owned state ──────────────────────────────────────────────── */

export type SavedKind = 'place' | 'trail' | 'wildlife' | 'story' | 'experience';

export interface SavedItem {
  id: string;
  kind: SavedKind;
  savedAt: string;
}

export interface Memory {
  id: string;
  title: string;
  placeId: string | null;
  date: string;
  art: ArtVariant;
  note: string;
  /** Editorial grid weighting — memories are not uniform tiles. */
  span: 'tall' | 'wide' | 'square';
}

export interface Visit {
  id: string;
  date: string;
  visitors: number;
  experienceIds: string[];
  reference: string;
  status: 'upcoming' | 'past';
  /** The prototype never claims to hold an official booking. */
  bookingKind: 'prototype-plan';
}

export interface UserProfile {
  name: string;
  interests: string[];
  onboarded: boolean;
}
