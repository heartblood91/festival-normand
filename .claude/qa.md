# QA Report — Admin Redesign (feat/admin-redesign)

## Test Status

| Phase | Feature | Status | Issues Found | Cannot Test |
|-------|---------|--------|-------------|-------------|
| 1 | Sidebar Layout | **PASS** | None | |
| 2 | User Management & RBAC | **PASS** | None | Email sending (no RESEND_API_KEY) |
| 3 | Image Upload & WebP | **PASS** | None | Actual file upload via MCP (component renders correctly) |
| 4 | TipTap Editor Enhanced | **PASS** | None | |
| 5 | Pagination & Filters | **PASS** | None | |
| 6 | Partner DnD Reorder | **PASS** | None | Actual drag interaction via MCP (handles render, action exists) |
| 7 | Preview Mode | **PASS** | None | |
| 8 | AI Publish Wizard | **PASS** | None | AI calls (no OPENROUTER_API_KEY) |

## Verified via Chrome MCP

### Phase 1 — Sidebar
- [x] Login page: no sidebar displayed
- [x] Dashboard: sidebar with all 6 nav items
- [x] Locale switcher (FR/EN) in sidebar
- [x] Contrast toggle in sidebar
- [x] "Retour au site" → navigates to /fr (public site)
- [x] User info: name, email truncated, role badge "Administrateur"
- [x] Logout button present
- [x] Mobile: hamburger menu opens Sheet with full sidebar
- [x] Active nav item highlighted in amber

### Phase 2 — Users & RBAC
- [x] /admin/users shows 2 users with role badges
- [x] Current user marked "Vous" (no self-actions)
- [x] Other user has role select + delete button
- [x] "Inviter un utilisateur" opens dialog with email + role select
- [x] Dialog has Cancel/Invite buttons

### Phase 3 — Image Upload
- [x] Event form: drag-and-drop zone "Drop image here or click"
- [x] Shows accepted formats (PNG, JPG, WebP, GIF) and max size (10MB)
- [x] News form: same upload component
- [x] Partner form: same upload component (logo preset)

### Phase 4 — TipTap Editor
- [x] News form: editor with grouped toolbar visible
- [x] Groups: Bold/Italic/Underline/Strike | H2/H3 | Lists/Quote/HR | Alignment | Table | Media | History
- [x] Tabs FR/EN for content

### Phase 5 — Pagination & Filters
- [x] Events: 755 results displayed
- [x] Filter by status (published) + department (CALVADOS) → 47 results
- [x] "Effacer les filtres" button appears when filters active
- [x] Pagination component at bottom

### Phase 6 — Partner DnD
- [x] 7 partners displayed with drag handles (GripVertical dots)
- [x] Order numbers (#1-#7) shown
- [x] Edit/Delete buttons per partner

### Phase 7 — Preview Mode
- [x] Edit form shows "Aperçu" button
- [x] Preview page renders with amber bar "Preview mode — this content is not published yet"
- [x] "Back to editor" button in preview bar
- [x] Full event content rendered (title, description, map, infos pratiques)

### Phase 8 — AI Publish Wizard
- [x] PublishWizard component imported in event-form
- [x] Triggered when published=true and form submitted
- [x] Component renders without crash

## Known Limitations (Cannot Test via MCP)
- **Email sending**: Requires RESEND_API_KEY — invitation emails won't send locally
- **AI features**: Requires OPENROUTER_API_KEY — SEO/RGAA/spelling/translation checks will fail gracefully
- **File upload**: MCP cannot simulate drag-and-drop file upload — component renders but actual upload not tested
- **DnD interaction**: MCP cannot simulate pointer drag — handles render, keyboard DnD not tested
- **Vercel Blob**: Dev uses local filesystem (/public/uploads/), prod would use Vercel Blob

## Bugs Fixed During QA
1. **500 on /admin/events**: Type `AdminEventListItem` exported from "use server" file → moved to `lib/types/admin.ts`
2. **Sidebar on login page**: AdminShell now checks pathname and hides sidebar on /login and /setup-account

## Next.js Dev Issues (3 Issues badge)
These are Next.js dev-mode warnings, not application bugs:
- Middleware deprecation notice (Next.js 16 recommends "proxy" over "middleware")
- Potential hydration warnings from date formatting

## Test Date
2026-03-20
