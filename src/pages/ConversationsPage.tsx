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
