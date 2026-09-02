import { useParams } from 'react-router-dom';
import { PageHero, IndexHead } from '../../components/site/PageHero';
import {
  Button, ErrorState, EmptyState, LoadingState, OfflineState,
  Reveal, SaveButton, SectionHead,
} from '../../components/ui';
import { StoryLead, StoryItem, ResultRow } from '../../components/cards';
import { useAppState } from '../../app/providers/AppState';
import { useAsync } from '../../utils';
import { storiesRepo, resolve } from '../../data/repositories';
import { photoFor } from '../../data/photoSlots';

export function StoryIndex() {
  const [state, retry] = useAsync(() => storiesRepo.all(), []);

  return (
    <>
      <IndexHead
        index="04"
        kicker="Reading"
        title={<>Stories of<br />the forest</>}
        lead="Longer pieces about the park — its heritage, its seasons, and the animals that have arranged their entire lives around not being seen."
      />

      <section className="section">
        <div className="wrap">
          {state.status === 'loading' && <LoadingState label="Loading stories" />}
          {state.status === 'offline' && <OfflineState />}
          {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

          {state.status === 'ready' && (
            <div className="stories" style={{ marginTop: 0 }}>
              <Reveal><StoryLead story={state.data[0]} /></Reveal>
              <Reveal delay={120}>
                <div className="stories__side">
                  {state.data.slice(1).map((s) => <StoryItem key={s.id} story={s} />)}
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function StoryDetail() {
  const { slug = '' } = useParams();
  const { isSaved, toggleSave } = useAppState();
  const [state, retry] = useAsync(() => storiesRepo.bySlug(slug), [slug]);

  if (state.status === 'loading') return <div className="wrap section"><LoadingState /></div>;
  if (state.status === 'offline') return <div className="wrap section"><OfflineState /></div>;
  if (state.status === 'error') return <div className="wrap section"><ErrorState message={state.message} onRetry={retry} /></div>;

  const story = state.data;
  if (!story) {
    return (
      <div className="wrap section">
        <EmptyState title="Not found" body="That story is not in the guide." action={<Button to="/stories">All stories</Button>} />
      </div>
    );
  }

  const index = storiesRepo.sync.all().findIndex((s) => s.id === story.id) + 1;
  const saved = isSaved('story', story.id);
  const related = [
    ...story.relatedPlaceIds.map((id) => resolve('place', id)),
    ...story.relatedWildlifeIds.map((id) => resolve('wildlife', id)),
    ...story.relatedTrailIds.map((id) => resolve('trail', id)),
  ].filter(Boolean);

  return (
    <>
      <PageHero
        slot={photoFor(story.id)}
        alt={story.heroImage.alt}
        kicker={`Story ${String(index).padStart(2, '0')} · ${story.category} · ${story.readMinutes} min read`}
        title={story.title}
        tagline={story.intro}
        breadcrumb={{ to: '/stories', label: 'All stories' }}
        actions={<SaveButton saved={saved} onToggle={() => toggleSave('story', story.id)} label={story.title} />}
      />

      <section className="section">
        <div className="wrap">
          {/* A magazine measure: the text column is deliberately narrow. */}
          <div style={{ maxWidth: 720, marginInline: 'auto' }}>
            <div className="prose">
              {story.content.map((block, i) => {
                if (block.type === 'paragraph') return <p key={i}>{block.text}</p>;
                if (block.type === 'heading') return <h3 key={i}>{block.text}</h3>;
                if (block.type === 'pullquote') return <blockquote className="pull" key={i}>{block.text}</blockquote>;
                // Inline figures are omitted: the guide has one attributable
                // photograph per story, and it is already the hero.
                return null;
              })}
            </div>

            <div style={{ marginTop: 56, paddingTop: 34, borderTop: '1px solid var(--rule)', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <SaveButton saved={saved} onToggle={() => toggleSave('story', story.id)} label={story.title} />
              <span className="small muted">Published {story.publishedAt}</span>
            </div>
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
