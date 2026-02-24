# Economy and Upgrades

## Goal
Support strategic build decisions through predictable economy and race-specific progression.

## Credit Sources
- Base round income (guaranteed).
- Win/loss streak modifier.
- Interest on unspent credits (capped).
- Kill bounty (small, prevents pure turtling).

## Suggested Economy Baseline
- Starting credits: `300`
- Base income per round: `120`
- Interest: `+1` per `50` saved credits, cap `+20`
- Win streak bonus: up to `+30`
- Loss streak bonus: up to `+20`

## Spending Types
- Unit purchase (main army growth).
- Unit sell (partial refund).
- Global upgrades (race-wide buffs).
- Unit branch upgrades (specific class enhancement).

## Upgrade Tree Structure
- Tier 1 available round 1+
- Tier 2 available round 4+
- Tier 3 available round 8+
- Some race capstones require prior branch investment.

## Race Upgrade Themes
- Beast:
  - Swarm speed, death-trigger effects, brood durability
- Alien:
  - Shield strength, phase mobility, high-tech weapon scaling
- Human:
  - Range discipline, mech durability, logistics/repair

## Anti-Snowball Controls
- Underdog soft bonus for consecutive round losses.
- Diminishing returns on stacking same upgrade category.
- Core HP shield in early rounds to reduce instant blowouts.

## Codex-Testable Requirements
- `ECO-001`: new match starts with `300` credits.
- `ECO-002`: base income grants `120` credits per round.
- `ECO-003`: interest is `+1` per `50` saved credits, capped at `+20`.
- `ECO-004`: win streak bonus is capped at `+30`, loss streak at `+20`.
- `ECO-005`: Tier 2 unlock at round `4+`, Tier 3 unlock at round `8+`.
- `ECO-006`: repeated same-category upgrades apply diminishing returns.
