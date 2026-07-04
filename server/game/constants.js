export const PRISONER_CLASSES = ['prisoner', 'veteran', 'leader'];
export const GUARD_CLASSES = ['guard', 'sergeant', 'warden'];

// Only mechanically meaningful for Prisoners (Guards are never discarded, so their own
// copy count is flavor only). Raised from the original 4 to 5 as part of the balance pass
// below - Guards need one more concentrated loss to eliminate a Prisoner class.
export const STARTING_COUNT = 5;

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

// 26-card Escape Deck.
//
// Balance note (round 1): in the original 18-card deck, Poison was the only event that could
// advance a win condition outside of battle - and it let the Guards player *choose* which
// already-weak Prisoner class to finish off, letting them route around bad matchup luck
// entirely. Nothing symmetric existed for Prisoners. Rebalanced by turning Poison down to one
// copy and adding two new Prisoner-favoring cards: Riot (denies the Guards tempo, mirroring
// Poison's disruption) and Reinforcements (undoes some Guard progress directly).
//
// Balance note (round 2): a Monte Carlo simulation (thousands of random-legal-move games)
// showed Guards still winning ~95% of the time even after the above. Root cause: Prisoners'
// win condition requires enough wins to cycle deep through the deck to uncover all 3 Key
// Fragments (~15 wins worth, on average), while Guards only need 4 *concentrated* losses on
// one class out of 12 - a much shorter race. Fixed by raising Key Fragments from 3 to 9 (still
// only 3 needed to win - simulated 95%->68.5% Guards) plus raising STARTING_COUNT from 4 to 5
// (95%->91.2% Guards alone), which combined land at a healthy ~53%/47% Guards/Prisoners split.
// Power Failure was also replaced with Blackout (see gameEngine.js) since it was so often a
// dead draw with no pending effect to cancel.
export const ESCAPE_DECK_TEMPLATE = [
  ...Array(9).fill({ type: 'key_fragment' }),
  ...Array(2).fill({ type: 'lockdown' }),
  ...Array(1).fill({ type: 'poison' }),
  ...Array(2).fill({ type: 'secret_tunnel' }),
  ...Array(2).fill({ type: 'smuggled_tools' }),
  ...Array(2).fill({ type: 'barricade' }),
  ...Array(1).fill({ type: 'blackout' }),
  ...Array(2).fill({ type: 'disguise' }),
  ...Array(2).fill({ type: 'shift_rotation' }),
  ...Array(2).fill({ type: 'riot' }),
  ...Array(1).fill({ type: 'reinforcements' }),
];
