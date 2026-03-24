"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Droplet, Calendar, MapPin, Sparkles, Droplets, Waves } from "lucide-react";

// 定义墨水的数据类型，与我们在数据库中建立的表结构一致
type Ink = {
  id: string;
  brand: string;
  series: string | null;
  name: string;
  hex_code: string | null;
  origin: string | null;
  release_year: number | null;
  base_type: string | null;
  has_sheen: boolean;
  has_shimmer: boolean;
  has_shading: boolean;
  is_scented: boolean;
  is_waterproof: boolean;
  image_urls: string[] | null;
};

export default function Home() {
  const [inks, setInks] = useState<Ink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInk, setSelectedInk] = useState<Ink | null>(null);
  
  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterSheen, setFilterSheen] = useState(false);
  const [filterShimmer, setFilterShimmer] = useState(false);
  const [filterShading, setFilterShading] = useState(false);

  // 派生状态：根据搜索和筛选条件过滤后的墨水列表
  const filteredInks = inks.filter(ink => {
    const matchSearch = ink.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        ink.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBrand = filterBrand ? ink.brand.toLowerCase() === filterBrand.toLowerCase() : true;
    const matchSheen = filterSheen ? ink.has_sheen : true;
    const matchShimmer = filterShimmer ? ink.has_shimmer : true;
    const matchShading = filterShading ? ink.has_shading : true;
    
    return matchSearch && matchBrand && matchSheen && matchShimmer && matchShading;
  });

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

  // 禁用背景滚动
  useEffect(() => {
    if (selectedInk) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedInk]);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <header className="bg-white px-6 py-5 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          InkLib <span className="text-sm font-normal text-gray-500 ml-2">彩墨档案馆</span>
        </h1>
      </header>

      <div className="p-6 max-w-md mx-auto">
        {/* 搜索与筛选区 */}
        <div className="mb-6 space-y-4">
          <input 
            type="text" 
            placeholder="搜索墨水名称或品牌..." 
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* 品牌下拉筛选 */}
          <div className="relative">
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full appearance-none px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 font-medium"
            >
              <option value="">🏷️ 全部品牌</option>
              <option value="Pilot">Pilot (百乐色彩雫)</option>
              <option value="Sailor">Sailor (写乐四季彩)</option>
              <option value="Diamine">Diamine (戴阿米)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setFilterSheen(!filterSheen)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterSheen ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              ✨ Sheen (金属光泽)
            </button>
            <button 
              onClick={() => setFilterShimmer(!filterShimmer)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterShimmer ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              🌟 Shimmer (金粉)
            </button>
            <button 
              onClick={() => setFilterShading(!filterShading)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterShading ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              🌊 Shading (层析/渐变)
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          </div>
        ) : filteredInks.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg mb-2">🫙</p>
            <p>没有找到符合条件的墨水</p>
            <p className="text-sm mt-2 text-gray-400">请尝试更换搜索词或取消筛选标签</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* 墨水卡片列表 */}
            {filteredInks.map((ink) => (
              <div 
                key={ink.id} 
                onClick={() => setSelectedInk(ink)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-transform active:scale-95 cursor-pointer"
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
                  
                  {/* 暂时隐藏列表卡片上的色号展示
                  {ink.hex_code && (
                    <div className="text-sm text-gray-500 font-mono mt-3">
                      {ink.hex_code.toUpperCase()}
                    </div>
                  )}
                  */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 详情页 Modal (从底部弹出的 PWA 风格) */}
      {selectedInk && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity animate-in fade-in duration-200">
          <div 
            className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
          >
            {/* 头部固定栏 */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div className="font-semibold text-gray-800">{selectedInk.brand}</div>
              <button 
                onClick={() => setSelectedInk(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 滚动内容区 */}
            <div className="overflow-y-auto flex-1 pb-10">
              {/* 大图展示 */}
              <div 
                className="w-full h-72 sm:h-80 bg-gray-100 relative"
                style={{ 
                  backgroundColor: selectedInk.hex_code || "#e5e7eb",
                  backgroundImage: selectedInk.image_urls && selectedInk.image_urls.length > 0 ? `url(${selectedInk.image_urls[0]})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!selectedInk.hex_code && (!selectedInk.image_urls || selectedInk.image_urls.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">暂无图片</div>
                )}
              </div>
              
              {/* 详情信息 */}
              <div className="p-6">
                <div className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-2">
                  {selectedInk.series || "经典系列"}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{selectedInk.name}</h2>
                
                {/* 暂时隐藏详情页中的色号展示
                {selectedInk.hex_code && (
                  <div className="flex items-center gap-3 mb-8">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: selectedInk.hex_code }}
                    ></div>
                    <span className="font-mono text-gray-600 font-medium">{selectedInk.hex_code.toUpperCase()}</span>
                  </div>
                )}
                */}
                
                {/* 属性网格 */}
                <h3 className="text-lg font-bold text-gray-800 mb-4">墨水特性</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className={`p-4 rounded-2xl border ${selectedInk.has_sheen ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={18} className={selectedInk.has_sheen ? 'text-blue-500' : 'text-gray-400'} />
                      <span className={`font-semibold ${selectedInk.has_sheen ? 'text-blue-900' : 'text-gray-500'}`}>Sheen</span>
                    </div>
                    <p className="text-xs text-gray-500">金属反光</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${selectedInk.has_shimmer ? 'bg-yellow-50 border-yellow-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets size={18} className={selectedInk.has_shimmer ? 'text-yellow-500' : 'text-gray-400'} />
                      <span className={`font-semibold ${selectedInk.has_shimmer ? 'text-yellow-900' : 'text-gray-500'}`}>Shimmer</span>
                    </div>
                    <p className="text-xs text-gray-500">金粉/银粉</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${selectedInk.has_shading ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Waves size={18} className={selectedInk.has_shading ? 'text-teal-500' : 'text-gray-400'} />
                      <span className={`font-semibold ${selectedInk.has_shading ? 'text-teal-900' : 'text-gray-500'}`}>Shading</span>
                    </div>
                    <p className="text-xs text-gray-500">层析/渐变</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${selectedInk.is_waterproof ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Droplet size={18} className={selectedInk.is_waterproof ? 'text-indigo-500' : 'text-gray-400'} />
                      <span className={`font-semibold ${selectedInk.is_waterproof ? 'text-indigo-900' : 'text-gray-500'}`}>Waterproof</span>
                    </div>
                    <p className="text-xs text-gray-500">防水特性</p>
                  </div>
                </div>

                {/* 基础信息 */}
                <h3 className="text-lg font-bold text-gray-800 mb-4">基本信息</h3>
                <div className="space-y-3 bg-gray-50 p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin size={16} />
                      <span className="text-sm">产地</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{selectedInk.origin || "未知"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={16} />
                      <span className="text-sm">发售年份</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{selectedInk.release_year || "未知"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Droplet size={16} />
                      <span className="text-sm">墨水基底</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {selectedInk.base_type === 'Dye' ? '染料 (Dye)' : 
                       selectedInk.base_type === 'Pigment' ? '颜料 (Pigment)' : 
                       selectedInk.base_type === 'Iron Gall' ? '铁胆 (Iron Gall)' : "未知"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
