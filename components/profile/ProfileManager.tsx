'use client';

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/(admin)/admin/actions';
import {
  AVATAR_ACCEPT,
  AVATAR_MAX_SIZE,
  AVATAR_MIME_ALLOWED,
  isAvatarVideo,
} from '@/lib/avatar';

type ProfileData = {
  display_name: string;
  bio: string;
  footer_text: string;
  display_name_color: string;
  bio_color: string;
  footer_color: string;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function ProfileManager({
  profile,
  avatarUrl,
  ogImageUrl,
}: {
  profile: ProfileData;
  avatarUrl: string | null;
  ogImageUrl: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio);
  const [footerText, setFooterText] = useState(profile.footer_text);
  const [displayNameColor, setDisplayNameColor] = useState(profile.display_name_color);
  const [bioColor, setBioColor] = useState(profile.bio_color);
  const [footerColor, setFooterColor] = useState(profile.footer_color);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingOgFile, setPendingOgFile] = useState<File | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(avatarUrl);
  const [localOg, setLocalOg] = useState<string | null>(ogImageUrl);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingFile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalAvatar(avatarUrl);
  }, [avatarUrl, pendingFile]);

  useEffect(() => {
    if (pendingOgFile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalOg(ogImageUrl);
  }, [ogImageUrl, pendingOgFile]);

  const dirty =
    displayName !== profile.display_name ||
    bio !== profile.bio ||
    footerText !== profile.footer_text ||
    displayNameColor !== profile.display_name_color ||
    bioColor !== profile.bio_color ||
    footerColor !== profile.footer_color ||
    pendingFile !== null ||
    pendingOgFile !== null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!AVATAR_MIME_ALLOWED.includes(file.type as (typeof AVATAR_MIME_ALLOWED)[number])) {
      setErrorMsg('지원하지 않는 형식 (jpg/png/webp/gif/mp4/webm만 가능)');
      if (e.target) e.target.value = '';
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      setErrorMsg('파일 크기는 최대 10MB 입니다');
      if (e.target) e.target.value = '';
      return;
    }

    setErrorMsg('');
    setPendingFile(file);
    setLocalAvatar(URL.createObjectURL(file));
    if (e.target) e.target.value = '';
  };

  const handleOgFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setErrorMsg('공유 이미지는 jpg/png/webp/gif만 가능 (동영상 불가)');
      if (e.target) e.target.value = '';
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      setErrorMsg('파일 크기는 최대 10MB 입니다');
      if (e.target) e.target.value = '';
      return;
    }

    setErrorMsg('');
    setPendingOgFile(file);
    setLocalOg(URL.createObjectURL(file));
    if (e.target) e.target.value = '';
  };

  const handleSave = () => {
    if (!dirty) return;
    setStatus('saving');
    setErrorMsg('');

    startTransition(async () => {
      if (pendingFile) {
        const formData = new FormData();
        formData.append('file', pendingFile);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setStatus('error');
          setErrorMsg(body.error ?? '사진 업로드 실패');
          return;
        }
        setPendingFile(null);
      }

      if (pendingOgFile) {
        const formData = new FormData();
        formData.append('file', pendingOgFile);
        const res = await fetch('/api/upload?type=og', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setStatus('error');
          setErrorMsg(body.error ?? '공유 이미지 업로드 실패');
          return;
        }
        setPendingOgFile(null);
      }

      const result = await updateProfile({
        display_name: displayName,
        bio,
        footer_text: footerText,
        display_name_color: displayNameColor,
        bio_color: bioColor,
        footer_color: footerColor,
      });
      if (result.error) {
        setStatus('error');
        setErrorMsg(result.error);
        return;
      }

      setStatus('saved');
      router.refresh();
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setStatus('idle'), 1500);
    });
  };

  const bioLen = bio.length;
  const footerLen = footerText.length;
  const isVideoPreview = pendingFile
    ? pendingFile.type.startsWith('video/')
    : isAvatarVideo(localAvatar);

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">프로필 편집</h2>
        <SaveIndicator status={status} />
      </div>

      <div className="flex items-start gap-4">
        <div
          className="relative w-40 aspect-[16/9] rounded-xl overflow-hidden flex items-center justify-center shrink-0
                     bg-gradient-to-br from-brand-pink-soft via-brand-cream to-brand-lavender-soft
                     border border-brand-lavender-soft"
        >
          {localAvatar ? (
            isVideoPreview ? (
              <video
                src={localAvatar}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={localAvatar}
                alt="프로필 사진"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <span className="text-2xl font-semibold text-neutral-900">
              {displayName.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="h-10 px-4 rounded-2xl border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors
                       disabled:opacity-50"
          >
            {localAvatar ? '사진 변경' : '사진 선택'}
          </button>
          <p className="text-xs text-neutral-500">
            jpg/png/webp/gif/mp4/webm · 최대 10MB
            {pendingFile && (
              <span className="block text-warning">
                저장 버튼을 눌러야 반영됩니다
              </span>
            )}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={AVATAR_ACCEPT}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex items-start gap-4">
        <div
          className="relative w-40 aspect-[16/9] rounded-xl overflow-hidden flex items-center justify-center shrink-0
                     bg-gradient-to-br from-brand-pink-soft via-brand-cream to-brand-lavender-soft
                     border border-brand-lavender-soft"
        >
          {localOg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localOg}
              alt="공유 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-neutral-500 text-center px-2">
              공유 이미지 없음
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-700">
            링크 공유 이미지
          </p>
          <button
            type="button"
            onClick={() => ogInputRef.current?.click()}
            disabled={isPending}
            className="h-10 px-4 rounded-2xl border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors
                       disabled:opacity-50"
          >
            {localOg ? '공유 이미지 변경' : '공유 이미지 선택'}
          </button>
          <p className="text-xs text-neutral-500">
            jpg/png/webp/gif · 동영상 불가 · 최대 10MB
            <span className="block">메신저 썸네일에 쓰여요</span>
            {pendingOgFile && (
              <span className="block text-warning">
                저장 버튼을 눌러야 반영됩니다
              </span>
            )}
          </p>
        </div>
        <input
          ref={ogInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleOgFileChange}
          className="hidden"
        />
      </div>

      <FieldWithColor
        label="닉네임 (1-30자)"
        color={displayNameColor}
        onColorChange={setDisplayNameColor}
      >
        <input
          type="text"
          maxLength={30}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isPending}
          className="w-full h-12 rounded-lg border border-neutral-200 bg-white px-4 text-base text-neutral-900
                     focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent
                     disabled:opacity-50"
        />
      </FieldWithColor>

      <FieldWithColor
        label={`내용 (${bioLen}/100자)`}
        color={bioColor}
        onColorChange={setBioColor}
      >
        <textarea
          maxLength={100}
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={isPending}
          placeholder="프로필에 표시할 내용을 입력하세요"
          className="w-full min-h-24 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 placeholder-neutral-500
                     focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent
                     disabled:opacity-50 resize-none"
        />
      </FieldWithColor>

      <FieldWithColor
        label={`푸터 문구 (${footerLen}/60자)`}
        color={footerColor}
        onColorChange={setFooterColor}
      >
        <input
          type="text"
          maxLength={60}
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          disabled={isPending}
          placeholder="Made with 💜 by kamori"
          className="w-full h-12 rounded-lg border border-neutral-200 bg-white px-4 text-base text-neutral-900 placeholder-neutral-500
                     focus:outline-none focus:ring-2 focus:ring-brand-lavender focus:border-transparent
                     disabled:opacity-50"
        />
      </FieldWithColor>

      {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}

      <div className="flex justify-end pt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !dirty}
          className="h-12 px-6 rounded-2xl bg-brand-lavender text-white font-medium
                     shadow-soft hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lavender focus-visible:ring-offset-2
                     disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          {isPending ? '저장 중…' : '저장'}
        </button>
      </div>
    </div>
  );
}

function FieldWithColor({
  label,
  color,
  onColorChange,
  children,
}: {
  label: string;
  color: string;
  onColorChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-neutral-700">
          {label}
        </span>
        <label className="flex items-center gap-1 text-xs text-neutral-500">
          <span>글자색</span>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value.toUpperCase())}
            className="w-8 h-7 rounded-md border border-neutral-200 bg-white cursor-pointer p-0.5"
            aria-label={`${label} 글자색`}
          />
          <span className="font-mono text-[10px] text-neutral-500 w-14">
            {color}
          </span>
        </label>
      </div>
      {children}
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return <span className="text-xs text-neutral-500">저장 중…</span>;
  }
  if (status === 'saved') {
    return <span className="text-xs text-success">저장됨 ✓</span>;
  }
  if (status === 'error') {
    return <span className="text-xs text-danger">저장 실패</span>;
  }
  return null;
}
