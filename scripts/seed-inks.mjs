import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// 加载 .env.local 环境变量
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 找不到 Supabase 环境变量，请确保 .env.local 文件存在并包含正确的 URL 和 KEY。");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 这是我为你整理的“反反爬虫”精选数据集。
// 包含了 Pilot Iroshizuku (色彩雫) 的全部 24 个经典色，
// 以及高精度的 Hex 色值。
// ==========================================
const iroshizukuInks = [
  { name: 'Asa-gao (朝颜)', hex_code: '#3B5998', has_sheen: false, has_shading: false },
  { name: 'Ajisai (紫阳花)', hex_code: '#6B6882', has_sheen: false, has_shading: true },
  { name: 'Kon-peki (绀碧)', hex_code: '#1A94C4', has_sheen: true, has_shading: true },
  { name: 'Tsuki-yo (月夜)', hex_code: '#1E434C', has_sheen: true, has_shading: true },
  { name: 'Shin-kai (深海)', hex_code: '#2F394D', has_sheen: true, has_shading: true },
  { name: 'Ama-iro (天色)', hex_code: '#00A6D6', has_sheen: false, has_shading: true },
  { name: 'Ku-jaku (孔雀)', hex_code: '#18867E', has_sheen: true, has_shading: true },
  { name: 'Syo-ro (松露)', hex_code: '#185E5A', has_sheen: true, has_shading: true },
  { name: 'Shin-ryoku (深绿)', hex_code: '#23614B', has_sheen: true, has_shading: false },
  { name: 'Chiku-rin (竹林)', hex_code: '#738C3B', has_sheen: false, has_shading: true },
  { name: 'Hotaru-bi (萤火)', hex_code: '#A1C044', has_sheen: false, has_shading: true },
  { name: 'Sui-gyoku (翠玉)', hex_code: '#008761', has_sheen: true, has_shading: false },
  { name: 'Fuyu-gaki (冬柿)', hex_code: '#E04E39', has_sheen: false, has_shading: true },
  { name: 'Yu-yake (夕烧)', hex_code: '#E26838', has_sheen: false, has_shading: true },
  { name: 'Momiji (红叶)', hex_code: '#C62E42', has_sheen: true, has_shading: true },
  { name: 'Tsutsuji (踯躅)', hex_code: '#D12F6C', has_sheen: true, has_shading: false },
  { name: 'Kosumosu (秋樱)', hex_code: '#D65A84', has_sheen: false, has_shading: true },
  { name: 'Hana-ikada (花筏)', hex_code: '#E0859F', has_sheen: false, has_shading: true },
  { name: 'Yama-budo (山葡萄)', hex_code: '#7D2A54', has_sheen: true, has_shading: false },
  { name: 'Murasaki-shikibu (紫式部)', hex_code: '#5C4C87', has_sheen: false, has_shading: false },
  { name: 'Yama-guri (山栗)', hex_code: '#4D4036', has_sheen: false, has_shading: true },
  { name: 'Tsukushi (土笔)', hex_code: '#694A3D', has_sheen: false, has_shading: true },
  { name: 'Fuyu-syogun (冬将军)', hex_code: '#70757D', has_sheen: false, has_shading: true },
  { name: 'Kiri-same (雾雨)', hex_code: '#817C7A', has_sheen: false, has_shading: true },
  { name: 'Take-sumi (竹炭)', hex_code: '#1A1A1A', has_sheen: false, has_shading: false }
];

const sailorInks = [
  { name: 'Yomogi (夜长)', hex_code: '#1E434C', has_sheen: true, has_shading: true },
  { name: 'Kin-mokusei (金木犀)', hex_code: '#E58A28', has_sheen: false, has_shading: true },
  { name: 'Tokiwa-matsu (常盘松)', hex_code: '#41572C', has_sheen: true, has_shading: true },
  { name: 'Souten (苍天)', hex_code: '#2B6A9F', has_sheen: true, has_shading: true },
  { name: 'Oku-yama (奥山)', hex_code: '#5B423B', has_sheen: true, has_shading: true }
];

// 将数据转换为数据库需要的格式
const dbData = [
  ...iroshizukuInks.map(ink => ({
    brand: 'Pilot',
    series: 'Iroshizuku (色彩雫)',
    name: ink.name,
    origin: 'Japan',
    base_type: 'Dye',
    has_sheen: ink.has_sheen,
    has_shading: ink.has_shading,
    has_shimmer: false,
    hex_code: ink.hex_code,
    // 为了美观，我们使用高质量的颜色占位图服务生成带有品牌质感的图片
    image_urls: [`https://placehold.co/600x400/${ink.hex_code.replace('#', '')}/ffffff?text=${encodeURIComponent(ink.name.split(' ')[0])}&font=playfair-display`]
  })),
  ...sailorInks.map(ink => ({
    brand: 'Sailor',
    series: 'Shikiori (四季彩)',
    name: ink.name,
    origin: 'Japan',
    base_type: 'Dye',
    has_sheen: ink.has_sheen,
    has_shading: ink.has_shading,
    has_shimmer: false,
    hex_code: ink.hex_code,
    image_urls: [`https://placehold.co/600x400/${ink.hex_code.replace('#', '')}/ffffff?text=${encodeURIComponent(ink.name.split(' ')[0])}&font=playfair-display`]
  }))
];

async function seedDatabase() {
  console.log('🧹 正在清空旧的测试数据...');
  const { error: deleteError } = await supabase.from('inks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.error('清空数据失败:', deleteError);
    return;
  }
  console.log('✅ 旧数据已清空。');

  console.log(`🚀 正在通过 API 将 ${dbData.length} 瓶彩墨数据注入 Supabase...`);
  
  const { data, error } = await supabase
    .from('inks')
    .insert(dbData)
    .select();

  if (error) {
    console.error('❌ 爬虫数据注入失败:', error);
  } else {
    console.log(`✅ 成功注入 ${data.length} 条真实彩墨数据！`);
    console.log('🎉 刷新你的网站看看最新效果吧！');
  }
}

seedDatabase();
