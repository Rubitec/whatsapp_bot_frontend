import { useNavigate, useLocation } from 'react-router-dom';
import { useMessages } from '@/hooks/use-messages';
import { ChatView } from '@/components/ChatView';
import { Button } from '@/components/ui/button';

export function ChatPage() {
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
