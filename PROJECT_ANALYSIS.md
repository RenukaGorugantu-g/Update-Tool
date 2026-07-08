# Project Analysis and Redesign Plan

## 1. Current architecture summary
- Frontend: React + TypeScript + Vite with a single context-based state store in src/context/PulseContext.tsx.
- Backend: Express server in server/index.js with file-based persistence for users, updates, and Gmail OAuth tokens.
- Data storage: JSON files on disk rather than a database.
- Authentication: Simple local login against seeded users and stored passwords.
- Notifications: Existing flow supports Gmail and Google Chat integrations, but the UI experience is heavier than necessary and most of the workflow is concentrated in one large employee dashboard component.

## 2. What the app currently does
- Allows employees to submit daily updates with sections for completed work, current work, blockers, project, and priority.
- Stores updates locally and also syncs to the backend when available.
- Supports admin and executive dashboards for monitoring and user management.
- Has Gmail OAuth and Google Chat webhook-based integrations.
- Includes mocked email/chat activity and a basic AI assistant experience.

## 3. Pain points
- The submission form is too dense for a first-time employee.
- Voice transcription, file uploads, priority selection, and project choice all compete for attention.
- The workflow requires more cognitive effort than necessary for a three-question daily check-in.
- Notification handling is present but not surfaced clearly as a delivery-status experience.
- The navigation includes several sections that feel more exploratory than operational for a daily-use employee.

## 4. UX audit summary
### High severity
- Too many controls in the main update experience.
- The current form mixes “daily update” with advanced features such as voice AI and attachments.
- The success and error state feedback is not centralised.

### Medium severity
- Navigation has more sections than needed for a day-to-day employee workflow.
- There is no clear, simple review step before submission.
- Status and notification outcomes are not visible enough to admins.

### Low severity
- Some labels and cards feel overly product-heavy for an internal tool.
- Spacing and hierarchy can be improved to make the primary action clearer.

## 5. DailyBot-inspired redesign direction
- Simplify the main experience to a short three-question update flow.
- Keep the brand and business logic intact while making the workflow feel calmer, faster, and more guided.
- Make the primary action obvious: submit update.
- Surface notification outcomes clearly after submission.

## 6. Planned implementation
- Refactor the employee update experience into a cleaner, single-card workflow.
- Keep submission logic, persistence, and integrations intact.
- Add a reusable server-side notification service for Gmail and Google Chat.
- Expose delivery status for each submitted update in the UI.
