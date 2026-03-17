export interface ConversationSummary {
  conversation_id: string;
  phone_number: string;
  contact_name: string | null;
  last_message_content: string | null;
  last_message_at: string | null;
  total_messages: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'audio' | 'image' | 'document' | 'order' | 'system';
  content: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  phone_number: string;
  contact_name: string | null;
  created_at: string;
}

export interface MessagesResponse {
  success: boolean;
  data: {
    conversation: Conversation;
    messages: Message[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: ConversationSummary[];
  };
}
