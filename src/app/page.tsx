"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { X, Droplet, Calendar, MapPin, Sparkles, Droplets, Waves, Search, ChevronDown, ChevronUp, SlidersHorizontal, Heart, Layers } from "lucide-react";

// 定义墨水的数据类型
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

function getDisplaySeriesName(series: string | null) {
  if (!series) return "";

  const seriesNameMap: Record<string, string> = {
    "Deep Dark": "深色系列",
    "深暗（Deep Dark）": "深色系列",
    "深色系列（Deep Dark）": "深色系列",
  };

  return seriesNameMap[series] || series;
}

export default function Home() {
  const [inks, setInks] = useState<Ink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInk, setSelectedInk] = useState<Ink | null>(null);
  
  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterSeries, setFilterSeries] = useState("");
  const [filterSheen, setFilterSheen] = useState(false);
  const [filterShimmer, setFilterShimmer] = useState(false);
  const [filterShading, setFilterShading] = useState(false);

  // 筛选器面板收起/展开状态
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 心愿单(Wishlist)和对比(Compare)状态
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // 初始化本地存储的 Wishlist
  useEffect(() => {
    const saved = localStorage.getItem("inklib_wishlist");
    if (saved) {
      try {
        setWishlistIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist:", e);
      }
    }
  }, []);

  // 当 wishlist 更新时存入本地
  useEffect(() => {
    localStorage.setItem("inklib_wishlist", JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 阻止触发卡片的点击详情事件
    setWishlistIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleCompare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 阻止触发卡片的点击详情事件
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 4) {
        alert("最多只能选择 4 款墨水进行对比哦！");
        return prev;
      }
      return [...prev, id];
    });
  };

  // 提取所有可用的品牌
  const availableBrands = useMemo(() => {
    const brandsSet = new Set(inks.map(ink => ink.brand).filter(Boolean));
    return Array.from(brandsSet) as string[];
  }, [inks]);

  // 根据当前选择的品牌，联动计算可用的系列
  const availableSeries = useMemo(() => {
    let filteredForSeries = inks;
    if (filterBrand) {
      filteredForSeries = inks.filter(ink => ink.brand === filterBrand);
    }
    const seriesSet = new Set(filteredForSeries.map(ink => ink.series).filter(Boolean));
    return Array.from(seriesSet) as string[];
  }, [inks, filterBrand]);

  // 如果当前选中的系列不在可选系列列表中，则清空系列选择
  useEffect(() => {
    if (filterSeries && !availableSeries.includes(filterSeries)) {
      setFilterSeries("");
    }
  }, [availableSeries, filterSeries]);

  // 重置所有筛选
  const handleResetFilters = () => {
    setFilterBrand("");
    setFilterSeries("");
    setFilterSheen(false);
    setFilterShimmer(false);
    setFilterShading(false);
    setShowWishlistOnly(false);
  };

  // 派生状态：根据搜索和筛选条件过滤后的墨水列表
  const filteredInks = useMemo(() => {
    return inks.filter(ink => {
      if (showWishlistOnly && !wishlistIds.includes(ink.id)) return false;

      const matchSearch = ink.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ink.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ink.series && ink.series.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchBrand = filterBrand ? ink.brand === filterBrand : true;
      const matchSeries = filterSeries ? ink.series === filterSeries : true;
      const matchSheen = filterSheen ? ink.has_sheen : true;
      const matchShimmer = filterShimmer ? ink.has_shimmer : true;
      const matchShading = filterShading ? ink.has_shading : true;
      
      return matchSearch && matchBrand && matchSeries && matchSheen && matchShimmer && matchShading;
    });
  }, [inks, searchQuery, filterBrand, filterSeries, filterSheen, filterShimmer, filterShading, showWishlistOnly, wishlistIds]);

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
    if (selectedInk || showCompareModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedInk, showCompareModal]);

  return (
    <main className="min-h-screen bg-gray-50 pb-36">
      {/* 顶部导航栏 */}
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            InkLib <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">彩墨档案馆</span>
          </h1>
        </div>
        
        {/* 搜索框和心愿单开关 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="搜索墨水名称、品牌或系列..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 transition-colors text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowWishlistOnly(!showWishlistOnly)} 
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${showWishlistOnly ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'}`}
            title="只看心愿单"
          >
            <Heart size={20} className={showWishlistOnly ? 'fill-red-500' : ''} />
          </button>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        
        {/* 筛选器折叠面板 */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <SlidersHorizontal size={18} />
              <span>筛选器</span>
              {(filterBrand || filterSeries || filterSheen || filterShimmer || filterShading) && (
                <span className="w-2 h-2 rounded-full bg-blue-500 ml-1"></span>
              )}
            </div>
            {isFilterOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
          </button>

          {isFilterOpen && (
            <div className="px-5 pb-5 pt-2 border-t border-gray-50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              
              {/* 品牌选择 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">品牌</label>
                <div className="relative">
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="">全部品牌</option>
                    {availableBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* 系列选择 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">系列</label>
                <div className="relative">
                  <select
                    value={filterSeries}
                    onChange={(e) => setFilterSeries(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:opacity-50"
                    disabled={availableSeries.length === 0}
                  >
                    <option value="">全部系列</option>
                    {availableSeries.map(series => (
                      <option key={series} value={series}>{getDisplaySeriesName(series)}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* 墨水特性 */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500">墨水特性</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-gray-800 checked:border-gray-800 transition-colors"
                        checked={filterSheen}
                        onChange={(e) => setFilterSheen(e.target.checked)}
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Sheen (光泽)</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-gray-800 checked:border-gray-800 transition-colors"
                        checked={filterShading}
                        onChange={(e) => setFilterShading(e.target.checked)}
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Shading (深浅变化)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-gray-800 checked:border-gray-800 transition-colors"
                        checked={filterShimmer}
                        onChange={(e) => setFilterShimmer(e.target.checked)}
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Shimmer (闪粉)</span>
                  </label>
                </div>
              </div>

              {/* 重置按钮 */}
              <div className="pt-2">
                <button 
                  onClick={handleResetFilters}
                  className="w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  重置筛选
                </button>
              </div>

            </div>
          )}
        </div>

        {/* 结果统计信息 */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
          <span>找到 {filteredInks.length} 个墨水样本</span>
        </div>

        {/* 墨水流 - 双列网格 */}
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredInks.map((ink) => (
              <div 
                key={ink.id} 
                onClick={() => setSelectedInk(ink)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-transform active:scale-95 cursor-pointer flex flex-col h-full"
              >
                {/* 颜色展示区 / 图片区 */}
                <div 
                  className="h-32 sm:h-40 w-full relative overflow-hidden shrink-0 group"
                  style={{ 
                    backgroundColor: ink.hex_code || "#e5e7eb",
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: ink.image_urls && ink.image_urls.length > 0 ? `url(${ink.image_urls[0]})` : 'none'
                    }}
                  />
                  {/* 如果没有设置色值和图片，显示提示 */}
                  {!ink.hex_code && (!ink.image_urls || ink.image_urls.length === 0) && (
                    <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs z-10">
                      暂无图片
                    </span>
                  )}
                  
                  {/* 标签 */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                    {ink.has_sheen && <span className="px-2 py-0.5 bg-white/95 text-[10px] rounded-md font-semibold text-gray-700 shadow-sm">Sheen</span>}
                    {ink.has_shimmer && <span className="px-2 py-0.5 bg-white/95 text-[10px] rounded-md font-semibold text-gray-700 shadow-sm">闪粉</span>}
                    {ink.has_shading && <span className="px-2 py-0.5 bg-white/95 text-[10px] rounded-md font-semibold text-gray-700 shadow-sm">层析</span>}
                  </div>
                </div>

                {/* 信息及操作区 */}
                <div className="p-3 flex flex-col flex-grow justify-between bg-white">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                      {ink.name}
                    </h2>
                    <div className="text-[11px] sm:text-xs text-gray-500 truncate mt-1">
                      {ink.brand}
                    </div>
                    {ink.series && (
                      <div className="text-[10px] sm:text-[11px] text-gray-400 truncate mt-0.5">
                        {getDisplaySeriesName(ink.series)}
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮区 (Wishlist & Compare) */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <button 
                      onClick={(e) => toggleWishlist(e, ink.id)} 
                      className={`p-1.5 rounded-full transition-colors ${wishlistIds.includes(ink.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100 hover:text-red-400'}`}
                      title={wishlistIds.includes(ink.id) ? "移出心愿单" : "加入心愿单"}
                    >
                      <Heart size={16} className={wishlistIds.includes(ink.id) ? 'fill-red-500' : ''} />
                    </button>
                    <button 
                      onClick={(e) => toggleCompare(e, ink.id)} 
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 ${compareIds.includes(ink.id) ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {compareIds.includes(ink.id) ? (
                        <>已加对比</>
                      ) : (
                        <><Layers size={12}/> 对比</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 悬浮对比状态栏 (仅在选中了对比墨水时显示) */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Layers size={16} />
              对比清单 ({compareIds.length}/4)
            </span>
            <button onClick={() => setCompareIds([])} className="text-gray-400 hover:text-white text-xs transition-colors">
              清空
            </button>
          </div>
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2">
              {compareIds.map(id => {
                const ink = inks.find(i => i.id === id);
                if (!ink) return null;
                return (
                  <div 
                    key={id} 
                    className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-700 relative group"
                    style={{
                      backgroundColor: ink.hex_code || "#374151",
                      backgroundImage: ink.image_urls && ink.image_urls.length > 0 ? `url(${ink.image_urls[0]})` : 'none'
                    }}
                    title={ink.name}
                  >
                    <button 
                      onClick={(e) => toggleCompare(e, ink.id)}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 shadow-sm md:scale-0 md:group-hover:scale-100 transition-transform"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                )
              })}
              {/* 占位符 */}
              {Array.from({ length: 4 - compareIds.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center opacity-50">
                  <span className="text-gray-500 text-xs">+</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowCompareModal(true)}
              disabled={compareIds.length < 2}
              className="bg-white text-gray-900 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-gray-100 transition-colors"
            >
              开始对比
            </button>
          </div>
        </div>
      )}

      {/* 对比详情 Modal (同屏网格布局) */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 animate-in slide-in-from-bottom-0 duration-300">
          {/* 对比模式的头部 */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 shadow-sm shrink-0 bg-white">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Layers size={20} /> 同屏颜色对比
            </h2>
            <button 
              onClick={() => setShowCompareModal(false)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* 同屏网格布局 (手机端2列，电脑端根据数量自适应) */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div className={`grid gap-2 sm:gap-4 max-w-5xl mx-auto h-full ${
              compareIds.length === 2 ? 'grid-cols-2' : 
              compareIds.length === 3 ? 'grid-cols-2 sm:grid-cols-3' : 
              'grid-cols-2' // 4个时就是 2x2 网格
            }`}>
              {compareIds.map(id => {
                const ink = inks.find(i => i.id === id);
                if (!ink) return null;
                return (
                  <div key={id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 flex flex-col">
                    {/* 大图展示 */}
                    <div 
                      className={`${compareIds.length > 2 ? 'h-32 sm:h-48' : 'h-48 sm:h-80'} w-full relative shrink-0`}
                      style={{ 
                        backgroundColor: ink.hex_code || "#e5e7eb",
                        backgroundImage: ink.image_urls && ink.image_urls.length > 0 ? `url(${ink.image_urls[0]})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!ink.hex_code && (!ink.image_urls || ink.image_urls.length === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">暂无图</div>
                      )}
                    </div>
                    
                    {/* 信息展示 (仅品牌、系列、名称、标签) */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-lg leading-tight mb-1 line-clamp-2">{ink.name}</h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-1">{ink.brand}</p>
                        {ink.series && <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">{getDisplaySeriesName(ink.series)}</p>}
                      </div>

                      {/* 特性 tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {ink.has_sheen && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-100">Sheen</span>}
                        {ink.has_shimmer && <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] rounded border border-yellow-100">闪粉</span>}
                        {ink.has_shading && <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] rounded border border-teal-100">层析</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 详情页 Modal (从底部弹出的 PWA 风格，单品查看) */}
      {selectedInk && !showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity animate-in fade-in duration-200">
          <div 
            className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
          >
            {/* 头部固定栏 */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div className="font-semibold text-gray-800 truncate pr-4">{selectedInk.brand} {selectedInk.series ? `· ${getDisplaySeriesName(selectedInk.series)}` : ''}</div>
              <button 
                onClick={() => setSelectedInk(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 滚动内容区 */}
            <div className="overflow-y-auto flex-1 pb-10">
              {/* 大图展示 */}
              <div 
                className="w-full h-72 sm:h-80 bg-gray-100 relative overflow-hidden"
                style={{ 
                  backgroundColor: selectedInk.hex_code || "#e5e7eb",
                }}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: selectedInk.image_urls && selectedInk.image_urls.length > 0 ? `url(${selectedInk.image_urls[0]})` : 'none',
                  }}
                />
                {!selectedInk.hex_code && (!selectedInk.image_urls || selectedInk.image_urls.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-10">暂无图片</div>
                )}
              </div>
              
              {/* 详情信息 */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 pr-4">{selectedInk.name}</h2>
                  <button 
                    onClick={(e) => toggleWishlist(e, selectedInk.id)}
                    className={`p-3 rounded-full shrink-0 shadow-sm transition-colors ${wishlistIds.includes(selectedInk.id) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    <Heart size={24} className={wishlistIds.includes(selectedInk.id) ? 'fill-red-500' : ''} />
                  </button>
                </div>
                
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
