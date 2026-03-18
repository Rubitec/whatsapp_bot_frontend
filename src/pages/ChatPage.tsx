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
      {loading && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
          }}
        >
          Loading...
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
