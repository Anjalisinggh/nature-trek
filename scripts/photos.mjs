/* ── Photo pipeline ────────────────────────────────────────────────────
   Resolves a curated set of Wikimedia Commons photographs, downloads a
   web-sized copy of each into public/photos/, and writes an attribution
   manifest. Run with: npm run photos

   Every slot is a DIFFERENT photograph of a DIFFERENT subject. Nothing
   is reused across the site.

   `place: 'sgnp'`  the photograph was taken in the park itself
   `place: 'repr'`  a representative image of the species or subject,
                    taken elsewhere — labelled as such in the UI, because
                    captioning it as SGNP would be a fabrication.        */

import { writeFile, mkdir, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'SGNP-Into-The-Forest/1.0 (design prototype; contact: local)';
const WIDTHS = { full: 1500, card: 760 };

/** slot → { title (preferred exact file), query (fallback search), … } */
const SLOTS = {
  // ── The park itself ───────────────────────────────────────────────
  'hero': {
    title: 'Mumbai 03-2016 89 scene in Sanjay Gandhi National Park.jpg',
    query: 'scene in Sanjay Gandhi National Park',
    place: 'sgnp',
    alt: 'A wide view inside Sanjay Gandhi National Park: forested slopes under open sky.',
  },
  'forest-trees': {
    title: 'Trees, Sanjay Gandhi National Park.jpg',
    query: 'Trees Sanjay Gandhi National Park',
    place: 'sgnp',
    alt: 'Tall trees standing in dense forest inside Sanjay Gandhi National Park.',
  },
  'park-road': {
    title: 'Trees and road, Sanjay Gandhi National Park.jpg',
    query: 'Trees and road Sanjay Gandhi National Park',
    place: 'sgnp',
    alt: 'A quiet road running between trees inside Sanjay Gandhi National Park.',
  },
  'entrance': {
    title: 'Entrance gate of Sanjay Gandhi National Park, Mumbai.jpg',
    query: 'Entrance gate Sanjay Gandhi National Park Mumbai',
    place: 'sgnp',
    alt: 'The main entrance gate of Sanjay Gandhi National Park in Borivali, Mumbai.',
  },
  'stream': {
    title: 'Shilonda stream in Sanjay Gandhi National Park, Mumbai- NinadVBhosale.jpg',
    query: 'Shilonda stream Sanjay Gandhi National Park',
    place: 'sgnp',
    alt: 'The Shilonda stream running through forest in Sanjay Gandhi National Park.',
  },
  'boating-lake': {
    title: 'Sanjay Gandhi National Park (Lake).jpeg',
    query: 'Sanjay Gandhi National Park Lake',
    place: 'sgnp',
    alt: 'A lake inside Sanjay Gandhi National Park, surrounded by forest.',
  },
  'tulsi-lake': {
    title: 'Tulsi Lake, SGNP.jpg',
    query: 'Tulsi Lake SGNP',
    place: 'sgnp',
    alt: 'Tulsi Lake, a forested water body within the Sanjay Gandhi National Park landscape.',
  },
  'vihar-lake': {
    title: 'Vihar Lake.jpg',
    query: 'Vihar Lake Mumbai',
    place: 'sgnp',
    alt: 'Vihar Lake, one of the water bodies associated with the park landscape.',
  },
  'railtrack': {
    title: 'Sanjay gandhi national part railtrack.jpg',
    query: 'Sanjay Gandhi national park railtrack',
    place: 'sgnp',
    alt: 'The narrow-gauge track of the Van Rani mini train inside the park.',
  },
  'forest-path': {
    title: 'Sanjay Gandhi National Park Road.jpg',
    query: 'Sanjay Gandhi National Park Road',
    place: 'sgnp',
    alt: 'A road curving away through the forest inside Sanjay Gandhi National Park.',
  },
  'canopy': {
    title: 'Sanjay Gandhi National Park.JPG',
    query: 'Sanjay Gandhi National Park forest canopy',
    place: 'sgnp',
    alt: 'Forest canopy inside Sanjay Gandhi National Park.',
  },
  'undergrowth': {
    title: 'At Sanjay Gandhi National Park (312703427).jpg',
    query: 'At Sanjay Gandhi National Park Dinesh Valke',
    place: 'sgnp',
    alt: 'Vegetation and undergrowth inside Sanjay Gandhi National Park.',
  },
  'orchid': {
    title: 'Orchids, Sanjay Gandhi National Park.jpg',
    query: 'Orchids Sanjay Gandhi National Park',
    place: 'sgnp',
    alt: 'Orchids growing in Sanjay Gandhi National Park.',
  },
  'green-detail': {
    title: 'Sanjay Gandhi National Park (3362445150).jpg',
    query: 'Sanjay Gandhi National Park Dinesh Valke plant',
    place: 'sgnp',
    alt: 'A close view of vegetation in Sanjay Gandhi National Park.',
  },
  'park-map-board': {
    title: 'Tourist map displayed in Sanjay Gandhi National Park, Mumbai.jpg',
    query: 'Tourist map Sanjay Gandhi National Park',
    place: 'sgnp',
    alt: 'The park’s own tourist map board, displayed inside Sanjay Gandhi National Park.',
  },
  'info-board': {
    title: 'Information board at the entrance of Sanjay Gandhi National Park, Mumbai.jpg',
    query: 'Information board entrance Sanjay Gandhi National Park',
    place: 'sgnp',
    alt: 'A visitor information board at the park entrance.',
  },

  // ── Kanheri ───────────────────────────────────────────────────────
  'kanheri-facade': {
    title: 'Kanheri Caves - Borivili, Mumbai.JPG',
    query: 'Kanheri-Caves-Mumbai',
    place: 'sgnp',
    alt: 'The rock-cut facade of the Kanheri cave complex, carved into the hillside.',
  },
  'kanheri-hall': {
    title: 'Kanheri Caves Interiors 02.jpg',
    query: 'Kanheri Caves Interiors pillared hall',
    place: 'sgnp',
    alt: 'The interior of a rock-cut hall at Kanheri, with carved pillars.',
  },
  'kanheri-interior': {
    title: 'Kanheri Caves Interiors 08.jpg',
    query: 'Kanheri Caves Interiors',
    place: 'sgnp',
    alt: 'A rock-cut chamber inside the Kanheri caves.',
  },
  'kanheri-buddha': {
    title: 'Buddha at Kanheri 01.jpg',
    query: 'Buddha at Kanheri',
    place: 'sgnp',
    alt: 'A carved standing Buddha figure at Kanheri.',
  },
  'kanheri-carving': {
    title: 'Kanheri donor couple.jpg',
    query: 'Kanheri donor couple relief',
    place: 'sgnp',
    alt: 'A relief carving of a donor couple in the rock at Kanheri.',
  },
  'kanheri-entrance': {
    title: 'Kanheri Caves - main cave entrance.jpg',
    query: 'Kanheri Caves main cave entrance',
    place: 'sgnp',
    alt: 'The entrance to the main prayer hall at Kanheri.',
  },
  'kanheri-steps': {
    title: 'Kanheri Caves - secondary caves.JPG',
    query: 'Kanheri Caves secondary caves',
    place: 'sgnp',
    alt: 'Smaller rock-cut cells and steps across the Kanheri hillside.',
  },
  'kanheri-in-park': {
    title: 'Kanheri caves sanjay gandhi national park.jpg',
    query: 'Kanheri caves sanjay gandhi national park',
    place: 'sgnp',
    alt: 'The Kanheri caves seen within the forest of Sanjay Gandhi National Park.',
  },

  // ── Wildlife — representative images, taken elsewhere ─────────────
  'leopard': {
    title: 'Indian leopard in Jawai Bandh April 2025 by Tisha Mukherjee 02.jpg',
    query: 'Indian leopard Panthera pardus fusca',
    place: 'repr',
    alt: 'An Indian leopard, the species that lives in the park’s forest.',
  },
  'chital': {
    title: 'Chital Axis Deer stag (12340301065).jpg',
    query: 'Chital Axis axis stag',
    place: 'repr',
    alt: 'A chital, or spotted deer, standing in open forest.',
  },
  'langur': {
    title: 'Northern plains gray langur in Chilkigarh March 2021 by Tisha Mukherjee 01.jpg',
    query: 'Hanuman langur Semnopithecus',
    place: 'repr',
    alt: 'A grey langur resting in a tree.',
  },
  'butterfly-blue-tiger': {
    title: 'Blue tiger (Tirumala limniace exoticus).jpg',
    query: 'Blue tiger Tirumala limniace butterfly',
    place: 'repr',
    alt: 'A blue tiger butterfly, pale blue streaks on dark brown wings.',
  },
  'butterfly-crimson-rose': {
    title: 'Crimson Rose (Pachliopta hector) underside.jpg',
    query: 'Crimson Rose Pachliopta hector butterfly',
    place: 'repr',
    alt: 'A crimson rose butterfly, black wings with white bands and a red body.',
  },
  'drongo': {
    title: 'Greater Racket-tailed-Drongo cropped.jpg',
    query: 'Greater Racket-tailed Drongo Dicrurus paradiseus',
    place: 'repr',
    alt: 'A greater racket-tailed drongo perched, its long tail streamers visible.',
  },
  'flycatcher': {
    title: 'Indian Paradise-Flycatcher in Rabindra Sarobar October 2025 by Tisha Mukherjee 01.jpg',
    query: 'Indian Paradise Flycatcher Terpsiphone paradisi',
    place: 'repr',
    alt: 'An Indian paradise flycatcher with long white tail streamers.',
  },
  'python': {
    title: 'Indian Rock Python (Python molurus) at Sanjay Gandhi National Park, Mumbai, Maharashtra.jpg',
    query: 'Indian Rock Python Sanjay Gandhi National Park',
    place: 'sgnp',
    alt: 'An Indian rock python photographed in Sanjay Gandhi National Park.',
  },
};

const qs = (o) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Commons rate-limits anonymous clients hard, so back off and retry. */
async function api(params, attempt = 0) {
  const res = await fetch(`${API}?${qs({ format: 'json', origin: '*', ...params })}`, {
    headers: { 'User-Agent': UA },
  });
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 5) throw new Error(`Commons API ${res.status} after retries`);
    await sleep(2000 * (attempt + 1));
    return api(params, attempt + 1);
  }
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

const strip = (html) => (html ?? '')
  .replace(/<[^>]*>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

async function infoForMany(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 25) {
    const batch = titles.slice(i, i + 25);
    const data = await api({
      action: 'query',
      titles: batch.map((t) => `File:${t}`).join('|'),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|size',
      iiurlwidth: String(WIDTHS.full),
    });
    const norm = new Map((data?.query?.normalized ?? []).map((n) => [n.to, n.from]));
    for (const page of Object.values(data?.query?.pages ?? {})) {
      if (page.missing !== undefined || !page.imageinfo) continue;
      const key = (norm.get(page.title) ?? page.title).replace(/^File:/, '');
      out.set(key, page.imageinfo[0]);
    }
    await sleep(700);
  }
  return out;
}

async function searchOne(query) {
  const data = await api({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '1',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: String(WIDTHS.full),
  });
  const pages = Object.values(data?.query?.pages ?? {});
  const page = pages[0];
  if (!page?.imageinfo) return null;
  return { info: page.imageinfo[0], title: page.title.replace(/^File:/, '') };
}

async function download(url, dest, attempt = 0) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    await sleep(2500 * (attempt + 1));
    return download(url, dest, attempt + 1);
  }
  if (!res.ok) throw new Error(`download ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  await sleep(350);
}

const run = async () => {
  await mkdir('public/photos', { recursive: true });
  const manifest = {};
  const report = [];

  const exact = await infoForMany(Object.values(SLOTS).map((c) => c.title));
  const used = new Set();

  for (const [slot, cfg] of Object.entries(SLOTS)) {
    let info = exact.get(cfg.title);
    let title = cfg.title;
    let how = 'exact';

    if (!info) {
      await sleep(900);
      const found = await searchOne(cfg.query);
      if (!found) { report.push(`✗ ${slot} — not found`); continue; }
      info = found.info;
      title = found.title;
      how = 'search';
    }

    // The no-repetition rule is enforced here, not left to review.
    if (used.has(title)) { report.push(`✗ ${slot} — duplicate of an earlier slot`); continue; }
    used.add(title);

    const meta = info.extmetadata ?? {};
    // Extension comes from the Commons filename — thumbnail URLs carry
    // query strings that make naive extension-splitting produce junk.
    const raw = (title.split('.').pop() ?? 'jpg').toLowerCase();
    const ext = raw === 'jpeg' ? 'jpg' : raw;
    const file = `${slot}.${ext}`;
    const cardFile = `${slot}@760.${ext}`;

    // Two widths, so cards never pull a 1500px file.
    const thumbBase = (info.thumburl || info.url).split('?')[0];
    const cardUrl = thumbBase.replace(/\/\d+px-/, `/${WIDTHS.card}px-`);

    const exists = async (p) => stat(p).then((s) => s.size > 1024).catch(() => false);

    if (!(await exists(`public/photos/${file}`))) {
      try {
        await download(thumbBase, `public/photos/${file}`);
      } catch (e) {
        report.push(`✗ ${slot} — download failed: ${e.message}`);
        continue;
      }
    }

    // A card-sized variant is an optimisation, not a requirement: if the
    // source has no such rendition, the full file is used instead.
    let hasCard = await exists(`public/photos/${cardFile}`);
    if (!hasCard && cardUrl !== thumbBase) {
      try {
        await download(cardUrl, `public/photos/${cardFile}`);
        hasCard = true;
      } catch { hasCard = false; }
    }

    manifest[slot] = {
      file: `/photos/${file}`,
      card: hasCard ? `/photos/${cardFile}` : `/photos/${file}`,
      width: info.thumbwidth ?? info.width,
      height: info.thumbheight ?? info.height,
      alt: cfg.alt,
      place: cfg.place,
      credit: {
        title,
        artist: strip(meta.Artist?.value) || 'Unknown',
        license: strip(meta.LicenseShortName?.value) || 'See source',
        licenseUrl: meta.LicenseUrl?.value ?? null,
        source: info.descriptionurl,
      },
    };
    report.push(`✓ ${slot.padEnd(22)} ${how.padEnd(6)} ${title}`);
  }

  await writeFile('src/data/photos.json', `${JSON.stringify(manifest, null, 2)}\n`);

  const credits = [
    '# Photography credits',
    '',
    'Every photograph on this site comes from Wikimedia Commons and is used under the',
    'licence shown. Images marked **representative** were not taken in Sanjay Gandhi',
    'National Park; they show the species or subject and are labelled as such in the UI.',
    '',
    '| Slot | File | Photographer | Licence | Taken in SGNP | Source |',
    '| --- | --- | --- | --- | --- | --- |',
    ...Object.entries(manifest).map(([slot, m]) =>
      `| \`${slot}\` | ${m.credit.title} | ${m.credit.artist} | ${m.credit.license} | ${m.place === 'sgnp' ? 'Yes' : 'Representative'} | ${m.credit.source} |`),
    '',
  ].join('\n');
  await writeFile('public/photos/CREDITS.md', credits);

  console.log(report.join('\n'));
  console.log(`\n${Object.keys(manifest).length}/${Object.keys(SLOTS).length} slots resolved`);
};

run().catch((e) => { console.error(e); process.exit(1); });
