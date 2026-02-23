# 2D Tug of War GDD (Desert Strike Style)

## Feature Description
Create a 2D tug-of-war auto-battler inspired by StarCraft 2 Desert Strike structure:
- Player picks one race: `Beast`, `Alien`, or `Human`
- Player buys units and upgrades between combat waves
- Units are either `Landed` or `Flying`
- Battles emphasize `massive entities vs massive entities`
- Each player has a capacity cap of `1000`
- Larger units consume more capacity

Why:
- Deliver fast strategic decision-making with strong faction identity.
- Support both swarm and super-unit fantasy in the same ruleset.
- Build a scalable framework for future PvP and PvE modes.

## Related References
- Current architecture snapshot: `architecture.md`
- Planning folder policy: `planning/README.md`
- Game scene flow in codebase (for eventual implementation):
  - `src/game/scenes/MainMenu.ts`
  - `src/game/scenes/Game.ts`
  - `src/game/scenes/GameOver.ts`

## High-Level Game Loop
1. Pre-match: pick race + starting doctrine.
2. Build phase: spend credits on units/upgrades, set deployment queue.
3. Combat phase: armies auto-deploy and fight along a 2D lane.
4. Resolution: surviving force pushes lane and damages enemy core.
5. Next round: receive income + rewards, rebalance composition.
6. Win condition: enemy core destroyed or higher core HP at round cap.

## Core Pillars
1. Big Army Fantasy: Many units on screen, including huge signature units.
2. Readable Chaos: Clear target priorities and VFX language despite scale.
3. Meaningful Tradeoffs: Capacity, tech, and counters all matter each round.
4. Distinct Races: Beast, Alien, Human must feel mechanically unique.

## System Doc Index
- `planning/systems/factions-and-identity.md`
- `planning/systems/unit-roster-and-stats.md`
- `planning/systems/unit-rosters-v1.md`
- `planning/systems/capacity-and-deployment.md`
- `planning/systems/combat-and-targeting.md`
- `planning/systems/economy-and-upgrades.md`
- `planning/systems/match-flow-and-modes.md`
- `planning/systems/ui-and-ux.md`
- `planning/systems/balance-and-telemetry.md`

## Fine-Grained Implementation Task Breakdown

### Phase 1: Combat Foundations
- [ ] Define canonical stat schema for all units (HP, DPS, range, tags, capacity).
- [ ] Implement Land/Flying layers and valid attack target rules.
- [ ] Implement base march, engage, attack, death, and push behaviors.
- [ ] Add deterministic round simulator mode for fast balance iteration.

### Phase 2: Economy + Capacity
- [ ] Implement round income, interest, and streak bonuses.
- [ ] Implement 1000-capacity validation and deployment queue UI.
- [ ] Implement buy/sell/lock tools for army planning.
- [ ] Add pre-round warnings for invalid or over-cap armies.

### Phase 3: Factions + Upgrades
- [ ] Add Beast roster and racial upgrades.
- [ ] Add Alien roster and racial upgrades.
- [ ] Add Human roster and racial upgrades.
- [ ] Add neutral shared upgrades and anti-air/anti-ground branches.

### Phase 4: Match Layer + UX
- [ ] Implement pre-match race select and loadout.
- [ ] Implement build/combat phase transitions with clear timers.
- [ ] Implement combat readability UX (target icons, damage text modes, alerts).
- [ ] Implement victory/defeat and end-of-match summary.

### Phase 5: Balance + Live Tuning Tools
- [ ] Add telemetry events for purchases, outcomes, and unit efficiency.
- [ ] Build balancing dashboard export from match logs.
- [ ] Run matchup matrix sweeps (Beast/Alien/Human mirrors and cross-race).
- [ ] Tune roster costs and upgrade breakpoints for healthy meta spread.

## Open Design Questions
- Should players be single-race only for the full match, or allow late dual-tech?
- Should capacity always be 1000, or scale with round number?
- How many rounds before forced sudden death?
- Should hero/commander units exist, or stay pure army composition?
