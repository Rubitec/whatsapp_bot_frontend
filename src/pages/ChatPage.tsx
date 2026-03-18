import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMessages } from '@/hooks/use-messages';
import { ChatView } from '@/components/ChatView';
import { ArrowLeft } from 'lucide-react';

export function ChatPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const location = useLocation();

  const phoneNumber = (location.state as { phoneNumber?: string })?.phoneNumber || '';
  const contactName = (location.state as { contactName?: string })?.contactName;

  const { messages, conversation, loading, loadingMore, error, hasMore, loadMore } =
    useMessages(phoneNumber);

  const displayName = contactName || conversation?.contact_name || phoneNumber;
  const displayPhone = conversation?.phone_number || phoneNumber;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
        }}
      >
        <button
          onClick={() => navigate('/conversations')}
          style={{
            padding: 6,
            color: '#6b7280',
            borderRadius: 6,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
        <div>
          <p style={{ fontWeight: 500, color: '#111827', fontSize: 15 }}>{displayName}</p>
          {displayName !== displayPhone && (
            <p style={{ fontSize: 12, color: '#6b7280' }}>{displayPhone}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      {loading && (
        <div style={{ flex: 1, overflowY: 'hidden', padding: 16 }}>
          {[...Array(8)].map((_, i) => {
            const isOutbound = i % 3 !== 0;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: isOutbound ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: [180, 240, 160, 220, 200, 260, 140, 190][i],
                    height: i === 2 || i === 5 ? 48 : 36,
                    borderRadius: 12,
                    backgroundColor: isOutbound ? '#f0e6e8' : '#f3f4f6',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ color: '#ef4444', marginBottom: 8 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
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
