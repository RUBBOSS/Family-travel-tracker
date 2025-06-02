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
  
  // Debug context
  useEffect(() => {
    console.log("AuthForm context:", context);
  }, [context]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let authError = null;
      
      if (isLogin) {
        const result = await supabase.auth.signInWithPassword({ email, password });
        authError = result.error;
        
        if (!authError) {
          // Login successful - user will be set automatically by context
          console.log('Login successful');
        }
      } else {
        // Validate username for registration
        if (!username.trim()) {
          setError('Username is required for registration');
          return;
        }
        
        // Registration - include username in metadata
        const result = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username.trim(),
              full_name: username.trim() // Use username as display name initially
            }
          }
        });
        authError = result.error;
        
        if (!authError) {
          // Registration successful - user should be logged in immediately since email confirmation is disabled
          console.log('Registration successful');
        }
      }      if (authError) {
        console.error('Auth error details:', authError);
        
        // Provide more specific error messages
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account');
        } else if (authError.message.includes('Database error')) {
          setError('Database error saving new user. Please ensure the database schema is set up correctly.');
        } else {
          setError(authError.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Auth error:', err);
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
