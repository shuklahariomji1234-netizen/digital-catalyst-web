import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-3xl font-bold mb-4">Create Account</h1>
      <p className="text-gray-400 mb-8">Signup feature coming soon.</p>
      <button onClick={() => navigate('/system-wallah/login')} className="bg-blue-600 px-6 py-2 rounded">
        Go to Login
      </button>
    </div>
  );
}