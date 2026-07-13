---
mode: agent
description: "Use when migrating this Vite React app from the current custom local auth flow to Clerk, preserving the report workflow and applying the requested sharp-edge dark redesign."
---

# Fix the Update Tool auth and UI

Please work inside this repository and make the app production-safe.

## Goals
1. Replace the custom password-based login flow with Clerk-authenticated identity.
2. Preserve the existing `Fill out report` / daily check-in workflow for signed-in users.
3. Ensure submitted updates remain available after logout and login instead of disappearing.
4. Convert the visual system to a darker, sharper, more geometric palette with fewer rounded edges.
5. Verify the repo diagnostics/build output and report the evidence.

## Required repo-aware constraints
- This is a Vite + React + TypeScript frontend with an Express backend.
- Keep the existing dashboard/report interactions intact.
- Do not rely on local-only user persistence as the source of truth for identity.
- Use Clerk for sign-in/sign-up and signed-in state.
- Preserve backend notification/report persistence as the working data store.

## Implementation checklist
- Install/configure the proper Clerk SDK for the Vite app.
- Wrap the app in the Clerk provider and switch the login experience to `SignedIn` / `SignedOut` patterns.
- Map Clerk user identity to the current employee context used by the report widget.
- Keep report submission and update retrieval stable across session transitions.
- Update global tokens and component styles for sharper corners, darker surfaces, and stronger contrast.
- Run the relevant validation commands and summarize the exact result.

## Do not do
- Do not keep the old fragile password/user localStorage login path as the only identity flow.
- Do not break the dashboard or the employee report widget during the migration.
- Do not treat notification delivery failure as a report-save failure.
