# Unit Roster and Stats

## Goal
Define unit taxonomy and a stat model that supports very large armies and very large individual entities.

## Unit Tags
- `Landed` or `Flying`
- `Biological`, `Mechanical`, `Psionic`
- `Light`, `Armored`, `Massive`
- `AoE`, `SingleTarget`, `Siege`, `Support`

## Canonical Stats
- `CostCredits`
- `CapacityCost`
- `MaxHP`
- `ShieldHP` (optional)
- `AttackDamage`
- `AttackCooldown`
- `AttackRange`
- `MoveSpeed`
- `TargetRule` (`GroundOnly`, `AirOnly`, `Both`)
- `SplashRadius` (optional)
- `Armor`
- `SpellPower` (optional)

## Size Classes (Capacity Guidance)
- `Swarm`: 1-8 capacity
- `Line`: 9-25 capacity
- `Heavy`: 26-80 capacity
- `Massive`: 81-180 capacity
- `Colossal`: 181-300 capacity

Design intent:
- 1000 capacity can represent either 1000+ tiny units, mixed armies, or 3-5 colossal units with escort.

## Starter Roster Plan (Per Race)
Minimum first release:
- 8 landed units
- 4 flying units
- 4 upgrades that directly modify specific units
- 4 global upgrades

Concrete v1 statlines are documented in:
- `planning/systems/unit-rosters-v1.md`

## Massive Entity Rules
- Massive/Colossal units get partial crowd-control resistance.
- They cannot be body-blocked by small units.
- They have lower turn rate penalty to keep push readable.
- They should be counterable by focused anti-massive builds.

## Counter Matrix Requirements
- Every race must have:
  - At least 2 early anti-air options
  - At least 2 anti-massive options
  - At least 1 long-range siege option
  - At least 1 sustain/support option
