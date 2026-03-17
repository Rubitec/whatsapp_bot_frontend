import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { Message, Conversation, MessagesResponse } from '@/types';

const PAGE_SIZE = 100;

export function useMessages(phoneNumber: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchMessages = useCallback(async (offset = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const encodedPhone = encodeURIComponent(phoneNumber);
      const res = await apiClient<MessagesResponse>(
        `/messages?phone_number=${encodedPhone}&limit=${PAGE_SIZE}&offset=${offset}`
      );

      setConversation(res.data.conversation);
      setTotal(res.data.pagination.total);

      if (offset === 0) {
        setMessages(res.data.messages);
      } else {
        // Prepend older messages
        setMessages((prev) => [...res.data.messages, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [phoneNumber]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const loadMore = useCallback(() => {
    fetchMessages(messages.length);
  }, [fetchMessages, messages.length]);

  const hasMore = messages.length < total;

  return { messages, conversation, loading, loadingMore, error, hasMore, loadMore };
}
