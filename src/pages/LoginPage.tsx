import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-8 py-6">
        <span className="text-xl font-semibold tracking-tight text-[#E8546C]">
          boundbird
        </span>
      </div>

      <div className="flex flex-col items-center px-4 pt-12">
        <h1 className="text-3xl font-light text-gray-800 text-center leading-snug">
          Sign in to your<br />BoundBird account
        </h1>
        <div className="w-8 h-0.5 bg-[#E8546C] mt-4 mb-10" />

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-4 text-base border border-gray-200 rounded-lg outline-none focus:border-[#E8546C] transition-colors placeholder:text-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#E8546C] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
