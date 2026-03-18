import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { ConversationSummary } from '@/types';

interface ConversationListProps {
  conversations: ConversationSummary[];
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationList({ conversations }: ConversationListProps) {
  const navigate = useNavigate();

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Card
          key={conv.id}
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate(`/conversations/${conv.id}`, {
            state: { phoneNumber: conv.phone_number, contactName: conv.contact_name },
          })}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">
                  {conv.contact_name || conv.phone_number}
                </p>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {formatTime(conv.last_message_at)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                {conv.contact_name && (
                  <p className="text-xs text-muted-foreground">{conv.phone_number}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {conv.last_message || 'No messages yet'}
                </p>
                <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-2 shrink-0">
                  {conv.total_messages}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
