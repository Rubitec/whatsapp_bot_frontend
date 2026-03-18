export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member';
  created_at: string;
}

export interface CompanyFull {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  label: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  phone_number: string;
  contact_name: string | null;
  last_message: string | null;
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

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
    company: CompanyFull | null;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export interface CompanyResponse {
  success: boolean;
  data: CompanyFull;
}

export interface ApiKeysResponse {
  success: boolean;
  data: ApiKey[];
}

export interface OverviewData {
  total_conversations: number;
  total_messages: number;
  active_today: number;
  recent_conversations: ConversationSummary[];
}

export interface OverviewResponse {
  success: boolean;
  data: OverviewData;
}

export interface CreateApiKeyResponse {
  success: boolean;
  data: {
    id: string;
    key: string;
    label: string | null;
    created_at: string;
  };
}
