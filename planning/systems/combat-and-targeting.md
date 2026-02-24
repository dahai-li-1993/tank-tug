# Combat and Targeting

## Goal
Define deterministic, readable combat behavior for large unit counts and massive units.

## Lane Model
- Single horizontal 2D lane (left base vs right base).
- Units auto-advance until enemies are in range.
- When one side wins a skirmish, survivors push toward enemy core.

## Targeting Priority (Default)
1. Nearest valid target in attack range.
2. If none in range, nearest valid target by distance.
3. Tie-break by lowest current HP.

`Valid target` depends on `TargetRule` and enemy `Landed/Flying`.

## Damage Model
- Hit-based attacks with optional splash.
- DPS computed from `AttackDamage / AttackCooldown`.
- Armor reduces incoming hit damage with clamp floor.
- Shields absorb first where present, then HP.

## Massive Combat Rules
- Massive/Colossal units ignore small knockback and minor slows.
- Anti-massive weapons gain bonus damage multiplier.
- Massive units have wide collision and cleave-friendly attack arcs.

## Pathing and Collision
- Soft separation for small units to reduce clumping.
- Hard collision for massive units, but no deadlock states allowed.
- Units can temporarily overlap during spawn grace frames to prevent jams.

## Readability Requirements
- Distinct hit effects for:
  - Ground-only attacks
  - Air-only attacks
  - Splash attacks
  - Anti-massive attacks
- Optional tactical overlay:
  - Health bars
  - Shield bars
  - Attack target lines
  - Capacity value labels

## Win/Loss Per Round
- Round ends when one army is fully eliminated or timer expires.
- Surviving units inflict core damage based on remaining total capacity and unit tier weights.

## Codex-Testable Requirements
- `CMB-001`: choose nearest valid target in range.
- `CMB-002`: if none in range, acquire nearest valid target by distance.
- `CMB-003`: tie-break target selection by lowest current HP.
- `CMB-004`: enforce `GroundOnly`, `AirOnly`, and `Both` target legality.
- `CMB-005`: shields absorb damage before HP.
- `CMB-006`: armor reduction obeys clamp floor.
- `CMB-007`: anti-massive bonus applies only when defender has `Massive`.
- `CMB-008`: round ends on full elimination or timer expiry.
