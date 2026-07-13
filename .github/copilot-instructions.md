# Update Tool repository guidance

This repository is a Vite + React + TypeScript frontend with an Express backend.

## Authentication strategy
- Replace the current custom local password login model with Clerk as the real identity layer.
- Do not treat the custom `pulse-users` localStorage records as the durable auth source of truth.
- Keep the existing employee report workflow, but bind it to the signed-in Clerk identity: use Clerk session user data (`user.id`, `user.emailAddresses`, `user.firstName`/`user.lastName`) to populate the current employee record.
- Preserve report persistence so submitted updates remain visible after logout and login.
- When a Clerk user signs in, the app should show the existing `Fill out report` widget and the normal dashboard flows instead of falling back to the old login path.

## Persistence and data safety
- Use the backend JSON file store as the persistent source for updates and user metadata where needed.
- Do not let the frontend delete stored reports or silently lose them after a re-login.
- If the app uses localStorage for fast UX, it must rehydrate from the backend and avoid clearing state on session changes.

## UX and theme direction
- Make the app feel sharper and more enterprise-grade: fewer rounded edges, dense spacing, strong dark background, and more geometric card treatments.
- Flatten buttons, cards, and sidebars; avoid soft pill shapes unless they are intentional for small badges.
- Keep the green success/accent treatment, but make the overall palette darker and more deliberate.

## Verification discipline
- After any fix, verify the repository diagnostics and build output.
- If an environment change is required, state what was changed and the exact evidence from the command output.
