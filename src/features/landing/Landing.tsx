import { Link } from 'react-router-dom';
import { Photo, NoPhoto, getPhoto } from '../../components/media/Photo';
import { Icon } from '../../components/ui/Icon';
import { Button, Notice, SectionHead, TextLink } from '../../components/ui';
import {
  PlaceCard, SpeciesCard, StoryLead, StoryItem, TrailBlock, MemoryPlate,
} from '../../components/cards';
import { ParkMap } from '../../components/map/ParkMap';
import { Reveal, useParallax, useCursorLabel } from '../../components/motion';
import { useAppState } from '../../app/providers/AppState';
import { formatDate } from '../../utils';
import { placesRepo, trailsRepo, wildlifeRepo, storiesRepo } from '../../data/repositories';
import { SECTION_PHOTO, photoFor } from '../../data/photoSlots';

/* ── Landing ───────────────────────────────────────────────────────────
   A scroll through the park. Each section is built differently on
   purpose — cinematic hero, a city/forest threshold, a 5+7 editorial
   split, the map plate, a full-bleed heritage moment, a horizontal
   species rail, a magazine grid, alternating route diagrams, a
   functional planning row and a field journal.

   No two sections share a composition, and no photograph is used twice. */

export function Landing() {
  const { profile, saved, memories, visits } = useAppState();

  const places = placesRepo.sync.all();
  const curated = trailsRepo.sync.curated();
  const stories = storiesRepo.sync.all();
  const animals = wildlifeRepo.sync.all();
  const upcoming = visits.find((v) => v.status === 'upcoming');

  // The species rail shows only what the guide can actually picture.
  const pictured = ['w-leopard', 'w-chital', 'w-langur', 'w-drongo', 'w-flycatcher', 'w-blue-tiger', 'w-crimson-rose', 'w-python']
    .map((id) => animals.find((a) => a.id === id))
    .filter(Boolean) as typeof animals;

  const featured = ['p-tulsi-lake', 'p-boating-lake', 'p-butterfly-garden', 'p-nature-trails']
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean) as typeof places;

  const heroPhoto = getPhoto(SECTION_PHOTO.hero);
  const kanheri = places.find((p) => p.id === 'p-kanheri')!;

  // Three planes at different rates: the depth cue.
  const skyPlane = useParallax(0.16, 22);
  const midPlane = useParallax(0.08, 44);
  const copyPlane = useParallax(-0.04, 0);

  const exploreCursor = useCursorLabel('Explore');

  return (
    <>
      {/* ══ HERO — cinematic, staged, parallaxed ═══════════════════ */}
      <section className="hero">
        {heroPhoto ? (
          <>
            <div className="hero__plane hero__planeIn" style={{ ...midPlane, zIndex: 0 }}>
              <img
                src={heroPhoto.file}
                srcSet={`${heroPhoto.card} 760w, ${heroPhoto.file} ${heroPhoto.width}w`}
                sizes="100vw"
                alt={heroPhoto.alt}
                width={heroPhoto.width}
                height={heroPhoto.height}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            </div>
            <div className="hero__veil" style={skyPlane} />
            <div className="hero__grain" />
          </>
        ) : (
          <div className="hero__plane"><NoPhoto label="Hero" /></div>
        )}

        <div className="hero__inner" style={copyPlane}>
          <div className="hero__copy">
            <div className="hero__eyebrow stage d1">
              <span className="dash" />
              <span className="label label--light">Sanjay Gandhi National Park · Mumbai</span>
            </div>

            <h1 className="hero-title hero__title">
              <span className="stage-line d2">Into</span>
              <span className="stage-line d3">the</span>
              <span className="stage-line d4"><em>forest</em></span>
            </h1>

            <p className="lead hero__lead stage d5">
              A forest of trails, ancient caves and wild stories, hidden inside Mumbai.
            </p>

            <div className="hero__actions stage d6">
              <Button to="/explore">Explore the park</Button>
              <Button to="/map" variant="ghost" icon="map">View the map</Button>
            </div>
          </div>
        </div>

        <div className="hero__meta stage d7">
          <div className="hero__scroll"><i /><span>Scroll</span></div>
          <span className="label">
            {heroPhoto ? `${heroPhoto.credit.artist} · ${heroPhoto.credit.license}` : ''}
          </span>
        </div>
      </section>

      {/* ══ THRESHOLD — the city falls quiet ═══════════════════════ */}
      <section className="threshold">
        <div className="wrap grid12">
          <Reveal kind="fade" className="c1-5">
            <div className="threshold__word">Mumbai</div>
          </Reveal>

          <Reveal kind="rise" delay={160} className="c7-12">
            <p className="threshold__line">
              And then, quite suddenly, the city falls quiet.
            </p>
            <div className="threshold__rule" />
            <p className="body" style={{ maxWidth: '40ch' }}>
              Twenty minutes past the gate the traffic is gone, the canopy closes, and the loudest thing is a
              drongo working through a repertoire it borrowed from other birds.
            </p>
            <p className="label" style={{ marginTop: 30 }}>Sanjay Gandhi National Park</p>
          </Reveal>
        </div>
      </section>

      {/* ══ 01 · THE PARK — 5 + 7 editorial split ══════════════════ */}
      <section className="section" id="park">
        <div className="wrap">
          <Reveal><SectionHead index="01" kicker="The park" title="Introduction" /></Reveal>

          <div className="grid12" style={{ marginTop: 50, alignItems: 'start' }}>
            <Reveal kind="rise" className="c1-5">
              <h2 className="display">A forest<br />within<br />the city</h2>
              <p className="body" style={{ marginTop: 32, maxWidth: '34ch' }}>
                It feels remote. It is not remote at all — this is Borivali, inside a city of more than twenty
                million people.
              </p>
              <p className="body" style={{ marginTop: 18, maxWidth: '34ch' }}>
                Inside it sit rock-cut Buddhist caves older than almost anything standing above ground in the
                city, lakes that still feed Mumbai&rsquo;s water supply, and a leopard population that has
                learned to move around us in the dark.
              </p>
              <div style={{ marginTop: 36 }}>
                <TextLink to="/stories/a-forest-inside-mumbai">Read the full story</TextLink>
              </div>
            </Reveal>

            <Reveal kind="wipe-up" delay={140} className="c7-12">
              <div className="zoom">
                <Photo
                  slot={SECTION_PHOTO.introPanorama}
                  ratio={0.42}
                  sizes="(max-width: 1080px) 92vw, 52vw"
                  credit="corner"
                />
              </div>

              <div className="stat-grid" style={{ marginTop: 40 }}>
                <div>
                  <div className="stat__value">109</div>
                  <div className="stat__label">Caves at Kanheri</div>
                </div>
                <div>
                  <div className="stat__value">274</div>
                  <div className="stat__label">Bird species</div>
                </div>
                <div>
                  <div className="stat__value">170</div>
                  <div className="stat__label">Butterfly species</div>
                </div>
              </div>
              <p className="small muted" style={{ marginTop: 20 }}>
                Figures as described by Maharashtra Tourism. This guide does not publish statistics it cannot
                attribute.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ 02 · THE MAP — large interactive canvas ════════════════ */}
      <section className="section map-section" id="map">
        <div className="wrap">
          <Reveal>
            <SectionHead index="02" kicker="The map" title="Plate 01" />
            <div className="grid12" style={{ marginTop: 40, alignItems: 'end' }}>
              <h2 className="display c1-5">Explore<br />the forest</h2>
              <p className="lead c7-12" style={{ maxWidth: '42ch' }}>
                Follow the paths. Find the stories. Choose any marker and the map will travel toward it.
              </p>
            </div>
          </Reveal>

          <div style={{ marginTop: 46 }} {...exploreCursor}>
            <ParkMap places={places} />
          </div>

          <div className="grid12" style={{ marginTop: 44, alignItems: 'center' }}>
            <Reveal kind="slide-right" className="c1-4">
              <div className="zoom">
                <Photo
                  slot={SECTION_PHOTO.mapFieldNote}
                  ratio={0.7}
                  sizes="(max-width: 1080px) 92vw, 30vw"
                />
              </div>
            </Reveal>
            <Reveal kind="rise" delay={120} className="c6-12">
              <span className="label">Field note</span>
              <p className="lead" style={{ marginTop: 14, maxWidth: '46ch' }}>
                The park keeps its own map at the gate. Ours is an illustrated impression drawn to show how the
                place fits together — it carries no projection and should never be used to navigate.
              </p>
              <div style={{ marginTop: 26 }}>
                <Button to="/map" variant="ghost" icon="map">Open the full map</Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ 03 · KANHERI — one architectural moment ════════════════ */}
      <section className="section" style={{ background: '#101B15' }} id="kanheri">
        <div className="wrap">
          <Reveal><SectionHead index="03" kicker="Heritage" title="Kanheri" /></Reveal>

          <div className="grid12" style={{ marginTop: 46, alignItems: 'end' }}>
            <Reveal kind="rise" className="c1-6">
              <h2 className="display">The stories<br />carved<br />in stone</h2>
            </Reveal>
            <Reveal kind="rise" delay={120} className="c8-12">
              <p className="lead">
                A whole monastic settlement cut out of a basalt hillside — living cells, prayer halls, stupas,
                inscriptions, and cisterns that caught the monsoon on a hill with no other water.
              </p>
            </Reveal>
          </div>

          <div className="grid12" style={{ marginTop: 46, alignItems: 'start' }}>
            <Reveal kind="wipe-up" className="c1-5">
              <div className="zoom kanheri__main">
                <Photo
                  slot={photoFor('p-kanheri')}
                  ratio={1.32}
                  sizes="(max-width: 1080px) 92vw, 40vw"
                  credit="corner"
                />
              </div>
            </Reveal>

            <Reveal kind="rise" delay={140} className="c7-12">
              <span className="label">What survives</span>
              <div className="kanheri__timeline" style={{ marginTop: 18 }}>
                {[
                  ['Halls', 'Chaityas cut for assembly and prayer'],
                  ['Cells', 'Viharas where the community lived'],
                  ['Stupas', 'Carved from the rock they stand in'],
                  ['Water', 'Channels and cisterns for the dry months'],
                  ['Writing', 'Inscriptions recording who gave what'],
                ].map(([k, v]) => (
                  <div className="kanheri__step" key={k}>
                    <div className="kanheri__when">{k}</div>
                    <div className="small">{v}</div>
                  </div>
                ))}
              </div>

              <p className="body" style={{ marginTop: 28, maxWidth: '46ch' }}>
                Everything here was made by removal. There are no blocks, no mortar and no foundations — the
                pillars were never carried up the hill, they were left behind when the rock around them was
                taken away.
              </p>

              <div style={{ marginTop: 30, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Button to={`/places/${kanheri.slug}`} variant="ghost">Explore Kanheri</Button>
                <TextLink to="/stories/the-ancient-caves">Read its story</TextLink>
              </div>
            </Reveal>
          </div>

          <div className="grid-3" style={{ marginTop: 44 }}>
            {[SECTION_PHOTO.kanheriA, SECTION_PHOTO.kanheriB, SECTION_PHOTO.kanheriC].map((slot, i) => (
              <Reveal key={slot} kind={i === 1 ? 'wipe-up' : i === 0 ? 'wipe-left' : 'wipe-right'} delay={i * 120}>
                <div className="zoom">
                  <Photo slot={slot} ratio={1.15} sizes="(max-width: 1080px) 46vw, 26vw" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 04 · WILDLIFE — horizontal species rail ════════════════ */}
      <section className="section" id="wildlife">
        <div className="wrap">
          <Reveal>
            <SectionHead index="04" kicker="Biodiversity" title="What you may see" />
            <div className="grid12" style={{ marginTop: 40, alignItems: 'end' }}>
              <h2 className="display c1-6">What you<br />may see</h2>
              <div className="c8-12">
                <p className="lead">
                  You may see. Not you will. Sightings are unpredictable, and that unpredictability is what
                  makes this a forest rather than an exhibit.
                </p>
                <div style={{ marginTop: 22 }}>
                  <Notice quiet icon="info">
                    Habitat information is kept broad, and this guide never publishes locations for wild
                    animals.
                  </Notice>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="wrap">
          <Reveal kind="fade" delay={100}>
            <div className="species-rail" style={{ marginTop: 46 }}>
              {pictured.map((a) => <SpeciesCard key={a.id} animal={a} />)}
            </div>
          </Reveal>
          <TextLink to="/wildlife">All wildlife in the guide</TextLink>
        </div>
      </section>

      {/* ══ 05 · TRAILS — alternating route diagrams ═══════════════ */}
      <section className="section" style={{ background: '#101B15' }} id="trails">
        <div className="wrap">
          <Reveal>
            <SectionHead index="05" kicker="On foot" title="Routes" />
            <div className="grid12" style={{ marginTop: 40, alignItems: 'end' }}>
              <h2 className="display c1-6">Walk through<br />the forest</h2>
              <div className="c8-12">
                <p className="lead">Choose a path and see where it takes you.</p>
                <div style={{ marginTop: 22 }}>
                  <Notice icon="info">
                    These are groupings this guide suggests — not official park routes. Confirm what is open on
                    the day.
                  </Notice>
                </div>
              </div>
            </div>
          </Reveal>

          <div style={{ marginTop: 40 }}>
            {curated.map((t, i) => (
              <TrailBlock key={t.id} trail={t} index={String(i + 1).padStart(2, '0')} flip={i % 2 === 1} />
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <TextLink to="/trails">All trails and routes</TextLink>
          </div>
        </div>
      </section>

      {/* ══ 06 · PLACES — image-led index ══════════════════════════ */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <SectionHead index="06" kicker="Discover" title="Four ways in" />
            <div className="grid12" style={{ marginTop: 40, alignItems: 'end' }}>
              <h2 className="display c1-5">Places<br />in the park</h2>
              <p className="lead c7-12" style={{ maxWidth: '42ch' }}>
                Heritage, water, recreation and scent. Four different parks, depending on which one you came
                for.
              </p>
            </div>
          </Reveal>

          <div className="card-row">
            {featured.map((p, i) => (
              <Reveal key={p.id} kind="rise" delay={i * 90}>
                <PlaceCard place={p} index={String(i + 1).padStart(2, '0')} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 07 · STORIES — magazine grid ═══════════════════════════ */}
      <section className="section" style={{ background: '#101B15' }} id="stories">
        <div className="wrap">
          <Reveal>
            <SectionHead index="07" kicker="Reading" title="Stories of the forest" />
            <div className="grid12" style={{ marginTop: 40, alignItems: 'end' }}>
              <h2 className="display c1-6">Stories of<br />the forest</h2>
              <p className="lead c8-12">
                The park at the length it deserves — heritage, seasons, and the animals that have arranged
                their lives around not being seen.
              </p>
            </div>
          </Reveal>

          <div className="mag" style={{ marginTop: 52 }}>
            <Reveal kind="wipe-up" className="mag__lead">
              <StoryLead story={stories[0]} />
            </Reveal>

            <div className="mag__side">
              {stories.slice(1, 3).map((s, i) => (
                <Reveal key={s.id} kind="slide-left" delay={140 + i * 120}>
                  <StoryItem story={s} ratio={0.68} />
                </Reveal>
              ))}
            </div>

            <div className="mag__wide">
              <div className="mag__pair">
                {stories.slice(3).map((s, i) => (
                  <Reveal key={s.id} kind={i === 0 ? 'wipe-left' : 'wipe-right'} delay={i * 140}>
                    <StoryItem story={s} ratio={0.52} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 08 · PLAN — functional, quiet ══════════════════════════ */}
      <section className="section" id="plan">
        <div className="wrap">
          <Reveal><SectionHead index="08" kicker="Practical" title="Before you go" /></Reveal>

          <div className="grid12" style={{ marginTop: 46, alignItems: 'start' }}>
            <Reveal kind="rise" className="c1-4">
              <h2 className="display">Plan<br />your visit</h2>
              <p className="body" style={{ marginTop: 26, maxWidth: '32ch' }}>
                The park sets its own timings, fees and access. This guide tells you what to think about, and
                sends you to the park for the rest.
              </p>
              <div style={{ marginTop: 30 }}>
                <Button to="/plan">Start planning</Button>
              </div>
              <div className="zoom" style={{ marginTop: 34 }}>
                <Photo slot={SECTION_PHOTO.planVisit} ratio={0.68} sizes="(max-width:1080px) 92vw, 28vw" />
              </div>
            </Reveal>

            <div className="c6-12">
              <div className="grid-2">
                {[
                  {
                    icon: 'calendar' as const, kicker: 'When', title: 'Date & season',
                    items: [
                      'Early morning is quietest, and best for birds.',
                      'The weeks after the monsoon are the park at its greenest.',
                      'Timings are set by the park — check on the day.',
                    ],
                  },
                  {
                    icon: 'star' as const, kicker: 'What', title: 'Activities',
                    items: [
                      'Kanheri Caves, trails, boating, Van Rani, safari.',
                      'Butterfly Garden and the Garden of Fragrance.',
                      'Availability changes. Nothing here is a guarantee.',
                    ],
                  },
                  {
                    icon: 'compass' as const, kicker: 'Getting in', title: 'Access',
                    items: [
                      'Main entrance at Krishnagiri Upvan, Borivali East.',
                      'Bicycle facilities near the entrance.',
                      'Some water-supply areas are restricted.',
                    ],
                  },
                  {
                    icon: 'ticket' as const, kicker: 'Tickets', title: 'Official booking',
                    items: [
                      'Entry and fees are handled by the park.',
                      'This guide is not connected to any booking system.',
                      'Follow official signage at the entrance.',
                    ],
                  },
                ].map((c, i) => (
                  <Reveal key={c.title} kind="rise" delay={i * 80}>
                    <div className="plan-card">
                      <div className="plan-card__icon"><Icon name={c.icon} size={23} /></div>
                      <span className="label">{c.kicker}</span>
                      <h3 className="h3" style={{ marginTop: 8 }}>{c.title}</h3>
                      <ul>{c.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div style={{ marginTop: 26 }}>
                <TextLink to="/safety">Safety in the park</TextLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 09 · JOURNEY — field journal ═══════════════════════════ */}
      <section className="section" style={{ background: '#101B15' }} id="journey">
        <div className="wrap">
          <Reveal><SectionHead index="09" kicker="Yours" title="Field notebook" /></Reveal>

          <div className="journal" style={{ marginTop: 46 }}>
            <Reveal kind="fade" className="journal__plates">
              {memories.slice(0, 5).map((m) => <MemoryPlate key={m.id} memory={m} />)}
            </Reveal>

            <Reveal kind="rise" delay={140} className="journal__side">
              <span className="label">{profile.name} · Field notebook</span>
              <h2 className="display" style={{ marginTop: 14 }}>My forest<br />journey</h2>
              <p className="body" style={{ marginTop: 22 }}>
                Places you have kept, trails you have saved, species you want to read about again — and the
                days you actually went.
              </p>

              {upcoming && (
                <p className="small" style={{ marginTop: 18, color: 'var(--sun)' }}>
                  Next planned visit · {formatDate(upcoming.date)}
                </p>
              )}

              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: 34 }}>
                {[
                  { v: saved.filter((s) => s.kind === 'place').length, l: 'Places explored' },
                  { v: saved.filter((s) => s.kind === 'trail').length, l: 'Trails saved' },
                  { v: saved.filter((s) => s.kind === 'wildlife').length, l: 'Wildlife discovered' },
                  { v: memories.length, l: 'Memories' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="stat__value">{String(s.v).padStart(2, '0')}</div>
                    <div className="stat__label">{s.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 34 }}>
                <TextLink to="/journey">Open my journey</TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ CLOSING ════════════════════════════════════════════════ */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="wrap">
          <Reveal kind="rise">
            <span className="label label--light">Sanjay Gandhi National Park</span>
            <h2 className="display" style={{ marginTop: 22 }}>The forest<br />is waiting.</h2>
            <div style={{ marginTop: 40, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button to="/map" icon="map">Explore the map</Button>
              <Button to="/stories" variant="ghost">Read the stories</Button>
            </div>
            <p className="small muted" style={{ marginTop: 44 }}>
              <Link to="/about" style={{ borderBottom: '1px solid var(--rule)' }}>
                Photography credits &amp; sources
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
