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
│  │  │  ├─ initializes TugPrototypeSim (arena `9600x5600`, bucket size `240`)
│  │  │  ├─ creates world/UI graphics layers + HUD/help overlays
│  │  │  ├─ configures dual-camera render routing (world camera + fixed-zoom UI camera)
│  │  │  ├─ initializes world camera to centered full-battlefield fit zoom based on viewport dimensions
│  │  │  ├─ binds race/hotkey controls and camera pan/zoom input
│  │  │  └─ starts deterministic prototype match
│  │  └─ update:
│  │     ├─ fixed-step simulation ticking
│  │     ├─ camera controls (W/A/S/D pan, Q/E + wheel zoom)
│  │     ├─ 2D battlefield drawing (arena, cores, 10x unit visuals, projectile trails, explosion pulses)
│  │     └─ HUD updates (alive counts, core HP, capacity + bars)
│  └─ class GameOver extends Phaser.Scene
│     └─ create: game over screen, pointerdown -> MainMenu
├─ 2D Match Rendering System (in Game scene)
│  ├─ world graphics layer draws large arena bounds (`9600x5600`), cores, 10x unit circles, projectile spheres/trails, and transient explosion rings/fills
│  ├─ UI graphics/text are rendered by a dedicated fixed-zoom UI camera
│  └─ Phaser main camera stores clamped center/zoom state for world pan + zoom with dynamic world-fit minimum zoom
├─ Headless Simulation System (tank-tug/src/game/sim)
│  ├─ class TugPrototypeSim (prototypeSim.ts)
│  │  ├─ facade API consumed by Game scene (`reset`, `step`, public SoA arrays + scalar state)
│  │  ├─ wires resolved config + context + typed-array state + system modules
│  │  └─ deterministic fixed-step orchestration pipeline (effects -> buckets -> melee-pressure seed -> unit loop with size-aware melee reach + local separation steering -> projectiles -> damage -> victory)
│  ├─ Sim Data Modules
│  │  ├─ simConstants.ts (combat/sim constants and CSV header schema)
│  │  ├─ simTypes.ts (RaceId, config/state/context contracts including body radius + melee target pressure arrays)
│  │  ├─ simConfig.ts (defaults + resolved derived config)
│  │  ├─ simContext.ts (clamp/bucket helpers + core positions + seeded RNG context)
│  │  └─ simState.ts (SoA allocation + reset lifecycle state)
│  ├─ Catalog Module
│  │  └─ unitArchetypeCatalog.ts
│  │     └─ CSV roster ingestion/strict parsing/validation into race presets
│  ├─ Systems Modules (src/game/sim/systems)
│  │  ├─ class SpawnSystem (archetype validation, spawn bands, melee runtime range lock, body radius derivation, unit materialization)
│  │  ├─ class SpatialBucketSystem (bucket broadphase rebuild)
│  │  ├─ class EngagementPressureSystem (deterministic melee-attacker pressure tracking per target)
│  │  ├─ class TargetingSystem (target validation/acquisition with tie-break rules + melee saturation scoring)
│  │  ├─ class CombatSystem (goal-directed movement with local allied separation steering, attacks, projectiles, impacts, explosion effects)
│  │  ├─ class DamageSystem (shield/HP application + death cleanup)
│  │  └─ class VictorySystem (alive/capacity stats + finish resolution)
│  ├─ class XorShift32 (rng.ts)
│  │  └─ deterministic RNG source for replayable simulation
│  └─ Simulation Tests
│     ├─ src/game/sim/__tests__/prototypeSim.characterization.test.ts
│     │  └─ replay determinism, scenario snapshots, and Game-contract field checks
│     └─ src/game/sim/__tests__/prototypeSim.crowd-behavior.test.ts
│        └─ anti-clump separation, focus-fire distribution, and size-vulnerability checks
└─ Asset Usage System
   ├─ background: Boot preload -> used by Preloader/MainMenu
   └─ logo: Preloader preload -> used by MainMenu
```

## Scene Flow
`Boot -> Preloader -> MainMenu -> Game` (ESC in Game returns to MainMenu)
