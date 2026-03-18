import { useEffect, useRef, useCallback } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import type { Message } from '@/types';

interface ChatViewProps {
  messages: Message[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export function ChatView({ messages, hasMore, loadingMore, onLoadMore }: ChatViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const prevMessageCount = useRef(0);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
      isInitialLoad.current = false;
      prevMessageCount.current = messages.length;
    }
  }, [messages]);

  // Preserve scroll position when older messages are prepended
  useEffect(() => {
    if (!isInitialLoad.current && messages.length > prevMessageCount.current) {
      const container = containerRef.current;
      if (container) {
        const addedCount = messages.length - prevMessageCount.current;
        // Find the element that was previously at the top and scroll to it
        const children = container.children;
        // Account for the loading indicator at position 0
        const targetIndex = hasMore || loadingMore ? addedCount + 1 : addedCount;
        if (children[targetIndex]) {
          (children[targetIndex] as HTMLElement).scrollIntoView();
        }
      }
      prevMessageCount.current = messages.length;
    }
  }, [messages, hasMore, loadingMore]);

  // Scroll-to-top detection for loading older messages
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || loadingMore || !hasMore) return;

    if (container.scrollTop < 100) {
      onLoadMore();
    }
  }, [loadingMore, hasMore, onLoadMore]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
      }}
    >
      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '8px 0', color: '#9ca3af', fontSize: 13 }}>
          Loading older messages...
        </div>
      )}

      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
