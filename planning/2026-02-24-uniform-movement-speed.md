# Uniform Unit Movement Speed

## Feature Description
Set a single shared movement speed for all combat units so every moving unit advances at the same rate regardless of race, unit type, or layer.

## Related References
- `architecture.md`
- `src/game/sim/prototypeSim.ts`
- `src/game/scenes/Game.ts`

## Implementation Task Breakdown
- [x] Define feature scope and references in a dedicated planning file.
- [x] Add a single shared simulation movement speed constant for all units.
- [x] Route unit spawn speed assignment through the shared speed value.
- [x] Run build/compile validation.
- [x] Update architecture snapshot text if system behavior description changes.

## Final Scope / Status
- Complete.
- Added `UNIFORM_UNIT_SPEED` in `TugPrototypeSim`.
- Updated spawn-time movement assignment so all units use the same movement speed.
- Verified with `npm run build-nolog` and `npx tsc --noEmit`.
