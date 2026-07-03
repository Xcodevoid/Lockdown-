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
4. The game ends the instant either win condition is met: Prisoners collect all 3 Key Fragments,
   or Guards fully eliminate one Prisoner class (4 discards of the same class).
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
- **Power Failure** ("ignore all event effects during the next battle") cancels every pending
  "next battle" effect outright — Barricade, Disguise tokens, Shift Rotation, and any queued
  Lockdown/Smuggled Tools — rather than merely pausing them, so the following battle plays out
  plain and nothing carries over past it.
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

The Escape Deck is now 20 cards. The combat table itself was left untouched (Prisoners still win
4 of 9 raw matchups to the Guards' 5) since that's a designer-set rule, not a gap — the fix targets
the actual identified asymmetry in the event economy rather than the base matchups.

## Notes on the build

- All real-time state (whose turn, fatigue, discard piles, the escape deck) is authoritative on
  the server; the client never has to compute game logic, only display it — this also means a
  player can't peek at hidden information (like Secret Tunnel's peeked cards) by inspecting the
  client.
- Rooms are in-memory only (no database) and are cleaned up after 6 hours with nobody connected —
  fine for casual play, but restarting the server clears all active games.
