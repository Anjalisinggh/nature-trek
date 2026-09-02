import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHero, IndexHead } from '../../components/site/PageHero';
import {
  Button, EmptyState, ErrorState, FreshnessNote, LeafList, LoadingState,
  Notice, OfflineState, Reveal, SaveButton, SectionHead, Tags, TextLink,
} from '../../components/ui';
import { TrailBlock, ResultRow } from '../../components/cards';
import { useAppState } from '../../app/providers/AppState';
import { useAsync, formatDuration } from '../../utils';
import { trailsRepo, placesRepo, resolve } from '../../data/repositories';
import { photoFor } from '../../data/photoSlots';
import type { Difficulty } from '../../data/models';

const DIFFICULTIES: Difficulty[] = ['easy', 'moderate', 'long'];

export function TrailIndex() {
  const [state, retry] = useAsync(() => trailsRepo.all(), []);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [interest, setInterest] = useState<string | null>(null);

  const trails = state.status === 'ready' ? state.data : [];
  const interests = useMemo(
    () => Array.from(new Set(trails.flatMap((t) => t.interests))).sort(),
    [trails],
  );

  const filtered = trails.filter(
    (t) => (!difficulty || t.difficulty === difficulty) && (!interest || t.interests.includes(interest)),
  );
  const curated = filtered.filter((t) => t.kind === 'curated');
  const paths = filtered.filter((t) => t.kind === 'trail');

  return (
    <>
      <IndexHead
        index="02"
        kicker="On foot"
        title={<>Walk through<br />the forest</>}
        lead="Choose a path and see where it takes you. Some of these are the park's own trails; others are groupings this guide suggests."
      >
        <div style={{ marginTop: 24 }}>
          <Notice icon="info">
            Curated routes are not official park routes. Trail access changes with the season and with park
            decisions — confirm what is open on the day.
          </Notice>
        </div>
      </IndexHead>

      <div className="wrap" style={{ marginTop: 48 }}>
        <div className="filters">
          <button className="filter" aria-pressed={difficulty === null} onClick={() => setDifficulty(null)}>All</button>
          {DIFFICULTIES.map((d) => (
            <button key={d} className="filter" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}>{d}</button>
          ))}
          <span style={{ width: 24 }} />
          <button className="filter" aria-pressed={interest === null} onClick={() => setInterest(null)}>Any interest</button>
          {interests.map((i) => (
            <button key={i} className="filter" aria-pressed={interest === i} onClick={() => setInterest(i)}>{i}</button>
          ))}
        </div>
      </div>

      <section className="section--tight section">
        <div className="wrap">
          {state.status === 'loading' && <LoadingState label="Loading trails" />}
          {state.status === 'offline' && <OfflineState />}
          {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

          {state.status === 'ready' && filtered.length === 0 && (
            <EmptyState
              title="No trails match"
              body="Try a different difficulty or interest."
              action={<Button variant="ghost" icon={null} onClick={() => { setDifficulty(null); setInterest(null); }}>Clear filters</Button>}
            />
          )}

          {curated.length > 0 && (
            <>
              <SectionHead index="—" kicker="Curated routes" />
              <div style={{ marginTop: 20 }}>
                {curated.map((t, i) => (
                  <Reveal key={t.id}><TrailBlock trail={t} index={String(i + 1).padStart(2, '0')} /></Reveal>
                ))}
              </div>
            </>
          )}

          {paths.length > 0 && (
            <>
              <div style={{ marginTop: 80 }}>
                <SectionHead index="—" kicker="Park trails" />
              </div>
              <div style={{ marginTop: 20 }}>
                {paths.map((t, i) => (
                  <Reveal key={t.id}><TrailBlock trail={t} index={String(i + 1).padStart(2, '0')} /></Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function TrailDetail() {
  const { slug = '' } = useParams();
  const { isSaved, toggleSave } = useAppState();
  const [state, retry] = useAsync(() => trailsRepo.bySlug(slug), [slug]);

  if (state.status === 'loading') return <div className="wrap section"><LoadingState /></div>;
  if (state.status === 'offline') return <div className="wrap section"><OfflineState /></div>;
  if (state.status === 'error') return <div className="wrap section"><ErrorState message={state.message} onRetry={retry} /></div>;

  const trail = state.data;
  if (!trail) {
    return (
      <div className="wrap section">
        <EmptyState title="Not found" body="That trail is not in the guide." action={<Button to="/trails">All trails</Button>} />
      </div>
    );
  }

  const saved = isSaved('trail', trail.id);
  const start = placesRepo.sync.byId(trail.startPointPlaceId);
  const duration = formatDuration(trail.durationMinutes);
  const related = [
    ...trail.relatedPlaceIds.map((id) => resolve('place', id)),
    ...trail.relatedWildlifeIds.map((id) => resolve('wildlife', id)),
    ...trail.relatedStoryIds.map((id) => resolve('story', id)),
  ].filter(Boolean);

  return (
    <>
      <PageHero
        slot={photoFor(trail.id)}
        alt={trail.heroImage.alt}
        kicker={trail.kind === 'curated' ? 'Curated route' : 'Park trail'}
        title={trail.name}
        tagline={trail.tagline}
        breadcrumb={{ to: '/trails', label: 'All trails' }}
        actions={
          <>
            <Button to={`/map?trail=${trail.slug}`} icon="map">View on map</Button>
            <SaveButton saved={saved} onToggle={() => toggleSave('trail', trail.id)} label={trail.name} />
          </>
        }
      />

      <section className="section">
        <div className="wrap">
          {/* Deliberately few numbers */}
          <div className="trail-row__facts" style={{ marginTop: 0, marginBottom: 56, gap: 56 }}>
            <div className="fact">
              <div className="fact__k">Difficulty</div>
              <div className="fact__v" style={{ textTransform: 'capitalize' }}>{trail.difficulty}</div>
            </div>
            <div className="fact">
              <div className="fact__k">Distance</div>
              <div className="fact__v">{trail.distanceKm != null ? `${trail.distanceKm} km` : 'Not verified'}</div>
            </div>
            <div className="fact">
              <div className="fact__k">Duration</div>
              <div className="fact__v">{duration ?? 'Not verified'}</div>
            </div>
            <div className="fact">
              <div className="fact__k">Starts at</div>
              <div className="fact__v">{start?.name.split(' · ')[0] ?? '—'}</div>
            </div>
          </div>

          <div className="article">
            <div>
              <SectionHead index="01" kicker="About" />
              <div className="prose" style={{ marginTop: 28 }}>
                {trail.description.map((p, i) => <p key={i}>{p}</p>)}
              </div>

              <div style={{ marginTop: 64 }}>
                <SectionHead index="02" kicker="The route" />
                <ol className="timeline" style={{ marginTop: 30 }}>
                  {trail.waypoints.map((w, i) => (
                    <li key={w.id}>
                      <span className="label">Stop {String(i + 1).padStart(2, '0')}</span>
                      <h3 className="h3" style={{ marginTop: 6 }}>{w.name}</h3>
                      {w.note && <p className="small" style={{ marginTop: 8 }}>{w.note}</p>}
                    </li>
                  ))}
                </ol>
              </div>

              <div style={{ marginTop: 56 }}>
                <SectionHead index="03" kicker="Highlights" />
                <div style={{ marginTop: 26 }}><LeafList items={trail.highlights} /></div>
              </div>

              <div style={{ marginTop: 56 }}>
                <SectionHead index="04" kicker="What you may see" />
                <div style={{ marginTop: 26 }}><Tags items={trail.whatYouMaySee} /></div>
              </div>
            </div>

            <aside className="aside">
              <div className="aside__block">
                <span className="label">Safety</span>
                <div style={{ marginTop: 16 }}><LeafList items={trail.safetyInfo} /></div>
              </div>

              <div className="aside__block">
                <span className="label">Access</span>
                <p className="small" style={{ marginTop: 14 }}>{trail.accessNote}</p>
                <div style={{ marginTop: 20 }}>
                  <FreshnessNote freshness={trail.access} subject="Trail access and route" />
                </div>
              </div>

              <div className="aside__block">
                <Notice quiet icon="alert">
                  The map is an illustrated impression of the park. Do not use it to navigate — follow park
                  signage and staff instructions on the ground.
                </Notice>
                <div style={{ marginTop: 20 }}>
                  <TextLink to={`/map?trail=${trail.slug}`}>See the route on the map</TextLink>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ background: '#101B15' }}>
          <div className="wrap">
            <SectionHead index="—" kicker="Related" />
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
