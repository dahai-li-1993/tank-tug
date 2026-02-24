# Unit Rosters v1 (Concrete Numbers)

## Scope
Concrete baseline roster for first playable balance pass:
- `Beast`: 12 units (8 Landed, 4 Flying)
- `Alien`: 12 units (8 Landed, 4 Flying)
- `Human`: 12 units (8 Landed, 4 Flying)

Notes:
- `DPS = AttackDamage / AttackCooldown`
- `MoveSpeed` is relative units per second
- Values are tuning baselines, not final live balance

## Beast Roster v1

| Unit | Layer | Role | CostCredits | CapacityCost | MaxHP | ShieldHP | AttackDamage | AttackCooldown | DPS | AttackRange | MoveSpeed | TargetRule | Armor | Tags |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| Fangling | Landed | Swarm Melee | 35 | 2 | 55 | 0 | 8 | 0.55 | 14.5 | 0.9 | 2.8 | GroundOnly | 0 | Biological, Light |
| Spine Spitter | Landed | Anti-Air Skirmisher | 55 | 3 | 70 | 0 | 10 | 0.80 | 12.5 | 4.8 | 2.5 | Both | 0 | Biological, Light |
| Carapace Brute | Landed | Frontline Tank | 95 | 8 | 260 | 0 | 20 | 1.20 | 16.7 | 1.1 | 1.9 | GroundOnly | 2 | Biological, Armored |
| Acid Ravager | Landed | Anti-Armor DPS | 130 | 12 | 230 | 0 | 44 | 1.60 | 27.5 | 2.2 | 2.0 | GroundOnly | 1 | Biological, Armored |
| Burrow Artillery | Landed | Siege AoE | 180 | 22 | 280 | 0 | 58 | 2.20 | 26.4 | 8.0 | 1.4 | GroundOnly | 1 | Biological, Siege, AoE |
| Brood Warden | Landed | Support Aura | 210 | 18 | 420 | 0 | 22 | 1.00 | 22.0 | 3.0 | 1.7 | Both | 2 | Biological, Support |
| Apex Behemoth | Landed | Massive Bruiser | 520 | 125 | 3500 | 0 | 170 | 2.20 | 77.3 | 1.8 | 1.4 | GroundOnly | 6 | Biological, Massive |
| Worldmaw Titan | Landed | Colossal Siege | 980 | 250 | 8200 | 0 | 410 | 3.80 | 107.9 | 5.0 | 1.0 | Both | 8 | Biological, Massive, Siege, AoE |
| Mite Swarm | Flying | Light Harass | 75 | 5 | 95 | 0 | 14 | 0.75 | 18.7 | 3.0 | 3.3 | GroundOnly | 0 | Biological, Light |
| Talon Flier | Flying | Interceptor | 125 | 10 | 180 | 0 | 26 | 0.95 | 27.4 | 4.5 | 3.5 | Both | 1 | Biological, Armored |
| Plague Wyvern | Flying | Bomber AoE | 280 | 35 | 620 | 0 | 72 | 2.00 | 36.0 | 5.5 | 2.6 | GroundOnly | 2 | Biological, Armored, AoE |
| Sky Leviathan | Flying | Massive Air Control | 640 | 145 | 4400 | 0 | 190 | 2.40 | 79.2 | 6.0 | 1.9 | Both | 6 | Biological, Massive |

## Alien Roster v1

| Unit | Layer | Role | CostCredits | CapacityCost | MaxHP | ShieldHP | AttackDamage | AttackCooldown | DPS | AttackRange | MoveSpeed | TargetRule | Armor | Tags |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| Prism Adept | Landed | Light Ranged | 50 | 3 | 80 | 40 | 13 | 0.80 | 16.3 | 5.0 | 2.3 | GroundOnly | 0 | Psionic, Light |
| Pulse Sentry | Landed | Early Anti-Air | 75 | 5 | 95 | 70 | 16 | 0.95 | 16.8 | 5.5 | 2.1 | Both | 0 | Psionic, Light, Support |
| Warp Lancer | Landed | Anti-Armor | 120 | 10 | 180 | 90 | 38 | 1.50 | 25.3 | 2.0 | 2.2 | GroundOnly | 1 | Psionic, Armored |
| Arc Stalker | Landed | Mobile DPS | 155 | 14 | 220 | 120 | 36 | 1.05 | 34.3 | 5.5 | 2.4 | Both | 1 | Psionic, Armored |
| Phase Colossus | Landed | Long Siege Beam | 340 | 42 | 520 | 260 | 78 | 1.80 | 43.3 | 8.5 | 1.7 | GroundOnly | 3 | Psionic, Massive, Siege, AoE |
| Aegis Templar | Landed | Support Caster | 260 | 20 | 210 | 260 | 30 | 1.20 | 25.0 | 4.0 | 2.0 | Both | 1 | Psionic, Support |
| Void Juggernaut | Landed | Massive Anchor | 560 | 135 | 2600 | 1800 | 160 | 2.00 | 80.0 | 3.8 | 1.3 | Both | 6 | Psionic, Massive |
| Celestial Ark | Landed | Colossal Artillery | 1020 | 260 | 4600 | 4200 | 360 | 3.40 | 105.9 | 9.0 | 0.9 | Both | 8 | Psionic, Massive, Siege, AoE |
| Needle Ray | Flying | Interceptor | 115 | 9 | 150 | 90 | 28 | 0.85 | 32.9 | 5.2 | 3.4 | Both | 1 | Psionic, Light |
| Rift Bomber | Flying | Ground Burst | 250 | 30 | 380 | 260 | 86 | 2.10 | 41.0 | 5.8 | 2.7 | GroundOnly | 2 | Psionic, Armored, AoE |
| Oracle Frigate | Flying | Utility Support | 300 | 24 | 320 | 320 | 34 | 1.00 | 34.0 | 6.5 | 2.9 | Both | 2 | Psionic, Support |
| Star Devourer | Flying | Massive Air Siege | 700 | 155 | 3000 | 2200 | 210 | 2.50 | 84.0 | 6.8 | 1.8 | Both | 6 | Psionic, Massive |

## Human Roster v1

| Unit | Layer | Role | CostCredits | CapacityCost | MaxHP | ShieldHP | AttackDamage | AttackCooldown | DPS | AttackRange | MoveSpeed | TargetRule | Armor | Tags |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| Rifle Trooper | Landed | Core Ranged | 45 | 3 | 80 | 0 | 12 | 0.75 | 16.0 | 4.8 | 2.3 | Both | 0 | Biological, Light |
| Jet Skirmisher | Landed | Fast Anti-Air | 65 | 4 | 90 | 0 | 14 | 0.70 | 20.0 | 4.5 | 2.8 | Both | 0 | Biological, Light |
| Bulwark Mech | Landed | Frontline Tank | 105 | 9 | 300 | 0 | 21 | 1.20 | 17.5 | 1.2 | 1.8 | GroundOnly | 3 | Mechanical, Armored |
| Railgun Walker | Landed | Anti-Massive | 160 | 15 | 240 | 0 | 62 | 1.80 | 34.4 | 6.2 | 1.9 | Both | 1 | Mechanical, Armored |
| Siege Platform | Landed | Long Range AoE | 220 | 26 | 330 | 0 | 74 | 2.20 | 33.6 | 8.8 | 1.3 | GroundOnly | 1 | Mechanical, Siege, AoE |
| Field Medic Drone | Landed | Sustain Support | 170 | 12 | 180 | 0 | 8 | 1.00 | 8.0 | 3.5 | 2.0 | Both | 0 | Mechanical, Support |
| Atlas Dreadnought | Landed | Massive Brawler | 540 | 130 | 4300 | 0 | 180 | 2.30 | 78.3 | 2.0 | 1.2 | GroundOnly | 7 | Mechanical, Massive |
| Fortress Crawler | Landed | Colossal Breaker | 990 | 250 | 9000 | 0 | 380 | 3.50 | 108.6 | 5.8 | 0.8 | Both | 9 | Mechanical, Massive, Siege, AoE |
| Wasp Fighter | Flying | Interceptor | 120 | 10 | 220 | 0 | 30 | 0.90 | 33.3 | 5.2 | 3.6 | Both | 1 | Mechanical, Light |
| Bombard Gunship | Flying | Ground AoE | 260 | 32 | 680 | 0 | 84 | 2.00 | 42.0 | 5.8 | 2.4 | GroundOnly | 2 | Mechanical, Armored, AoE |
| Valkyrie Support Ship | Flying | Hybrid Support | 320 | 25 | 520 | 0 | 36 | 0.95 | 37.9 | 6.5 | 2.8 | Both | 2 | Mechanical, Support |
| Leviathan Carrier | Flying | Massive Air Flagship | 710 | 160 | 5200 | 0 | 220 | 2.60 | 84.6 | 6.5 | 1.7 | Both | 7 | Mechanical, Massive |

## Quick Validation Against System Requirements
- 8 Landed + 4 Flying per race: `Pass`
- At least 2 early anti-air options per race: `Pass`
- At least 2 anti-massive options per race: `Pass`
- At least 1 siege option per race: `Pass`
- At least 1 support option per race: `Pass`

## Capacity Composition Examples (1000 Cap)
- Swarm Beast example:
  - 120x Fangling (240 cap)
  - 80x Spine Spitter (240 cap)
  - 20x Carapace Brute (160 cap)
  - 8x Burrow Artillery (176 cap)
  - 4x Plague Wyvern (140 cap)
  - Total: `956` cap
- Elite Alien example:
  - 2x Celestial Ark (520 cap)
  - 2x Void Juggernaut (270 cap)
  - 6x Arc Stalker (84 cap)
  - 4x Needle Ray (36 cap)
  - 2x Aegis Templar (40 cap)
  - Total: `950` cap
- Combined Arms Human example:
  - 1x Fortress Crawler (250 cap)
  - 1x Atlas Dreadnought (130 cap)
  - 8x Bulwark Mech (72 cap)
  - 10x Railgun Walker (150 cap)
  - 8x Rifle Trooper (24 cap)
  - 4x Wasp Fighter (40 cap)
  - 6x Bombard Gunship (192 cap)
  - 6x Field Medic Drone (72 cap)
  - Total: `930` cap

## Codex-Testable Requirements
- `RST-001`: all unit names are unique across full table.
- `RST-002`: displayed DPS equals recomputed DPS (`AttackDamage / AttackCooldown`) within tolerance.
- `RST-003`: all colossal entries use capacity in `181-300`.
- `RST-004`: documented example armies do not exceed `1000` capacity.
