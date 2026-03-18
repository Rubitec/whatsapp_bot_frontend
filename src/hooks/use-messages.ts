import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import type { Message, Conversation, MessagesResponse } from '@/types';

const PAGE_SIZE = 50;

export function useMessages(phoneNumber: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const oldestOffset = useRef(0);

  // Initial load: fetch the last page of messages
  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const encodedPhone = encodeURIComponent(phoneNumber);

      // First, get total count with limit=0
      const countRes = await apiClient<MessagesResponse>(
        `/messages?phone_number=${encodedPhone}&limit=1&offset=0`
      );

      const totalCount = countRes.data.pagination.total;
      setTotal(totalCount);
      setConversation(countRes.data.conversation);

      if (totalCount === 0) {
        setMessages([]);
        oldestOffset.current = 0;
        return;
      }

      // Calculate offset to get the last PAGE_SIZE messages
      const offset = Math.max(0, totalCount - PAGE_SIZE);
      const res = await apiClient<MessagesResponse>(
        `/messages?phone_number=${encodedPhone}&limit=${PAGE_SIZE}&offset=${offset}`
      );

      setMessages(res.data.messages);
      oldestOffset.current = offset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (phoneNumber) {
      fetchInitial();
    }
  }, [fetchInitial]);

  // Load older messages (scroll up)
  const loadMore = useCallback(async () => {
    if (oldestOffset.current <= 0 || loadingMore) return;

    try {
      setLoadingMore(true);

      const encodedPhone = encodeURIComponent(phoneNumber);
      const newOffset = Math.max(0, oldestOffset.current - PAGE_SIZE);
      const limit = oldestOffset.current - newOffset;

      const res = await apiClient<MessagesResponse>(
        `/messages?phone_number=${encodedPhone}&limit=${limit}&offset=${newOffset}`
      );

      setMessages((prev) => [...res.data.messages, ...prev]);
      oldestOffset.current = newOffset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more messages');
    } finally {
      setLoadingMore(false);
    }
  }, [phoneNumber, loadingMore]);

  const hasMore = oldestOffset.current > 0;

  return { messages, conversation, loading, loadingMore, error, hasMore, loadMore };
}
