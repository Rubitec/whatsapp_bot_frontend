import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/use-conversations';
import { MessageSquare, Users, TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
}

function StatCard({ icon, iconBg, label, value }: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{label}</span>
      </div>
      <p style={{ fontSize: 30, fontWeight: 600, color: '#111827' }}>{value}</p>
    </div>
  );
}

export function OverviewPage() {
  const { conversations, loading } = useConversations();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce((sum, c) => sum + c.total_messages, 0);

    const today = new Date().toDateString();
    const messagesToday = conversations.filter(
      (c) => c.last_message_at && new Date(c.last_message_at).toDateString() === today
    ).length;

    return { totalConversations, totalMessages, messagesToday };
  }, [conversations]);

  const recentConversations = useMemo(() => {
    return [...conversations]
      .sort((a, b) => {
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [conversations]);

  function formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 24 }}>
          Overview
        </h1>
        <div style={{ color: '#9ca3af' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 24 }}>
        Overview
      </h1>

      {/* Stats cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          icon={<MessageSquare style={{ width: 20, height: 20, color: '#2563eb' }} />}
          iconBg="#eff6ff"
          label="Total Conversations"
          value={stats.totalConversations}
        />
        <StatCard
          icon={<TrendingUp style={{ width: 20, height: 20, color: '#16a34a' }} />}
          iconBg="#f0fdf4"
          label="Total Messages"
          value={stats.totalMessages.toLocaleString()}
        />
        <StatCard
          icon={<Users style={{ width: 20, height: 20, color: '#9333ea' }} />}
          iconBg="#faf5ff"
          label="Active Today"
          value={stats.messagesToday}
        />
      </div>

      {/* Recent conversations */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
            Recent Conversations
          </h2>
        </div>
        {recentConversations.length === 0 ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: 14,
            }}
          >
            No conversations yet
          </div>
        ) : (
          <div>
            {recentConversations.map((conv, i) => (
              <button
                key={conv.conversation_id}
                onClick={() =>
                  navigate(`/conversations/${conv.conversation_id}`, {
                    state: { phoneNumber: conv.phone_number, contactName: conv.contact_name },
                  })
                }
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  border: 'none',
                  borderBottom: i < recentConversations.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {conv.contact_name || conv.phone_number}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 2,
                    }}
                  >
                    {conv.last_message_content || 'No messages'}
                  </p>
                </div>
                <div style={{ marginLeft: 16, textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{formatTime(conv.last_message_at)}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {conv.total_messages} msgs
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
