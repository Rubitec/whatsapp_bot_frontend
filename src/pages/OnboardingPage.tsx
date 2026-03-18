import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';

export function OnboardingPage() {
  const { session, loading: authLoading } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient('/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({ company_name: companyName, phone, address, tax_id: taxId }),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-8 py-6">
        <span className="text-xl font-semibold tracking-tight text-[#E8546C]">
          boundbird
        </span>
      </div>

      <div className="flex flex-col items-center px-4 pt-12">
        <h1 className="text-3xl font-light text-gray-800 text-center leading-snug">
          Set up your company
        </h1>
        <div className="w-8 h-0.5 bg-[#E8546C] mt-4 mb-10" />

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <input
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full px-4 py-4 text-base border border-gray-200 rounded-lg outline-none focus:border-[#E8546C] transition-colors placeholder:text-gray-400"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-4 text-base border border-gray-200 rounded-lg outline-none focus:border-[#E8546C] transition-colors placeholder:text-gray-400"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-4 py-4 text-base border border-gray-200 rounded-lg outline-none focus:border-[#E8546C] transition-colors placeholder:text-gray-400"
          />
          <input
            type="text"
            placeholder="EIN / Tax ID"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            required
            className="w-full px-4 py-4 text-base border border-gray-200 rounded-lg outline-none focus:border-[#E8546C] transition-colors placeholder:text-gray-400"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-base font-medium text-white bg-[#E8546C] rounded-full hover:bg-[#d94a61] transition-colors disabled:opacity-60"
          >
            {loading ? 'Setting up...' : 'Get started'}
          </button>
        </form>
      </div>
    </div>
  );
}
