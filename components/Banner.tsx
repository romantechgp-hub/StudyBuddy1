
import React, { useState, useEffect } from 'react';

const Banner: React.FC = () => {
  const [settings, setSettings] = useState({
    mainBannerTitle: 'অ্যাডমিন',
    mainBannerSubtitle: 'এআই-এর সাথে পড়াশোনা হোক আরও সহজ ও আনন্দদায়ক।',
    mainBannerImage: '',
    mainBannerBgColor: 'from-indigo-600 to-purple-600'
  });

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('global_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({
          ...prev,
          mainBannerTitle: parsed.mainBannerTitle || 'অ্যাডমিন',
          mainBannerSubtitle: parsed.mainBannerSubtitle || prev.mainBannerSubtitle,
          mainBannerImage: parsed.mainBannerImage || '',
          mainBannerBgColor: parsed.mainBannerBgColor || prev.mainBannerBgColor
        }));
      }
    };
    loadSettings();
    window.addEventListener('local-storage-update', loadSettings);
    return () => window.removeEventListener('local-storage-update', loadSettings);
  }, []);

  if (settings.mainBannerImage) {
    return (
      <div className="w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 group animate-in fade-in zoom-in duration-1000 mb-8">
        <div className="relative aspect-[8/1] sm:aspect-[12/1] w-full">
          <img src={settings.mainBannerImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main Banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-5">
            <h2 className="text-white text-base sm:text-xl font-black tracking-tight mb-0.5 drop-shadow-lg">{settings.mainBannerTitle}</h2>
            <p className="text-white/90 text-[9px] sm:text-xs font-bold max-w-xl drop-shadow-md">{settings.mainBannerSubtitle}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br ${settings.mainBannerBgColor} p-3 sm:p-5 text-white relative overflow-hidden shadow-lg border border-white/10 animate-in fade-in zoom-in duration-1000 mb-8`}>
      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-1">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
          ✨ অ্যাডমিন
        </div>
        <div className="space-y-0.5 max-w-2xl">
          <h2 className="text-lg sm:text-2xl font-black tracking-tighter leading-tight drop-shadow-sm">
            {settings.mainBannerTitle}
          </h2>
          <p className="text-white/80 text-[9px] sm:text-xs font-medium leading-relaxed drop-shadow-sm">
            {settings.mainBannerSubtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Banner;
