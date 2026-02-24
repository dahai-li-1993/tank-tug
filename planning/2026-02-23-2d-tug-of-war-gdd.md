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
3. Combat phase: armies auto-deploy and fight across a true 2D battlefield.
4. Resolution: surviving force pushes through space and damages enemy core.
5. Next round: receive income + rewards, rebalance composition.
6. Win condition: enemy core destroyed or higher core HP at round cap.

## Core Pillars
1. Big Army Fantasy: Many units on screen, including huge signature units.
2. Readable Chaos: Clear target priorities and VFX language despite scale.
3. Meaningful Tradeoffs: Capacity, tech, and counters all matter each round.
4. Distinct Races: Beast, Alien, Human must feel mechanically unique.

## System Doc Index
- `planning/systems/codex-automation-contract.md`
- `planning/systems/test-fixtures-v1.md`
- `planning/systems/phase-0-ecs-foundation.md`
- `planning/systems/factions-and-identity.md`
- `planning/systems/unit-roster-and-stats.md`
- `planning/systems/unit-rosters-v1.md`
- `planning/systems/capacity-and-deployment.md`
- `planning/systems/combat-and-targeting.md`
- `planning/systems/economy-and-upgrades.md`
- `planning/systems/match-flow-and-modes.md`
- `planning/systems/ui-and-ux.md`
- `planning/systems/balance-and-telemetry.md`

## Codex Testability Baseline
- Every feature is assigned requirement IDs in:
  - `planning/systems/codex-automation-contract.md`
- Deterministic fixtures are defined in:
  - `planning/systems/test-fixtures-v1.md`
- Implementation is considered complete only when all requirement IDs have passing automated tests.

### Requirement Coverage by Phase
- Phase 0 (Automation Foundation): `ECS-*`
- Phase 1 (Combat Foundations): `UNI-*`, `RST-*`, `CMB-*`
- Phase 2 (Economy + Capacity): `CAP-*`, `ECO-*`
- Phase 3 (Factions + Upgrades): `FAC-*`, `ECO-*`
- Phase 4 (Match Layer + UX): `FLW-*`, `UIX-*`
- Phase 5 (Balance + Live Tuning): `TEL-*`

## Fine-Grained Implementation Task Breakdown

### Phase 0: Automation Foundation
- [x] Implement headless ECS simulation core (typed-array SoA).
- [x] Implement deterministic sim tick + seeded RNG contract.
- [x] Implement spatial bucket broadphase for target acquisition.
- [x] Upgrade prototype from lane-style movement to true 2D movement/targeting.
- [ ] Implement state snapshot + replay checksum pipeline.
- [ ] Implement schema validation pipeline for unit/upgrade data tables.
- [ ] Set up requirement-ID based test organization (ECS/FAC/UNI/RST/CAP/CMB/ECO/FLW/UIX/TEL).

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

## Current Implementation Status (Prototype Pass 2)
- Added first-playable tug-of-war simulation prototype in `src/game/scenes/Game.ts`.
- Added headless deterministic ECS-style sim in `src/game/sim/prototypeSim.ts`.
- Prototype supports race matchup selection hotkeys, seeded restarts, and primitive unit rendering.
- Prototype now runs as a true 2D battlefield simulation with XY movement/targeting.
- Visual representation:
  - Landed units: squares
  - Flying units: circles
- Prototype does not yet implement:
  - buy/sell economy loop
  - full upgrade system
  - replay checksum tests

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
