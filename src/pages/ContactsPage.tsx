import { useState, useMemo } from 'react';
import { useConversations } from '@/hooks/use-conversations';
import { Search } from 'lucide-react';

export function ContactsPage() {
  const { conversations, loading } = useConversations();
  const [search, setSearch] = useState('');

  const contacts = useMemo(() => {
    const list = conversations.map((c) => ({
      phone: c.phone_number,
      name: c.contact_name,
      lastMessage: c.last_message_at,
      totalMessages: c.total_messages,
    }));

    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.phone.includes(q) ||
        c.name?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 24 }}>
        Contacts
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
          placeholder="Search contacts..."
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

      {loading ? (
        <div style={{ color: '#9ca3af', padding: '48px 0', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Last Message</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Messages</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}
                  >
                    No contacts found
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.phone}
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>
                      {contact.name || <span style={{ color: '#9ca3af' }}>Unknown</span>}
                    </td>
                    <td style={{ ...tdStyle, color: '#4b5563' }}>{contact.phone}</td>
                    <td style={{ ...tdStyle, color: '#6b7280' }}>{formatDate(contact.lastMessage)}</td>
                    <td style={{ ...tdStyle, color: '#4b5563', textAlign: 'right' }}>
                      {contact.totalMessages}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '12px 20px',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 20px',
  fontSize: 14,
};
