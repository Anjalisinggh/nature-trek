import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { Scene } from '../src/components/art/Scene';
import { MapArt } from '../src/components/map/MapArt';

const out = (name: string, node: any, width: number) => {
  let svg = renderToStaticMarkup(node);
  if (!svg.includes("xmlns")) svg = svg.replace("<svg ", "<svg xmlns=\"http://www.w3.org/2000/svg\" ");
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: width }, background: '#0D1712' });
  writeFileSync(`.preview/${name}.png`, r.render().asPng());
  console.log('wrote', name);
};

out('hero', <Scene variant="hero" seed="sgnp-hero-plate" alt="" scrim="left" />, 1200);
out('kanheri', <Scene variant="kanheri" seed="p-kanheri" alt="" />, 900);
out('lake', <Scene variant="lake" seed="p-tulsi-lake" alt="" />, 700);
out('monsoon', <Scene variant="monsoon" seed="s-monsoon" alt="" />, 700);
out('night', <Scene variant="night" seed="w-leopard" alt="" />, 700);
out('understorey', <Scene variant="understorey" seed="p-butterfly-garden" alt="" />, 700);
out('map', <MapArt />, 1100);
