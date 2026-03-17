# WhatsApp Conversation Logger — Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React SPA to view WhatsApp conversations, plus required backend changes (users table, dual auth, conversations endpoint, CORS).

**Architecture:** Two phases — (1) backend changes in `whatsapp_bot_backend` repo, (2) new React + Vite frontend in `whatsapp_bot_frontend` repo. Backend gets dual auth (JWT + API key), a users table, a GET /conversations endpoint, and CORS. Frontend uses Supabase Auth for login and calls the backend API with JWTs.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, React Router v6

**Spec:** `docs/superpowers/specs/2026-03-17-whatsapp-frontend-design.md`

**Backend repo:** `/Users/mateorubinstein/Desktop/Rubitec/Projects/whatsapp_bot/whatsapp_bot_backend`
**Frontend repo:** `/Users/mateorubinstein/Desktop/Rubitec/Projects/whatsapp_bot/whatsapp_bot_frontend`

---

## File Map

### Backend changes (whatsapp_bot_backend)

| File | Action | Responsibility |
|------|--------|---------------|
| `sql/01_schema.sql` | Modify | Add users table |
| `src/middleware/auth.ts` | Modify | Dual auth (JWT + API key) |
| `src/routes/conversations.ts` | Create | GET /conversations endpoint |
| `src/index.ts` | Modify | Add CORS, mount conversations route |
| `tests/middleware/auth.test.ts` | Modify | Add JWT auth tests |
| `tests/routes/conversations.test.ts` | Create | Conversations endpoint tests |

### Frontend (whatsapp_bot_frontend)

| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies, scripts |
| `vite.config.ts` | Vite config |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind config |
| `postcss.config.js` | PostCSS for Tailwind |
| `components.json` | shadcn/ui config |
| `index.html` | HTML entry |
| `.env` | Env vars (not committed) |
| `.env.example` | Env var template |
| `.gitignore` | Ignore rules |
| `src/main.tsx` | React entry point |
| `src/App.tsx` | Router + layout |
| `src/index.css` | Tailwind imports + globals |
| `src/lib/utils.ts` | shadcn/ui cn() utility |
| `src/lib/supabase.ts` | Supabase Auth client |
| `src/lib/api.ts` | Backend API fetch wrapper |
| `src/types/index.ts` | Shared types |
| `src/hooks/use-auth.ts` | Auth state hook |
| `src/hooks/use-conversations.ts` | Fetch conversations |
| `src/hooks/use-messages.ts` | Fetch messages |
| `src/components/AuthGuard.tsx` | Auth protection wrapper |
| `src/components/ConversationList.tsx` | Phone number list |
| `src/components/ChatBubble.tsx` | Single message bubble |
| `src/components/ChatView.tsx` | Scrollable message list |
| `src/pages/LoginPage.tsx` | Login form |
| `src/pages/ConversationsPage.tsx` | Conversations list page |
| `src/pages/ChatPage.tsx` | Read-only chat page |

---

## Chunk 1: Backend Changes

### Task 1: Add users table to SQL schema

**Files:**
- Modify: `whatsapp_bot_backend/sql/01_schema.sql`

- [ ] **Step 1: Add users table to schema**

Append to the end of `sql/01_schema.sql` (before the view):

```sql
-- Users (maps Supabase Auth users to companies)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
```

- [ ] **Step 2: Add RLS policy for users table**

Append to `sql/02_rls.sql`:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_isolation ON users
  USING (company_id = current_setting('app.company_id')::UUID);
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mateorubinstein/Desktop/Rubitec/Projects/whatsapp_bot/whatsapp_bot_backend
git add sql/
git commit -m "feat: add users table to schema for Supabase Auth mapping"
```

---

### Task 2: Update auth middleware for dual auth (TDD)

**Files:**
- Modify: `whatsapp_bot_backend/src/middleware/auth.ts`
- Modify: `whatsapp_bot_backend/src/types/index.ts`
- Modify: `whatsapp_bot_backend/tests/middleware/auth.test.ts`

- [ ] **Step 1: Add UserRow type to types/index.ts**

Add to `src/types/index.ts`:

```typescript
export interface UserRow {
  id: string;
  auth_id: string;
  company_id: string;
  email: string;
  created_at: string;
  companies: {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
  };
}
```

- [ ] **Step 2: Write failing tests for JWT auth**

Add these tests to `tests/middleware/auth.test.ts`, in a new `describe('JWT auth')` block:

```typescript
describe('JWT auth', () => {
  const mockGetUser = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    // Mock supabase.auth.getUser
    const { supabase } = require('../../src/lib/supabase');
    supabase.auth = { getUser: mockGetUser };
  });

  const validUserRow = {
    id: 'user-uuid',
    auth_id: 'auth-uuid',
    company_id: 'company-uuid',
    email: 'test@example.com',
    companies: {
      id: 'company-uuid',
      name: 'Test Co',
      slug: 'test-co',
      is_active: true,
    },
  };

  function mockJwtAuth(authResult: unknown, userRow: unknown, userError: unknown = null) {
    mockGetUser.mockResolvedValueOnce(authResult);
    if (authResult?.data?.user) {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: userRow, error: userError }),
          }),
        }),
      });
    }
  }

  it('authenticates with valid Supabase JWT', async () => {
    mockJwtAuth(
      { data: { user: { id: 'auth-uuid' } }, error: null },
      validUserRow
    );

    const res = await request(app).get('/test').set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.valid-jwt');
    expect(res.status).toBe(200);
    expect(res.body.company).toEqual({
      id: 'company-uuid',
      name: 'Test Co',
      slug: 'test-co',
    });
  });

  it('falls back to API key when JWT verification fails', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'invalid' } });
    // Set up API key mock (falls back)
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: validApiKeyRow, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
      });

    const res = await request(app).get('/test').set('Authorization', `Bearer ${RAW_KEY}`);
    expect(res.status).toBe(200);
  });

  it('returns 401 when JWT user has no matching users row', async () => {
    mockJwtAuth(
      { data: { user: { id: 'auth-uuid' } }, error: null },
      null,
      { code: 'PGRST116' }
    );

    const res = await request(app).get('/test').set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.valid-jwt');
    expect(res.status).toBe(401);
  });

  it('returns 401 when JWT user company is inactive', async () => {
    mockJwtAuth(
      { data: { user: { id: 'auth-uuid' } }, error: null },
      { ...validUserRow, companies: { ...validUserRow.companies, is_active: false } }
    );

    const res = await request(app).get('/test').set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.valid-jwt');
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test -- tests/middleware/auth.test.ts
```

Expected: FAIL

- [ ] **Step 4: Implement dual auth middleware**

Replace `src/middleware/auth.ts` with:

```typescript
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { supabase } from '../lib/supabase';
import type { ApiKeyRow, UserRow } from '../types';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization' },
    });
    return;
  }

  const token = authHeader.slice(7);

  // Try JWT auth first
  const jwtResult = await tryJwtAuth(token);
  if (jwtResult) {
    req.company = jwtResult;
    next();
    return;
  }

  // Fall back to API key auth
  const apiKeyResult = await tryApiKeyAuth(token);
  if (apiKeyResult) {
    req.company = apiKeyResult.company;

    // Fire-and-forget: update last_used_at
    void supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyResult.keyId)
      .then(undefined, (err: unknown) => console.error('Failed to update last_used_at:', err));

    next();
    return;
  }

  res.status(401).json({
    error: { code: 'UNAUTHORIZED', message: 'Invalid authorization' },
  });
}

async function tryJwtAuth(token: string): Promise<{ id: string; name: string; slug: string } | null> {
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  const { data, error: userError } = await supabase
    .from('users')
    .select('id, auth_id, company_id, companies(id, name, slug, is_active)')
    .eq('auth_id', user.id)
    .single();

  if (userError || !data) {
    return null;
  }

  const row = data as unknown as UserRow;

  if (!row.companies.is_active) {
    return null;
  }

  return {
    id: row.companies.id,
    name: row.companies.name,
    slug: row.companies.slug,
  };
}

async function tryApiKeyAuth(token: string): Promise<{ company: { id: string; name: string; slug: string }; keyId: string } | null> {
  const keyHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, company_id, key_hash, is_active, companies(id, name, slug, is_active)')
    .eq('key_hash', keyHash)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as ApiKeyRow;

  if (!row.is_active || !row.companies.is_active) {
    return null;
  }

  return {
    company: {
      id: row.companies.id,
      name: row.companies.name,
      slug: row.companies.slug,
    },
    keyId: row.id,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- tests/middleware/auth.test.ts
```

Expected: All tests PASS

- [ ] **Step 6: Run ALL tests**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/middleware/auth.ts src/types/index.ts tests/middleware/auth.test.ts
git commit -m "feat: add dual auth middleware (Supabase JWT + API key)"
```

---

### Task 3: Add GET /conversations endpoint (TDD)

**Files:**
- Create: `whatsapp_bot_backend/src/routes/conversations.ts`
- Create: `whatsapp_bot_backend/tests/routes/conversations.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/routes/conversations.test.ts`:

```typescript
import express from 'express';
import request from 'supertest';
import { conversationsRouter } from '../../src/routes/conversations';
import { errorHandler } from '../../src/middleware/error-handler';
import { mockFrom } from '../setup';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.company = { id: 'company-uuid', name: 'Test Co', slug: 'test-co' };
    next();
  });
  app.use('/conversations', conversationsRouter);
  app.use(errorHandler);
  return app;
}

const mockConversationSummary = {
  conversation_id: 'conv-uuid',
  company_id: 'company-uuid',
  company_name: 'Test Co',
  phone_number: '+1234567890',
  contact_name: 'John',
  last_message_content: 'Hello',
  last_message_at: '2026-03-17T00:00:00Z',
  total_messages: 5,
};

describe('GET /conversations', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    jest.resetAllMocks();
  });

  it('returns 200 with list of conversations', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [mockConversationSummary],
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).get('/conversations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.conversations).toHaveLength(1);
    expect(res.body.data.conversations[0].conversation_id).toBe('conv-uuid');
  });

  it('returns empty array when no conversations', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).get('/conversations');
    expect(res.status).toBe(200);
    expect(res.body.data.conversations).toEqual([]);
  });

  it('queries conversation_summary view', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    await request(app).get('/conversations');
    expect(mockFrom).toHaveBeenCalledWith('conversation_summary');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/routes/conversations.test.ts
```

Expected: FAIL

- [ ] **Step 3: Implement conversations route**

Create `src/routes/conversations.ts`:

```typescript
import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/error-handler';

export const conversationsRouter = Router();

conversationsRouter.get('/', async (req: Request, res: Response) => {
  const companyId = req.company.id;

  const { data, error } = await supabase
    .from('conversation_summary')
    .select('*')
    .eq('company_id', companyId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Failed to fetch conversations');
  }

  res.json({
    success: true,
    data: {
      conversations: data || [],
    },
  });
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/routes/conversations.test.ts
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/conversations.ts tests/routes/conversations.test.ts
git commit -m "feat: add GET /conversations endpoint"
```

---

### Task 4: Add CORS and mount conversations route

**Files:**
- Modify: `whatsapp_bot_backend/src/index.ts`

- [ ] **Step 1: Install cors package**

```bash
npm install cors
npm install -D @types/cors
```

- [ ] **Step 2: Update src/index.ts**

Add CORS and conversations route to the app:

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimiter } from './middleware/rate-limit';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { messagesRouter } from './routes/messages';
import { conversationsRouter } from './routes/conversations';

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());

// Rate limiting
app.use(rateLimiter);

// Health check (before auth)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth
app.use(authMiddleware);

// Routes
app.use('/messages', messagesRouter);
app.use('/conversations', conversationsRouter);

// Error handler
app.use(errorHandler);

const port = process.env.PORT || process.env.API_PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { app };
```

- [ ] **Step 3: Run ALL tests**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: Compiles clean

- [ ] **Step 5: Commit and push**

```bash
git add src/index.ts package.json package-lock.json
git commit -m "feat: add CORS support and mount conversations route"
git push origin main
```

---

## Chunk 2: Frontend App

### Task 5: Scaffold React + Vite + Tailwind + shadcn/ui project

**Files:**
- Create all config files in `whatsapp_bot_frontend/`

- [ ] **Step 1: Create GitHub repo**

```bash
cd /Users/mateorubinstein/Desktop/Rubitec/Projects/whatsapp_bot
gh repo create Rubitec/whatsapp_bot_frontend --public --clone
cd whatsapp_bot_frontend
```

- [ ] **Step 2: Scaffold Vite project**

```bash
npm create vite@latest . -- --template react-ts
npm install
```

- [ ] **Step 3: Install dependencies**

```bash
npm install @supabase/supabase-js react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 4: Set up Tailwind**

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Replace `src/index.css` with:

```css
@import "tailwindcss";
```

- [ ] **Step 5: Set up shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted: use default style, default color, CSS variables: yes.

Then install needed components:

```bash
npx shadcn@latest add button card input label table
```

- [ ] **Step 6: Create .env and .env.example**

Create `.env`:
```
VITE_SUPABASE_URL=https://jhkioefdrvbuxatbfhqi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
```

Create `.env.example`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 7: Update .gitignore**

Make sure `.env` is in `.gitignore` (Vite template usually includes it).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold React + Vite + Tailwind + shadcn/ui project"
```

---

### Task 6: Types and lib files

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create src/types/index.ts**

```typescript
export interface ConversationSummary {
  conversation_id: string;
  phone_number: string;
  contact_name: string | null;
  last_message_content: string | null;
  last_message_at: string | null;
  total_messages: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'audio' | 'image' | 'document' | 'order' | 'system';
  content: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  phone_number: string;
  contact_name: string | null;
  created_at: string;
}

export interface MessagesResponse {
  success: boolean;
  data: {
    conversation: Conversation;
    messages: Message[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: ConversationSummary[];
  };
}
```

- [ ] **Step 2: Create src/lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 3: Create src/lib/api.ts**

```typescript
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Missing VITE_API_URL');
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

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
      // Non-JSON error response
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/ src/lib/
git commit -m "feat: add types, Supabase client, and API client"
```

---

### Task 7: Auth hook and AuthGuard

**Files:**
- Create: `src/hooks/use-auth.ts`
- Create: `src/components/AuthGuard.tsx`

- [ ] **Step 1: Create src/hooks/use-auth.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { session, loading, signIn, signOut };
}
```

- [ ] **Step 2: Create src/components/AuthGuard.tsx**

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-auth.ts src/components/AuthGuard.tsx
git commit -m "feat: add auth hook and AuthGuard component"
```

---

### Task 8: Data hooks

**Files:**
- Create: `src/hooks/use-conversations.ts`
- Create: `src/hooks/use-messages.ts`

- [ ] **Step 1: Create src/hooks/use-conversations.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { ConversationSummary, ConversationsResponse } from '@/types';

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<ConversationsResponse>('/conversations');
      setConversations(res.data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}
```

- [ ] **Step 2: Create src/hooks/use-messages.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { Message, Conversation, MessagesResponse } from '@/types';

const PAGE_SIZE = 100;

export function useMessages(phoneNumber: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchMessages = useCallback(async (offset = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const encodedPhone = encodeURIComponent(phoneNumber);
      const res = await apiClient<MessagesResponse>(
        `/messages?phone_number=${encodedPhone}&limit=${PAGE_SIZE}&offset=${offset}`
      );

      setConversation(res.data.conversation);
      setTotal(res.data.pagination.total);

      if (offset === 0) {
        setMessages(res.data.messages);
      } else {
        // Prepend older messages
        setMessages((prev) => [...res.data.messages, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [phoneNumber]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const loadMore = useCallback(() => {
    fetchMessages(messages.length);
  }, [fetchMessages, messages.length]);

  const hasMore = messages.length < total;

  return { messages, conversation, loading, loadingMore, error, hasMore, loadMore };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add conversations and messages data hooks"
```

---

### Task 9: Login page

**Files:**
- Create: `src/pages/LoginPage.tsx`

- [ ] **Step 1: Create src/pages/LoginPage.tsx**

```typescript
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">WhatsApp Logger</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/LoginPage.tsx
git commit -m "feat: add login page"
```

---

### Task 10: Conversations page + ConversationList

**Files:**
- Create: `src/components/ConversationList.tsx`
- Create: `src/pages/ConversationsPage.tsx`

- [ ] **Step 1: Create src/components/ConversationList.tsx**

```typescript
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { ConversationSummary } from '@/types';

interface ConversationListProps {
  conversations: ConversationSummary[];
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationList({ conversations }: ConversationListProps) {
  const navigate = useNavigate();

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Card
          key={conv.conversation_id}
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate(`/chat/${conv.conversation_id}`, {
            state: { phoneNumber: conv.phone_number, contactName: conv.contact_name },
          })}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">
                  {conv.contact_name || conv.phone_number}
                </p>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {formatTime(conv.last_message_at)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                {conv.contact_name && (
                  <p className="text-xs text-muted-foreground">{conv.phone_number}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {conv.last_message_content || 'No messages yet'}
                </p>
                <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-2 shrink-0">
                  {conv.total_messages}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create src/pages/ConversationsPage.tsx**

```typescript
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useConversations } from '@/hooks/use-conversations';
import { ConversationList } from '@/components/ConversationList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ConversationsPage() {
  const { signOut } = useAuth();
  const { conversations, loading, error, refetch } = useConversations();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.phone_number.includes(q) ||
        c.contact_name?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <Button variant="outline" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <Input
        placeholder="Search by phone or name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-2">{error}</p>
          <Button variant="outline" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!loading && !error && <ConversationList conversations={filtered} />}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ConversationList.tsx src/pages/ConversationsPage.tsx
git commit -m "feat: add conversations page with search and list"
```

---

### Task 11: Chat page + ChatBubble + ChatView

**Files:**
- Create: `src/components/ChatBubble.tsx`
- Create: `src/components/ChatView.tsx`
- Create: `src/pages/ChatPage.tsx`

- [ ] **Step 1: Create src/components/ChatBubble.tsx**

```typescript
import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
}

const TYPE_LABELS: Record<string, string> = {
  audio: 'Audio message',
  image: 'Image',
  document: 'Document',
  order: 'Order',
  system: 'System message',
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isOutbound = message.direction === 'outbound';
  const displayContent =
    message.content || TYPE_LABELS[message.message_type] || message.message_type;

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 ${
          isOutbound
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{displayContent}</p>
        <p
          className={`text-xs mt-1 ${
            isOutbound ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/ChatView.tsx**

```typescript
import { useEffect, useRef } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types';

interface ChatViewProps {
  messages: Message[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export function ChatView({ messages, hasMore, loadingMore, onLoadMore }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
      initialLoad.current = false;
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {hasMore && (
        <div className="text-center mb-4">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load older messages'}
          </Button>
        </div>
      )}

      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
```

- [ ] **Step 3: Create src/pages/ChatPage.tsx**

```typescript
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMessages } from '@/hooks/use-messages';
import { ChatView } from '@/components/ChatView';
import { Button } from '@/components/ui/button';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const phoneNumber = (location.state as { phoneNumber?: string })?.phoneNumber || '';
  const contactName = (location.state as { contactName?: string })?.contactName;

  const { messages, conversation, loading, loadingMore, error, hasMore, loadMore } =
    useMessages(phoneNumber);

  const displayName = contactName || conversation?.contact_name || phoneNumber;
  const displayPhone = conversation?.phone_number || phoneNumber;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          &larr; Back
        </Button>
        <div>
          <p className="font-medium">{displayName}</p>
          {displayName !== displayPhone && (
            <p className="text-xs text-muted-foreground">{displayPhone}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      {loading && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <ChatView
          messages={messages}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ChatBubble.tsx src/components/ChatView.tsx src/pages/ChatPage.tsx
git commit -m "feat: add chat page with read-only message view"
```

---

### Task 12: App router and entry point

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Update src/App.tsx**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { LoginPage } from '@/pages/LoginPage';
import { ConversationsPage } from '@/pages/ConversationsPage';
import { ChatPage } from '@/pages/ChatPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <ConversationsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <AuthGuard>
              <ChatPage />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Update src/main.tsx**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 3: Clean up unused Vite template files**

Remove any Vite template files that are no longer needed: `src/App.css`, `src/assets/react.svg`, etc.

- [ ] **Step 4: Verify it compiles**

```bash
npm run build
```

Expected: Compiles clean

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add routing with AuthGuard for protected pages"
```

---

### Task 13: Final verification and push

- [ ] **Step 1: Run dev server and verify**

```bash
npm run dev
```

Verify: login page renders at `http://localhost:5173/login`

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: Compiles clean

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```
