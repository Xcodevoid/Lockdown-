export const PRISONER_CLASSES = ['prisoner', 'veteran', 'leader'];
export const GUARD_CLASSES = ['guard', 'sergeant', 'warden'];
export const STARTING_COUNT = 5;

export function classSide(cls) {
  return PRISONER_CLASSES.includes(cls) ? 'prisoner' : 'guard';
}
