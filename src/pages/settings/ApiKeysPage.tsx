import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { Copy, Plus, Trash2 } from 'lucide-react';
import type { ApiKey, ApiKeysResponse, CreateApiKeyResponse } from '@/types';

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '12px 20px',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 20px',
  fontSize: 14,
};

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient<ApiKeysResponse>('/api-keys');
      setKeys(res.data);
    } catch (err) {
      // Endpoint may not exist yet — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await apiClient<CreateApiKeyResponse>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ label: newLabel || null }),
      });
      setNewlyCreatedKey(res.data.key);
      setNewLabel('');
      setShowCreate(false);
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await apiClient(`/api-keys/${id}`, { method: 'DELETE' });
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke key');
    }
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return <div style={{ color: '#9ca3af' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Newly created key banner */}
      {newlyCreatedKey && (
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 500, color: '#166534', marginBottom: 8 }}>
            API key created. Copy it now — you won't be able to see it again.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <code
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: 4,
                fontSize: 13,
                fontFamily: 'monospace',
                color: '#1f2937',
                wordBreak: 'break-all',
              }}
            >
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => copyKey(newlyCreatedKey)}
              title="Copy"
              style={{
                padding: 8,
                color: '#15803d',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 6,
                display: 'flex',
              }}
            >
              <Copy style={{ width: 16, height: 16 }} />
            </button>
          </div>
          {copied && <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>Copied!</p>}
          <button
            onClick={() => setNewlyCreatedKey(null)}
            style={{
              fontSize: 12,
              color: '#16a34a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: 8,
              textDecoration: 'underline',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          API keys allow external services to authenticate with your account.
        </p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: '#ffffff',
            backgroundColor: '#E8546C',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          New key
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
              Label (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Production, Development"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: 14,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: '#E8546C',
              borderRadius: 8,
              border: 'none',
              cursor: creating ? 'not-allowed' : 'pointer',
              opacity: creating ? 0.6 : 1,
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      )}

      {error && <p style={{ fontSize: 14, color: '#ef4444', marginBottom: 16 }}>{error}</p>}

      {/* Keys table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <th style={thStyle}>Label</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Last Used</th>
              <th style={thStyle}>Status</th>
              <th style={{ padding: '12px 20px', width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}
                >
                  No API keys yet
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr
                  key={key.id}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>
                    {key.label || <span style={{ color: '#9ca3af' }}>No label</span>}
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280' }}>{formatDate(key.created_at)}</td>
                  <td style={{ ...tdStyle, color: '#6b7280' }}>{formatDate(key.last_used_at)}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 9999,
                        backgroundColor: key.is_active ? '#f0fdf4' : '#f3f4f6',
                        color: key.is_active ? '#15803d' : '#6b7280',
                      }}
                    >
                      {key.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {key.is_active && (
                      <button
                        onClick={() => handleRevoke(key.id)}
                        title="Revoke"
                        style={{
                          padding: 6,
                          color: '#9ca3af',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: 6,
                          display: 'inline-flex',
                        }}
                      >
                        <Trash2 style={{ width: 16, height: 16 }} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
