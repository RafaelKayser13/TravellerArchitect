# Event System Directory Structure

This directory contains all game events, organized by domain.

## Structure

- **life/**: Events related to "Life Events" (generic table used by all careers).
- **agent/**: Career-specific events for Agent.
- **army/**: Career-specific events for Army.
- **marine/**: Career-specific events for Marine.
- **navy/**: Career-specific events for Navy.
- **scout/**: Career-specific events for Scout.
- **merchant/**: Career-specific events for Merchant.
- **scholar/**: Career-specific events for Scholar.
- **entertainer/**: Career-specific events for Entertainer.
- **citizen/**: Career-specific events for Citizen.
- **drifter/**: Career-specific events for Drifter.
- **rogue/**: Career-specific events for Rogue.
- **noble/**: Career-specific events for Noble.
- **prisoner/**: Events related to the Prisoner career/state.

## File Naming Convention

- `[domain]-events.ts`: Contains the main event table (2d6) for that career/domain.
- `[domain]-mishap-events.ts`: Contains the mishap table (1d6) for that career.
- `[specific]-event.ts`: Individual complex events (e.g., `neural-jack-install.event.ts`).
