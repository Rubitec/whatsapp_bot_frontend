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
