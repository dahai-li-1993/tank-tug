# Return To 2D Combat While Keeping Camera Controls

## Feature Description
Switch the in-match battlefield presentation back to 2D Phaser rendering for better runtime performance while preserving interactive camera movement controls (pan + zoom).

## Related References
- `architecture.md`
- `src/game/scenes/Game.ts`
- `src/game/sim/prototypeSim.ts`
- `src/game/render/ThreeBattleRenderer.ts`
- `planning/2026-02-24-3d-battlefield-conversion.md`
- `planning/2026-02-24-camera-pan-and-zoom.md`

## Implementation Task Breakdown
- [x] Define feature scope and references in a dedicated planning file.
- [x] Replace in-match battlefield rendering in `Game` with direct Phaser 2D drawing.
- [x] Preserve camera pan/zoom controls (`W/A/S/D`, `Q/E`, mouse wheel) using Phaser camera transforms.
- [x] Keep HUD/help overlays screen-anchored while world rendering pans/zooms.
- [x] Remove obsolete 3D battlefield renderer code paths.
- [x] Validate via build + typecheck.
- [x] Update `architecture.md` snapshot to match final 2D architecture.

## Final Scope / Status
- Complete.
- Replaced 3D battlefield rendering with Phaser 2D arena/core/unit drawing in `Game`.
- Preserved camera movement controls (`W/A/S/D` pan and `Q/E` + mouse wheel zoom) with clamped camera center/zoom.
- Kept HUD/help and HP bars camera-independent by moving UI overlays to fixed scroll factors.
- Removed `src/game/render/ThreeBattleRenderer.ts` and removed `three` + `@types/three` dependencies.
- Verified with `npm run build-nolog` and `npx tsc --noEmit`.
