"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// 定义墨水的数据类型，与我们在数据库中建立的表结构一致
type Ink = {
  id: string;
  brand: string;
  series: string | null;
  name: string;
  hex_code: string | null;
  has_sheen: boolean;
  has_shimmer: boolean;
  has_shading: boolean;
  image_urls: string[] | null;
};

export default function Home() {
  const [inks, setInks] = useState<Ink[]>([]);
  const [loading, setLoading] = useState(true);

  // 当页面加载时，去 Supabase 获取数据
  useEffect(() => {
    async function fetchInks() {
      try {
        const { data, error } = await supabase
          .from("inks")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("获取数据失败:", error);
        } else {
          setInks(data || []);
        }
      } catch (err) {
        console.error("发生错误:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInks();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <header className="bg-white px-6 py-5 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          InkLib <span className="text-sm font-normal text-gray-500 ml-2">彩墨档案馆</span>
        </h1>
      </header>

      <div className="p-6 max-w-md mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          </div>
        ) : inks.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg mb-2">🫙</p>
            <p>还没有收录任何墨水</p>
            <p className="text-sm mt-2 text-gray-400">请在数据库中添加数据后刷新查看</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* 墨水卡片列表 */}
            {inks.map((ink) => (
              <div 
                key={ink.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-transform active:scale-95"
              >
                {/* 颜色展示区 / 图片区 */}
                <div 
                  className="h-48 w-full flex items-end p-4 relative bg-cover bg-center"
                  style={{ 
                    backgroundColor: ink.hex_code || "#e5e7eb",
                    backgroundImage: ink.image_urls && ink.image_urls.length > 0 ? `url(${ink.image_urls[0]})` : 'none'
                  }}
                >
                  {/* 半透明遮罩，为了让标签更清晰 */}
                  {ink.image_urls && ink.image_urls.length > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  )}

                  {/* 如果没有设置色值和图片，显示提示 */}
                  {!ink.hex_code && (!ink.image_urls || ink.image_urls.length === 0) && (
                    <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                      暂无色值
                    </span>
                  )}
                  {/* 标签 */}
                  <div className="flex gap-2 relative z-10">
                    {ink.has_sheen && <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs rounded-full font-medium text-gray-800">✨ Sheen</span>}
                    {ink.has_shimmer && <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs rounded-full font-medium text-gray-800">🌟 金粉</span>}
                    {ink.has_shading && <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs rounded-full font-medium text-gray-800">🌊 层析</span>}
                  </div>
                </div>

                {/* 信息区 */}
                <div className="p-5">
                  <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">
                    {ink.brand} {ink.series ? `· ${ink.series}` : ""}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{ink.name}</h2>
                  
                  {ink.hex_code && (
                    <div className="text-sm text-gray-500 font-mono mt-3">
                      {ink.hex_code.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
