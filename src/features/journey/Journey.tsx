import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IndexHead, PageHero } from '../../components/site/PageHero';
import {
  Button, EmptyState, LeafList, Notice, Reveal, SectionHead, TextLink,
} from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { MemoryPlate, ResultRow } from '../../components/cards';
import { useAppState } from '../../app/providers/AppState';
import { formatDate, formatShortDate, todayISO } from '../../utils';
import { resolve, safetyRepo, experiencesRepo, placesRepo, network } from '../../data/repositories';
import { allPhotos } from '../../components/media/Photo';
import { photoFor } from '../../data/photoSlots';
import type { SavedKind } from '../../data/models';

/* ── My forest journey ─────────────────────────────────────────────── */

const KINDS: { id: SavedKind; label: string }[] = [
  { id: 'place', label: 'Places' },
  { id: 'trail', label: 'Trails' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'story', label: 'Stories' },
  { id: 'experience', label: 'Experiences' },
];

export function Journey() {
  const { profile, saved, memories, visits, addMemory } = useAppState();
  const [kind, setKind] = useState<SavedKind | null>(null);

  const items = saved
    .filter((s) => !kind || s.kind === kind)
    .map((s) => ({ key: `${s.kind}-${s.id}`, r: resolve(s.kind, s.id) }))
    .filter((i) => i.r);

  const upcoming = visits.filter((v) => v.status === 'upcoming');
  const past = visits.filter((v) => v.status === 'past');

  const addPlate = () => {
    const places = placesRepo.sync.all();
    const p = places[Math.floor(Math.random() * places.length)];
    addMemory({
      title: p.name.split(' · ')[0],
      placeId: p.id,
      date: todayISO(),
      art: p.heroImage.art,
      note: 'A moment worth keeping.',
      span: 'square',
    });
  };

  return (
    <>
      <IndexHead
        index="06"
        kicker={`${profile.name} · Field notebook`}
        title={<>My forest<br />journey</>}
        lead="Places you have kept, trails you have saved, species you want to read about again — and the days you actually went."
      />

      <section className="section">
        <div className="wrap">
          <div className="notebook" style={{ marginTop: 0 }}>
            <div className="notebook__stats" style={{ marginTop: 0 }}>
              {[
                { v: saved.filter((s) => s.kind === 'place').length, l: 'Places explored' },
                { v: saved.filter((s) => s.kind === 'trail').length, l: 'Trails saved' },
                { v: saved.filter((s) => s.kind === 'wildlife').length, l: 'Wildlife discovered' },
                { v: memories.length, l: 'Memories' },
              ].map((s) => (
                <div className="notebook__stat" key={s.l}>
                  <div className="stat__value">{String(s.v).padStart(2, '0')}</div>
                  <div className="stat__label">{s.l}</div>
                </div>
              ))}
            </div>

            {profile.interests.length > 0 && (
              <div style={{ marginTop: 44 }}>
                <span className="label">What draws you in</span>
                <div className="tags" style={{ marginTop: 14 }}>
                  {profile.interests.map((i) => <span className="tag" key={i}>{i}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Memories */}
      <section className="section--tight section">
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <SectionHead index="01" kicker="Memories" />
            <Button variant="ghost" small icon="plus" onClick={addPlate}>Add a plate</Button>
          </div>

          {memories.length === 0 ? (
            <EmptyState icon="camera" title="No memories yet" body="Notes and pictures from your visits collect here." />
          ) : (
            <div className="plates" style={{ marginTop: 34 }}>
              {memories.map((m) => <Reveal key={m.id}><MemoryPlate memory={m} /></Reveal>)}
            </div>
          )}
        </div>
      </section>

      {/* Saved */}
      <section className="section" style={{ background: '#101B15' }}>
        <div className="wrap">
          <SectionHead index="02" kicker="Saved" />

          <div className="filters" style={{ marginTop: 24 }}>
            <button className="filter" aria-pressed={kind === null} onClick={() => setKind(null)}>All</button>
            {KINDS.map((k) => (
              <button key={k.id} className="filter" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>{k.label}</button>
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon="heart"
              title="Nothing saved yet"
              body="Save any place, trail, species or story and it will collect here."
              action={<Button to="/explore">Start exploring</Button>}
            />
          ) : (
            <div className="grid-2" style={{ marginTop: 40 }}>
              {items.map(({ key, r }) => (
                <ResultRow key={key} href={r!.href} name={r!.name} meta={r!.meta} slot={photoFor(r!.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Visits */}
      <section className="section">
        <div className="wrap">
          <SectionHead index="03" kicker="Visits" />

          {upcoming.length === 0 && past.length === 0 ? (
            <EmptyState icon="calendar" title="No visits yet" body="Plan a day and it will appear here." action={<Button to="/plan">Plan a visit</Button>} />
          ) : (
            <div className="grid-2" style={{ marginTop: 34 }}>
              {[...upcoming, ...past].map((v) => (
                <div key={v.id} className="plan-card">
                  <span className="label">{v.status === 'upcoming' ? 'Upcoming' : 'Past visit'} · {v.reference}</span>
                  <h3 className="h2" style={{ marginTop: 12 }}>{formatDate(v.date)}</h3>
                  <p className="small" style={{ marginTop: 12 }}>
                    {v.visitors} {v.visitors === 1 ? 'visitor' : 'visitors'} · {v.experienceIds.length} activities noted
                  </p>
                  <div style={{ marginTop: 20 }}>
                    <Notice quiet>A plan you made here — not an official booking.</Notice>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 44, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            <Button to="/plan" variant="ghost">Plan another visit</Button>
            <TextLink to="/safety">Safety in the park</TextLink>
          </div>
        </div>
      </section>
    </>
  );
}

export function MemoryDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { memories, removeMemory } = useAppState();
  const memory = memories.find((m) => m.id === id);

  if (!memory) {
    return (
      <div className="wrap section">
        <EmptyState icon="camera" title="Not found" body="That memory is no longer saved." action={<Button to="/journey">My journey</Button>} />
      </div>
    );
  }

  const place = memory.placeId ? placesRepo.sync.byId(memory.placeId) : null;

  return (
    <>
      <PageHero
        slot={photoFor(memory.placeId ?? "")}
        alt={`${memory.title}. ${memory.note}`}
        noPhotoNote={memory.note}
        kicker={`Field note · ${formatShortDate(memory.date)}`}
        title={memory.title}
        tagline={memory.note}
        breadcrumb={{ to: '/journey', label: 'My journey' }}
      />
      <section className="section">
        <div className="wrap" style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {place && <Button to={`/places/${place.slug}`} variant="ghost">Open {place.name.split(' · ')[0]}</Button>}
          <Button
            variant="ghost"
            icon={null}
            onClick={() => { removeMemory(memory.id); navigate('/journey'); }}
          >
            Remove this plate
          </Button>
        </div>
      </section>
    </>
  );
}

/* ── Plan your visit ───────────────────────────────────────────────────
   Produces a personal plan. There is no booking integration, so nothing
   here simulates a payment, a reservation or a ticket.                */

export function Plan() {
  const navigate = useNavigate();
  const { addVisit } = useAppState();
  const experiences = experiencesRepo.sync.all();

  const [date, setDate] = useState(todayISO());
  const [visitors, setVisitors] = useState(2);
  const [chosen, setChosen] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = () => {
    setSaving(true);
    setTimeout(() => {
      addVisit({ date, visitors, experienceIds: chosen });
      navigate('/journey');
    }, 650);
  };

  const day = [
    ['09:00', 'Enter the park'],
    ['10:00', 'Forest trail'],
    ['12:00', 'Rest'],
    ['14:00', 'Kanheri'],
    ['17:00', 'Head out before dusk'],
  ];

  return (
    <>
      <IndexHead
        index="07"
        kicker="Practical"
        title={<>Plan<br />your visit</>}
        lead="Note a date, who is coming and what you hope to do. The park decides the rest — timings, fees and what is running are set by SGNP, not by this guide."
      >
        <div style={{ marginTop: 24 }}>
          <Notice icon="alert">
            This guide is not connected to an official booking system. Nothing here is a ticket, a reservation
            or proof of entry.
          </Notice>
        </div>
      </IndexHead>

      <section className="section">
        <div className="wrap">
          <div className="article">
            <div>
              <SectionHead index="01" kicker="When and who" />
              <div className="grid-2" style={{ marginTop: 28 }}>
                <label>
                  <span className="label">Date</span>
                  <input
                    type="date"
                    value={date}
                    min={todayISO()}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      marginTop: 12, width: '100%', minHeight: 54, padding: '0 16px',
                      background: 'var(--surface)', border: '1px solid var(--hair)',
                      borderRadius: 'var(--r-sm)', color: 'var(--ivory)', fontFamily: 'var(--sans)', fontSize: 16,
                    }}
                  />
                </label>

                <div>
                  <span className="label">Visitors</span>
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                    <button className="nav__icon" style={{ border: '1px solid var(--hair)' }} aria-label="Fewer visitors" onClick={() => setVisitors((v) => Math.max(1, v - 1))}>
                      <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
                    </button>
                    <span className="h2" aria-live="polite" style={{ minWidth: 48, textAlign: 'center' }}>{visitors}</span>
                    <button className="nav__icon" style={{ border: '1px solid var(--hair)' }} aria-label="More visitors" onClick={() => setVisitors((v) => Math.min(20, v + 1))}>
                      <Icon name="plus" size={17} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 60 }}>
                <SectionHead index="02" kicker="What interests you" />
                <p className="small muted" style={{ marginTop: 4, marginBottom: 22 }}>
                  Availability is decided by the park on the day.
                </p>
                <div className="filters">
                  {experiences.map((e) => (
                    <button
                      key={e.id}
                      className="filter"
                      aria-pressed={chosen.includes(e.id)}
                      onClick={() => setChosen((c) => (c.includes(e.id) ? c.filter((x) => x !== e.id) : [...c, e.id]))}
                    >
                      <span className="filter__tick"><Icon name="check" size={11} /></span>
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 60 }}>
                <SectionHead index="03" kicker="A rough shape for the day" />
                <ol className="timeline" style={{ marginTop: 30 }}>
                  {day.map(([time, what]) => (
                    <li key={time}>
                      <span className="label">{time}</span>
                      <h3 className="h3" style={{ marginTop: 6 }}>{what}</h3>
                    </li>
                  ))}
                </ol>
                <Notice quiet>A suggested rhythm, not a schedule. Actual operating times come from the park.</Notice>
              </div>
            </div>

            <aside className="aside">
              <div className="aside__block">
                <span className="label">Your plan</span>
                <dl style={{ marginTop: 16 }}>
                  <div className="info-row"><dt>Date</dt><dd>{formatDate(date)}</dd></div>
                  <div className="info-row"><dt>Visitors</dt><dd>{visitors}</dd></div>
                  <div className="info-row">
                    <dt>Activities</dt>
                    <dd>
                      {chosen.length === 0
                        ? 'None noted'
                        : chosen.map((id) => experiences.find((e) => e.id === id)?.name).filter(Boolean).join(', ')}
                    </dd>
                  </div>
                </dl>
                <div style={{ marginTop: 24 }}>
                  <Button onClick={submit} disabled={saving} icon={null}>
                    {saving ? 'Saving…' : 'Save this plan'}
                  </Button>
                </div>
              </div>

              <div className="aside__block">
                <span className="label">Official instructions</span>
                <p className="small" style={{ marginTop: 12 }}>
                  Entry, tickets and fees are handled by the park. Follow official signage and staff
                  instructions at the entrance.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Safety ────────────────────────────────────────────────────────── */

export function Safety() {
  return (
    <>
      <IndexHead
        index="—"
        kicker="Before you walk"
        title={<>Safety<br />in the park</>}
        lead="Small, boring things, done consistently. Almost all of them protect the forest as much as they protect you."
      />

      <section className="section">
        <div className="wrap">
          <div className="grid-3">
            <div>
              <SectionHead index="01" kicker="Always" />
              <div style={{ marginTop: 22 }}><LeafList items={safetyRepo.sync.all()} /></div>
            </div>
            <div>
              <SectionHead index="02" kicker="Around wildlife" />
              <div style={{ marginTop: 22 }}>
                <LeafList items={[
                  'Never approach, follow or try to attract any animal.',
                  'Do not feed anything, including monkeys near visitor areas.',
                  'Keep food and packaging out of sight; take all waste with you.',
                  'Do not walk in the forest after dark.',
                  'If you see a leopard: stay still, stay quiet, keep your distance, tell park staff.',
                ]} />
              </div>
            </div>
            <div>
              <SectionHead index="03" kicker="Emergency and help" />
              <div style={{ marginTop: 22 }}>
                <Notice icon="alert">
                  This guide does not publish emergency contact numbers, because publishing an unverified one
                  is worse than publishing none. Use the details on official park signage, and speak to park
                  staff at the entrance or information point.
                </Notice>
              </div>
              <p className="small" style={{ marginTop: 24 }}>
                Some parts of the landscape — including the water-supply areas around the lakes — are not open
                to visitors. This guide marks them, and never routes you into them.
              </p>
              <div style={{ marginTop: 24 }}>
                <TextLink to="/map">Open the map</TextLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── About & sources ───────────────────────────────────────────────── */

export function About() {
  const { offline, setOffline, reducedMotion, setReducedMotion, profile, setProfile } = useAppState();

  return (
    <>
      <IndexHead
        index="—"
        kicker="Colophon"
        title={<>About<br />this guide</>}
        lead="A design prototype for a digital field guide to Sanjay Gandhi National Park. Not an official SGNP website."
      />

      <section className="section">
        <div className="wrap">
          <div className="article">
            <div className="prose">
              <h3>What this is</h3>
              <p>
                An editorial website about the forest inside Mumbai: its places, its trails, its wildlife and
                its heritage. It is built as a design prototype, and it is careful about the difference between
                what it can tell you and what only the park can.
              </p>

              <h3>What it will not do</h3>
              <p>
                It does not invent operational information. No timings, fees, phone numbers or schedules appear
                anywhere in this guide — where a value would be needed, it says so and sends you to the park.
                Everything operational carries a freshness note describing whether it has been verified.
              </p>
              <p>
                It does not simulate a booking. Planning a visit here produces a personal plan and nothing more.
                There is no ticket, no code and no reservation.
              </p>
              <p>
                It does not publish locations for wild animals, and never suggests a sighting is guaranteed.
                Restricted areas — including water-supply land around Tulsi and Vihar — are marked as
                restricted and never routed into.
              </p>

              <h3>Sources</h3>
              <p>
                Descriptions of places, heritage and biodiversity draw on publicly available Sanjay Gandhi
                National Park and Maharashtra tourism material, including the description of Kanheri as an
                ancient Buddhist rock-cut complex of 109 caves, and the park&rsquo;s cited counts of plant, bird,
                mammal and butterfly species.
              </p>

              <h3>Photography</h3>
              <p>
                Every photograph here comes from Wikimedia Commons and is used under the licence shown beside
                it. Images taken inside Sanjay Gandhi National Park are captioned as such; images that merely
                show a species or subject carry a <strong style={{ color: 'var(--ivory)', fontWeight: 500 }}>Representative</strong> badge,
                because captioning them as SGNP would be a fabrication. The full list is below.
              </p>

              <h3>Artwork</h3>
              <p>
                The park map is drawn in code — an illustrated plate of land, water, basalt and paths, laid out
                in the same coordinate space the place records use. Trails carry drawn route diagrams rather
                than photographs, because a route explains a trail better than a picture of trees does. No
                Studio Ghibli branding, characters or assets appear anywhere.
              </p>

              <h3>Credits</h3>
              <PhotoCredits />
            </div>

            <aside className="aside">
              <div className="aside__block">
                <span className="label">Your name</span>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ name: e.target.value })}
                  aria-label="Your name"
                  style={{
                    marginTop: 12, width: '100%', minHeight: 50, padding: '0 14px',
                    background: 'var(--surface-2)', border: '1px solid var(--hair)',
                    borderRadius: 'var(--r-sm)', color: 'var(--ivory)', fontFamily: 'var(--sans)', fontSize: 15,
                  }}
                />
              </div>

              <div className="aside__block">
                <span className="label">Accessibility</span>
                <div className="filters" style={{ marginTop: 14 }}>
                  <button className="filter" aria-pressed={reducedMotion} onClick={() => setReducedMotion(!reducedMotion)}>
                    Reduce motion
                  </button>
                </div>
                <p className="small muted" style={{ marginTop: 14 }}>
                  The site also respects your system reduced-motion setting, and type scales with your browser
                  font size.
                </p>
              </div>

              <div className="aside__block">
                <span className="label">Connection</span>
                <div className="filters" style={{ marginTop: 14 }}>
                  <button
                    className="filter"
                    aria-pressed={offline}
                    onClick={() => { setOffline(!offline); network.setOffline(!offline); }}
                  >
                    Simulate offline
                  </button>
                </div>
                <p className="small muted" style={{ marginTop: 14 }}>
                  Shows how the guide behaves where the signal drops inside the park.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}


/** The licence list. Required by CC, and worth reading anyway. */
function PhotoCredits() {
  const rows = allPhotos();
  return (
    <div style={{ marginTop: 20 }}>
      <p className="small muted" style={{ marginBottom: 18 }}>
        {rows.length} photographs · {rows.filter((r) => r.place === 'sgnp').length} taken in the park
      </p>
      <dl style={{ margin: 0 }}>
        {rows.map((r) => (
          <div className="info-row" key={r.slot}>
            <dt>{r.place === 'sgnp' ? 'In the park' : 'Representative'}</dt>
            <dd>
              {r.credit.artist} · {r.credit.license}{' '}
              <a href={r.credit.source} target="_blank" rel="noreferrer noopener" style={{ borderBottom: '1px solid var(--rule)' }}>
                {r.credit.title}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
