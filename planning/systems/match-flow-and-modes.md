# Match Flow and Modes

## Goal
Define round pacing and mode variants for the tug-of-war format.

## Standard Match Structure
- `Round Start (Build)`: 30-45 seconds
- `Combat`: up to 60 seconds
- `Resolution`: 5-8 seconds
- Repeat until victory condition met

## Victory Conditions
- Primary: enemy core HP reaches 0.
- Secondary (time cap): highest core HP at final round wins.
- Tiebreak: higher remaining deployed capacity, then total damage dealt.

## Core Health Model
- Recommended starting core HP: `5000`
- Surviving attackers deal weighted breakthrough damage:
  - Swarm/Line: low per-unit breakthrough
  - Heavy: medium breakthrough
  - Massive/Colossal: high breakthrough

## First Release Modes
- `1v1 Ranked` (primary)
- `1v1 Custom` (sandbox)
- `PvE Gauntlet` (scripted enemy builds)

## Future Mode Hooks
- `2v2 Shared Front` (ally coordination)
- `Draft Mode` (limited shop offerings)
- `Commander Mode` (hero + army)

## Round Timer Tuning Notes
- Shorter build favors execution speed and known metas.
- Longer build favors strategic adaptation and scouting.
- Use adaptive extension on first 3 rounds for onboarding.
