
import React, { useState, useEffect } from 'react';

const Banner: React.FC = () => {
  const [settings, setSettings] = useState({
    adminName: 'রিমন মাহমুদ রোমান',
    adminEmail: 'romantechgp@gmail.com'
  });

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('global_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    };
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  return (
    <div className="bg-indigo-600 text-white py-2.5 shadow-md relative overflow-hidden">
      {/* Animated background element for dynamism */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/5 -skew-x-12 translate-x-[-50%] animate-[pulse_4s_infinite]"></div>
      
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
          <span className="font-black text-[11px] sm:text-xs uppercase tracking-widest">
            অ্যাডমিন: <span className="text-amber-300">{settings.adminName}</span>
          </span>
        </div>
        <div className="hidden sm:block h-3 w-[1px] bg-white/20"></div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest opacity-80">যোগাযোগ:</span>
          <span className="font-mono bg-white/10 px-3 py-0.5 rounded-full text-[10px] sm:text-xs border border-white/10 hover:bg-white/20 transition-all cursor-default">
            {settings.adminEmail}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
