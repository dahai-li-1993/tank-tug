# Tank Tug Architecture

Current architecture snapshot (systems + classes).  
No changelog/history is kept in this file.

## Structure (Tree View)
```text
Tank Tug
├─ Toolchain System (Bun + Vite + TypeScript)
│  ├─ package.json scripts
│  │  ├─ dev / build
│  │  └─ dev-nolog / build-nolog
│  ├─ runtime dependencies
│  │  └─ Phaser 3
│  └─ vite configs
│     ├─ vite/config.dev.mjs (port 8080)
│     └─ vite/config.prod.mjs
├─ Bootstrap System
│  └─ tank-tug/src/main.ts
│     └─ DOMContentLoaded -> StartGame('game-container')
├─ Game Composition System
│  └─ tank-tug/src/game/main.ts
│     ├─ builds Phaser GameConfig (1024x768, transparent canvas, parent game-container)
│     └─ registers scene classes
│        ├─ Boot
│        ├─ Preloader
│        ├─ MainMenu
│        ├─ Game
│        └─ GameOver
├─ Scene Lifecycle System (tank-tug/src/game/scenes)
│  ├─ class Boot extends Phaser.Scene
│  │  ├─ preload: background (assets/bg.png)
│  │  └─ create: start Preloader
│  ├─ class Preloader extends Phaser.Scene
│  │  ├─ init: loading UI + progress bar
│  │  ├─ preload: logo (assets/logo.png)
│  │  └─ create: start MainMenu
│  ├─ class MainMenu extends Phaser.Scene
│  │  └─ create: show menu, pointerdown -> Game
│  ├─ class Game extends Phaser.Scene
│  │  ├─ create:
│  │  │  ├─ initializes TugPrototypeSim
│  │  │  ├─ creates world/UI graphics layers + HUD/help overlays
│  │  │  ├─ configures dual-camera render routing (world camera + fixed-zoom UI camera)
│  │  │  ├─ binds race/hotkey controls and camera pan/zoom input
│  │  │  └─ starts deterministic prototype match
│  │  └─ update:
│  │     ├─ fixed-step simulation ticking
│  │     ├─ camera controls (W/A/S/D pan, Q/E + wheel zoom)
│  │     ├─ 2D battlefield drawing (arena, cores, units, projectile trails)
│  │     └─ HUD updates (alive counts, core HP, capacity + bars)
│  └─ class GameOver extends Phaser.Scene
│     └─ create: game over screen, pointerdown -> MainMenu
├─ 2D Match Rendering System (in Game scene)
│  ├─ world graphics layer draws arena bounds, cores, unit circles, and projectile spheres/trails per tick
│  ├─ UI graphics/text are rendered by a dedicated fixed-zoom UI camera
│  └─ Phaser main camera stores clamped center/zoom state for world pan + zoom
├─ Headless Simulation System (tank-tug/src/game/sim/prototypeSim.ts)
│  ├─ class TugPrototypeSim
│  │  ├─ SoA ECS-like storage (typed arrays per component)
│  │  ├─ deterministic fixed-step loop
│  │  ├─ seeded RNG-driven spawn variance
│  │  ├─ CSV roster data ingestion (`src/game/sim/unitArchetypes.csv`) with strict schema/value parsing and unique row `unitKey`
│  │  ├─ 2D spatial bucket broadphase for target acquisition
│  │  ├─ full XY movement and Euclidean target selection
│  │  ├─ uniform movement speed shared by all spawned units
│  │  ├─ data-driven archetype attack style (`melee` or `ranged`) with fail-fast validation
│  │  ├─ melee range lock (20) + melee ground-only targeting requirement
│  │  ├─ ranged authored range contract (40..220, no runtime clamp)
│  │  ├─ explicit explosive radius per archetype (`0` non-explosive, `>0` explosive) for melee and ranged attacks
│  │  ├─ ranged attack profiles (direct / projectile with single-target or explosive impacts)
│  │  ├─ non-homing projectile simulation (fixed aim point + per-tick travel and impact)
│  │  ├─ combat resolution (shield, armor, HP, core breach, area damage)
│  │  └─ victory resolution (core destroy, wipe, tick cap tiebreak)
│  └─ class XorShift32
│     └─ deterministic RNG source for replayable simulation
└─ Asset Usage System
   ├─ background: Boot preload -> used by Preloader/MainMenu
   └─ logo: Preloader preload -> used by MainMenu
```

## Scene Flow
`Boot -> Preloader -> MainMenu -> Game` (ESC in Game returns to MainMenu)
