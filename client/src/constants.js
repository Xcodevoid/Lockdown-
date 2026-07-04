export const PRISONER_CLASSES = ['prisoner', 'veteran', 'leader'];
export const GUARD_CLASSES = ['guard', 'sergeant', 'warden'];
export const STARTING_COUNT = 5;

export function classSide(cls) {
  return PRISONER_CLASSES.includes(cls) ? 'prisoner' : 'guard';
}

export const CLASS_ICON = {
  prisoner: '🧍',
  veteran: '🎖️',
  leader: '👑',
  guard: '💂',
  sergeant: '⭐',
  warden: '🗝️',
};

export const CARD_ICON = {
  key_fragment: '🔑',
  lockdown: '🚨',
  poison: '☠️',
  secret_tunnel: '🗺️',
  smuggled_tools: '🪜',
  barricade: '🚧',
  blackout: '🌑',
  disguise: '🎭',
  shift_rotation: '🔄',
  riot: '✊',
  reinforcements: '🧰',
};
