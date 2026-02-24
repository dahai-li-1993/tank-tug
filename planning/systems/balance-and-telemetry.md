# Balance and Telemetry

## Goal
Create measurable balance workflows for a three-race competitive tug-of-war game.

## Balance KPIs
- Global win rate by race (target near 50% +/- 2%).
- Match duration median (target range by mode).
- Pick rate and win rate for each unit and upgrade.
- Anti-air coverage rate by round.
- Massive unit efficiency:
  - Damage dealt per capacity
  - Survival time
  - Core breakthrough impact

## Telemetry Events (Minimum)
- `match_start` (mode, race, map, seed)
- `unit_bought` (unitId, cost, capacity, round)
- `upgrade_bought` (upgradeId, tier, round)
- `round_result` (winner, duration, breakthrough_damage)
- `unit_combat_summary` (spawned, kills, damage_dealt, damage_taken, life_time)
- `match_end` (winner, rounds, final_core_hp)

## Balance Process
1. Run scheduled matchup matrix tests (all race combinations).
2. Flag outliers above thresholds:
   - Win rate > 54% or < 46%
   - Unit pick rate > 70% with top-3 win contribution
3. Apply constrained tuning:
   - Cost/capacity first
   - Damage/health second
   - Ability redesign last
4. Re-test and compare against previous baseline.

## Patch Policy
- Weekly small tuning patches during active test cycle.
- Major rework only at season boundaries.
- Keep one patch behind fallback table for emergency rollback.

## Live Risk Watchlist
- Race mirror stagnation.
- No-counter flying deathballs.
- Massive-only endgame meta with low diversity.
- Excess snowball from early streak economy.

## Codex-Testable Requirements
- `TEL-001`: all required telemetry event types are emitted in a complete match.
- `TEL-002`: every telemetry event includes required typed payload fields.
- `TEL-003`: event ordering is valid (`match_start` first, `match_end` last).
- `TEL-004`: KPI aggregation outputs deterministic values for a known telemetry fixture.
- `TEL-005`: outlier detection triggers at configured thresholds (for example >54% win rate).
