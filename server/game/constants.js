export const PRISONER_CLASSES = ['prisoner', 'veteran', 'leader'];
export const GUARD_CLASSES = ['guard', 'sergeant', 'warden'];

export const STARTING_COUNT = 4;

// Every one of the 9 (prisonerClass, guardClass) matchups resolves to a winner.
// Source rules only listed 8 of the 9; "leader vs guard" was left undefined,
// so it was ruled (by the game owner) that Leader wins that matchup by default,
// making Leader undefeated except by Warden.
const PRISONER_WINS = new Set(['leader:sergeant', 'veteran:guard', 'prisoner:warden', 'leader:guard']);
const GUARD_WINS = new Set(['warden:leader', 'warden:veteran', 'sergeant:veteran', 'sergeant:prisoner', 'guard:prisoner']);

export function resolveBattle(prisonerClass, guardClass) {
  if (PRISONER_WINS.has(`${prisonerClass}:${guardClass}`)) return 'prisoners';
  if (GUARD_WINS.has(`${guardClass}:${prisonerClass}`)) return 'guards';
  throw new Error(`Unresolved matchup: ${prisonerClass} vs ${guardClass}`);
}

// 20-card Escape Deck.
//
// Balance note: in the original 18-card deck, Poison was the only event that could advance
// a win condition outside of battle - and it let the Guards player *choose* which already-weak
// Prisoner class to finish off, letting them route around bad matchup luck entirely. Nothing
// symmetric existed for Prisoners. Rebalanced by turning Poison down to one copy and adding two
// new Prisoner-favoring cards: Riot (denies the Guards tempo, mirroring Poison's disruption) and
// Reinforcements (undoes some Guard progress directly, mirroring Poison's ability to add it).
export const ESCAPE_DECK_TEMPLATE = [
  ...Array(3).fill({ type: 'key_fragment' }),
  ...Array(2).fill({ type: 'lockdown' }),
  ...Array(1).fill({ type: 'poison' }),
  ...Array(2).fill({ type: 'secret_tunnel' }),
  ...Array(2).fill({ type: 'smuggled_tools' }),
  ...Array(2).fill({ type: 'barricade' }),
  ...Array(1).fill({ type: 'power_failure' }),
  ...Array(2).fill({ type: 'disguise' }),
  ...Array(2).fill({ type: 'shift_rotation' }),
  ...Array(2).fill({ type: 'riot' }),
  ...Array(1).fill({ type: 'reinforcements' }),
];
