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

export function CompanySettingsPage() {
  const { company, refetchMe } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (company) {
      setName(company.name);
      setPhone(company.phone ?? '');
      setAddress(company.address ?? '');
      setTaxId(company.tax_id ?? '');
    }
  }, [company]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await apiClient('/company', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, address, tax_id: taxId }),
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
          <label style={labelStyle}>Company Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>EIN / Tax ID</label>
          <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} style={inputStyle} />
        </div>

        {error && <p style={{ fontSize: 14, color: '#ef4444' }}>{error}</p>}
        {success && <p style={{ fontSize: 14, color: '#16a34a' }}>Settings saved successfully.</p>}

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 4,
};
