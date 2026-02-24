# Camera Pan and Zoom Controls

## Feature Description
Add interactive camera controls in the match scene so players can zoom in/out and move the 3D camera along the battlefield horizontal plane.

## Related References
- `architecture.md`
- `src/game/render/ThreeBattleRenderer.ts`
- `src/game/scenes/Game.ts`
- `planning/2026-02-24-3d-battlefield-conversion.md`

## Implementation Task Breakdown
- [x] Define feature scope and references in a dedicated planning file.
- [x] Add camera state and control APIs to `ThreeBattleRenderer` for horizontal panning and zoom.
- [x] Clamp camera target and zoom ranges to keep the battlefield in view.
- [x] Add scene input handling for pan/zoom (keyboard + wheel).
- [x] Update in-game help text to document the controls.
- [x] Validate with build + typecheck.
- [x] Update `architecture.md` snapshot if renderer/scene responsibilities change.
- [x] Remap keyboard camera pan controls from arrow keys to `W/A/S/D`.
- [x] Add `Q/E` keyboard zoom controls while keeping mouse-wheel zoom.
- [x] Resolve race-selection hotkey conflicts introduced by the `Q/W/E` camera bindings.
- [x] Re-validate with build + typecheck and refresh architecture snapshot text.

## Final Scope / Status
- Complete.
- Added renderer camera controls for horizontal-plane panning and zoom distance adjustments.
- Added camera bounds clamping for both pan target and zoom range to preserve battlefield framing.
- Remapped scene camera controls to `W/A/S/D` pan and `Q/E` zoom, while retaining mouse-wheel zoom.
- Remapped right-side race hotkeys from `Q/W/E` to `U/I/O` to avoid camera-control conflicts.
- Updated in-game help text to match the new bindings.
- Verified with `npm run build-nolog` and `npx tsc --noEmit`.
