import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ParkMap, PlaceIndex } from '../../components/map/ParkMap';
import { IndexHead } from '../../components/site/PageHero';
import { ErrorState, LoadingState, Notice, OfflineState, SectionHead } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { useAsync } from '../../utils';
import { placesRepo, trailsRepo } from '../../data/repositories';

/* ── The map page ──────────────────────────────────────────────────────
   The plate at full width, plus a list index beneath it — map content is
   never available only visually.                                       */

export function MapPage() {
  const [params] = useSearchParams();
  const [state, retry] = useAsync(() => placesRepo.all(), []);
  const [view, setView] = useState<'plate' | 'list'>('plate');

  const trailSlug = params.get('trail');
  const routeTrail = trailSlug ? trailsRepo.sync.bySlug(trailSlug) ?? null : null;
  const places = state.status === 'ready' ? state.data : [];

  return (
    <>
      <IndexHead
        index="00"
        kicker="Cartography"
        title={<>The park,<br />drawn</>}
        lead="Forest, basalt, water and the trails that link them. Follow the paths and see what is where."
      >
        <div className="filters" style={{ marginTop: 26 }}>
          <button className="filter" aria-pressed={view === 'plate'} onClick={() => setView('plate')}>
            <Icon name="map" size={13} /> Illustrated plate
          </button>
          <button className="filter" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <Icon name="list" size={13} /> List of places
          </button>
        </div>
      </IndexHead>

      <section className="section map-section">
        <div className="wrap">
          {state.status === 'loading' && <LoadingState label="Loading the park map" />}
          {state.status === 'offline' && <OfflineState />}
          {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

          {state.status === 'ready' && (
            view === 'plate' ? (
              <>
                {routeTrail && (
                  <div style={{ marginBottom: 30, maxWidth: 640 }}>
                    <Notice icon="route">
                      Showing <strong style={{ color: 'var(--ivory)', fontWeight: 500 }}>{routeTrail.name}</strong>.
                      An illustrated impression of the route, not a navigational line.
                    </Notice>
                  </div>
                )}
                <ParkMap places={places} routeTrail={routeTrail} initialSelected={params.get('place')} />
              </>
            ) : (
              <>
                <SectionHead index="—" kicker="Every place on the plate" />
                <PlaceIndex places={places} />
              </>
            )
          )}
        </div>
      </section>
    </>
  );
}
