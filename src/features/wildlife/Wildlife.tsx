import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHero, IndexHead } from '../../components/site/PageHero';
import {
  Button, EmptyState, ErrorState, LeafList, LoadingState, Notice,
  OfflineState, Reveal, SaveButton, SectionHead,
} from '../../components/ui';
import { SpeciesCard, ResultRow } from '../../components/cards';
import { useAppState } from '../../app/providers/AppState';
import { useAsync } from '../../utils';
import { wildlifeRepo, resolve, label } from '../../data/repositories';
import { photoFor } from '../../data/photoSlots';
import type { WildlifeCategory } from '../../data/models';

const CATEGORIES: WildlifeCategory[] = ['mammals', 'birds', 'butterflies', 'reptiles', 'amphibians', 'plants'];

export function WildlifeIndex() {
  const [state, retry] = useAsync(() => wildlifeRepo.all(), []);
  const [category, setCategory] = useState<WildlifeCategory | null>(null);

  const all = state.status === 'ready' ? state.data : [];
  const filtered = category ? all.filter((w) => w.category === category) : all;

  return (
    <>
      <IndexHead
        index="03"
        kicker="Biodiversity"
        title={<>What you<br />may see</>}
        lead="Maharashtra Tourism credits the park with more than 1,300 plant species, 274 birds, 35 mammals and 170 butterflies. You will meet a small fraction of them, and that is the correct expectation."
      >
        <div style={{ marginTop: 24 }}>
          <Notice icon="alert">
            This guide never publishes precise locations for wild animals, and never suggests a sighting is
            guaranteed. Habitat information is deliberately broad.
          </Notice>
        </div>
      </IndexHead>

      <div className="wrap" style={{ marginTop: 48 }}>
        <div className="filters">
          <button className="filter" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} className="filter" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          {state.status === 'loading' && <LoadingState label="Loading wildlife" />}
          {state.status === 'offline' && <OfflineState />}
          {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

          {state.status === 'ready' && (
            filtered.length === 0 ? (
              <EmptyState
                title="Nothing in that group yet"
                body="More species are being added to the guide."
                action={<Button variant="ghost" icon={null} onClick={() => setCategory(null)}>Show all</Button>}
              />
            ) : (
              <div className="grid-4">
                {filtered.map((w, i) => (
                  <Reveal key={w.id} delay={(i % 4) * 60}><SpeciesCard animal={w} /></Reveal>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}

export function WildlifeDetail() {
  const { slug = '' } = useParams();
  const { isSaved, toggleSave } = useAppState();
  const [state, retry] = useAsync(() => wildlifeRepo.bySlug(slug), [slug]);

  if (state.status === 'loading') return <div className="wrap section"><LoadingState /></div>;
  if (state.status === 'offline') return <div className="wrap section"><OfflineState /></div>;
  if (state.status === 'error') return <div className="wrap section"><ErrorState message={state.message} onRetry={retry} /></div>;

  const animal = state.data;
  if (!animal) {
    return (
      <div className="wrap section">
        <EmptyState title="Not found" body="That species is not in the guide." action={<Button to="/wildlife">All wildlife</Button>} />
      </div>
    );
  }

  const saved = isSaved('wildlife', animal.id);
  const related = [
    ...animal.relatedPlaceIds.map((id) => resolve('place', id)),
    ...animal.relatedStoryIds.map((id) => resolve('story', id)),
  ].filter(Boolean);

  return (
    <>
      <PageHero
        slot={photoFor(animal.id)}
        alt={animal.heroImage.alt}
        kicker={label(animal.category)}
        title={animal.name}
        tagline={animal.tagline}
        breadcrumb={{ to: '/wildlife', label: 'All wildlife' }}
        actions={<SaveButton saved={saved} onToggle={() => toggleSave('wildlife', animal.id)} label={animal.name} />}
      />

      <section className="section">
        <div className="wrap">
          {animal.scientificName && (
            <p className="serif-italic" style={{ fontSize: 26, color: 'var(--moss)', marginBottom: 46 }}>
              {animal.scientificName}
            </p>
          )}

          <div className="article">
            <div>
              <SectionHead index="01" kicker="About" />
              <div className="prose" style={{ marginTop: 28 }}>
                {animal.description.map((p, i) => <p key={i}>{p}</p>)}
              </div>

              <div style={{ marginTop: 60 }}>
                <SectionHead index="02" kicker="Did you know" />
                <div style={{ marginTop: 26 }}><LeafList items={animal.didYouKnow} /></div>
              </div>
            </div>

            <aside className="aside">
              <div className="aside__block">
                <span className="label">Identification</span>
                <div style={{ marginTop: 16 }}><LeafList items={animal.identification} /></div>
              </div>

              <div className="aside__block">
                <span className="label">Where you may encounter it</span>
                <p className="small" style={{ marginTop: 14 }}>{animal.habitat}</p>
                <div style={{ marginTop: 18 }}>
                  <Notice quiet icon="info">
                    General habitat only. Sensitive locations are never published, and no sighting is ever
                    guaranteed.
                  </Notice>
                </div>
              </div>

              <div className="aside__block">
                <span className="label">Safety</span>
                <div style={{ marginTop: 14 }}>
                  <Notice icon="alert">Keep your distance. Never approach or feed wildlife.</Notice>
                </div>
                <div style={{ marginTop: 18 }}><LeafList items={animal.safetyInfo} /></div>
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
