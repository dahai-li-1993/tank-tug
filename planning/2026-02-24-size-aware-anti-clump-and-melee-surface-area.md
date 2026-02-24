# Size-Aware Anti-Clump and Melee Surface Area

## Feature Description
Implement deterministic anti-clump unit movement and size-aware melee target distribution that scales at default prototype density.

Why:
- Reduce visible clustering where many units stack onto one victim.
- Keep simulation readable while preserving deterministic outcomes.
- Make larger units more vulnerable to swarms by geometric engagement capacity, not arbitrary damage multipliers.

## Related References
- `src/game/sim/prototypeSim.ts`
- `src/game/sim/simTypes.ts`
- `src/game/sim/simState.ts`
- `src/game/sim/simConstants.ts`
- `src/game/sim/systems/spawnSystem.ts`
- `src/game/sim/systems/targetingSystem.ts`
- `src/game/sim/systems/combatSystem.ts`
- `src/game/sim/systems/spatialBucketSystem.ts`
- `src/game/sim/__tests__/prototypeSim.characterization.test.ts`
- `architecture.md`

## Implementation Task Breakdown
- [x] Add body-radius and melee target-pressure arrays to simulation state contracts and allocation/reset lifecycle.
- [x] Add deterministic tuning constants for body radius, local separation, and melee saturation penalty.
- [x] Add `EngagementPressureSystem` for per-target melee pressure tracking (clear, seed, increment/decrement, query).
- [x] Compute per-unit body radius at spawn from `renderSize` using clamped conversion constants.
- [x] Wire pressure lifecycle into the fixed-step pipeline so retarget/core-breach transitions update pressure counters immediately.
- [x] Upgrade melee target scoring to combine distance with size-aware saturation penalty using geometric soft-cap formula.
- [x] Add local allied separation steering that blends movement goal and separation vector using bucket-local neighbor sampling with deterministic fallback handling.
- [x] Apply size-aware melee reach (`meleeRange + targetBodyRadius`) while keeping ranged reach unchanged.
- [x] Add crowd-behavior tests for separation, focus-fire distribution, and size-vulnerability behavior.
- [x] Update characterization snapshot expectations and re-run verification commands.
- [x] Update `architecture.md` to match final architecture snapshot and update this plan file final status.

## Final Scope And Status
- Complete.
- Added `bodyRadius` and `targetMeleePressure` SoA fields and integrated their lifecycle into state allocation/reset.
- Added `EngagementPressureSystem` and wired deterministic per-target melee-pressure updates into `TugPrototypeSim` retarget/core-breach flow.
- `TargetingSystem` now applies distance + saturation scoring for melee acquisition using geometric soft-cap based on attacker/defender body radii.
- `CombatSystem` now supports bucket-local allied separation steering with deterministic overlap fallback and fixed neighbor-processing cap.
- Melee in-range checks now use `meleeRange + targetBodyRadius`; ranged checks remain unchanged.
- Added `src/game/sim/__tests__/prototypeSim.crowd-behavior.test.ts` for separation, focus-fire distribution, and size-vulnerability assertions.
- Updated `prototypeSim.characterization.test.ts` deterministic snapshots to match the new movement/targeting model.
- Verification executed:
  - `npx vite-node ./src/game/sim/__tests__/prototypeSim.characterization.test.ts`
  - `npx vite-node ./src/game/sim/__tests__/prototypeSim.crowd-behavior.test.ts`
  - `npx tsc --noEmit`
  - `npx vite build --config vite/config.prod.mjs`
