import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverview } from '@/hooks/use-overview';
import { StatCard } from '@/components/StatCard';
import { StatCardSkeleton } from '@/components/StatCardSkeleton';
import { ConversationRowSkeleton } from '@/components/ConversationRowSkeleton';
import { MessageSquare, Users, TrendingUp } from 'lucide-react';

type PresetFilter =
  | 'this_month'
  | 'last_30'
  | 'last_60'
  | 'last_90'
  | 'this_year'
  | 'last_year'
  | 'custom';

const PRESET_LABELS: Record<PresetFilter, string> = {
  this_month: 'This Month',
  last_30: 'Last 30 Days',
  last_60: 'Last 60 Days',
  last_90: 'Last 90 Days',
  this_year: 'This Year',
  last_year: 'Last Year',
  custom: 'Custom',
};

function getPresetRange(preset: PresetFilter): { from: Date; to: Date } {
  const now = new Date();
  const to = now;

  switch (preset) {
    case 'this_month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to };
    case 'last_30':
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to };
    case 'last_60':
      return { from: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), to };
    case 'last_90':
      return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to };
    case 'this_year':
      return { from: new Date(now.getFullYear(), 0, 1), to };
    case 'last_year':
      return {
        from: new Date(now.getFullYear() - 1, 0, 1),
        to: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59),
      };
    default:
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to };
  }
}

function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function OverviewPage() {
  const navigate = useNavigate();
  const [preset, setPreset] = useState<PresetFilter>('this_month');
  const [customFrom, setCustomFrom] = useState(() => toDateInputValue(new Date()));
  const [customTo, setCustomTo] = useState(() => toDateInputValue(new Date()));

  const { from, to } = useMemo(() => {
    if (preset === 'custom') {
      return {
        from: new Date(customFrom + 'T00:00:00.000Z').toISOString(),
        to: new Date(customTo + 'T23:59:59.999Z').toISOString(),
      };
    }
    const range = getPresetRange(preset);
    return { from: range.from.toISOString(), to: range.to.toISOString() };
  }, [preset, customFrom, customTo]);

  const { data, loading } = useOverview(from, to);

  const handlePresetChange = useCallback((value: PresetFilter) => {
    setPreset(value);
    if (value === 'custom') {
      const range = getPresetRange('this_month');
      setCustomFrom(toDateInputValue(range.from));
      setCustomTo(toDateInputValue(range.to));
    }
  }, []);

  function formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header with filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827' }}>Overview</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value as PresetFilter)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {Object.entries(PRESET_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {preset === 'custom' && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: 13,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  outline: 'none',
                }}
              />
              <span style={{ color: '#9ca3af', fontSize: 13 }}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: 13,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  outline: 'none',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      {/* Stats cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={<MessageSquare style={{ width: 20, height: 20, color: '#2563eb' }} />}
              iconBg="#eff6ff"
              label="Conversations"
              value={data?.total_conversations ?? 0}
            />
            <StatCard
              icon={<TrendingUp style={{ width: 20, height: 20, color: '#16a34a' }} />}
              iconBg="#f0fdf4"
              label="Messages"
              value={(data?.total_messages ?? 0).toLocaleString()}
            />
            <StatCard
              icon={<Users style={{ width: 20, height: 20, color: '#9333ea' }} />}
              iconBg="#faf5ff"
              label="Active Today"
              value={data?.active_today ?? 0}
            />
          </>
        )}
      </div>

      {/* Recent conversations */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
            Recent Conversations
          </h2>
        </div>
        {loading ? (
          <div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                <ConversationRowSkeleton />
              </div>
            ))}
          </div>
        ) : !data?.recent_conversations.length ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: 14,
            }}
          >
            No conversations in this period
          </div>
        ) : (
          <div>
            {data.recent_conversations.map((conv, i) => (
              <button
                key={conv.id}
                onClick={() =>
                  navigate(`/conversations/${conv.id}`, {
                    state: { phoneNumber: conv.phone_number, contactName: conv.contact_name },
                  })
                }
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  border: 'none',
                  borderBottom:
                    i < data.recent_conversations.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {conv.contact_name || conv.phone_number}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 2,
                    }}
                  >
                    {conv.last_message || 'No messages'}
                  </p>
                </div>
                <div style={{ marginLeft: 16, textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>
                    {formatTime(conv.last_message_at)}
                  </p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {conv.total_messages} msgs
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
