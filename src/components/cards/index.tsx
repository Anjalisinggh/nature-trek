import { Link } from 'react-router-dom';
import { Photo, NoPhoto, hasPhoto } from '../media/Photo';
import { Icon } from '../ui/Icon';
import { Reveal, useCursorLabel } from '../motion';
import { RouteDiagram } from '../map/RouteDiagram';
import { formatDuration, formatShortDate } from '../../utils';
import { label } from '../../data/repositories';
import { photoFor } from '../../data/photoSlots';
import type { Experience, Memory, Place, Story, Trail, Wildlife } from '../../data/models';

/* ── Cards ─────────────────────────────────────────────────────────────
   Each content type gets its own visual language, so no two sections of
   the site look alike:

     places       image-led card, numbered caption beneath
     wildlife     full-bleed portrait, name over the image, hover reveal
     stories      magazine item, mixed sizes at the call site
     trails       drawn route diagram, no photograph
     experiences  compact index row                                    */

export function PlaceCard({ place, index, ratio = 1.1 }: { place: Place; index?: string; ratio?: number }) {
  const slot = photoFor(place.id);
  const cursor = useCursorLabel('View');
  return (
    <Link to={`/places/${place.slug}`} className="mag-item zoom" {...cursor}>
      <Photo
        slot={slot}
        ratio={ratio}
        sizes="(max-width: 620px) 92vw, (max-width: 1080px) 46vw, 24vw"
        fallback={<NoPhoto note={place.tagline} />}
      />
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 14 }}>
        {index && <span className="index">{index}</span>}
        <span className="label">{label(place.category)}</span>
      </div>
      <h3 className="h3 mag-item__title" style={{ marginTop: 10 }}>{place.name}</h3>
      <p className="small" style={{ marginTop: 10 }}>{place.shortDescription}</p>
    </Link>
  );
}

/** Full-bleed species portrait. Scientific name and habitat line arrive
 *  on hover, so the rail reads as photography first. */
export function SpeciesCard({ animal }: { animal: Wildlife }) {
  const slot = photoFor(animal.id);
  const cursor = useCursorLabel('View');
  return (
    <Link to={`/wildlife/${animal.slug}`} className="species zoom" {...cursor}>
      <Photo
        slot={slot}
        ratio={1.24}
        sizes="(max-width: 620px) 80vw, 300px"
        credit="corner"
        fallback={<NoPhoto label="Not pictured" note={animal.tagline} />}
      />
      <span className="species__veil" />
      <div className="species__body">
        <span className="label">{label(animal.category)}</span>
        <h3 className="h3" style={{ marginTop: 8 }}>{animal.name}</h3>
        {animal.scientificName && <div className="species__sci">{animal.scientificName}</div>}
        <div className="species__meta">{animal.habitat.split('.')[0]}</div>
      </div>
    </Link>
  );
}

export function StoryLead({ story }: { story: Story }) {
  const slot = photoFor(story.id);
  const cursor = useCursorLabel('Read');
  return (
    <Link to={`/stories/${story.slug}`} className="mag-item zoom" {...cursor}>
      <Photo
        slot={slot}
        ratio={0.72}
        sizes="(max-width: 1080px) 92vw, 56vw"
        priority={false}
        fallback={<NoPhoto label="No photograph" note={story.intro} />}
      />
      <div style={{ marginTop: 26, maxWidth: '46ch' }}>
        <span className="label">{story.category} · {story.readMinutes} min read</span>
        <h3 className="display mag-item__title" style={{ marginTop: 14 }}>{story.title}</h3>
        <p className="lead" style={{ marginTop: 16 }}>{story.intro}</p>
        <span className="link" style={{ marginTop: 24, display: 'inline-flex' }}>
          Read the story <Icon name="arrow-right" size={13} />
        </span>
      </div>
    </Link>
  );
}

export function StoryItem({ story, ratio = 0.62 }: { story: Story; ratio?: number }) {
  const slot = photoFor(story.id);
  const cursor = useCursorLabel('Read');
  return (
    <Link to={`/stories/${story.slug}`} className="mag-item zoom" {...cursor}>
      <Photo
        slot={slot}
        ratio={ratio}
        sizes="(max-width: 1080px) 92vw, 30vw"
        fallback={<NoPhoto label="No photograph" note={story.subtitle} />}
      />
      <span className="label" style={{ display: 'block', marginTop: 18 }}>{story.category}</span>
      <h4 className="h3 mag-item__title" style={{ marginTop: 8 }}>{story.title}</h4>
      <p className="small" style={{ marginTop: 8 }}>{story.subtitle}</p>
    </Link>
  );
}

/** Trails carry a drawn route, not a photograph. */
export function TrailBlock({ trail, index, flip }: { trail: Trail; index: string; flip?: boolean }) {
  const duration = formatDuration(trail.durationMinutes);
  const cursor = useCursorLabel('Follow');

  return (
    <article className={`trail-block${flip ? ' trail-block--flip' : ''}`}>
      <Reveal kind={flip ? 'slide-left' : 'slide-right'} className="trail-block__art">
        <RouteDiagram trail={trail} />
      </Reveal>

      <Reveal kind="rise" delay={120} className="trail-block__body">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span className="index">{index}</span>
          <span className="label">{trail.kind === 'curated' ? 'Curated route' : 'Park trail'}</span>
        </div>

        <h3 className="h2" style={{ marginTop: 14 }}>
          <Link to={`/trails/${trail.slug}`} {...cursor}>{trail.name}</Link>
        </h3>
        <p className="body" style={{ marginTop: 14, maxWidth: '46ch' }}>{trail.tagline}</p>

        <div className="trail-facts">
          <div>
            <div className="fact__k">Difficulty</div>
            <div className="fact__v" style={{ textTransform: 'capitalize' }}>{trail.difficulty}</div>
          </div>
          <div>
            <div className="fact__k">Distance</div>
            <div className="fact__v">{trail.distanceKm != null ? `${trail.distanceKm} km` : '—'}</div>
          </div>
          <div>
            <div className="fact__k">Duration</div>
            <div className="fact__v">{duration ?? '—'}</div>
          </div>
          <div>
            <div className="fact__k">Stops</div>
            <div className="fact__v">{String(trail.waypoints.length).padStart(2, '0')}</div>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          <span className="label" style={{ display: 'block', marginBottom: 12 }}>What you may see</span>
          <div className="tags">
            {trail.whatYouMaySee.slice(0, 4).map((w) => <span className="tag" key={w}>{w}</span>)}
          </div>
        </div>

        <Link to={`/trails/${trail.slug}`} className="link" style={{ marginTop: 30 }} {...cursor}>
          Explore trail <Icon name="arrow-right" size={13} />
        </Link>
      </Reveal>
    </article>
  );
}

export function ExperienceCard({ experience, index }: { experience: Experience; index?: string }) {
  const cursor = useCursorLabel('View');
  const slot = photoFor(experience.locationPlaceId ?? '');
  return (
    <Link to={`/experiences/${experience.slug}`} className="mag-item zoom" {...cursor}>
      <Photo
        slot={hasPhoto(slot) ? slot : null}
        ratio={0.86}
        sizes="(max-width: 1080px) 46vw, 24vw"
        fallback={<NoPhoto label={experience.category} note={experience.description} />}
      />
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 14 }}>
        {index && <span className="index">{index}</span>}
        <span className="label">{experience.category}</span>
      </div>
      <h3 className="h3 mag-item__title" style={{ marginTop: 8 }}>{experience.name}</h3>
      <p className="small" style={{ marginTop: 8 }}>{experience.description}</p>
    </Link>
  );
}

export function MemoryPlate({ memory, className = '' }: { memory: Memory; className?: string }) {
  const slot = photoFor(memory.placeId ?? '');
  return (
    <Link to={`/journey/memories/${memory.id}`} className={`journal__plate zoom ${className}`}>
      <span className="journal__stamp">{formatShortDate(memory.date)}</span>
      <Photo
        slot={slot}
        ratio={1}
        sizes="200px"
        credit="none"
        fallback={<NoPhoto label="Field note" note={memory.title} />}
      />
    </Link>
  );
}

/** Compact row for Related, Saved and Search listings. */
export function ResultRow({ href, name, meta, slot }: {
  href: string; name: string; meta: string; slot: string | null;
}) {
  return (
    <Link to={href} className="story-row zoom">
      <div className="story-row__media">
        <Photo slot={slot} ratio={0.82} sizes="140px" credit="none" fallback={<NoPhoto label="" />} />
      </div>
      <div style={{ flex: 1 }}>
        <span className="label">{meta}</span>
        <h4 className="h3 mag-item__title" style={{ marginTop: 8, fontSize: 21 }}>{name}</h4>
      </div>
      <Icon name="arrow-right" size={15} />
    </Link>
  );
}
