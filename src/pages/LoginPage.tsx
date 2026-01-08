import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Go to dashboard after login
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
      <div className="bg-slate-800 p-8 rounded-xl max-w-md w-full border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to System Wallah</h2>
        
        {error && <p className="text-red-400 bg-red-900/30 p-3 rounded mb-4 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
          />
          <input 
            type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-bold transition">
            Login
          </button>
        </form>

        <div className="my-6 text-center text-gray-500">OR</div>

        <button onClick={handleGoogleLogin} className="w-full bg-white text-black p-3 rounded font-bold hover:bg-gray-200 transition">
          Sign in with Google
        </button>

        <button onClick={() => navigate('/system-wallah')} className="mt-4 text-sm text-gray-400 hover:text-white w-full text-center">
          ← Back
        </button>
      </div>
    </div>
  );
}