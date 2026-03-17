# WhatsApp Conversation Logger — Frontend Design

## Overview

React + Vite SPA for viewing WhatsApp bot conversations. Supabase Auth for user login, all data fetched through the backend API using JWT auth. Read-only chat interface — no sending messages.

## Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS + shadcn/ui (component library)
- React Router (client-side routing)
- `@supabase/supabase-js` (auth only)
- Plain `fetch` for API calls

## Project Structure

```
whatsapp_bot_frontend/
├── src/
│   ├── main.tsx                # App entry point
│   ├── App.tsx                 # Router + auth guard
│   ├── lib/
│   │   ├── supabase.ts         # Supabase Auth client
│   │   └── api.ts              # Backend API client (fetch wrapper with JWT)
│   ├── hooks/
│   │   ├── use-auth.ts         # Auth state hook (login, logout, session)
│   │   ├── use-conversations.ts # Fetch conversations list
│   │   └── use-messages.ts     # Fetch messages for a conversation
│   ├── pages/
│   │   ├── LoginPage.tsx       # Email/password login
│   │   ├── ConversationsPage.tsx # Phone number list
│   │   └── ChatPage.tsx        # Read-only chat view
│   ├── components/
│   │   ├── ConversationList.tsx # Phone number list with last message preview
│   │   ├── ChatBubble.tsx      # Single message bubble
│   │   ├── ChatView.tsx        # Scrollable message list
│   │   └── AuthGuard.tsx       # Redirect to login if not authenticated
│   └── types/
│       └── index.ts            # Shared types
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── components.json             # shadcn/ui config
├── package.json
└── .env.example
```

## Backend Changes Required

These changes must be implemented in `whatsapp_bot_backend` before the frontend can function.

### 1. Users table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
```

### 2. Dual auth middleware

The backend auth middleware must accept two token types:

- **Supabase JWT** — verify with `supabase.auth.getUser(token)`, look up `users.auth_id` to get `company_id`. Used by the frontend.
- **API key** — SHA-256 hash lookup in `api_keys`. Used by Make.com.

Detection: Try JWT verification first via `supabase.auth.getUser(token)`. If that returns a user, look up `users.auth_id`. If JWT verification fails (returns error), fall back to API key SHA-256 lookup.

### 3. GET /conversations endpoint

Returns all conversations for the authenticated company, using the `conversation_summary` view.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": "uuid",
        "phone_number": "+1234567890",
        "contact_name": "John",
        "last_message_content": "Hello",
        "last_message_at": "2026-03-17T00:00:00Z",
        "total_messages": 42
      }
    ]
  }
}
```

`last_message_content` and `last_message_at` may be `null` for conversations with no messages yet.

Sorted by `last_message_at` DESC (nulls last). Scoped to `company_id`.

### 4. CORS

Add `cors` package to backend. Allow the frontend origin (configurable via `CORS_ORIGIN` env var).

## Auth Flow

1. User visits app → `AuthGuard` checks Supabase session → no session → redirect to `/login`
2. User enters email/password → `supabase.auth.signInWithPassword()`
3. On success → session stored by Supabase SDK → redirect to `/`
4. API calls attach JWT from session as `Authorization: Bearer <jwt>`
5. Backend verifies JWT → looks up user → gets `company_id` → returns company-scoped data
6. Logout → `supabase.auth.signOut()` → redirect to `/login`
7. On 401 response from API → clear session → redirect to `/login` (handles expired/revoked tokens)

Users are created manually in Supabase Auth dashboard + a row in the `users` table.

## Pages

### Login Page (`/login`)

- Email + password form using shadcn/ui `Card`, `Input`, `Button`
- Calls `supabase.auth.signInWithPassword()`
- Shows error message on invalid credentials
- Redirects to `/` on success
- No signup form — admin creates users manually

### Conversations Page (`/`)

- Fetches `GET /conversations` from backend
- Displays list using shadcn/ui components (table or card layout)
- Each row shows: phone number, contact name, last message preview (truncated), timestamp, message count
- Conversations with no messages show "No messages yet"
- Sorted by most recent message first
- Search/filter bar to filter by phone number or contact name (client-side filter)
- Clicking a row navigates to `/chat/:conversationId`
- Loading, error, and empty states

### Chat Page (`/chat/:conversationId`)

- Fetches `GET /messages?phone_number=:phoneNumber` from backend (conversation ID mapped to phone number from conversations data or a separate lookup)
- WhatsApp-style chat layout:
  - Inbound messages: left-aligned, light background
  - Outbound messages: right-aligned, colored background
  - Each bubble: content text (or message type label for non-text like "Audio message"), timestamp
- Read-only — no input field
- Back button to return to conversations list
- Scrolls to bottom on load
- Header shows phone number + contact name
- "Load older messages" button at top for conversations with 100+ messages (fetches next page with offset)
- Loading and error states

## Components

### AuthGuard

Wrapper that checks `supabase.auth.getSession()`. Listens to `onAuthStateChange` for session changes. If no session, redirects to `/login`. Renders children if authenticated. Provides auth context to child components.

### ConversationList

Receives array of conversation summaries. Renders each as a clickable row/card. Handles the search/filter input. Handles null `last_message_content`. Uses shadcn/ui `Table` or `Card` components.

### ChatView

Receives array of messages and a loading flag. Renders scrollable container with `ChatBubble` components. Auto-scrolls to bottom on initial load. Shows "Load older messages" button at top if more pages exist.

### ChatBubble

Single message. Props: `direction`, `content`, `message_type`, `created_at`. Left/right aligned based on direction. Shows content for text messages, shows type label (e.g., "Audio message") for non-text. Timestamp below the bubble.

## API Client (`lib/api.ts`)

Thin fetch wrapper with error handling and session expiry detection:

```typescript
async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    let errorMessage = 'Request failed';
    try {
      const error = await res.json();
      errorMessage = error.error?.message || errorMessage;
    } catch {
      // Non-JSON error response (e.g., proxy error)
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
```

## Routing

| Route | Page | Auth Required |
|-------|------|:---:|
| `/login` | LoginPage | No |
| `/` | ConversationsPage | Yes |
| `/chat/:conversationId` | ChatPage | Yes |

React Router v6 with `BrowserRouter`. `AuthGuard` wraps protected routes. Route uses `conversationId` (UUID) instead of phone number to avoid URL encoding issues with `+` in E.164 numbers.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `VITE_API_URL` | Backend URL |
