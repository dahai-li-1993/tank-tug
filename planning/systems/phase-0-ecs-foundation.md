# Phase 0 ECS Foundation (Automation-First)

## Goal
Define a deterministic ECS/data-oriented foundation that can support `1000+` active units and fully automated testing.

## Architecture Decision
- Use a headless simulation core with no Phaser dependency.
- Use SoA typed arrays for hot-path components.
- Keep rendering as a thin read-only projection layer.

## Required ECS Components (v1)
- `Alive` (bit)
- `Team` (0/1)
- `Layer` (`Landed`/`Flying`)
- `PositionX`
- `PositionY`
- `HP`
- `ShieldHP`
- `Armor`
- `Damage`
- `Range`
- `Speed`
- `AttackMask` (`GroundOnly`/`AirOnly`/`Both`)
- `CooldownTicks`
- `NextAttackTick`
- `TargetEntity`
- `CapacityCost`
- `RenderSize`
- `SpawnOrder`

## Required ECS Systems (v1)
1. `SpawnSystem`
2. `SpatialBucketBuildSystem` (2D grid)
3. `TargetAcquireSystem`
4. `MoveSystem`
5. `AttackSystem`
6. `DamageResolveSystem`
7. `CoreBreachSystem`
8. `RoundResolutionSystem`

## Determinism Rules
- Fixed tick: `50ms` (`20 ticks/sec`)
- Seeded RNG only
- Stable tie-break order:
  - distance
  - lowest HP+Shield
  - lowest SpawnOrder
- Replay of same input+seed must produce identical outcome and checksum stream.

## Performance Budgets (Prototype Targets)
- `ECS-PERF-001`: Simulate `1200` units for `120s` within `<= 16ms` average update cost on dev machine.
- `ECS-PERF-002`: P95 update cost for same scenario `<= 24ms`.
- `ECS-PERF-003`: No per-tick heap allocations in simulation hot loop.
- `ECS-PERF-004`: Prototype can render and simulate without fatal frame stalls (>250ms).

## Milestones and Test IDs
- `ECS-001`: Headless sim module created and callable from scene.
- `ECS-002`: SoA component storage implemented via typed arrays.
- `ECS-003`: Fixed-step tick loop implemented.
- `ECS-004`: Seeded RNG integrated and isolated.
- `ECS-005`: Deterministic target acquisition tie-break rules implemented.
- `ECS-006`: Shield/armor/core damage resolution implemented.
- `ECS-007`: Spatial bucket broadphase implemented.
- `ECS-008`: Replay hash emitted once per round/tick-window.
- `ECS-009`: Validation scenario with `1000+` entities passes determinism check.
- `ECS-010`: Prototype scene renders ECS state with primitive shapes only.
- `ECS-011`: Prototype movement and targeting use full 2D coordinates (not lane-only).

## Prototype Definition of Done
- ECS milestones `ECS-001` through `ECS-011` each have at least one passing automated test.
- Performance budgets tracked and reported.
- Prototype runs as playable first-pass battle loop with race matchup selection and restart.
