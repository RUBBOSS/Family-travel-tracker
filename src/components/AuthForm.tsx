import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useUserContext } from '@/context/UserContext';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const context = useUserContext();

  useEffect(() => {
    // Check and restore session on component mount
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (session?.user) {
          // Session exists, user is already logged in
          console.log('Existing session found');
        }
      } catch (e) {
        console.error('Error checking session:', e);
      }
    };

    initializeAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        if (data?.user) {
          console.log('Login successful');
        }
      } else {
        if (!username.trim()) {
          setError('Username is required for registration');
          setLoading(false);
          return;
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              full_name: username.trim()
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (data?.user) {
          console.log('Registration successful');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto mt-8 p-4 bg-slate-800 rounded-lg">
      <h2 className="text-lg font-bold text-white mb-2">{isLogin ? 'Login' : 'Register'}</h2>
      
      {!isLogin && (
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-700 text-white"
          required
        />
      )}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-3 py-2 rounded bg-slate-700 text-white"
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full px-3 py-2 rounded bg-slate-700 text-white"
        required
      />
      
      {error && <div className="text-red-400 text-sm">{error}</div>}
      
      <button
        type="submit"
        className="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
      </button>
      
      <button
        type="button"
        className="w-full py-2 rounded bg-slate-600 text-white mt-2"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
    </form>
  );
}
