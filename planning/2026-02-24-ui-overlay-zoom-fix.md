# UI Overlay Zoom Isolation

## Feature Description
Fix the in-match UI so HUD/help/core HP bars remain fixed-size and unaffected by world camera zoom while gameplay camera pan/zoom stays enabled.

## Related References
- `architecture.md`
- `src/game/scenes/Game.ts`
- `planning/2026-02-24-return-to-2d-combat-with-camera.md`

## Implementation Task Breakdown
- [x] Define bugfix scope and references in a dedicated planning file.
- [x] Add a dedicated UI camera in `Game` with fixed zoom.
- [x] Route world renderables to main camera and UI renderables to UI camera.
- [x] Keep resize handling correct for both cameras.
- [x] Validate via build + typecheck.
- [x] Update `architecture.md` snapshot if camera responsibilities change.

## Final Scope / Status
- Complete.
- Added a dedicated `ui` camera with fixed zoom (`1`) in `Game`.
- Routed world and UI renderables with camera ignore lists so UI is not affected by world zoom/pan.
- Updated resize/shutdown behavior to keep the UI camera lifecycle clean.
- Verified with `npm run build-nolog` and `npx tsc --noEmit`.
