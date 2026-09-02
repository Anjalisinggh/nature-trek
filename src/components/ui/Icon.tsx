import type { ReactElement } from 'react';

/* ── Iconography ───────────────────────────────────────────────────────
   1.5px stroke, rounded terminals, organic where it can be. Drawn by
   hand rather than pulled from a set so the map markers and the UI
   share one line quality. Never emoji.                               */

export type IconName =
  | 'home' | 'map' | 'compass' | 'ticket' | 'user'
  | 'footsteps' | 'paw' | 'butterfly' | 'bird' | 'leaf'
  | 'cave' | 'boat' | 'train' | 'hill' | 'star'
  | 'calendar' | 'heart' | 'camera' | 'search' | 'arrow-left'
  | 'arrow-right' | 'close' | 'bicycle' | 'gate' | 'flower'
  | 'ripple' | 'river' | 'info' | 'layers' | 'locate'
  | 'play' | 'pause' | 'chevron' | 'alert' | 'check'
  | 'settings' | 'bell' | 'list' | 'plus' | 'clock' | 'route';

interface Props {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const paths: Record<IconName, ReactElement> = {
  home: <><path d="M3 10.2 12 3.5l9 6.7" /><path d="M5.5 9v10.5h13V9" /><path d="M10 19.5v-5.2h4v5.2" /></>,
  map: <><path d="M3 6.6 9 4l6 2.6L21 4v13.4L15 20l-6-2.6L3 20z" /><path d="M9 4v13.4M15 6.6V20" /></>,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="m14.8 9.2-1.6 4.2-4.2 1.6 1.6-4.2z" /></>,
  ticket: <><path d="M3 8.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.2a2.3 2.3 0 0 0 0 4.6v1.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.2a2.3 2.3 0 0 0 0-4.6z" /><path d="M14 7.5v9" strokeDasharray="1.6 2.2" /></>,
  user: <><circle cx="12" cy="8.6" r="3.6" /><path d="M4.8 20c.6-3.7 3.6-5.8 7.2-5.8s6.6 2.1 7.2 5.8" /></>,
  footsteps: <><path d="M8.4 5.2c1.3 0 2.1 1.2 1.9 3-.2 1.7-.9 2.9-2.2 2.9s-2-1.3-1.8-3c.2-1.7.8-2.9 2.1-2.9Z" /><path d="M6.4 13.2c1.5 0 2.3.8 2.2 2s-.9 1.8-2.2 1.8-2.1-.7-2-1.9c.1-1.2.8-1.9 2-1.9Z" /><path d="M16 9.4c1.3 0 2.1 1.2 1.9 3-.2 1.7-.9 2.9-2.2 2.9s-2-1.2-1.8-3c.2-1.7.8-2.9 2.1-2.9Z" /><path d="M14 17.4c1.5 0 2.3.8 2.2 2s-.9 1.8-2.2 1.8-2.1-.7-2-1.9c.1-1.2.8-1.9 2-1.9Z" /></>,
  paw: <><ellipse cx="12" cy="15.3" rx="4" ry="3.4" /><ellipse cx="6.9" cy="11.6" rx="1.7" ry="2.1" /><ellipse cx="17.1" cy="11.6" rx="1.7" ry="2.1" /><ellipse cx="9.6" cy="7.3" rx="1.6" ry="2.1" /><ellipse cx="14.4" cy="7.3" rx="1.6" ry="2.1" /></>,
  butterfly: <><path d="M12 6.4v11.4" /><path d="M12 8c-1.4-2.6-4-3.9-5.9-3-1.9 1-2 4 .1 5.8-2 .9-2.6 3.4-1.2 4.9 1.5 1.6 4.6 1 7-2.4" /><path d="M12 8c1.4-2.6 4-3.9 5.9-3 1.9 1 2 4-.1 5.8 2 .9 2.6 3.4 1.2 4.9-1.5 1.6-4.6 1-7-2.4" /><path d="M12 6.4 10.6 4M12 6.4 13.4 4" /></>,
  bird: <><path d="M4 13.5c3.6.6 6.3-.9 8.1-4.4" /><path d="M12.1 9.1c1-2.2 2.8-3.4 5-3.4l1.6 2.2 2.3.6-1.8 1.6c0 4.6-3.2 8.4-8 8.4-3.1 0-5.5-1.2-7.2-3.5" /><circle cx="16.6" cy="7.9" r=".7" fill="currentColor" stroke="none" /></>,
  leaf: <><path d="M20 4.5C11 4.5 5 8.4 5 14.4c0 2 .7 3.6 1.9 4.7C10.4 15.6 14 12.6 19 10.6" /><path d="M6.9 19.1C4.4 20 3.6 20.6 3.6 20.6" /></>,
  cave: <><path d="M3 20V13c0-4.9 4-8.9 9-8.9s9 4 9 8.9v7" /><path d="M9 20v-4.6a3 3 0 0 1 6 0V20" /><path d="M3 20h18" /></>,
  boat: <><path d="M3.5 15.6h17l-2.3 4.2a1.6 1.6 0 0 1-1.4.8H7.2a1.6 1.6 0 0 1-1.4-.8z" /><path d="M12 15.6V4.2l6.4 6.6-6.4 1.4" /><path d="M5.2 12.7 12 15.6" /></>,
  train: <><rect x="5" y="4.6" width="14" height="11" rx="3" /><path d="M5 10h14" /><circle cx="8.6" cy="12.9" r="1" /><circle cx="15.4" cy="12.9" r="1" /><path d="m7.4 15.6-2 3.8M16.6 15.6l2 3.8" /></>,
  hill: <><path d="M2 18.6 8.6 9l4 5.6L16.4 10 22 18.6z" /><path d="M12 4.6v2.8" /><path d="M10.7 5.8h2.6" /></>,
  star: <><path d="m12 3.6 2.4 5.6 6.1.5-4.6 4 1.4 6-5.3-3.2-5.3 3.2 1.4-6-4.6-4 6.1-.5z" /></>,
  calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="2.6" /><path d="M3.5 10h17M8.4 3.4v4M15.6 3.4v4" /></>,
  heart: <><path d="M12 20.3s-7.8-4.5-7.8-9.6a4.3 4.3 0 0 1 7.8-2.5 4.3 4.3 0 0 1 7.8 2.5c0 5.1-7.8 9.6-7.8 9.6Z" /></>,
  camera: <><path d="M3.5 8.8A2 2 0 0 1 5.5 7h1.9l1.3-2.2h6.6L16.6 7h1.9a2 2 0 0 1 2 1.8v9.4a2 2 0 0 1-2 1.8h-13a2 2 0 0 1-2-1.8z" /><circle cx="12" cy="13.4" r="3.6" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.6" /><path d="m15.6 15.6 4.6 4.6" /></>,
  'arrow-left': <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
  'arrow-right': <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  bicycle: <><circle cx="6" cy="16.4" r="3.6" /><circle cx="18" cy="16.4" r="3.6" /><path d="m6 16.4 4.2-7.2h5L18 16.4" /><path d="M10.2 9.2h5.4M14.4 9.2 12.6 5.6h-2" /></>,
  gate: <><path d="M4 20V8.6c0-2 1.6-3.6 3.6-3.6h8.8c2 0 3.6 1.6 3.6 3.6V20" /><path d="M12 5v15M4 20h16M7.6 9.6v6.8M16.4 9.6v6.8" /></>,
  flower: <><circle cx="12" cy="10" r="2" /><path d="M12 8c0-2.2.9-3.6 2.4-3.6S16.8 6 15.6 7.8" /><path d="M14 10c2.2 0 3.6.9 3.6 2.4S16 14.8 14.2 13.6" /><path d="M12 12c0 2.2-.9 3.6-2.4 3.6S7.2 14 8.4 12.2" /><path d="M10 10c-2.2 0-3.6-.9-3.6-2.4S8 5.2 9.8 6.4" /><path d="M12 15.6V21" /></>,
  ripple: <><path d="M3 9.6c2.2-1.8 4-1.8 6 0s3.8 1.8 6 0 3.8-1.8 6 0" /><path d="M3 14c2.2-1.8 4-1.8 6 0s3.8 1.8 6 0 3.8-1.8 6 0" /><path d="M3 18.4c2.2-1.8 4-1.8 6 0s3.8 1.8 6 0 3.8-1.8 6 0" /></>,
  river: <><path d="M6 3c0 4.4 3 5.6 3 9s-3 4.6-3 9" /><path d="M15 3c0 4.4 3 5.6 3 9s-3 4.6-3 9" /></>,
  info: <><circle cx="12" cy="12" r="8.6" /><path d="M12 11v5.4" /><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none" /></>,
  layers: <><path d="m12 3.4 8.4 4.4L12 12.2 3.6 7.8z" /><path d="m3.6 12.4 8.4 4.4 8.4-4.4" /><path d="m3.6 16.6 8.4 4.4 8.4-4.4" /></>,
  locate: <><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="8.4" /><path d="M12 1.6v3M12 19.4v3M22.4 12h-3M4.6 12h-3" /></>,
  play: <><path d="M8.4 5.6 19 12 8.4 18.4z" /></>,
  pause: <><path d="M9 5.6v12.8M15 5.6v12.8" /></>,
  chevron: <><path d="m9 5.6 6.4 6.4L9 18.4" /></>,
  alert: <><path d="M12 4.2 21 19.4H3z" /><path d="M12 10.2v4.2" /><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none" /></>,
  check: <><path d="m4.8 12.6 4.8 4.6L19.2 6.8" /></>,
  settings: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.6v2.6M12 18.8v2.6M21.4 12h-2.6M5.2 12H2.6M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8M18.6 18.6l-1.8-1.8M7.2 7.2 5.4 5.4" /></>,
  bell: <><path d="M6.4 10.4a5.6 5.6 0 0 1 11.2 0c0 4.2 1.6 5.6 1.6 5.6H4.8s1.6-1.4 1.6-5.6Z" /><path d="M10.2 19a2 2 0 0 0 3.6 0" /></>,
  list: <><path d="M8.4 6.6h12M8.4 12h12M8.4 17.4h12" /><circle cx="4.4" cy="6.6" r=".9" fill="currentColor" stroke="none" /><circle cx="4.4" cy="12" r=".9" fill="currentColor" stroke="none" /><circle cx="4.4" cy="17.4" r=".9" fill="currentColor" stroke="none" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  clock: <><circle cx="12" cy="12" r="8.6" /><path d="M12 7v5.3l3.4 2" /></>,
  route: <><circle cx="6" cy="6.4" r="2.6" /><circle cx="18" cy="17.6" r="2.6" /><path d="M8.6 6.4h5.4a3.4 3.4 0 0 1 0 6.8h-4a3.4 3.4 0 0 0 0 6.8h5.4" strokeDasharray="0.1 3.4" /></>,
};

export function Icon({ name, size = 22, className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
