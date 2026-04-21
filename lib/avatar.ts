export function isAvatarVideo(pathOrUrl: string | null | undefined): boolean {
  if (!pathOrUrl) return false;
  const clean = pathOrUrl.split('?')[0];
  return /\.(mp4|webm)$/i.test(clean);
}

export const AVATAR_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';

export const AVATAR_MIME_ALLOWED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
] as const;

export const AVATAR_MAX_SIZE = 10 * 1024 * 1024;
