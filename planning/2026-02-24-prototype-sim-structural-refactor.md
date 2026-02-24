# Prototype Sim Structural Refactor

## Feature Description
Refactor `TugPrototypeSim` from a monolithic class into a structural composition with a stable facade and focused internal systems.

Goals:
- Preserve deterministic gameplay behavior for identical config + seed.
- Preserve existing `Game.ts` integration contract (`new TugPrototypeSim`, `reset`, `step`, and currently-read public fields).
- Improve maintainability by separating state, parsing/catalog, spatial queries, targeting, combat/projectiles, damage, and victory resolution.

## Related References
- `src/game/sim/prototypeSim.ts`
- `src/game/scenes/Game.ts`
- `src/game/sim/unitArchetypes.csv`
- `architecture.md`
- `planning/systems/phase-0-ecs-foundation.md`
- `planning/systems/codex-automation-contract.md`

## Implementation Task Breakdown
- [x] Capture deterministic snapshots/checksums for fixed scenarios.
  - Used custom valid race presets in characterization tests because current checked-in CSV data does not pass strict archetype spawn validation.
- [x] Extract constants/config/types into dedicated modules.
- [x] Extract CSV archetype parsing + validation into a catalog module.
- [x] Extract typed-array state allocation/reset into a state module.
- [x] Extract systems:
  - [x] Spawn system.
  - [x] Spatial bucket/query system.
  - [x] Targeting system.
  - [x] Combat/projectile/explosion system.
  - [x] Damage resolution system.
  - [x] Victory/stats system.
- [x] Rebuild `TugPrototypeSim` as facade that wires state + systems and re-exports public contract.
- [x] Add characterization tests under `src/game/sim/__tests__/`:
  - [x] deterministic replay checksum
  - [x] fixed scenario outcome regression
  - [x] API contract fields consumed by `Game.ts`
- [x] Run verification and resolve issues.
  - Executed: `npx vite-node ./src/game/sim/__tests__/prototypeSim.characterization.test.ts`
  - Executed: `npx tsc --noEmit`
  - Executed: `npx vite build --config vite/config.prod.mjs`
- [x] Update this plan file with final status and scope.
- [x] Update `architecture.md` to match final code structure snapshot.

## Final Scope and Status
- `TugPrototypeSim` is now a stable facade over dedicated modules for config, context, state, archetype catalog, and systems.
- Existing `Game.ts` access pattern remains compatible (public sim arrays/scalars/methods unchanged in shape and names).
- Added optional `racePresets` constructor override for deterministic fixture-driven tests without changing default runtime behavior.
- Added characterization test coverage for deterministic replay, snapshot regressions, and `Game.ts` public contract fields.
