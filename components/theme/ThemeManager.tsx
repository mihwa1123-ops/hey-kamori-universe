'use client';

import { useState, useTransition, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { updateTheme } from '@/app/(admin)/admin/actions';

type ThemeData = {
  bg_color_1: string;
  button_bg: string;
  button_text: string;
  button_border: string;
};

export const THEME_DEFAULTS: ThemeData = {
  bg_color_1: '#FDF9F3',
  button_bg: '#FFFFFF',
  button_text: '#2D2A3E',
  button_border: '#E5DFF5',
};

export function ThemeManager({ theme }: { theme: ThemeData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ThemeData>(theme);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(state) !== JSON.stringify(theme);

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateTheme(state);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    });
  };

  const previewBg: CSSProperties = { backgroundColor: state.bg_color_1 };
  const previewBtn: CSSProperties = {
    backgroundColor: state.button_bg,
    color: state.button_text,
    borderColor: state.button_border,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">
          테마 커스터마이징
        </h2>
        {saved && <span className="text-xs text-success">저장됨 ✓</span>}
      </div>

      <div className="rounded-3xl p-6 space-y-3 border border-neutral-200" style={previewBg}>
        <p className="text-xs text-center text-neutral-500">미리보기</p>
        <div
          className="h-14 rounded-2xl flex items-center justify-center border font-medium shadow-soft"
          style={previewBtn}
        >
          예시 링크 버튼
        </div>
        <div
          className="h-14 rounded-2xl flex items-center justify-center border font-medium shadow-soft"
          style={previewBtn}
        >
          다른 링크
        </div>
      </div>

      <div className="space-y-3">
        <ColorField
          label="배경 색상"
          value={state.bg_color_1}
          onChange={(v) => setState({ ...state, bg_color_1: v })}
        />
        <ColorField
          label="버튼 배경"
          value={state.button_bg}
          onChange={(v) => setState({ ...state, button_bg: v })}
        />
        <ColorField
          label="버튼 글자"
          value={state.button_text}
          onChange={(v) => setState({ ...state, button_text: v })}
        />
        <ColorField
          label="버튼 테두리"
          value={state.button_border}
          onChange={(v) => setState({ ...state, button_border: v })}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setState(THEME_DEFAULTS)}
          disabled={isPending}
          className="h-12 px-4 rounded-2xl border border-neutral-200 text-sm text-neutral-700 font-medium
                     hover:bg-neutral-50 transition-colors
                     disabled:opacity-50"
        >
          기본값으로
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !dirty}
          className="flex-1 h-12 rounded-2xl bg-brand-lavender text-white font-medium
                     shadow-soft hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200
                     disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? '저장 중…' : '저장'}
        </button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="flex-1 text-sm text-neutral-700">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-12 h-10 rounded-lg border border-neutral-200 bg-white cursor-pointer p-1"
        aria-label={`${label} 색상 피커`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        maxLength={7}
        className="w-24 h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-mono text-neutral-900
                   focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent"
      />
    </label>
  );
}
