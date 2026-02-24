# Codex Automation Contract (v1)

## Goal
Make every design feature implementable and verifiable by Codex with deterministic, machine-checkable tests.

## Non-Negotiable Implementation Rules
- Combat simulation must be deterministic for identical input + seed.
- All randomness must come from a seeded RNG passed through sim context.
- Core gameplay rules must live in pure logic modules (no Phaser/UI dependencies).
- Full match state must be serializable to JSON for snapshot and replay tests.
- Unit/upgrade data must be data-driven (table/JSON), not hardcoded per unit in logic.
- Every feature must map to at least one `Requirement ID` and one automated test.

## Determinism Contract
- Fixed simulation step: `50 ms` (`20 ticks/sec`).
- Numeric rounding: deterministic rounding strategy documented and reused everywhere.
- Stable iteration order for collections:
  - Sort by `spawnOrder` then `unitId` when tie conditions happen.
- Replay checksum:
  - Emit per-round state hash.
  - Replaying same seed must produce same hash sequence.

## Recommended Test Layers
1. `Schema tests`: validate roster/upgrade data integrity.
2. `Rule tests`: unit-level logic (capacity, targeting, economy math).
3. `Scenario sim tests`: deterministic combat snapshots using fixed fixtures.
4. `Replay tests`: run same seed twice and compare hashes.
5. `UI state tests`: verify HUD/store state and warning triggers (headless).
6. `Telemetry tests`: event presence, payload fields, ordering constraints.

## Requirement ID Format
- Prefix by system:
  - `ECS` phase-0 ECS foundation
  - `FAC` factions
  - `UNI` unit schema/taxonomy
  - `RST` concrete v1 roster table
  - `CAP` capacity/deployment
  - `CMB` combat/targeting
  - `ECO` economy/upgrades
  - `FLW` match flow/modes
  - `UIX` UI/UX
  - `TEL` telemetry/balance process
- Example: `CAP-003`

## Feature-to-Test Matrix

| Requirement ID | Feature | Source | Deterministic Input | Expected Assertion |
|---|---|---|---|---|
| ECS-001 | Headless sim core independent from Phaser | phase-0-ecs-foundation.md | Import sim module in isolated unit test | Module runs tick without Scene |
| ECS-002 | SoA typed-array component storage | phase-0-ecs-foundation.md | Initialize sim with N entities | Component arrays exist and indexed by entity ID |
| ECS-003 | Fixed-step deterministic tick | phase-0-ecs-foundation.md | Run same fixture for 300 ticks twice | State snapshots are identical |
| ECS-004 | Seeded RNG determinism | phase-0-ecs-foundation.md | Same seed and inputs, repeated run | Identical spawn jitter and outcomes |
| ECS-005 | Stable target tie-break order | phase-0-ecs-foundation.md | Equal-distance/equal-range fixture | Lowest HP then lowest spawn order selected |
| ECS-006 | Damage pipeline with shield/armor/core breach | phase-0-ecs-foundation.md | Shielded and armored target fixtures | Damage order and core breach values match spec |
| ECS-007 | Spatial bucket broadphase active | phase-0-ecs-foundation.md | Run target acquire with bucket debug stats | Bucket query path used and results valid |
| ECS-008 | Replay checksum stream | phase-0-ecs-foundation.md | Emit hash each interval, replay same seed | Hash sequence matches exactly |
| ECS-009 | 1000+ entity determinism scenario | phase-0-ecs-foundation.md | Beast vs Human large fixture | Deterministic winner/tick/core values |
| ECS-010 | Primitive-shape prototype projection | phase-0-ecs-foundation.md | Render scene with sim state | Ground uses square, flying uses circle |
| ECS-011 | Full 2D movement/targeting | phase-0-ecs-foundation.md | 2D spread fixture with vertical separation | Units acquire and move in both X and Y axes |
| FAC-001 | Race locked after match start | factions-and-identity.md | Start match as Beast, attempt Alien purchase | Purchase rejected with `ERR_RACE_LOCKED` |
| FAC-002 | No cross-race unit purchase | factions-and-identity.md | Human player buys Alien unit ID | Purchase rejected and credits unchanged |
| FAC-003 | Neutral upgrades allowed for all races | factions-and-identity.md | Buy shared upgrade as each race | Upgrade applies for Beast/Alien/Human |
| FAC-004 | Race passive triggers correctly | factions-and-identity.md | Trigger passive event per race fixture | Buff/effect appears with expected duration/value |
| UNI-001 | Canonical stats required for all units | unit-roster-and-stats.md | Validate unit table schema | All required keys exist and typed correctly |
| UNI-002 | Capacity size class boundaries respected | unit-roster-and-stats.md | Evaluate `CapacityCost` ranges | Unit class label matches configured range |
| UNI-003 | Roster composition per race | unit-roster-and-stats.md | Count layers by race | Exactly 8 Landed + 4 Flying per race |
| UNI-004 | Counter matrix minimum coverage | unit-roster-and-stats.md | Query tags/roles per race | Each race has min anti-air/anti-massive/siege/support |
| RST-001 | Unit names unique in full roster | unit-rosters-v1.md | Build set of names | No duplicates |
| RST-002 | DPS formula correctness | unit-rosters-v1.md | Recompute DPS from damage/cooldown | Stored DPS within tolerance `0.1` |
| RST-003 | Colossal capacity range valid | unit-rosters-v1.md | Filter colossal units | Capacity between 181 and 300 |
| RST-004 | Example armies fit cap | unit-rosters-v1.md | Sum example compositions | Total capacity <= 1000 |
| CAP-001 | Capacity hard cap at 1000 | capacity-and-deployment.md | Current 995, buy cap 10 unit | Buy rejected with no state mutation |
| CAP-002 | Selling frees capacity in build phase | capacity-and-deployment.md | Sell unit during build | Capacity decreases immediately |
| CAP-003 | Upgrades do not consume capacity | capacity-and-deployment.md | Buy upgrade at 998 cap | Capacity unchanged |
| CAP-004 | Deployment order by line priority | capacity-and-deployment.md | Mixed queue at combat start | Spawn order is frontline -> midline -> backline/flying |
| CAP-005 | No queue reorder during combat | capacity-and-deployment.md | Attempt reorder in combat phase | Action rejected with `ERR_PHASE_LOCKED` |
| CAP-006 | No unit sell during combat | capacity-and-deployment.md | Attempt sell in combat phase | Action rejected with `ERR_PHASE_LOCKED` |
| CAP-007 | Reinforcement mode switch works | capacity-and-deployment.md | Run same queue in both modes | `Wave Locked` spawns all at t0; `Trickle` uses intervals |
| CMB-001 | Target nearest valid in range | combat-and-targeting.md | 3 enemy candidates in range | Chosen target has smallest distance |
| CMB-002 | If none in range target nearest valid by distance | combat-and-targeting.md | No in-range targets | Target acquisition picks nearest valid |
| CMB-003 | Tie-break by lowest current HP | combat-and-targeting.md | Equal distance candidates | Lowest HP target selected |
| CMB-004 | Land/Flying target rule enforced | combat-and-targeting.md | Ground-only attacker vs air unit | No attack issued |
| CMB-005 | Shields absorb before HP | combat-and-targeting.md | Apply damage to shielded unit | Shield decreases first, HP unchanged until shield 0 |
| CMB-006 | Armor reduction with floor clamp | combat-and-targeting.md | High armor vs low damage hits | Damage per hit never drops below clamp floor |
| CMB-007 | Anti-massive bonus applied | combat-and-targeting.md | Anti-massive attacker hits massive + non-massive | Bonus only on massive target |
| CMB-008 | Round end conditions | combat-and-targeting.md | Army wipe and timer-expiry fixtures | Round ends immediately on wipe or at timer cap |
| ECO-001 | Starting credits baseline | economy-and-upgrades.md | New match state | Credits = 300 |
| ECO-002 | Base income each round | economy-and-upgrades.md | Advance round with no modifiers | +120 credits applied |
| ECO-003 | Interest formula and cap | economy-and-upgrades.md | Saved credits sweep | +1 per 50, max +20 |
| ECO-004 | Streak bonus caps | economy-and-upgrades.md | Long win/loss streak simulation | Win <= +30, loss <= +20 |
| ECO-005 | Upgrade tier unlock rounds | economy-and-upgrades.md | Attempt Tier2 at round 3 | Rejected; allowed at round 4 |
| ECO-006 | Diminishing returns applies on stacked category | economy-and-upgrades.md | Buy repeated same-category upgrades | Incremental gain decreases per stack |
| FLW-001 | Core HP initial value | match-flow-and-modes.md | New match state | Both cores = 5000 |
| FLW-002 | Primary victory condition | match-flow-and-modes.md | Apply damage to enemy core <= 0 | Match ends with attacker victory |
| FLW-003 | Secondary victory at round cap | match-flow-and-modes.md | Reach final round with both cores > 0 | Higher core HP wins |
| FLW-004 | Tiebreak order | match-flow-and-modes.md | Equal core HP at cap | Higher remaining capacity wins, else total damage |
| FLW-005 | Mode registry includes v1 modes | match-flow-and-modes.md | Query enabled modes | Contains Ranked, Custom, PvE Gauntlet |
| UIX-001 | Capacity meter thresholds | ui-and-ux.md | Feed 900, 950, 1000 cap states | Colors green, yellow, red respectively |
| UIX-002 | Build UI shows required unit card fields | ui-and-ux.md | Render card from roster fixture | Displays credit, capacity, damage profile icons |
| UIX-003 | Warning: no anti-air | ui-and-ux.md | Queue with zero anti-air tags | Warning flag set true |
| UIX-004 | Warning: overflow attempt | ui-and-ux.md | Attempt purchase that exceeds cap | Overflow warning and blocked action |
| UIX-005 | Overlay hotkeys toggle HUD flags | ui-and-ux.md | Dispatch hotkeys for bars/lines/numbers | Store flags toggle deterministically |
| TEL-001 | Required telemetry events emitted | balance-and-telemetry.md | Simulate full match | All minimum event types present |
| TEL-002 | Event payload schema validity | balance-and-telemetry.md | Validate each event object | Required fields present and typed |
| TEL-003 | Event ordering constraints | balance-and-telemetry.md | Match timeline capture | `match_start` first, `match_end` last |
| TEL-004 | KPI calculations | balance-and-telemetry.md | Aggregate sample telemetry set | KPIs match deterministic expected outputs |
| TEL-005 | Balance outlier detection thresholds | balance-and-telemetry.md | Feed synthetic rates 55%/45% etc | Outlier flags trip at specified cutoffs |

## Definition of Done for Fully Automated Implementation
- Every requirement ID above has at least one green automated test.
- Test suite includes at least one deterministic replay test per race matchup.
- Critical path (`capacity`, `combat`, `economy`, `victory`) has zero flaky tests across 20 reruns.
- ECS performance budgets are evaluated and reported for `1200`-unit scenarios.
- CI artifact includes:
  - test report
  - replay checksums
  - telemetry schema validation report

## Out of Scope for Automation v1
- Subjective art/audio quality.
- Manual UX feel polish beyond measurable thresholds.
