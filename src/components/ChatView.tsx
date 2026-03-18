import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import { DateSeparator } from '@/components/DateSeparator';
import type { Message } from '@/types';

interface ChatViewProps {
  messages: Message[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toDateString();
}

export function ChatView({ messages, hasMore, loadingMore, onLoadMore }: ChatViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const prevMessageCount = useRef(0);
  const [floatingDate, setFloatingDate] = useState<string | null>(null);
  const [showFloating, setShowFloating] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Build date groups: track which messages start a new date
  const dateBreaks = useMemo(() => {
    const breaks = new Set<string>();
    let lastDate = '';
    for (const msg of messages) {
      const dateKey = getDateKey(msg.created_at);
      if (dateKey !== lastDate) {
        breaks.add(msg.id);
        lastDate = dateKey;
      }
    }
    return breaks;
  }, [messages]);

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
        const children = container.children;
        const targetIndex = hasMore || loadingMore ? addedCount + 1 : addedCount;
        if (children[targetIndex]) {
          (children[targetIndex] as HTMLElement).scrollIntoView();
        }
      }
      prevMessageCount.current = messages.length;
    }
  }, [messages, hasMore, loadingMore]);

  // Handle scroll: load more + update floating date
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Load more
    if (!loadingMore && hasMore && container.scrollTop < 100) {
      onLoadMore();
    }

    // Find which date separator is closest to the top of the viewport
    const dateSeparators = container.querySelectorAll('[data-date-label]');
    let currentLabel: string | null = null;

    for (const el of dateSeparators) {
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (rect.top <= containerRect.top + 20) {
        currentLabel = el.getAttribute('data-date-label');
      } else {
        break;
      }
    }

    if (currentLabel) {
      setFloatingDate(currentLabel);
      setShowFloating(true);

      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setShowFloating(false), 1500);
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
        position: 'relative',
      }}
    >
      {/* Floating date header */}
      {floatingDate && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'opacity 0.3s',
            opacity: showFloating ? 1 : 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#374151',
              backgroundColor: '#ffffff',
              padding: '4px 14px',
              borderRadius: 9999,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            {floatingDate}
          </span>
        </div>
      )}

      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '8px 0', color: '#9ca3af', fontSize: 13 }}>
          Loading older messages...
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id}>
          {dateBreaks.has(msg.id) && (
            <div data-date-label={formatDateLabel(msg.created_at)}>
              <DateSeparator date={formatDateLabel(msg.created_at)} />
            </div>
          )}
          <ChatBubble message={msg} />
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
