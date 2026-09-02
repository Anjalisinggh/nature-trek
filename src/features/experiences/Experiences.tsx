import { useParams } from 'react-router-dom';
import { PageHero, IndexHead } from '../../components/site/PageHero';
import {
  Button, EmptyState, ErrorState, FreshnessNote, LeafList, LoadingState,
  Notice, OfflineState, Reveal, SaveButton, SectionHead, TextLink,
} from '../../components/ui';
import { ExperienceCard, ResultRow } from '../../components/cards';
import { useAppState } from '../../app/providers/AppState';
import { useAsync } from '../../utils';
import { experiencesRepo, placesRepo, resolve } from '../../data/repositories';
import { photoFor } from '../../data/photoSlots';

export function ExperienceIndex() {
  const [state, retry] = useAsync(() => experiencesRepo.all(), []);

  return (
    <>
      <IndexHead
        index="05"
        kicker="Things to do"
        title={<>Experiences<br />in the park</>}
        lead="What there is to do, and what the park decides is running on the day you arrive."
      >
        <div style={{ marginTop: 24 }}>
          <Notice icon="info">
            Availability is dynamic and is not verified by this guide. Confirm at the park.
          </Notice>
        </div>
      </IndexHead>

      <section className="section">
        <div className="wrap">
          {state.status === 'loading' && <LoadingState label="Loading experiences" />}
          {state.status === 'offline' && <OfflineState />}
          {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

          {state.status === 'ready' && (
            <div className="card-row" style={{ marginTop: 0 }}>
              {state.data.map((e, i) => (
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

export function ExperienceDetail() {
  const { slug = '' } = useParams();
  const { isSaved, toggleSave } = useAppState();
  const [state, retry] = useAsync(() => experiencesRepo.bySlug(slug), [slug]);

  if (state.status === 'loading') return <div className="wrap section"><LoadingState /></div>;
  if (state.status === 'offline') return <div className="wrap section"><OfflineState /></div>;
  if (state.status === 'error') return <div className="wrap section"><ErrorState message={state.message} onRetry={retry} /></div>;

  const exp = state.data;
  if (!exp) {
    return (
      <div className="wrap section">
        <EmptyState title="Not found" body="That experience is not in the guide." action={<Button to="/experiences">All experiences</Button>} />
      </div>
    );
  }

  const saved = isSaved('experience', exp.id);
  const place = exp.locationPlaceId ? placesRepo.sync.byId(exp.locationPlaceId) : null;
  const related = exp.relatedPlaceIds.map((id) => resolve('place', id)).filter(Boolean);

  return (
    <>
      <PageHero
        slot={photoFor(exp.id)}
        alt={exp.heroImage.alt}
        kicker={exp.category}
        title={exp.name}
        tagline={exp.description}
        breadcrumb={{ to: '/experiences', label: 'All experiences' }}
        actions={
          <>
            {place && <Button to={`/map?place=${place.id}`} icon="map">View on map</Button>}
            <SaveButton saved={saved} onToggle={() => toggleSave('experience', exp.id)} label={exp.name} />
          </>
        }
      />

      <section className="section">
        <div className="wrap">
          <div className="article">
            <div>
              <SectionHead index="01" kicker="About" />
              <div className="prose" style={{ marginTop: 28 }}>
                {exp.details.map((d, i) => <p key={i}>{d}</p>)}
              </div>

              {exp.requirements.length > 0 && (
                <div style={{ marginTop: 60 }}>
                  <SectionHead index="02" kicker="Before you go" />
                  <div style={{ marginTop: 26 }}><LeafList items={exp.requirements} /></div>
                </div>
              )}
            </div>

            <aside className="aside">
              <div className="aside__block">
                <span className="label">Good to know</span>
                <dl style={{ marginTop: 16 }}>
                  <div className="info-row"><dt>Location</dt><dd>{place?.name ?? 'Information coming soon'}</dd></div>
                  <div className="info-row"><dt>Duration</dt><dd>{exp.durationNote}</dd></div>
                  <div className="info-row"><dt>Booking</dt><dd>{exp.bookingNote}</dd></div>
                </dl>
                <div style={{ marginTop: 20 }}>
                  <FreshnessNote freshness={exp.availability} subject="Availability and operating times" />
                </div>
              </div>

              {place && (
                <div className="aside__block">
                  <span className="label">Where</span>
                  <p className="small" style={{ marginTop: 12 }}>{place.shortDescription}</p>
                  <div style={{ marginTop: 20 }}>
                    <TextLink to={`/places/${place.slug}`}>Open {place.name.split(' · ')[0]}</TextLink>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ background: '#101B15' }}>
          <div className="wrap">
            <SectionHead index="—" kicker="Related places" />
            <div className="grid-2" style={{ marginTop: 34 }}>
              {related.map((r) => r && (
                <ResultRow key={r.id} href={r.href} name={r.name} meta={r.meta} slot={photoFor(r.id)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
