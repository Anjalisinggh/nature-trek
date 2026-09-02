import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHero, IndexHead } from '../../components/site/PageHero';
import {
  Button, EmptyState, ErrorState, FreshnessNote, InfoRows, LeafList,
  LoadingState, Notice, OfflineState, Reveal, SaveButton, SectionHead, Tags, TextLink,
} from '../../components/ui';
import { PlaceCard, ResultRow, ExperienceCard, SpeciesCard, StoryItem, TrailBlock } from '../../components/cards';
import { useAppState } from '../../app/providers/AppState';
import { useAsync } from '../../utils';
import {
  placesRepo, trailsRepo, wildlifeRepo, storiesRepo, experiencesRepo, resolve, label,
} from '../../data/repositories';
import { photoFor, galleryFor } from '../../data/photoSlots';
import { Photo } from '../../components/media/Photo';

/* ── Place detail ──────────────────────────────────────────────────────
   One template for every place. Operational rows come from the record,
   so anything unverified renders as "Information coming soon" instead
   of an invented time or price.                                       */

export function PlaceDetail() {
  const { slug = '' } = useParams();
  const { isSaved, toggleSave } = useAppState();
  const [state, retry] = useAsync(() => placesRepo.bySlug(slug), [slug]);

  if (state.status === 'loading') return <div className="wrap section"><LoadingState /></div>;
  if (state.status === 'offline') return <div className="wrap section"><OfflineState /></div>;
  if (state.status === 'error') return <div className="wrap section"><ErrorState message={state.message} onRetry={retry} /></div>;

  const place = state.data;
  if (!place) {
    return (
      <div className="wrap section">
        <EmptyState title="Not found" body="That place is not in the guide." action={<Button to="/explore">Explore the park</Button>} />
      </div>
    );
  }

  const saved = isSaved('place', place.id);
  const related = [
    ...place.relatedPlaceIds.map((id) => resolve('place', id)),
    ...place.relatedTrailIds.map((id) => resolve('trail', id)),
    ...place.relatedWildlifeIds.map((id) => resolve('wildlife', id)),
    ...place.relatedStoryIds.map((id) => resolve('story', id)),
  ].filter(Boolean);

  return (
    <>
      <PageHero
        slot={photoFor(place.id)}
        alt={place.heroImage.alt}
        kicker={label(place.category)}
        title={place.name}
        tagline={place.tagline}
        breadcrumb={{ to: '/explore', label: 'All places' }}
        actions={
          <>
            <Button to={`/map?place=${place.id}`} icon="map">View on map</Button>
            <SaveButton saved={saved} onToggle={() => toggleSave('place', place.id)} label={place.name} />
          </>
        }
      />

      <section className="section">
        <div className="wrap">
          {place.accessStatus !== 'public' && (
            <div style={{ marginBottom: 48 }}>
              <Notice icon="alert">
                {place.accessStatus === 'restricted'
                  ? 'Access to this area may be restricted. This guide does not present it as a public visitor destination.'
                  : place.accessStatus === 'view-only'
                    ? 'Shown as a landscape feature. Not a destination this guide directs visitors to enter.'
                    : 'Public access for this experience has not been verified.'}
              </Notice>
            </div>
          )}

          <div className="article">
            <div>
              <SectionHead index="01" kicker="About" />
              <div className="prose" style={{ marginTop: 28 }}>
                {place.about.map((p, i) => <p key={i}>{p}</p>)}
              </div>

              {galleryFor(place.id).length > 0 && (
                <div style={{ marginTop: 56 }}>
                  <SectionHead index="02" kicker="Gallery" />
                  <div className="grid-3" style={{ marginTop: 28 }}>
                    {galleryFor(place.id).map((s) => (
                      <Reveal key={s} kind="wipe-up">
                        <div className="zoom">
                          <Photo slot={s} ratio={1.1} sizes="(max-width: 1080px) 46vw, 22vw" />
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 60 }}>
                <SectionHead index={galleryFor(place.id).length ? '03' : '02'} kicker="What you may see" />
                <p className="small muted" style={{ marginTop: 4, marginBottom: 22 }}>
                  You may see — not you will. Nothing here is guaranteed.
                </p>
                <Tags items={place.whatYouMaySee} />
              </div>
            </div>

            <aside className="aside">
              <div className="aside__block">
                <span className="label">Good to know</span>
                <div style={{ marginTop: 16 }}>
                  <InfoRows rows={place.goodToKnow} />
                </div>
                <div style={{ marginTop: 22 }}>
                  <FreshnessNote freshness={place.openingInfo} subject="Timings, fees and access" />
                </div>
              </div>

              {place.facilities.length > 0 && (
                <div className="aside__block">
                  <span className="label">Facilities</span>
                  <div style={{ marginTop: 16 }}>
                    <LeafList items={place.facilities} />
                  </div>
                </div>
              )}

              <div className="aside__block">
                <span className="label">On the map</span>
                <p className="small" style={{ marginTop: 12 }}>
                  See where this sits in relation to the rest of the park.
                </p>
                <div style={{ marginTop: 20 }}>
                  <TextLink to={`/map?place=${place.id}`}>Open the map</TextLink>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ background: '#101B15' }}>
          <div className="wrap">
            <SectionHead index="—" kicker="Explore nearby" />
            <div className="grid-2" style={{ marginTop: 34 }}>
              {related.map((r) => r && (
                <ResultRow key={`${r.kind}-${r.id}`} href={r.href} name={r.name} meta={r.meta} slot={photoFor(r.id)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ── Explore: the index of everything ──────────────────────────────── */

type Tab = 'places' | 'trails' | 'wildlife' | 'stories' | 'experiences';

const TABS: { id: Tab; label: string }[] = [
  { id: 'places', label: 'Places' },
  { id: 'trails', label: 'Trails' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'stories', label: 'Stories' },
  { id: 'experiences', label: 'Experiences' },
];

export function Explore() {
  const [tab, setTab] = useState<Tab>('places');

  const places = placesRepo.sync.all();
  const trails = trailsRepo.sync.all();
  const animals = wildlifeRepo.sync.all();
  const stories = storiesRepo.sync.all();
  const experiences = experiencesRepo.sync.all();

  const counts: Record<Tab, number> = {
    places: places.length, trails: trails.length, wildlife: animals.length,
    stories: stories.length, experiences: experiences.length,
  };

  return (
    <>
      <IndexHead
        index="01"
        kicker="Explore"
        title={<>Everything<br />in the guide</>}
        lead="Places, trails, wildlife, stories and experiences — arranged by what they are. Every one of them connects back to somewhere on the map."
      >
        <div className="filters" style={{ marginTop: 28 }}>
          {TABS.map((t) => (
            <button key={t.id} className="filter" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label} <span style={{ opacity: 0.55 }}>{counts[t.id]}</span>
            </button>
          ))}
        </div>
      </IndexHead>

      <section className="section">
        <div className="wrap">
          {tab === 'places' && (
            <div className="card-row" style={{ marginTop: 0 }}>
              {places.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 70}>
                  <PlaceCard place={p} index={String(i + 1).padStart(2, '0')} />
                </Reveal>
              ))}
            </div>
          )}

          {tab === 'trails' && (
            <div>
              {trails.map((t, i) => (
                <Reveal key={t.id}><TrailBlock trail={t} index={String(i + 1).padStart(2, '0')} /></Reveal>
              ))}
            </div>
          )}

          {tab === 'wildlife' && (
            <div className="grid-4">
              {animals.map((a, i) => (
                <Reveal key={a.id} delay={(i % 4) * 60}><SpeciesCard animal={a} /></Reveal>
              ))}
            </div>
          )}

          {tab === 'stories' && (
            <div className="grid-2">
              {stories.map((s) => <Reveal key={s.id}><StoryItem story={s} /></Reveal>)}
            </div>
          )}

          {tab === 'experiences' && (
            <div className="card-row" style={{ marginTop: 0 }}>
              {experiences.map((e, i) => (
                <Reveal key={e.id} delay={(i % 4) * 70}>
                  <ExperienceCard experience={e} index={String(i + 1).padStart(2, '0')} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
