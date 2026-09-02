import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Nav, Footer } from '../../components/site/Chrome';
import { Landing } from '../../features/landing/Landing';
import { Explore, PlaceDetail } from '../../features/places/Places';
import { MapPage } from '../../features/map/MapPage';
import { TrailIndex, TrailDetail } from '../../features/trails/Trails';
import { WildlifeIndex, WildlifeDetail } from '../../features/wildlife/Wildlife';
import { StoryIndex, StoryDetail } from '../../features/stories/Stories';
import { ExperienceIndex, ExperienceDetail } from '../../features/experiences/Experiences';
import { Journey, MemoryDetail, Plan, Safety, About } from '../../features/journey/Journey';
import { Search } from '../../features/search/Search';
import { EmptyState, Button } from '../../components/ui';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/explore" element={<Explore />} />
          <Route path="/places/:slug" element={<PlaceDetail />} />

          <Route path="/map" element={<MapPage />} />

          <Route path="/trails" element={<TrailIndex />} />
          <Route path="/trails/:slug" element={<TrailDetail />} />

          <Route path="/wildlife" element={<WildlifeIndex />} />
          <Route path="/wildlife/:slug" element={<WildlifeDetail />} />

          <Route path="/stories" element={<StoryIndex />} />
          <Route path="/stories/:slug" element={<StoryDetail />} />

          <Route path="/experiences" element={<ExperienceIndex />} />
          <Route path="/experiences/:slug" element={<ExperienceDetail />} />

          <Route path="/plan" element={<Plan />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/journey/memories/:id" element={<MemoryDetail />} />

          <Route path="/search" element={<Search />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/about" element={<About />} />

          <Route
            path="*"
            element={
              <div className="wrap" style={{ paddingTop: 200, paddingBottom: 120 }}>
                <EmptyState
                  icon="compass"
                  title="Off the path"
                  body="That page is not part of the guide."
                  action={<Button to="/">Back to the forest</Button>}
                />
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
