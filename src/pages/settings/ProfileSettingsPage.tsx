import { useState, useEffect, type FormEvent } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 16px',
  fontSize: 14,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  outline: 'none',
  backgroundColor: '#ffffff',
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  color: '#6b7280',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 4,
};

export function ProfileSettingsPage() {
  const { user, refetchMe } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await apiClient('/me', {
        method: 'PUT',
        body: JSON.stringify({ full_name: fullName }),
      });
      await refetchMe();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={user?.email ?? ''} disabled style={disabledInputStyle} />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Email cannot be changed.</p>
        </div>
        <div>
          <label style={labelStyle}>Role</label>
          <input
            type="text"
            value={user?.role ?? ''}
            disabled
            style={{ ...disabledInputStyle, textTransform: 'capitalize' }}
          />
        </div>

        {error && <p style={{ fontSize: 14, color: '#ef4444' }}>{error}</p>}
        {success && <p style={{ fontSize: 14, color: '#16a34a' }}>Profile updated successfully.</p>}

        <div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: '#E8546C',
              borderRadius: 8,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
