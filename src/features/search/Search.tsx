import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { EmptyState, ErrorState, SectionHead } from '../../components/ui';
import { ResultRow } from '../../components/cards';
import { IndexHead } from '../../components/site/PageHero';
import { search } from '../../data/repositories';
import { photoFor } from '../../data/photoSlots';
import type { SearchResult } from '../../data/repositories';

const SUGGESTIONS = ['Kanheri', 'Butterfly', 'Leopard', 'Monsoon', 'Boating', 'Bamboo', 'Trail'];

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; results: SearchResult[] };

const GROUPS: Record<string, string> = {
  place: 'Places', trail: 'Trails', wildlife: 'Wildlife',
  story: 'Stories', experience: 'Experiences',
};

export function Search() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    const q = query.trim();
    if (!q) { setState({ status: 'idle' }); return; }

    let alive = true;
    setState({ status: 'loading' });
    const t = setTimeout(() => {
      search(q)
        .then((results) => { if (alive) setState({ status: 'ready', results }); })
        .catch((e: unknown) => {
          if (alive) setState({ status: 'error', message: e instanceof Error ? e.message : 'Search failed' });
        });
    }, 220);

    return () => { alive = false; clearTimeout(t); };
  }, [query]);

  const grouped = state.status === 'ready'
    ? state.results.reduce<Record<string, SearchResult[]>>((acc, r) => {
      (acc[r.kind] ??= []).push(r);
      return acc;
    }, {})
    : {};

  return (
    <>
      <IndexHead
        index="—"
        kicker="Search"
        title={<>Find your<br />way in</>}
        lead="Search across places, trails, wildlife, stories and experiences."
      />

      <section className="section">
        <div className="wrap">
          <div style={{ position: 'relative', maxWidth: 620 }}>
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kanheri, leopard, monsoon…"
              aria-label="Search the guide"
              style={{
                width: '100%', minHeight: 62, padding: '0 20px 0 54px',
                background: 'var(--surface)', border: '1px solid var(--hair)',
                borderRadius: 'var(--r-sm)', color: 'var(--ivory)',
                fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 300,
              }}
            />
            <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
              <Icon name="search" size={19} />
            </span>
          </div>

          {state.status === 'idle' && (
            <div style={{ marginTop: 44 }}>
              <span className="label">Try</span>
              <div className="filters" style={{ marginTop: 16 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="filter" onClick={() => setQuery(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {state.status === 'loading' && (
            <div style={{ marginTop: 48 }} aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', gap: 22, marginBottom: 26 }}>
                  <div className="skeleton" style={{ width: 132, height: 108, flex: '0 0 132px' }} />
                  <div style={{ flex: 1, paddingTop: 12 }}>
                    <div className="skeleton" style={{ height: 12, width: '22%' }} />
                    <div className="skeleton" style={{ height: 22, width: '54%', marginTop: 14 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {state.status === 'error' && (
            <ErrorState message={state.message} onRetry={() => setQuery((q) => `${q} `.trim())} />
          )}

          {state.status === 'ready' && state.results.length === 0 && (
            <EmptyState
              icon="search"
              title="Nothing found"
              body={`No places, trails, wildlife, stories or experiences match “${query}”.`}
            />
          )}

          {state.status === 'ready' && state.results.length > 0 && (
            <>
              <p className="label" style={{ marginTop: 44 }}>
                {state.results.length} {state.results.length === 1 ? 'result' : 'results'}
              </p>
              {Object.entries(grouped).map(([kind, items]) => (
                <div key={kind} style={{ marginTop: 56 }}>
                  <SectionHead index="—" kicker={GROUPS[kind] ?? kind} />
                  <div className="grid-2" style={{ marginTop: 28 }}>
                    {items.map((r) => (
                      <ResultRow key={`${r.kind}-${r.id}`} href={r.href} name={r.name} meta={r.meta} slot={photoFor(r.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </>
  );
}
