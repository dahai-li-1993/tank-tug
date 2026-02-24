# Test Fixtures v1

## Goal
Provide canonical deterministic fixtures used by requirement tests in `codex-automation-contract.md`.

## Global Fixture Rules
- Unless explicitly overridden:
  - tick rate `20/s`
  - seed `424242`
  - starting credits `300`
  - core HP `5000`
  - max capacity `1000`

## Fixture Catalog

### `FX-RACE-LOCK-01`
- PlayerA race: Beast
- Action: attempt to buy `Prism Adept` (Alien)
- Expected: `ERR_RACE_LOCKED`

### `FX-ECS-DETERMINISM-01`
- Seed: `424242`
- Matchup: Beast vs Human
- Sim duration: `600` ticks
- Expected:
  - identical winner/core/alive outputs across repeated runs
  - identical replay hash sequence

### `FX-ECS-SCALE-01`
- Seed: `424242`
- Matchup: Beast vs Human (1000+ entities)
- Sim duration: `1200` ticks
- Expected:
  - no crashes
  - deterministic completion
  - performance metrics emitted

### `FX-ECS-2D-01`
- Seed: `424242`
- Two enemy clusters separated on Y axis
- Sim duration: `300` ticks
- Expected:
  - units adjust Y position while pathing
  - target selection uses Euclidean distance in 2D

### `FX-CAP-EDGE-01`
- Build phase, PlayerA capacity used: `995`
- Action: buy unit with capacity `10`
- Expected: blocked, state unchanged

### `FX-CAP-SELL-01`
- Build phase with capacity `640`
- Action: sell one `Atlas Dreadnought` (`130` cap)
- Expected capacity: `510`

### `FX-DEPLOY-ORDER-01`
- Queue:
  - 2x Bulwark Mech (frontline)
  - 2x Rifle Trooper (midline)
  - 2x Wasp Fighter (air/backline)
- Combat start expectation:
  - frontline first, then midline, then flying

### `FX-TARGET-TIE-01`
- Attacker has 2 valid targets at equal distance.
- TargetA HP: 140, TargetB HP: 60
- Expected chosen target: TargetB

### `FX-SHIELD-01`
- Defender HP 200, Shield 100
- Incoming hit 80
- Expected: HP 200, Shield 20

### `FX-ECO-INTEREST-01`
- Savings sweep: 0, 50, 250, 1000 credits
- Expected interest: 0, 1, 5, 20

### `FX-UPGRADE-TIER-01`
- Attempt Tier2 purchase at round 3
- Expected: blocked
- Attempt Tier2 at round 4
- Expected: allowed

### `FX-VICTORY-TIMECAP-01`
- Final round reached, both cores above zero
- Core HP A/B: 1200/1200
- Remaining capacity A/B: 280/260
- Expected winner: A (capacity tiebreak)

### `FX-UI-CAP-COLOR-01`
- Inputs:
  - 900/1000
  - 950/1000
  - 1000/1000
- Expected colors:
  - green, yellow, red

### `FX-UI-NO-AA-01`
- Queue contains no units with anti-air capability
- Expected: warning `NO_ANTI_AIR = true`

### `FX-TEL-ORDER-01`
- Full match telemetry stream
- Expected order:
  - first event `match_start`
  - last event `match_end`
