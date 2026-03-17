# Onboarding / Signup Flow — Design

## Overview

Self-service signup that creates a Supabase Auth user, then completes onboarding by creating a company and user row in the database. Two-step process: auth first (Supabase SDK), then profile/company creation (backend API).

## Flow

1. User visits `/signup`, enters email + password
2. Frontend calls `supabase.auth.signUp({ email, password })` → session created
3. Frontend redirects to `/onboarding` with full name + company name form
4. Frontend calls `POST /auth/complete-signup` with JWT + `{ full_name, company_name }`
5. Backend verifies JWT, creates company (slug from name), creates user row (role: admin), returns success
6. Frontend redirects to `/`

## Incomplete Onboarding Handling

If a user signs up but doesn't complete onboarding (drops off between step 2 and 4):
- On next login, AuthGuard calls `GET /profile`
- If profile returns 401 (no user row in DB → JWT auth fails in middleware), redirect to `/onboarding`
- The `/onboarding` page detects they have a Supabase session but no user row, shows the completion form

## Backend Changes

### `POST /auth/complete-signup` (unauthenticated route, mounted under `/auth`)

**Request:**
```json
{
  "full_name": "John Doe",
  "company_name": "Acme Corp"
}
```

Requires `Authorization: Bearer <jwt>` header. The endpoint verifies the JWT manually (not through auth middleware since `/auth` routes are mounted before it).

**Logic:**
1. Verify JWT via `supabase.auth.getUser(token)`
2. Check no existing user row for this `auth_id` (prevent duplicate signup)
3. Generate slug from company_name (lowercase, replace spaces with hyphens, strip special chars)
4. Insert company row (name, slug, plan: 'free')
5. Insert user row (auth_id, company_id, email from JWT, full_name, role: 'admin')
6. Return `{ success: true }`

If company or user insert fails, return error (Supabase Auth user already exists, they can retry).

**Validation (Zod):**
- `full_name`: string, min 1, max 100
- `company_name`: string, min 1, max 100

**Error responses:**
- 400: validation failed
- 401: missing/invalid JWT
- 409: user already completed signup (user row exists)
- 409: company slug already taken

### Slug generation

`"Acme Corp"` → `"acme-corp"`, `"My Company!"` → `"my-company"`. If slug exists, append `-2`, `-3`, etc.

## Frontend Changes

### New: `/signup` page

- Form: email, password (min 6 chars)
- Calls `supabase.auth.signUp({ email, password })`
- On success: redirect to `/onboarding`
- On error: show error message
- Link: "Already have an account? Sign in"

### New: `/onboarding` page

- Requires Supabase session (redirect to `/signup` if none)
- Form: full name, company name
- Calls `POST /auth/complete-signup` with JWT
- On success: redirect to `/`
- On error: show error message

### Updated: Login page

- Add link: "Don't have an account? Sign up"

### Updated: AuthGuard

- After confirming session exists, call `GET /profile` to check if user row exists
- If profile fails (user has Supabase auth but no user row), redirect to `/onboarding`
- Cache the profile result to avoid repeated calls

## Routes

| Route | Page | Auth Required |
|-------|------|:---:|
| `/login` | LoginPage | No |
| `/signup` | SignupPage | No |
| `/onboarding` | OnboardingPage | Supabase session only |
| `/` | ConversationsPage | Yes (full) |
| `/chat/:conversationId` | ChatPage | Yes (full) |

## Environment Variables

No new env vars needed.
