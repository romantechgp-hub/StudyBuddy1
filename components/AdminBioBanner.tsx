
import React, { useState, useEffect } from 'react';

const AdminBioBanner: React.FC = () => {
  const [settings, setSettings] = useState({
    adminName: 'রিমন মাহমুদ রোমান',
    adminEmail: 'romantechgp@gmail.com',
    adminTagLine: 'অ্যাডমিন ও ডেভেলপার',
    adminBio: 'প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস।',
    adminImage: ''
  });

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('global_settings');
      if (saved) {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    };
    loadSettings();
    window.addEventListener('storage', loadSettings);
    window.addEventListener('local-storage-update', loadSettings);
    return () => {
      window.removeEventListener('storage', loadSettings);
      window.removeEventListener('local-storage-update', loadSettings);
    };
  }, []);

  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-xl p-6 sm:p-10 group">
        {/* Decorative background blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-[1.5rem] sm:rounded-[2.5rem] border-4 border-slate-50 bg-slate-100 overflow-hidden shadow-lg transform group-hover:rotate-3 transition-transform duration-500">
              {settings.adminImage ? (
                <img src={settings.adminImage} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-black text-slate-200">
                  👤
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-grow text-center md:text-left space-y-3">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">{settings.adminTagLine}</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{settings.adminName}</h3>
            </div>
            
            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed max-w-xl italic">
              "{settings.adminBio}"
            </p>
            
            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-lg">📧</span>
                <span className="text-[10px] sm:text-xs font-black text-slate-700">{settings.adminEmail}</span>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-lg">🛡️</span>
                <span className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase tracking-widest">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBioBanner;
