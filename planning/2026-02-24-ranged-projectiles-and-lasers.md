# Data-Driven Projectile Combat With Explicit Melee/Ranged Range Rules

## Feature Description
Refactor prototype ranged combat to projectile-only and make melee/ranged attack range rules explicitly data-driven through archetype style metadata:
- Add `attackStyle` (`melee` or `ranged`) to each unit archetype.
- Move archetype data out of inline TypeScript object literals into a CSV data table.
- Melee units are range-locked to `20`.
- Ranged units use authored `range` directly and must be authored in `40..220` (validated, no runtime clamp).
- Melee units must be ground-only targeters.
- Add required `explosiveRadius` for both melee and ranged archetypes; `0` means non-explosive.
- Remove laser simulation/rendering paths entirely.
- Triple authored range values for all ranged archetypes.

Why:
- Keep combat behavior deterministic and explicit.
- Remove hidden balancing transforms and keep unit stats source-of-truth in data.
- Simplify prototype weapon VFX and combat pipeline to projectile-only.

## Related References
- `architecture.md`
- `src/game/sim/prototypeSim.ts`
- `src/game/scenes/Game.ts`
- `planning/2026-02-23-2d-tug-of-war-gdd.md`
- `planning/systems/combat-and-targeting.md`
- `planning/systems/unit-roster-and-stats.md`

## Implementation Task Breakdown
- [x] Update archetype schema with explicit `attackStyle` data.
- [x] Remove laser-only combat + rendering data paths and logic.
- [x] Keep ranged combat on projectile-only path.
- [x] Lock melee unit runtime range to `20`.
- [x] Keep ranged unit runtime range exactly authored from data.
- [x] Add fail-fast validation for archetype range/style/targeting rules.
- [x] Rewrite current presets to satisfy new data rules (`melee range=20`, ranged `40..220`, melee ground-only).
- [x] Update scene help text and world rendering to projectile-only behavior.
- [x] Validate with `npm run build-nolog` and `npx tsc --noEmit`.
- [x] Update `architecture.md` snapshot for final system/class responsibilities.
- [x] Triple authored `range` values for all ranged archetypes in `RACE_PRESETS`.
- [x] Adjust ranged-range validation envelope to match the new authored values.
- [x] Re-validate with `npm run build-nolog` and `npx tsc --noEmit`.
- [x] Refactor unit preset data from inline TypeScript object literals into CSV for easier editing.
- [x] Parse CSV into deterministic `RACE_PRESETS` runtime structure with fail-fast schema/value validation.
- [x] Add required `explosiveRadius` stat for both melee and ranged archetypes (`0` => non-explosive).
- [x] Route explosion behavior from explicit `explosiveRadius` data (remove explosive heuristics).
- [x] Re-validate with `npm run build-nolog` and `npx tsc --noEmit`.
- [x] Tune projectile flight speed down for better visual readability.
- [x] Re-validate with `npm run build-nolog` and `npx tsc --noEmit`.
- [x] Add required unique `unitKey` search identifier as CSV column 1.
- [x] Enforce fail-fast duplicate/missing `unitKey` validation in CSV parser.
- [x] Re-validate with `npm run build-nolog` and `npx tsc --noEmit`.

## Final Scope / Status
- Complete.
- Added explicit archetype-driven `attackStyle` (`melee` / `ranged`) in `TugPrototypeSim`.
- Removed laser-only simulation and rendering systems; ranged attacks now use projectile-only behavior.
- Enforced deterministic range rules:
  - melee runtime range is locked to `20`
  - ranged runtime range uses authored `range` directly (no runtime multiplier/clamp transforms)
- Added fail-fast archetype validation:
  - melee must be ground-only (`ATTACK_GROUNDED`)
  - melee must author `range=20`
  - ranged must author `range` in `40..220`
- Updated preset data to satisfy the schema rules, including:
  - all configured melee archetypes author `range=20`
  - alien archetype #5 authored range adjusted `38 -> 40`
- Updated `Game` scene help text and rendering to projectile-only VFX.
- Triple-range pass applied to all ranged archetypes (authored ranges now 3x prior values).
- Refactored archetype roster data into CSV at `src/game/sim/unitArchetypes.csv`.
- Added CSV parsing pipeline into `TugPrototypeSim` with fail-fast header/row/value validation.
- Added required `explosiveRadius` stat for all archetypes:
  - `explosiveRadius = 0` -> non-explosive attack
  - `explosiveRadius > 0` -> explosive attack
- Explosion behavior is now fully data-driven from `explosiveRadius` (heuristic explosive classification removed).
- Direct/melee attacks now support explosion when `explosiveRadius > 0`.
- Validation:
  - `npm run build-nolog`
  - `npx tsc --noEmit`
- Projectile flight speed tuned down globally by lowering sim speed constants.
- Added required CSV-first search key `unitKey` for every archetype row.
- CSV parser now fails fast on missing or duplicate `unitKey` values.
