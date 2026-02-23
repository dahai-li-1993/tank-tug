# UI and UX

## Goal
Make high-scale battles understandable while keeping buy/build interactions fast.

## Core Screens
- Main Menu
- Race Select
- Loadout + Build Shop
- Live Combat HUD
- End Match Summary

## Build Phase UI Requirements
- Race crest and doctrine summary always visible.
- Shop grouped by `Landed`, `Flying`, `Support`, `Massive`.
- Unit cards show:
  - Credit cost
  - Capacity cost
  - Damage profile icons (anti-ground/anti-air/anti-massive)
- Queue panel shows projected formation and total capacity.

## Combat HUD Requirements
- Top bar:
  - Round number
  - Timer
  - Core HP (both sides)
- Bottom panel:
  - Capacity used
  - Credits
  - Upgrade quick view
- Optional overlays toggled by hotkey:
  - Health bars
  - Target lines
  - Damage numbers

## Feedback and Clarity
- Distinct audio stingers:
  - Massive unit deployed
  - Core breached
  - Round won/lost
- Visual warnings:
  - No anti-air in army
  - Capacity overflow attempt
  - Economy decay from over-spending

## Input/Controls
- Mouse-first build interactions.
- Keyboard shortcuts for:
  - Buy/sell selected card
  - Toggle overlays
  - Lock shop
  - Confirm loadout

## Accessibility Baseline
- Colorblind-safe team colors.
- Scalable UI text sizes.
- Reduced VFX mode for visual overload control.
