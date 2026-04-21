import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { AVATAR_MAX_SIZE, AVATAR_MIME_ALLOWED } from '@/lib/avatar';

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'video/mp4':
      return 'mp4';
    case 'video/webm':
      return 'webm';
    default:
      return 'bin';
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }
  if (user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: '파일이 필요합니다' }, { status: 400 });
  }
  if (!AVATAR_MIME_ALLOWED.includes(file.type as (typeof AVATAR_MIME_ALLOWED)[number])) {
    return NextResponse.json(
      { error: '지원하지 않는 형식 (jpg/png/webp/gif/mp4/webm만 가능)' },
      { status: 400 }
    );
  }
  if (file.size > AVATAR_MAX_SIZE) {
    return NextResponse.json(
      { error: '파일 크기는 최대 10MB 입니다' },
      { status: 400 }
    );
  }

  const ext = extFromMime(file.type);
  const path = `${user.id}/avatar.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { error: dbErr } = await supabase
    .from('profiles')
    .update({ avatar_path: path })
    .eq('id', user.id);

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/profile');

  return NextResponse.json({ path });
}
