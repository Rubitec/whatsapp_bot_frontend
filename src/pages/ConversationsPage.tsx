import { useState, useMemo } from 'react';
import { useConversations } from '@/hooks/use-conversations';
import { ConversationList } from '@/components/ConversationList';
import { Search } from 'lucide-react';

export function ConversationsPage() {
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
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 24 }}>
        Conversations
      </h1>

      <div style={{ position: 'relative', maxWidth: 400, marginBottom: 16 }}>
        <Search
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            color: '#9ca3af',
          }}
        />
        <input
          placeholder="Search by phone or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: 40,
            paddingRight: 16,
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 14,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            outline: 'none',
            backgroundColor: '#ffffff',
          }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Loading...</div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: '#ef4444', marginBottom: 8 }}>{error}</p>
          <button
            onClick={refetch}
            style={{
              fontSize: 14,
              color: '#E8546C',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && <ConversationList conversations={filtered} />}
    </div>
  );
}
