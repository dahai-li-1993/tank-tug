# Melee Range Lock At Runtime

## Feature Description
Allow melee archetypes to author any CSV `range` value while the simulation always enforces melee attack range as a locked runtime value (`20`).

Why:
- Prevent spawn-time validation failures when melee rows do not explicitly set `range=20`.
- Keep melee behavior deterministic by enforcing one runtime range value.

## Related References
- `src/game/sim/systems/spawnSystem.ts`
- `src/game/sim/simConstants.ts`
- `src/game/sim/unitArchetypes.csv`
- `architecture.md`

## Implementation Task Breakdown
- [x] Remove melee archetype validation that requires authored CSV `range` to equal the melee lock value.
- [x] Keep runtime melee range assignment locked to the hard-coded melee range value path used during spawn materialization.
- [x] Run simulation characterization tests to confirm behavior still passes.
- [x] Update this plan with final status/scope after implementation.

## Final Scope And Status
- Complete.
- `SpawnSystem` now accepts any authored melee `range` value in CSV while still forcing melee runtime range to `20` through the existing melee lock constant path.
- Verification: `npx vite-node ./src/game/sim/__tests__/prototypeSim.characterization.test.ts` passed.
