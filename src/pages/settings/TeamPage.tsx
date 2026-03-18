import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Copy } from 'lucide-react';
import type { User } from '@/types';

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

interface UsersResponse {
  success: boolean;
  data: User[];
}

export function TeamPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviting, setInviting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient<UsersResponse>('/users');
      setUsers(res.data);
    } catch {
      // Endpoint may not be available yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInvite = async () => {
    setInviting(true);
    setError(null);
    setCreatedCredentials(null);
    try {
      const res = await apiClient<{ success: boolean; data: { email: string; password: string } }>('/users', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
      });
      setCreatedCredentials({ email: res.data.email, password: res.data.password });
      setInviteEmail('');
      setInviteName('');
      setInviteRole('member');
      setShowInvite(false);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setInviting(false);
    }
  };

  const copyCredentials = async () => {
    if (!createdCredentials) return;
    await navigator.clipboard.writeText(
      `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!confirm(`Remove ${user?.full_name || user?.email}? This will permanently delete their account.`)) return;
    try {
      setError(null);
      await apiClient(`/users/${userId}`, { method: 'DELETE' });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user');
    }
  };

  function formatDate(dateStr: string): string {
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
      {/* Credentials banner */}
      {createdCredentials && (
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
            User created. Copy the credentials now — the password won't be shown again.
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
                whiteSpace: 'pre-line',
              }}
            >
              Email: {createdCredentials.email}{'\n'}Password: {createdCredentials.password}
            </code>
            <button
              onClick={copyCredentials}
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
            onClick={() => setCreatedCredentials(null)}
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
          Manage team members who have access to your company.
        </p>
        <button
          onClick={() => setShowInvite(!showInvite)}
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
          Invite user
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
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
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
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
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
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
          <div style={{ minWidth: 120 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: 14,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail || !inviteName}
            style={{
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: '#E8546C',
              borderRadius: 8,
              border: 'none',
              cursor: inviting || !inviteEmail || !inviteName ? 'not-allowed' : 'pointer',
              opacity: inviting || !inviteEmail || !inviteName ? 0.6 : 1,
            }}
          >
            {inviting ? 'Sending...' : 'Send invite'}
          </button>
        </div>
      )}

      {error && <p style={{ fontSize: 14, color: '#ef4444', marginBottom: 16 }}>{error}</p>}

      {/* Users table */}
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
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Joined</th>
              <th style={{ padding: '12px 20px', width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}
                >
                  No team members yet
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>
                    {user.full_name}
                    {user.id === currentUser?.id && (
                      <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>(you)</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: '#4b5563' }}>{user.email}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 9999,
                        backgroundColor: user.role === 'admin' ? '#eff6ff' : '#f3f4f6',
                        color: user.role === 'admin' ? '#2563eb' : '#6b7280',
                        textTransform: 'capitalize',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280' }}>{formatDate(user.created_at)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleRemove(user.id)}
                        title="Remove"
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
