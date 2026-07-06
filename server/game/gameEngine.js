import { PRISONER_CLASSES, GUARD_CLASSES, STARTING_COUNT, ESCAPE_DECK_TEMPLATE, resolveBattle } from './constants.js';

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function freshClassState() {
  const c = {};
  for (const cls of PRISONER_CLASSES) c[cls] = { remaining: STARTING_COUNT, fatigued: false, willBeFatigued: false, forcedFatiguedUntilRound: 0 };
  return c;
}
function freshGuardClassState() {
  const c = {};
  for (const cls of GUARD_CLASSES) c[cls] = { fatigued: false, willBeFatigued: false, forcedFatiguedUntilRound: 0 };
  return c;
}

export function createGame(id) {
  return {
    id,
    status: 'waiting_for_players', // waiting_for_players | choosing | swap_window | awaiting_event_input | finished
    players: { prisoners: null, guards: null }, // { socketId, name }
    prisonerClasses: freshClassState(),
    guardClasses: freshGuardClassState(),
    escapeDeck: shuffle(ESCAPE_DECK_TEMPLATE),
    escapeDiscard: [],
    collectedKeys: 0,
    round: 1,
    pending: {
      revealModifiers: [], // FIFO queue of 'lockdown' | 'smuggled_tools'
      barricadeActive: false, // blocks leader/warden during the round currently being chosen
      barricadeQueued: false, // set when the card is revealed; promoted to active next housekeeping pass
      disguiseTokens: 0,
      shiftRotation: false,
    },
    choices: { prisoners: null, guards: null }, // { unitClass, disguiseAs }
    swap: { prisoners: undefined, guards: undefined }, // undefined = not yet responded
    pendingEventInput: null, // { type, ... }
    log: [],
    winner: null, // 'prisoners' | 'guards' | null
  };
}

function otherSide(side) {
  return side === 'prisoners' ? 'guards' : 'prisoners';
}

// Returns { eligible: string[], fallbackLevel: 'none' | 'ignored_fatigue' | 'ignored_fatigue_and_barricade' }
export function getEligibleClasses(state, side) {
  const classes = side === 'prisoners' ? PRISONER_CLASSES : GUARD_CLASSES;
  const classState = side === 'prisoners' ? state.prisonerClasses : state.guardClasses;
  const barricadedClass = side === 'prisoners' ? 'leader' : 'warden';
  const barricadeActive = state.pending.barricadeActive;

  const passesSurvival = (cls) => (side === 'prisoners' ? classState[cls].remaining > 0 : true);
  // A class can be locked out for two rounds instead of the usual one via an "until round N"
  // mark - either Riot (opponent-imposed, guards only) or the Aggressive stance (self-imposed,
  // either side), so this checks both sides' classes the same way.
  const isForcedFatigued = (cls) => classState[cls].forcedFatiguedUntilRound >= state.round;
  const isFatigued = (cls) => classState[cls].fatigued || isForcedFatigued(cls);

  const tier1 = classes.filter((cls) => passesSurvival(cls) && !isFatigued(cls) && !(barricadeActive && cls === barricadedClass));
  if (tier1.length > 0) return { eligible: tier1, fallbackLevel: 'none' };

  const tier2 = classes.filter((cls) => passesSurvival(cls) && !(barricadeActive && cls === barricadedClass));
  if (tier2.length > 0) return { eligible: tier2, fallbackLevel: 'ignored_fatigue' };

  const tier3 = classes.filter((cls) => passesSurvival(cls));
  return { eligible: tier3, fallbackLevel: 'ignored_fatigue_and_barricade' };
}

const STANCES = ['standard', 'aggressive', 'cautious'];

export function submitChoice(state, side, unitClass, disguiseAs, stance) {
  if (state.status !== 'choosing') throw new Error('Not currently choosing units');
  if (state.choices[side]) throw new Error('Choice already submitted this round');

  const { eligible } = getEligibleClasses(state, side);
  if (!eligible.includes(unitClass)) throw new Error(`${unitClass} is not eligible this round`);

  let disguiseUsed = null;
  if (side === 'prisoners' && disguiseAs && state.pending.disguiseTokens > 0) {
    if (!PRISONER_CLASSES.includes(disguiseAs)) throw new Error('Invalid disguise class');
    disguiseUsed = disguiseAs;
  }

  const stanceUsed = STANCES.includes(stance) ? stance : 'standard';

  state.choices[side] = { unitClass, disguiseAs: disguiseUsed, stance: stanceUsed };

  if (state.choices.prisoners && state.choices.guards) {
    if (state.pending.shiftRotation) {
      state.status = 'swap_window';
      state.swap = { prisoners: undefined, guards: undefined };
    } else {
      resolveRound(state);
    }
  }
  return state;
}

export function submitSwap(state, side, newUnitClass) {
  if (state.status !== 'swap_window') throw new Error('Not currently in a swap window');
  if (state.swap[side] !== undefined) throw new Error('Swap decision already made this round');

  if (newUnitClass) {
    const { eligible } = getEligibleClasses(state, side);
    const currentClass = state.choices[side].unitClass;
    if (newUnitClass === currentClass) throw new Error('Must switch to a different unit to use Shift Rotation');
    if (!eligible.includes(newUnitClass)) throw new Error(`${newUnitClass} is not eligible`);
    state.choices[side] = { unitClass: newUnitClass, disguiseAs: null, stance: state.choices[side].stance };
  }
  state.swap[side] = true;

  if (state.swap.prisoners !== undefined && state.swap.guards !== undefined) {
    state.pending.shiftRotation = false;
    resolveRound(state);
  }
  return state;
}

function markUsed(state, side, unitClass) {
  const classState = side === 'prisoners' ? state.prisonerClasses[unitClass] : state.guardClasses[unitClass];
  classState.willBeFatigued = true;
}

function resolveRound(state) {
  const prisonerClass = state.choices.prisoners.unitClass;
  const guardClass = state.choices.guards.unitClass;
  const disguiseAs = state.choices.prisoners.disguiseAs;
  const effectivePrisonerClass = disguiseAs || prisonerClass;
  const prisonerStance = state.choices.prisoners.stance || 'standard';
  const guardStance = state.choices.guards.stance || 'standard';

  markUsed(state, 'prisoners', prisonerClass);
  markUsed(state, 'guards', guardClass);
  if (disguiseAs) state.pending.disguiseTokens = Math.max(0, state.pending.disguiseTokens - 1);

  // Aggressive is a self-imposed lock: the class played is out for the next two rounds instead
  // of one, win or lose - same mechanism Riot uses to lock an opponent's class, just applied to
  // your own here.
  if (prisonerStance === 'aggressive') state.prisonerClasses[prisonerClass].forcedFatiguedUntilRound = state.round + 2;
  if (guardStance === 'aggressive') state.guardClasses[guardClass].forcedFatiguedUntilRound = state.round + 2;

  const winner = resolveBattle(effectivePrisonerClass, guardClass);

  // Guards' Cautious: losing doesn't cost you the usual Fatigue - stay available next round.
  if (winner === 'prisoners' && guardStance === 'cautious') {
    state.guardClasses[guardClass].willBeFatigued = false;
  }

  const logEntry = {
    round: state.round,
    prisonerClass,
    guardClass,
    disguiseAs,
    prisonerStance,
    guardStance,
    winner,
    escapeCardsRevealed: [],
  };

  if (winner === 'guards') {
    // Cautious (either side) protects the Prisoner from being discarded this battle - it's only
    // Fatigued as normal, same as if they'd won.
    const discardPrevented = prisonerStance === 'cautious' || guardStance === 'cautious';

    if (!discardPrevented) {
      state.prisonerClasses[prisonerClass].remaining -= 1;
      logEntry.prisonerDiscarded = prisonerClass;
      if (state.prisonerClasses[prisonerClass].remaining <= 0) {
        state.winner = 'guards';
        state.status = 'finished';
        logEntry.eliminatedClass = prisonerClass;
        state.log.push(logEntry);
        return;
      }
    } else {
      logEntry.discardPrevented = true;
    }

    // Guards' Aggressive bonus: also discard one copy of whichever *other* surviving class is
    // weakest, independent of whether the primary discard above happened.
    if (guardStance === 'aggressive') {
      const otherSurviving = PRISONER_CLASSES.filter((c) => c !== prisonerClass && state.prisonerClasses[c].remaining > 0);
      if (otherSurviving.length > 0) {
        const target = otherSurviving.reduce((min, c) => (state.prisonerClasses[c].remaining < state.prisonerClasses[min].remaining ? c : min));
        state.prisonerClasses[target].remaining -= 1;
        logEntry.aggressiveBonusDiscard = target;
        if (state.prisonerClasses[target].remaining <= 0) {
          state.winner = 'guards';
          state.status = 'finished';
          logEntry.eliminatedClass = target;
          state.log.push(logEntry);
          return;
        }
      }
    }
  }

  state.log.push(logEntry);

  if (winner === 'prisoners') {
    let revealCount = 1;
    if (state.pending.revealModifiers.length > 0) {
      const modifier = state.pending.revealModifiers.shift();
      revealCount = modifier === 'lockdown' ? 0 : 2; // 'smuggled_tools' => 2
    }
    // Aggressive adds an extra reveal on top of whatever the modifier queue already granted;
    // Cautious overrides to zero regardless - safety has a price.
    if (prisonerStance === 'aggressive') revealCount += 1;
    if (prisonerStance === 'cautious') revealCount = 0;
    if (continueReveals(state, logEntry, revealCount)) return; // game over or paused for event input
  }

  finishRoundHousekeeping(state);
}

// Reveals up to `count` escape cards, one at a time. Stops early (returning true) if the
// game ends or a card needs player input (Poison/Secret Tunnel) - in which case the remaining
// count is stashed on the state so the event-resolution functions can pick up where this left off.
function continueReveals(state, logEntry, count) {
  let remaining = count;
  while (remaining > 0 && state.escapeDeck.length > 0) {
    const finished = revealTopEscapeCard(state, logEntry);
    if (finished) return true; // prisoners just won the game via key fragments
    remaining -= 1;
    // Check pendingEventInput itself, not state.status: after a resume, status is still the
    // stale 'awaiting_event_input' string from the *previous* pause (only finishRoundHousekeeping
    // ever resets it), so checking status here would wrongly treat a plain, no-input card revealed
    // right after a resume as a fresh pause.
    if (state.pendingEventInput) {
      state._pendingReveal = { remaining, logEntry };
      return true; // paused; caller must not run housekeeping yet
    }
  }
  return false;
}

// Returns true if this reveal ended the game (mutates state.status/winner).
function revealTopEscapeCard(state, logEntry) {
  if (state.escapeDeck.length === 0) return false;
  const card = state.escapeDeck.shift();
  logEntry.escapeCardsRevealed.push(card.type);

  switch (card.type) {
    case 'key_fragment': {
      state.collectedKeys += 1;
      state.escapeDiscard.push(card);
      if (state.collectedKeys >= 3) {
        state.winner = 'prisoners';
        state.status = 'finished';
        return true;
      }
      break;
    }
    case 'lockdown':
      state.pending.revealModifiers.push('lockdown');
      state.escapeDiscard.push(card);
      break;
    case 'smuggled_tools':
      state.pending.revealModifiers.push('smuggled_tools');
      state.escapeDiscard.push(card);
      break;
    case 'barricade':
      state.pending.barricadeQueued = true;
      state.escapeDiscard.push(card);
      break;
    case 'blackout':
      // The Prisoner class just played doesn't go Fatigued next round after all.
      // (Replaces the old Power Failure, which was so often a dead draw with nothing
      // pending to cancel that it wasn't reliably benefiting anyone.)
      state.prisonerClasses[logEntry.prisonerClass].willBeFatigued = false;
      state.escapeDiscard.push(card);
      break;
    case 'disguise':
      state.pending.disguiseTokens += 1;
      state.escapeDiscard.push(card);
      break;
    case 'shift_rotation':
      state.pending.shiftRotation = true;
      state.escapeDiscard.push(card);
      break;
    case 'poison': {
      const survivingClasses = PRISONER_CLASSES.filter((cls) => state.prisonerClasses[cls].remaining > 0);
      state.escapeDiscard.push(card);
      if (survivingClasses.length === 0) break;
      state.status = 'awaiting_event_input';
      state.pendingEventInput = { type: 'poison', chooser: 'guards', options: survivingClasses };
      break;
    }
    case 'secret_tunnel': {
      const peek = state.escapeDeck.splice(0, Math.min(3, state.escapeDeck.length));
      state.escapeDiscard.push(card);
      state.status = 'awaiting_event_input';
      state.pendingEventInput = { type: 'secret_tunnel', chooser: 'prisoners', cards: peek };
      break;
    }
    case 'riot': {
      state.escapeDiscard.push(card);
      state.status = 'awaiting_event_input';
      state.pendingEventInput = { type: 'riot', chooser: 'prisoners', options: GUARD_CLASSES.slice() };
      break;
    }
    case 'reinforcements': {
      const understaffed = PRISONER_CLASSES.filter((cls) => state.prisonerClasses[cls].remaining < STARTING_COUNT);
      state.escapeDiscard.push(card);
      if (understaffed.length === 0) break; // nothing to reinforce; card has no effect
      state.status = 'awaiting_event_input';
      state.pendingEventInput = { type: 'reinforcements', chooser: 'prisoners', options: understaffed };
      break;
    }
    default:
      break;
  }
  return false;
}

export function resolvePoisonChoice(state, chosenClass) {
  if (state.status !== 'awaiting_event_input' || !state.pendingEventInput || state.pendingEventInput.type !== 'poison') {
    throw new Error('No Poison event awaiting input');
  }
  if (!state.pendingEventInput.options.includes(chosenClass)) throw new Error('That class is not a valid Poison target');

  state.prisonerClasses[chosenClass].remaining -= 1;
  const eliminated = state.prisonerClasses[chosenClass].remaining <= 0;
  state.pendingEventInput = null;

  if (eliminated) {
    state.winner = 'guards';
    state.status = 'finished';
    return { eliminated: chosenClass };
  }

  resumeAfterEventInput(state);
  return { eliminated: null };
}

export function resolveSecretTunnelOrder(state, orderedCardTypes) {
  if (state.status !== 'awaiting_event_input' || !state.pendingEventInput || state.pendingEventInput.type !== 'secret_tunnel') {
    throw new Error('No Secret Tunnel event awaiting input');
  }
  const original = state.pendingEventInput.cards;
  if (orderedCardTypes.length !== original.length) throw new Error('Order must include exactly the peeked cards');

  const pool = original.slice();
  const reordered = orderedCardTypes.map((type) => {
    const idx = pool.findIndex((c) => c.type === type);
    if (idx === -1) throw new Error('Invalid card in reorder');
    return pool.splice(idx, 1)[0];
  });

  state.escapeDeck = [...reordered, ...state.escapeDeck];
  state.pendingEventInput = null;
  resumeAfterEventInput(state);
}

export function resolveRiotChoice(state, guardClass) {
  if (state.status !== 'awaiting_event_input' || !state.pendingEventInput || state.pendingEventInput.type !== 'riot') {
    throw new Error('No Riot event awaiting input');
  }
  if (!state.pendingEventInput.options.includes(guardClass)) throw new Error('Invalid Riot target');

  // Locked out for the next two rounds (not just the usual one).
  state.guardClasses[guardClass].forcedFatiguedUntilRound = state.round + 2;
  state.pendingEventInput = null;
  resumeAfterEventInput(state);
}

export function resolveReinforcementsChoice(state, prisonerClass) {
  if (state.status !== 'awaiting_event_input' || !state.pendingEventInput || state.pendingEventInput.type !== 'reinforcements') {
    throw new Error('No Reinforcements event awaiting input');
  }
  if (!state.pendingEventInput.options.includes(prisonerClass)) throw new Error('Invalid Reinforcements target');

  state.prisonerClasses[prisonerClass].remaining = Math.min(STARTING_COUNT, state.prisonerClasses[prisonerClass].remaining + 1);
  state.pendingEventInput = null;
  resumeAfterEventInput(state);
}

// After an event that needed player input (Poison/Secret Tunnel) is resolved, either
// continue any reveals that were paused mid-sequence (e.g. Smuggled Tools' second card),
// or if nothing was paused, wrap up the round as normal.
function resumeAfterEventInput(state) {
  const paused = state._pendingReveal;
  state._pendingReveal = null;
  if (paused) {
    const stillPaused = continueReveals(state, paused.logEntry, paused.remaining);
    if (stillPaused) return; // game over, or another event input now awaiting
  }
  finishRoundHousekeeping(state);
}

function finishRoundHousekeeping(state) {
  // Barricade lasts exactly one upcoming battle: promote the queued flag (set when the
  // card was revealed) to active now, and let whatever was active this past round expire.
  state.pending.barricadeActive = state.pending.barricadeQueued;
  state.pending.barricadeQueued = false;

  for (const cls of PRISONER_CLASSES) {
    const c = state.prisonerClasses[cls];
    c.fatigued = c.willBeFatigued;
    c.willBeFatigued = false;
  }
  for (const cls of GUARD_CLASSES) {
    const c = state.guardClasses[cls];
    c.fatigued = c.willBeFatigued;
    c.willBeFatigued = false;
  }

  state.round += 1;
  state.choices = { prisoners: null, guards: null };
  state.swap = { prisoners: undefined, guards: undefined };
  state.status = 'choosing';
}

// Your own side's Fatigue is always visible to you (you need it to know your options).
// Your opponent's Fatigue is hidden - only remaining/eliminated counts and active card
// effects (e.g. a Riot lock, which is public because it was caused by a played card) stay
// visible for them. This is the one deliberately-hidden layer in an otherwise fully public
// game, added so an experienced opponent can't fully deduce your next legal move before you
// choose it.
function ownClassView(classState) {
  const out = {};
  for (const cls of Object.keys(classState)) {
    const { willBeFatigued, ...rest } = classState[cls];
    out[cls] = rest;
  }
  return out;
}
function opponentClassView(classState) {
  const out = {};
  for (const cls of Object.keys(classState)) {
    const { willBeFatigued, ...rest } = classState[cls];
    out[cls] = { ...rest, fatigued: null }; // null = hidden, distinct from true/false
  }
  return out;
}

export function publicState(state, forSide) {
  return {
    id: state.id,
    status: state.status,
    round: state.round,
    prisonerClasses: forSide === 'prisoners' ? ownClassView(state.prisonerClasses) : opponentClassView(state.prisonerClasses),
    guardClasses: forSide === 'guards' ? ownClassView(state.guardClasses) : opponentClassView(state.guardClasses),
    eligibleClasses: getEligibleClasses(state, forSide).eligible,
    eligibleFallbackLevel: getEligibleClasses(state, forSide).fallbackLevel,
    escapeDeckCount: state.escapeDeck.length,
    escapeDiscard: state.escapeDiscard.map((c) => c.type),
    collectedKeys: state.collectedKeys,
    pending: state.pending,
    log: state.log,
    winner: state.winner,
    pendingEventInput: state.pendingEventInput && state.pendingEventInput.chooser === forSide ? state.pendingEventInput : (state.pendingEventInput ? { type: state.pendingEventInput.type, chooser: state.pendingEventInput.chooser } : null),
    myChoiceSubmitted: !!state.choices[forSide],
    myChoice: state.choices[forSide] ? state.choices[forSide].unitClass : null,
    myStance: state.choices[forSide] ? state.choices[forSide].stance : null,
    opponentChoiceSubmitted: !!state.choices[otherSide(forSide)],
    mySwapSubmitted: state.swap[forSide] !== undefined,
    opponentConnected: !!state.players[otherSide(forSide)]?.connected,
    players: {
      prisoners: state.players.prisoners ? { name: state.players.prisoners.name, connected: state.players.prisoners.connected } : null,
      guards: state.players.guards ? { name: state.players.guards.name, connected: state.players.guards.connected } : null,
    },
  };
}
