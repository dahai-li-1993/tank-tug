# 3D Battlefield Conversion

## Feature Description
Convert the in-match battlefield presentation from primitive 2D drawing to a 3D view while keeping the existing deterministic simulation logic intact.  
Units should render as spheres, with player units shown in green and enemy units shown in red.  
All flying units should share a single fixed flight height in the 3D scene.

## Related References
- `architecture.md`
- `src/game/scenes/Game.ts`
- `src/game/render/ThreeBattleRenderer.ts`
- `src/game/sim/prototypeSim.ts`
- `src/game/main.ts`
- `package.json`

## Implementation Task Breakdown
- [x] Add 3D rendering dependency and typesafe integration point.
- [x] Implement a dedicated 3D battlefield renderer class to own camera, lights, arena meshes, and unit meshes.
- [x] Map simulation coordinates from XY into 3D XZ space and apply a constant Y height for flying units.
- [x] Render all units as spheres, colored by team (`green` for player/left, `red` for enemy/right).
- [x] Replace `Game` scene 2D world drawing with the new 3D renderer lifecycle (`create`, `render`, `destroy`).
- [x] Keep existing HUD, controls, and simulation stepping behavior unchanged.
- [x] Validate with a production build.

## Final Scope / Status
- Complete.
- Added `three` dependency and `ThreeBattleRenderer` as a dedicated rendering system.
- Converted live battlefield rendering in `Game` scene from 2D primitives to a 3D scene.
- Enforced fixed flight altitude for all flying units and team-color sphere visualization (left/player green, right/enemy red).
- Preserved deterministic simulation behavior, hotkeys, and HUD text/capacity/core stats.
