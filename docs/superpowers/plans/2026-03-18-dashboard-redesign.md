# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the app from standalone pages to a SaaS-style dashboard with persistent sidebar navigation, overview, contacts, and settings pages.

**Architecture:** Nested React Router layout with a `DashboardLayout` component wrapping all authenticated routes via `<Outlet>`. Sidebar provides navigation; settings uses a secondary horizontal tab bar. AuthGuard wraps the layout route.

**Tech Stack:** React Router v7 (nested routes + Outlet), Tailwind CSS, Lucide React icons, existing apiClient + hooks.

---

## File Structure

### New Files
- `src/components/Sidebar.tsx` — Sidebar navigation with logo, nav items, user profile
- `src/components/DashboardLayout.tsx` — Layout shell: sidebar + main content area with Outlet
- `src/pages/OverviewPage.tsx` — Stats cards + recent activity (placeholder data from conversations)
- `src/pages/ContactsPage.tsx` — Contacts table derived from conversations data
- `src/pages/settings/SettingsLayout.tsx` — Settings sub-navigation with horizontal tabs + Outlet
- `src/pages/settings/CompanySettingsPage.tsx` — View/edit company info
- `src/pages/settings/ApiKeysPage.tsx` — List/create/revoke API keys
- `src/pages/settings/ProfileSettingsPage.tsx` — View/edit user profile

### Modified Files
- `src/App.tsx` — Restructure routes to use nested layout
- `src/pages/ConversationsPage.tsx` — Remove standalone wrapper, remove sign-out button
- `src/pages/ChatPage.tsx` — Update back navigation to `/conversations`
- `src/components/ConversationList.tsx` — Update navigate path to `/conversations/:id`

---

### Task 1: Sidebar Component

**Files:**
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar component**

Sidebar with: BoundBird logo top, nav items (Overview, Conversations, Contacts, Settings) with Lucide icons, user email + sign out at bottom. Uses `useAuth` for session email and sign out. Uses `NavLink` for active state styling.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

### Task 2: DashboardLayout Component

**Files:**
- Create: `src/components/DashboardLayout.tsx`

- [ ] **Step 1: Create DashboardLayout**

Flex layout: Sidebar (w-60, fixed) + main content area (flex-1, overflow-y-auto) rendering `<Outlet />`.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

### Task 3: Update Routing

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Restructure routes**

Wrap all authenticated routes under a parent route with `DashboardLayout` element wrapped in `AuthGuard`. Nested routes: `/` → OverviewPage, `/conversations` → ConversationsPage, `/conversations/:conversationId` → ChatPage, `/contacts` → ContactsPage, `/settings` → SettingsLayout with children (index → CompanySettingsPage, `api-keys` → ApiKeysPage, `profile` → ProfileSettingsPage).

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

### Task 4: Update Existing Pages

**Files:**
- Modify: `src/pages/ConversationsPage.tsx`
- Modify: `src/pages/ChatPage.tsx`
- Modify: `src/components/ConversationList.tsx`

- [ ] **Step 1: Update ConversationsPage**

Remove outer div wrapper with max-w, remove sign-out button. Content fills the main area.

- [ ] **Step 2: Update ChatPage**

Change back navigation to `/conversations`. Remove max-w-2xl wrapper — use full width of content area. Update h-screen to h-full.

- [ ] **Step 3: Update ConversationList**

Change navigate path from `/chat/:id` to `/conversations/:id`.

- [ ] **Step 4: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

### Task 5: Overview Page

**Files:**
- Create: `src/pages/OverviewPage.tsx`

- [ ] **Step 1: Create OverviewPage**

Stats cards (total conversations, total messages, messages today) derived from conversations hook data. Recent conversations list (top 5). Placeholder chart area for message volume.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

### Task 6: Contacts Page

**Files:**
- Create: `src/pages/ContactsPage.tsx`

- [ ] **Step 1: Create ContactsPage**

Table showing contacts extracted from conversations: name, phone, last message date, total messages. Search/filter support.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

### Task 7: Settings Pages

**Files:**
- Create: `src/pages/settings/SettingsLayout.tsx`
- Create: `src/pages/settings/CompanySettingsPage.tsx`
- Create: `src/pages/settings/ApiKeysPage.tsx`
- Create: `src/pages/settings/ProfileSettingsPage.tsx`

- [ ] **Step 1: Create SettingsLayout**

Horizontal tab nav (Company, API Keys, Profile) using NavLink + `<Outlet />`.

- [ ] **Step 2: Create CompanySettingsPage**

Form to view/edit company name, phone, address, tax ID. Fetches from `/company` endpoint, saves via PUT/PATCH.

- [ ] **Step 3: Create ApiKeysPage**

Table of API keys (label, created, last used, active status). Create new key button with label input. Revoke key button. Shows newly created key once (with copy functionality).

- [ ] **Step 4: Create ProfileSettingsPage**

Form to view/edit user full name and email (read-only). Fetches from `/profile`.

- [ ] **Step 5: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

---

### Task 8: Final Verification

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`

- [ ] **Step 2: Visual review of all routes**

Verify all pages render correctly and navigation works.
