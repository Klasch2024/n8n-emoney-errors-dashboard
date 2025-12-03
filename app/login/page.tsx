'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Valid users array
    const validUsers = [
      {
        name: 'Henrique Schalk',
        email: 'schalkadvision@gmail.com',
        password: 'Emoney2025',
      },
      {
        name: 'Steve Ernst',
        email: 'stevenaernst@gmail.com',
        password: 'Emoney2025',
      },
    ];

    // Check if credentials match any valid user
    const user = validUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Store auth in cookie (for server-side middleware)
      document.cookie = `isAuthenticated=true; path=/; max-age=86400`; // 24 hours
      document.cookie = `userEmail=${encodeURIComponent(email)}; path=/; max-age=86400`;
      document.cookie = `userName=${encodeURIComponent(user.name)}; path=/; max-age=86400`;
      
      // Also store in localStorage for client-side checks
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', user.name);
      
      // Small delay to ensure cookie is set
      setTimeout(() => {
        router.push('/dashboard/errors');
        router.refresh();
      }, 100);
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E67514] rounded-full mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">N8N Errors Dashboard</h1>
          <p className="text-sm text-[#BEBEBE]">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg p-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F5F5F5] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder-[#8A8A8A] focus:outline-none focus:border-[#E67514] transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#F5F5F5] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder-[#8A8A8A] focus:outline-none focus:border-[#E67514] transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

