'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/PasswordInput';

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');

    if (next.length < 6) {
      setStatus('error');
      setErrorMsg('새 비밀번호는 6자 이상이어야 합니다');
      return;
    }
    if (next !== confirm) {
      setStatus('error');
      setErrorMsg('새 비밀번호 확인이 일치하지 않습니다');
      return;
    }

    setStatus('submitting');
    const supabase = createClient();

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user?.email) {
      setStatus('error');
      setErrorMsg('세션이 만료되었습니다. 다시 로그인해주세요.');
      return;
    }

    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: current,
    });
    if (verifyErr) {
      setStatus('error');
      setErrorMsg('현재 비밀번호가 올바르지 않습니다');
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: next });
    if (updateErr) {
      setStatus('error');
      setErrorMsg(updateErr.message);
      return;
    }

    setStatus('success');
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Link
            href="/admin"
            className="inline-block text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            ← 관리자 홈으로
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900">비밀번호 변경</h1>
          <p className="text-sm text-neutral-500">현재 비밀번호를 확인 후 새 비밀번호를 입력하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <PasswordInput
            required
            autoComplete="current-password"
            placeholder="현재 비밀번호"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            disabled={status === 'submitting'}
          />
          <PasswordInput
            required
            autoComplete="new-password"
            placeholder="새 비밀번호 (6자 이상)"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            disabled={status === 'submitting'}
          />
          <PasswordInput
            required
            autoComplete="new-password"
            placeholder="새 비밀번호 확인"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={status === 'submitting'}
          />
          <button
            type="submit"
            disabled={status === 'submitting' || !current || !next || !confirm}
            className="w-full h-12 rounded-2xl bg-brand-lavender text-white font-medium
                       shadow-soft transition-all duration-200
                       hover:shadow-hover hover:-translate-y-0.5
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2
                       disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? '변경 중…' : '비밀번호 변경'}
          </button>

          {status === 'error' && (
            <p className="text-sm text-center text-danger">{errorMsg}</p>
          )}
          {status === 'success' && (
            <div className="rounded-2xl bg-brand-mint/40 border border-brand-mint p-4 text-center">
              <p className="text-sm text-neutral-900">비밀번호가 변경되었어요 ✅</p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
