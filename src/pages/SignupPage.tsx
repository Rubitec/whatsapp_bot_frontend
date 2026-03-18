import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Signup failed');
      }

      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
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
        {emailSent ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#E8546C]/10 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#E8546C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="text-3xl font-light text-gray-800 text-center leading-snug">
              Check your email
            </h1>
            <div className="w-8 h-0.5 bg-[#E8546C] mt-4 mb-6" />
            <p className="text-gray-500 text-center max-w-sm leading-relaxed">
              We sent a confirmation link to<br />
              <span className="text-gray-800 font-medium">{email}</span>
            </p>
            <p className="text-sm text-gray-400 mt-4 text-center max-w-sm">
              Click the link in the email to verify your account, then come back here to sign in.
            </p>
            <Link
              to="/login"
              className="mt-8 px-8 py-4 text-base font-medium text-white bg-[#E8546C] rounded-full hover:bg-[#d94a61] transition-colors"
            >
              Go to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-light text-gray-800 text-center leading-snug">
              Create your<br />BoundBird account
            </h1>
            <div className="w-8 h-0.5 bg-[#E8546C] mt-4 mb-10" />

            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-4 text-base border border-gray-200 rounded-lg outline-none focus:border-[#E8546C] transition-colors placeholder:text-gray-400"
              />
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
                minLength={6}
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
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#E8546C] hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
