// Hand-built SVG icon set replacing emoji everywhere a unit class or Escape Deck card is
// shown. Emoji render differently per OS/browser, which reads as inconsistent/unpolished
// next to the custom card frames; these are identical for every player regardless of device.
// Icons use fill="currentColor" so they pick up the surrounding text color automatically,
// and size via 1em so existing font-size-based CSS continues to control their size.

function Svg({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: '1em', height: '1em', display: 'inline-block', verticalAlign: '-0.15em', flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

const PERSON_BODY = 'M12 11.2c-4.4 0-7 2.9-7 8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1c0-5.1-2.6-8-7-8z';
const CAP = 'M4 12.4C4 7.8 7.6 4 12 4s8 3.8 8 8.4H4z';

const CLASS_ICONS = {
  prisoner: (
    <Svg>
      <circle cx="12" cy="7" r="3.4" />
      <path d={PERSON_BODY} />
    </Svg>
  ),
  veteran: (
    <Svg>
      <circle cx="12" cy="7" r="3.4" />
      <path d={PERSON_BODY} />
      <path d="M9 16.6l3-1.7 3 1.7" fill="none" stroke="var(--bg-deep)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  leader: (
    <Svg>
      <path d="M7.5 4.6l1.3 2.3L11 4l1 2.9 1.7-2.9 1.3 2.6-.6 1.6H8.1z" />
      <circle cx="12" cy="9.6" r="3.4" />
      <path d="M12 13.8c-4.4 0-7 2.9-7 8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1c0-5.1-2.6-8-7-8z" />
    </Svg>
  ),
  guard: (
    <Svg>
      <path d={CAP} />
      <ellipse cx="12" cy="12.6" rx="9.6" ry="1.9" />
    </Svg>
  ),
  sergeant: (
    <Svg>
      <path d="M4 10.6C4 6 7.6 2.2 12 2.2s8 3.8 8 8.4H4z" />
      <ellipse cx="12" cy="10.8" rx="9.6" ry="1.9" />
      <path d="M7.5 16l4.5-2.4 4.5 2.4M7.5 19.4l4.5-2.4 4.5 2.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  warden: (
    <Svg>
      <path d="M4 10.6C4 6 7.6 2.2 12 2.2s8 3.8 8 8.4H4z" />
      <ellipse cx="12" cy="10.8" rx="9.6" ry="1.9" />
      <path d="M12 14.4l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z" />
    </Svg>
  ),
};

const CARD_ICONS = {
  key_fragment: (
    <Svg>
      <circle cx="7.2" cy="8.2" r="3.7" fill="none" stroke="currentColor" strokeWidth="2.3" />
      <path d="M10.6 8.2H19M14.8 8.2v3.1M17.8 8.2v2.4" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" fill="none" />
    </Svg>
  ),
  lockdown: (
    <Svg>
      <rect x="5.5" y="11" width="13" height="9" rx="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.1" />
    </Svg>
  ),
  poison: (
    <Svg>
      <path d="M12 3.2c-4.3 0-7 3-7 6.8 0 2.1 1.1 3.8 2.5 4.9v1.9c0 .6.5 1 1 1h.6v1.4c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9v-1.4h.6c.5 0 1-.4 1-1v-1.9c1.4-1.1 2.5-2.8 2.5-4.9 0-3.8-2.7-6.8-7-6.8z" />
      <circle cx="9.2" cy="9.6" r="1.3" fill="var(--bg-deep)" />
      <circle cx="14.8" cy="9.6" r="1.3" fill="var(--bg-deep)" />
      <path d="M10.7 12.8h2.6l-1.3 1.9z" fill="var(--bg-deep)" />
    </Svg>
  ),
  secret_tunnel: (
    <Svg>
      <path d="M4 20v-7.5C4 8 7.6 4.5 12 4.5s8 3.5 8 8V20" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <path d="M8 20v-6a4 4 0 0 1 8 0v6" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.65" />
    </Svg>
  ),
  smuggled_tools: (
    <Svg>
      <path d="M7 2.5v19M17 2.5v19M7 7.5h10M7 12h10M7 16.5h10" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </Svg>
  ),
  barricade: (
    <Svg>
      <rect x="3" y="9.5" width="18" height="5.6" rx="1.3" />
      <path d="M5.5 9.5l3.6 5.6M11 9.5l3.6 5.6M16.5 9.5l2.2 3.4" stroke="var(--bg-deep)" strokeWidth="2" />
    </Svg>
  ),
  blackout: (
    <Svg>
      <path d="M15.8 3.3a9 9 0 1 0 4.9 16.5 10.6 10.6 0 0 1-4.9-16.5z" />
    </Svg>
  ),
  disguise: (
    <Svg>
      <path d="M2.3 9.8c1.6-1.6 4.8-2.1 6.9-.5 1 .8 1.7 1 2.8 1s1.8-.2 2.8-1c2.1-1.6 5.3-1.1 6.9.5-1 5.4-4.7 7.4-7.3 6-.9-.5-1.1-1.3-1.1-1.9v-.4h-2.6v.4c0 .6-.2 1.4-1.1 1.9-2.6 1.4-6.3-.6-7.3-6z" />
      <circle cx="7.7" cy="10.6" r="1.4" fill="var(--bg-deep)" />
      <circle cx="16.3" cy="10.6" r="1.4" fill="var(--bg-deep)" />
    </Svg>
  ),
  shift_rotation: (
    <Svg>
      <path d="M5.5 8.2a6.5 6.5 0 0 1 11.3-3.8M17.8 5.6v3.4h-3.4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 15.8a6.5 6.5 0 0 1-11.3 3.8M6.2 18.4V15h3.4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  riot: (
    <Svg>
      <rect x="7.3" y="9.5" width="2.5" height="6.2" rx="1.25" />
      <rect x="10.5" y="7.8" width="2.5" height="7.9" rx="1.25" />
      <rect x="13.7" y="8.4" width="2.5" height="7.3" rx="1.25" />
      <path d="M6.3 15c0-1 .7-1.7 1.6-1.7h9c1 0 1.8.8 1.8 1.9v1.6c0 3.2-2.5 5.8-5.9 5.8h-.9c-3.4 0-5.9-2.6-5.9-5.8z" />
    </Svg>
  ),
  reinforcements: (
    <Svg>
      <path d="M12 2.8l7.2 2.7v5.7c0 5.2-3.1 8.7-7.2 10.3-4.1-1.6-7.2-5.1-7.2-10.3V5.5z" />
      <path d="M12 8v8M8 12h8" stroke="var(--bg-deep)" strokeWidth="2.1" strokeLinecap="round" />
    </Svg>
  ),
};

export function ClassIcon({ name }) {
  return CLASS_ICONS[name] ?? null;
}

export function CardIcon({ name }) {
  return CARD_ICONS[name] ?? null;
}
