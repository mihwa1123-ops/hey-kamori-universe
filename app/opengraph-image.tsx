import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { isAvatarVideo } from '@/lib/avatar';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'hey.kamori';

export default async function OpenGraphImage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_path, updated_at')
    .limit(1)
    .maybeSingle();

  const avatarUrl =
    profile?.avatar_path && !isAvatarVideo(profile.avatar_path)
      ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data
          .publicUrl
      : null;

  const displayName = profile?.display_name ?? 'hey.kamori';
  const bio = profile?.bio ?? '';
  const initial = displayName.charAt(0);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, #FBDFEA 0%, #FDF9F3 50%, #D4C5F0 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          fontFamily: 'sans-serif',
        }}
      >
        {avatarUrl ? (
           
          <img
            src={avatarUrl}
            alt=""
            width={300}
            height={300}
            style={{
              width: 300,
              height: 300,
              borderRadius: 40,
              objectFit: 'cover',
              border: '4px solid #D4C5F0',
            }}
          />
        ) : (
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 40,
              background: '#D4C5F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 140,
              fontWeight: 700,
              color: '#2D2A3E',
              border: '4px solid #D4C5F0',
            }}
          >
            {initial}
          </div>
        )}

        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: '#2D2A3E',
            marginTop: 36,
            display: 'flex',
          }}
        >
          {displayName}
        </div>

        {bio && (
          <div
            style={{
              fontSize: 32,
              color: '#737373',
              marginTop: 18,
              maxWidth: 960,
              textAlign: 'center',
              display: 'flex',
              lineHeight: 1.4,
            }}
          >
            {bio}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 48,
            fontSize: 22,
            color: '#B8A4E3',
            display: 'flex',
          }}
        >
          💜 hey-kamori-universe.vercel.app
        </div>
      </div>
    ),
    { ...size, emoji: 'twemoji' }
  );
}
