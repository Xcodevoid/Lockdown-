# Lockdown: Prisoners vs. Guards

A real-time, 2-player web game (one player is the Prisoners, the other is the Guards), with a
room-code system so two people can play from separate devices, and a full English / 中文 language
toggle.

## Project layout

- `server/` — Node.js + Express + Socket.IO. Holds all game rules and authoritative state
  (`server/game/`). Nothing about the rules lives in the client — the client only renders
  whatever the server tells it, and sends back the player's choices.
- `client/` — React (Vite). UI, i18n, and socket wiring only.

## Running it locally

Requires Node 18+.

```bash
npm run install:all   # installs both server/ and client/ dependencies
npm run dev            # runs the server (port 4000) and client (port 5173) together
```

Then open **http://localhost:5173** in two browser tabs/windows (or on two devices on the same
network, using your machine's LAN IP instead of `localhost`) to play as the two sides.

To run them separately instead:
```bash
cd server && npm install && npm run dev   # http://localhost:4000
cd client && npm install && npm run dev   # http://localhost:5173
```

## How a game works

1. One player creates a room and picks a side (Prisoners or Guards); this gives a 5-character
   room code.
2. The other player joins with that code and is seated on the remaining side.
3. Each round, both players secretly pick a unit; once both have picked, the choices are revealed
   and the battle resolves automatically according to the combat table (see in-app **Rules**
   button, available on both the home screen and the game screen).
4. The game ends the instant either win condition is met: Prisoners collect 3 Key Fragments,
   or Guards fully eliminate one Prisoner class (5 discards of the same class).
5. Either player can hit **Play again** afterward to reset the same room for a rematch.

Refreshing the page or reconnecting after a dropped connection resumes your same seat (it's keyed
off a token stored in your browser's `localStorage`, not a login).

## Rule interpretations

The source rules (photographed from a notes app) had a few points that were either genuinely
ambiguous or simply not specified. These were resolved as follows, per discussion with the game's
designer:

- **Leader vs. Guard** was the one matchup out of all 9 possible (3 Prisoner classes × 3 Guard
  classes) that the original combat table didn't cover. Ruling: **Leader wins**, making Leader
  undefeated except by Warden.
- **Poison**: discards **one** copy of the chosen surviving Prisoner class (not all remaining
  copies of that class).
- **Fatigue deadlock guard rail**: if a player has no eligible unit because everything is either
  Fatigued or blocked by an event (e.g. Barricade), Fatigue is waived for that round only, so the
  game can never get stuck with no legal move.
- **Who resolves each event**: Poison (which hurts the Prisoners) is chosen by the **Guards**
  player; Secret Tunnel (which helps the Prisoners) is resolved privately by the **Prisoners**
  player, who alone sees the 3 peeked cards.
- **Disguise** tokens are banked until used (they don't expire if unused the very next round).

If any of these should work differently, they're all isolated in
`server/game/gameEngine.js` and easy to adjust.

## Balance pass

Playtesting (and a look at the numbers) showed the Guards had a real edge, traced to one specific
card: **Poison** was the only Escape Deck event that could advance a win condition outside of
battle, and it let the Guards player *choose* which already-weakened Prisoner class to finish off
— letting them route around bad matchup luck entirely. Prisoners had nothing symmetric. Fixed by:

- Poison reduced from 2 copies to 1.
- Added **Riot** (✊, 2 copies): Prisoners choose a Guard class to lock out for the next *two*
  rounds instead of the usual one — denies Guards tempo, mirroring how Poison denies Prisoners
  progress.
- Added **Reinforcements** (🧰, 1 copy): Prisoners choose an understaffed class to restock by one
  copy (capped at 4) — directly undoes some Guard progress, mirroring how Poison directly adds to
  it.

That first pass (20-card deck) turned out not to be nearly enough. A Monte Carlo simulation —
thousands of games played out with random-but-legal moves on both sides, used here purely to
detect *structural* bias in the ruleset, independent of skill — showed Guards still winning
**95.2%** of games. Root cause: Prisoners' win condition needs enough wins to cycle deep through
the deck to uncover all 3 Key Fragments (~15 wins' worth, on average, out of only ~44% of rounds
won), while Guards only need 4 *concentrated* losses on one class out of 12 total Prisoner cards —
a much shorter race that finishes first almost every time.

One idea floated for a fix — removing Fatigue for Prisoners only, so they could always replay
their best matchup — was tested the same way before adopting it: **it didn't help (95.2% →
96.3% Guards)**. Under random play, fatigue mostly just forces rotation through classes you'd
cycle through anyway; it isn't where the imbalance actually lives, and it interacts oddly enough
with the rest of the mechanics that it made things marginally worse rather than better.

What did work, each verified by the same simulation before being adopted:

- **Key Fragments raised from 3 to 9 in the deck** (still only 3 needed to win) — makes them
  meaningfully more likely to turn up within the number of wins a game actually lasts.
  95.2% → 68.5% Guards on its own.
- **Prisoner starting copies raised from 4 to 5 per class** (so eliminating a class now takes 5
  discards, not 4) — note this only changes Prisoners; Guards' own copy count was never
  mechanically used (they're never discarded), so it stays "4" as flavor text only.
  95.2% → 91.2% Guards alone, but combined with the Key Fragment change above: **95.2% → 54.2%
  Guards / 45.8% Prisoners** — a healthy, close-to-even split.
- **Power Failure replaced with Blackout** (🌑, same 1 copy): instead of "cancel all pending
  effects" — which was very often a dead draw with nothing to cancel — it now reliably un-Fatigues
  the Prisoner class you just played, so it always does something useful for Prisoners.

The Escape Deck is now 26 cards (9 Key Fragments + 17 event cards). The combat table itself was
still left untouched (Prisoners still win 4 of 9 raw matchups to the Guards' 5) — that's a
designer-set rule, not a gap, and the data showed the deck/elimination pacing was the real lever,
not the matchups.

## Hidden information (strategic depth pass)

After the balance pass, the game still felt "solved" once both players learned the matchup table:
almost everything was public (Fatigue state, remaining counts, discard piles), so an experienced
opponent could usually deduce your exact legal options before you even picked. Two structural
causes:

1. Fatigue state was fully visible for *both* sides in real time, and with only 3 classes to
   choose from, that regularly narrowed an opponent's choice down to something you could already
   see coming — very little of a real mind game was left.
2. Guards never face permanent attrition (only Fatigue, which cycles every round), so their side
   never builds toward anything over a long game the way Prisoners' dwindling copies do.

The surgical fix (chosen over bigger rewrites like multi-lane simultaneous battles, to keep the
change low-risk): **your opponent's Fatigue status is now hidden from you.** You always see your
own Fatigue (you need it to know your options), and progress-tracking info stays fully public on
both sides (remaining/eliminated counts, discard piles, and any active card effect like a Riot
lock — those are public because a played card caused them, not because you can read minds). But
you can no longer see whether your opponent's classes are Fatigued, which restores real
uncertainty about their next move without changing any win condition or combat rule.

This only touches what `publicState()` broadcasts to each client — `server/game/gameEngine.js`'s
actual rules engine (`getEligibleClasses`, `resolveBattle`, etc.) still operates on full,
unredacted truth, so there's no risk of this leaking into game logic.

## Notes on the build

- All real-time state (whose turn, fatigue, discard piles, the escape deck) is authoritative on
  the server; the client never has to compute game logic, only display it — this also means a
  player can't peek at hidden information (like Secret Tunnel's peeked cards) by inspecting the
  client.
- Rooms are in-memory only (no database) and are cleaned up after 6 hours with nobody connected —
  fine for casual play, but restarting the server clears all active games.
