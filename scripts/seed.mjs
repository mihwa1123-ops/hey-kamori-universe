// scripts/seed.mjs
// 로컬 개발용 테스트 데이터 주입 스크립트 (1회용)
// 실행: node scripts/seed.mjs 또는 pnpm seed

import { createClient } from '@supabase/supabase-js';
import process from 'node:process';

process.loadEnvFile('.env.local');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

if (!url || !serviceKey || !adminEmail) {
  console.error('❌ .env.local에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL 중 하나가 없습니다.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

// 1) Auth 사용자 확인/생성
console.log(`1️⃣  Auth 사용자 확인: ${adminEmail}`);
const { data: list, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) throw listErr;

let user = list.users.find((u) => u.email === adminEmail);
if (user) {
  console.log(`   ✅ 이미 존재 (id=${user.id})`);
} else {
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: adminEmail,
    email_confirm: true,
  });
  if (createErr) throw createErr;
  user = created.user;
  console.log(`   ✅ 새로 생성 (id=${user.id})`);
}

// 2) 프로필 upsert
console.log('2️⃣  프로필 upsert');
const { error: profileErr } = await admin.from('profiles').upsert(
  {
    id: user.id,
    username: 'hey.kamori',
    display_name: 'hey.kamori',
    bio: '카모리의 작은 링크 허브 🌸\n놀러와주세요',
    social_instagram: 'https://instagram.com/',
  },
  { onConflict: 'id' }
);
if (profileErr) throw profileErr;
console.log('   ✅ profiles 반영');

// 3) 테마 upsert (기본값)
console.log('3️⃣  테마 upsert');
const { error: themeErr } = await admin.from('themes').upsert(
  { profile_id: user.id },
  { onConflict: 'profile_id' }
);
if (themeErr) throw themeErr;
console.log('   ✅ themes 반영');

// 4) 샘플 링크 (중복 방지: 기존 링크 없을 때만 삽입)
console.log('4️⃣  샘플 링크 확인');
const { data: existing, error: linksErr } = await admin
  .from('links')
  .select('id')
  .eq('profile_id', user.id)
  .limit(1);
if (linksErr) throw linksErr;

if (existing && existing.length > 0) {
  console.log('   ✅ 이미 링크가 있음 — 삽입 건너뜀');
} else {
  const sampleLinks = [
    { profile_id: user.id, title: '포트폴리오', url: 'https://example.com/portfolio', display_order: 0 },
    { profile_id: user.id, title: '블로그', url: 'https://example.com/blog', display_order: 1 },
    { profile_id: user.id, title: 'Instagram', url: 'https://instagram.com/', display_order: 2 },
  ];
  const { error: insertErr } = await admin.from('links').insert(sampleLinks);
  if (insertErr) throw insertErr;
  console.log(`   ✅ 샘플 링크 ${sampleLinks.length}개 삽입`);
}

console.log('\n🎉 Seed 완료! 브라우저에서 http://localhost:3000 새로고침 하세요.');
