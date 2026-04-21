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
  footer_text: string;
  display_name_color: string;
  bio_color: string;
  footer_color: string;
};

export async function updateProfile(
  input: ProfileInput
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const display_name = input.display_name.trim();
  const bio = input.bio;
  const footer_text = input.footer_text.trim();
  if (display_name.length < 1 || display_name.length > 30) {
    return { error: '닉네임은 1-30자여야 합니다' };
  }
  if (bio.length > 100) {
    return { error: '내용은 최대 100자입니다' };
  }
  if (footer_text.length > 60) {
    return { error: '푸터 문구는 최대 60자입니다' };
  }
  for (const color of [
    input.display_name_color,
    input.bio_color,
    input.footer_color,
  ]) {
    if (!HEX_RE.test(color)) {
      return { error: '색상 형식이 올바르지 않습니다 (#RRGGBB)' };
    }
  }

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      display_name,
      bio,
      footer_text: footer_text || null,
    })
    .eq('id', user.id);
  if (profileErr) return { error: profileErr.message };

  const { error: themeErr } = await supabase
    .from('themes')
    .upsert(
      {
        profile_id: user.id,
        display_name_color: input.display_name_color.toUpperCase(),
        bio_color: input.bio_color.toUpperCase(),
        footer_color: input.footer_color.toUpperCase(),
      },
      { onConflict: 'profile_id' }
    );
  if (themeErr) return { error: themeErr.message };

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
  button_style: 'solid' | 'glass' | 'outline';
  button_radius: 'square' | 'round' | 'rounder' | 'full';
  button_shadow: 'none' | 'soft' | 'strong' | 'hard';
  font_family: 'pretendard' | 'noto-kr' | 'noto-jp' | 'plex-kr';
  font_weight: '300' | '500' | '700';
  display_name_color: string;
  bio_color: string;
  footer_color: string;
};

const HEX_RE = /^#[0-9A-F]{6}$/i;
const STYLES = ['solid', 'glass', 'outline'] as const;
const RADII = ['square', 'round', 'rounder', 'full'] as const;
const SHADOWS = ['none', 'soft', 'strong', 'hard'] as const;
const FONTS = ['pretendard', 'noto-kr', 'noto-jp', 'plex-kr'] as const;
const WEIGHTS = ['300', '500', '700'] as const;

export async function updateTheme(input: ThemeInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  for (const color of [
    input.bg_color_1,
    input.button_bg,
    input.button_text,
    input.button_border,
    input.display_name_color,
    input.bio_color,
    input.footer_color,
  ]) {
    if (!HEX_RE.test(color)) {
      return { error: '색상 형식이 올바르지 않습니다 (#RRGGBB)' };
    }
  }
  if (!STYLES.includes(input.button_style)) {
    return { error: '잘못된 버튼 스타일 값' };
  }
  if (!RADII.includes(input.button_radius)) {
    return { error: '잘못된 모서리 값' };
  }
  if (!SHADOWS.includes(input.button_shadow)) {
    return { error: '잘못된 그림자 값' };
  }
  if (!FONTS.includes(input.font_family)) {
    return { error: '잘못된 폰트 값' };
  }
  if (!WEIGHTS.includes(input.font_weight)) {
    return { error: '잘못된 폰트 굵기 값' };
  }

  const { error } = await supabase.from('themes').upsert(
    {
      profile_id: user.id,
      bg_color_1: input.bg_color_1.toUpperCase(),
      button_bg: input.button_bg.toUpperCase(),
      button_text: input.button_text.toUpperCase(),
      button_border: input.button_border.toUpperCase(),
      button_style: input.button_style,
      button_radius: input.button_radius,
      button_shadow: input.button_shadow,
      font_family: input.font_family,
      font_weight: input.font_weight,
      display_name_color: input.display_name_color.toUpperCase(),
      bio_color: input.bio_color.toUpperCase(),
      footer_color: input.footer_color.toUpperCase(),
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
