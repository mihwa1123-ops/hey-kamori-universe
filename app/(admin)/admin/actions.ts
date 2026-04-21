'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LinkInput = {
  title: string;
  url: string;
  is_public: boolean;
};

export type ActionResult = { error: string | null };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if (user.email !== process.env.ADMIN_EMAIL) redirect('/');
  return { supabase, user };
}

function validateLinkInput(input: LinkInput): string | null {
  const title = input.title.trim();
  if (title.length < 1 || title.length > 40) {
    return '제목은 1-40자여야 합니다';
  }
  if (!/^https?:\/\/.+/i.test(input.url.trim())) {
    return 'URL은 http:// 또는 https://로 시작해야 합니다';
  }
  return null;
}

function revalidateAll() {
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function createLink(input: LinkInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const err = validateLinkInput(input);
  if (err) return { error: err };

  const { data: maxRow } = await supabase
    .from('links')
    .select('display_order')
    .eq('profile_id', user.id)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.display_order ?? -1) + 1;

  const { error } = await supabase.from('links').insert({
    profile_id: user.id,
    title: input.title.trim(),
    url: input.url.trim(),
    is_public: input.is_public,
    display_order: nextOrder,
  });

  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function updateLink(
  id: string,
  input: LinkInput
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const err = validateLinkInput(input);
  if (err) return { error: err };

  const { error } = await supabase
    .from('links')
    .update({
      title: input.title.trim(),
      url: input.url.trim(),
      is_public: input.is_public,
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function deleteLink(id: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from('links').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function toggleLinkPublic(
  id: string,
  isPublic: boolean
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from('links')
    .update({ is_public: isPublic })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export type ProfileInput = {
  display_name: string;
  bio: string;
  social_instagram: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
};

function validateSocialUrl(url: string | null): string | null {
  if (url === null || url === '') return null;
  if (!/^https?:\/\/.+/i.test(url)) {
    return 'URL은 http:// 또는 https://로 시작해야 합니다';
  }
  return null;
}

export async function updateProfile(
  input: ProfileInput
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const display_name = input.display_name.trim();
  const bio = input.bio;
  if (display_name.length < 1 || display_name.length > 30) {
    return { error: '닉네임은 1-30자여야 합니다' };
  }
  if (bio.length > 100) {
    return { error: '내용은 최대 100자입니다' };
  }
  for (const social of [
    input.social_instagram,
    input.social_twitter,
    input.social_youtube,
  ]) {
    const err = validateSocialUrl(social);
    if (err) return { error: err };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name,
      bio,
      social_instagram: input.social_instagram || null,
      social_twitter: input.social_twitter || null,
      social_youtube: input.social_youtube || null,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/profile');
  return { error: null };
}

export type ThemeInput = {
  bg_color_1: string;
  button_bg: string;
  button_text: string;
  button_border: string;
};

const HEX_RE = /^#[0-9A-F]{6}$/i;

export async function updateTheme(input: ThemeInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  for (const color of [
    input.bg_color_1,
    input.button_bg,
    input.button_text,
    input.button_border,
  ]) {
    if (!HEX_RE.test(color)) {
      return { error: '색상 형식이 올바르지 않습니다 (#RRGGBB)' };
    }
  }

  const { error } = await supabase.from('themes').upsert(
    {
      profile_id: user.id,
      bg_color_1: input.bg_color_1.toUpperCase(),
      button_bg: input.button_bg.toUpperCase(),
      button_text: input.button_text.toUpperCase(),
      button_border: input.button_border.toUpperCase(),
    },
    { onConflict: 'profile_id' }
  );

  if (error) return { error: error.message };
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/theme');
  return { error: null };
}

export async function reorderLinks(
  orderedIds: string[]
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('links')
        .update({ display_order: index })
        .eq('id', id)
        .eq('profile_id', user.id)
    )
  );

  for (const { error } of results) {
    if (error) return { error: error.message };
  }

  revalidateAll();
  return { error: null };
}
