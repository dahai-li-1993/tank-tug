# Factions and Identity

## Goal
Define race identity for `Beast`, `Alien`, and `Human` using StarCraft-style asymmetry while fitting one shared tug-of-war ruleset.

## Shared Constraints
- All races use the same `1000` max capacity.
- All races field both `Landed` and `Flying` units.
- All races access common core stats and targeting rules.
- Power is distributed differently: swarm, tech, or sustained fire.

## Beast
Fantasy:
- Biological swarm with rapid reinforcement and sacrifice value.

Mechanical identity:
- Best low-cost throughput per capacity.
- Strong surround and overrun patterns.
- Can spike with a few giant bio-beasts.

Expected weaknesses:
- Fragile anti-air without upgrades.
- Vulnerable to burst AoE and choke damage.

Racial passive concept:
- `Brood Momentum`: when a Beast unit dies, nearby Beast units gain short move/attack speed boost.

## Alien
Fantasy:
- High-tech psionic force with elite quality and shields.

Mechanical identity:
- High efficiency per unit, high upfront cost.
- Strong long-range and flying dominance.
- Durable with shield-first health model.

Expected weaknesses:
- Low unit count early if economy is weak.
- Poor recovery from repeated losses of expensive units.

Racial passive concept:
- `Phase Discipline`: first incoming burst each combat interval is partially absorbed by shields.

## Human
Fantasy:
- Flexible military with combined arms and steady economy.

Mechanical identity:
- Most adaptable roster and upgrade trees.
- Reliable anti-ground and anti-air parity.
- Good sustain through repair and ranged formations.

Expected weaknesses:
- Lower top-end scaling than perfect Alien tech.
- Less raw swarm pressure than Beast.

Racial passive concept:
- `Frontline Logistics`: landed mechanical units slowly self-repair out of combat.

## Race Selection Rules
- Player locks race at match start.
- No cross-race unit purchase within a match.
- Shared neutral upgrades exist, but race upgrades are exclusive.

## Tuning Knobs
- Base unit stat multipliers by race archetype.
- Upgrade scaling curves per race.
- Economy bonuses per race kept under hard caps to prevent runaway.
