'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/PasswordInput';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(
        error.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다'
          : error.message
      );
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center px-4 py-10">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-neutral-900">hey.kamori</h1>
          <p className="text-sm text-neutral-500">관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="username"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'submitting'}
            className="w-full h-12 rounded-lg border border-neutral-200 bg-white px-4 text-base text-neutral-900 placeholder-neutral-500
                       focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent
                       disabled:opacity-50"
          />
          <PasswordInput
            required
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status === 'submitting'}
          />
          <button
            type="submit"
            disabled={status === 'submitting' || !email || !password}
            className="w-full h-12 rounded-2xl bg-brand-lavender text-white font-medium
                       shadow-soft transition-all duration-200
                       hover:shadow-hover hover:-translate-y-0.5
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2
                       disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? '로그인 중…' : '로그인'}
          </button>
          {status === 'error' && (
            <p className="text-sm text-center text-danger">
              {errorMsg || '로그인 실패. 다시 시도해주세요.'}
            </p>
          )}
        </form>

        <p className="text-xs text-neutral-500 text-center">
          관리자만 로그인할 수 있어요
        </p>
      </div>
    </main>
  );
}
