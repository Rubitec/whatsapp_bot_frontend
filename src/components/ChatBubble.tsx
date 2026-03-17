import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
}

const TYPE_LABELS: Record<string, string> = {
  audio: 'Audio message',
  image: 'Image',
  document: 'Document',
  order: 'Order',
  system: 'System message',
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isOutbound = message.direction === 'outbound';
  const displayContent =
    message.content || TYPE_LABELS[message.message_type] || message.message_type;

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 ${
          isOutbound
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{displayContent}</p>
        <p
          className={`text-xs mt-1 ${
            isOutbound ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
