'use client';

import { useState, useTransition, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { updateTheme } from '@/app/(admin)/admin/actions';
import {
  THEME_DEFAULTS,
  buildButtonStyle,
  getFontFamily,
  type AppliedTheme,
} from '@/lib/theme';
import { cn } from '@/lib/utils';

export { THEME_DEFAULTS } from '@/lib/theme';

const STYLE_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'glass', label: 'Glass' },
  { value: 'outline', label: 'Outline' },
] as const;

const RADIUS_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'round', label: 'Round' },
  { value: 'rounder', label: 'Rounder' },
  { value: 'full', label: 'Full' },
] as const;

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'soft', label: 'Soft' },
  { value: 'strong', label: 'Strong' },
  { value: 'hard', label: 'Hard' },
] as const;

const FONT_OPTIONS = [
  { value: 'pretendard', label: 'Pretendard (한글·영문)' },
  { value: 'noto-kr', label: 'Noto Sans KR (한글·영문)' },
  { value: 'noto-jp', label: 'Noto Sans JP (일본어·영문)' },
  { value: 'plex-kr', label: 'IBM Plex Sans KR (한글·영문)' },
] as const;

export function ThemeManager({ theme }: { theme: AppliedTheme }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AppliedTheme>(theme);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(state) !== JSON.stringify(theme);

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateTheme({
        bg_color_1: state.bg_color_1,
        button_bg: state.button_bg,
        button_text: state.button_text,
        button_border: state.button_border,
        button_style: state.button_style as 'solid' | 'glass' | 'outline',
        button_radius: state.button_radius as
          | 'square'
          | 'round'
          | 'rounder'
          | 'full',
        button_shadow: state.button_shadow as
          | 'none'
          | 'soft'
          | 'strong'
          | 'hard',
        font_family: state.font_family as
          | 'pretendard'
          | 'noto-kr'
          | 'noto-jp'
          | 'plex-kr',
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    });
  };

  const previewBg: CSSProperties = {
    backgroundColor: state.bg_color_1,
    fontFamily: getFontFamily(state.font_family),
  };
  const previewBtn: CSSProperties = {
    ...buildButtonStyle(state),
    fontFamily: getFontFamily(state.font_family),
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">
          테마 커스터마이징
        </h2>
        {saved && <span className="text-xs text-success">저장됨 ✓</span>}
      </div>

      <div className="rounded-3xl p-6 space-y-3 border border-neutral-200" style={previewBg}>
        <p className="text-xs text-center text-neutral-500">미리보기</p>
        <div className="h-14 flex items-center justify-center font-medium px-4" style={previewBtn}>
          예시 링크 버튼
        </div>
        <div className="h-14 flex items-center justify-center font-medium px-4" style={previewBtn}>
          Another Link · リンク
        </div>
      </div>

      <section className="space-y-3">
        <p className="text-sm font-medium text-neutral-700">색상</p>
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
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-neutral-700">버튼 스타일</p>
        <OptionRow
          options={STYLE_OPTIONS}
          value={state.button_style}
          onChange={(v) => setState({ ...state, button_style: v })}
        />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-neutral-700">모서리</p>
        <OptionRow
          options={RADIUS_OPTIONS}
          value={state.button_radius}
          onChange={(v) => setState({ ...state, button_radius: v })}
        />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-neutral-700">그림자</p>
        <OptionRow
          options={SHADOW_OPTIONS}
          value={state.button_shadow}
          onChange={(v) => setState({ ...state, button_shadow: v })}
        />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-neutral-700">페이지 폰트</p>
        <select
          value={state.font_family}
          onChange={(e) => setState({ ...state, font_family: e.target.value })}
          className="w-full h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900
                     focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-neutral-500">
          모두 상업적 사용 가능 (OFL/Apache 라이선스) · 300/500/700 굵기 포함
        </p>
      </section>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-4 border-t border-neutral-200">
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

function OptionRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-10 rounded-xl border text-sm font-medium transition-colors',
            value === opt.value
              ? 'border-brand-lavender bg-brand-lavender-soft text-neutral-900'
              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
