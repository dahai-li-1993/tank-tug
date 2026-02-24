# Capacity and Deployment

## Goal
Formalize army size control with a hard `1000` capacity cap and a fair deployment flow.

## Capacity Rules
- Max capacity per player: `1000`
- A unit purchase is blocked if `CurrentCapacity + UnitCapacity > 1000`.
- Upgrades do not consume capacity.
- Selling a unit refunds credits and frees capacity immediately in build phase.

## Capacity Distribution Targets
- Early rounds: 150-350 capacity used.
- Mid rounds: 400-750 capacity used.
- Late rounds: 800-1000 capacity used.

## Deployment Model
- Units are queued during build phase.
- At combat start, units spawn in ordered groups from nearest-to-farthest frontline slots.
- Spawn rules preserve formation intent:
  - Frontline first (tanks/bruisers)
  - Midline second (DPS/support)
  - Backline/fliers last (range/air)

## Reinforcement Rules
- Optional mode flag for release:
  - `Wave Locked`: all planned units spawn at combat start only.
  - `Trickle Reinforce`: reserve budget releases reinforcements at timed intervals.

## Anti-Abuse Constraints
- No instant queue reorder in active combat.
- No unit-selling during active combat.
- Spawn collision protection to prevent path jams near base gate.

## UI Requirements
- Persistent `Capacity Used / 1000` meter.
- Color states:
  - Green <= 90%
  - Yellow 91%-99%
  - Red 100%
- Hover/unit-card shows exact `CapacityCost`.

## Codex-Testable Requirements
- `CAP-001`: purchase blocked if capacity would exceed `1000`.
- `CAP-002`: selling in build phase immediately frees capacity.
- `CAP-003`: upgrades never consume capacity.
- `CAP-004`: spawn order is deterministic by frontline -> midline -> backline/flying.
- `CAP-005`: queue reordering blocked during combat.
- `CAP-006`: unit selling blocked during combat.
- `CAP-007`: `Wave Locked` and `Trickle Reinforce` produce distinct deterministic spawn timing.
