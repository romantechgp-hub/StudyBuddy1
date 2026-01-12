import React, { useState, useEffect } from 'react';
import { UserProfile, BannerImage, AdminLink, AdminNotice } from '../types';
import ImageCropper from './ImageCropper';
import UserIdCard from './UserIdCard';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'support' | 'notices' | 'links' | 'banners' | 'settings'>('users');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  
  const [idCardUser, setIdCardUser] = useState<UserProfile | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperAspect, setCropperAspect] = useState(1);
  const [cropperTarget, setCropperTarget] = useState<'logo' | 'adminImg' | 'mainBanner' | 'customBanner' | null>(null);

  const [globalSettings, setGlobalSettings] = useState({
    appName: 'স্টাডিবাডি',
    appSubtitle: 'আপনার পড়াশোনার বন্ধু',
    appLogo: '',
    adminName: 'রিমন মাহমুদ রোমান',
    adminEmail: 'romantechgp@gmail.com',
    adminBio: 'প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস।',
    adminImage: '',
    aiSystemInstruction: "You are Roman, a friendly AI tutor. Correct errors in Bengali and reply in English with translations.",
    dailyRewardPoints: 10,
    footerText: '"প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস"',
    mainBannerTitle: 'অ্যাডমিন',
    mainBannerSubtitle: 'এআই-এর সাথে পড়াশোনা হোক আরও সহজ ও আনন্দদায়ক।',
    mainBannerImage: '',
    mainBannerBgColor: 'from-indigo-600 to-purple-600'
  });

  const loadData = () => {
    // Registered Users Source of Truth - consistent with App.tsx
    const rawUsers = JSON.parse(localStorage.getItem('studybuddy_registered_users') || '[]');
    setUsers(rawUsers);
    
    setTickets(JSON.parse(localStorage.getItem('admin_tickets') || '[]'));
    setBanners(JSON.parse(localStorage.getItem('admin_banners') || '[]'));
    setLinks(JSON.parse(localStorage.getItem('admin_links') || '[]'));
    setNotices(JSON.parse(localStorage.getItem('admin_notices') || '[]'));
    
    const savedSettings = localStorage.getItem('global_settings');
    if (savedSettings) setGlobalSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
  };

  useEffect(() => {
    loadData();
    // Poll every 2 seconds to simulate "real-time" data from all users on this browser
    const interval = setInterval(loadData, 2000);
    window.addEventListener('local-storage-update', loadData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('local-storage-update', loadData);
    };
  }, []);

  const syncStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('local-storage-update'));
  };

  const handleToggleBlock = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u);
    syncStorage('studybuddy_registered_users', updated);
  };

  const handleRemoveUser = (userId: string) => {
    if (!window.confirm('ইউজারটিকে মুছে ফেলতে চান?')) return;
    const updated = users.filter(u => u.id !== userId);
    syncStorage('studybuddy_registered_users', updated);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col h-[850px] overflow-hidden animate-in fade-in duration-500">
      {cropperImage && (
        <ImageCropper 
          image={cropperImage} aspect={cropperAspect} 
          onCropComplete={(cropped) => {
            if (cropperTarget === 'logo') setGlobalSettings(p => ({...p, appLogo: cropped}));
            if (cropperTarget === 'adminImg') setGlobalSettings(p => ({...p, adminImage: cropped}));
            setCropperImage(null);
          }} onCancel={() => setCropperImage(null)} 
        />
      )}

      {idCardUser && (
        <UserIdCard user={idCardUser} adminName={globalSettings.adminName} onClose={() => setIdCardUser(null)} isAdmin={true} onUpdateUser={(u) => {
          const updated = users.map(user => user.id === u.id ? u : user);
          syncStorage('studybuddy_registered_users', updated);
          setIdCardUser(u);
        }} />
      )}

      <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl">🛡️</div>
          <div>
            <h2 className="font-black text-lg tracking-tight leading-none">অ্যাডমিন কন্ট্রোল</h2>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">রিয়েল-টাইম ইউজার ডাটা</p>
          </div>
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 overflow-x-auto no-scrollbar max-w-full">
          {['users', 'support', 'notices', 'links', 'banners', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              {tab === 'users' ? 'ইউজার' : tab === 'support' ? 'হেল্প' : tab === 'notices' ? 'নোটিশ' : tab === 'links' ? 'লিংক' : tab === 'banners' ? 'ব্যানার' : 'সেটিংস'}
            </button>
          ))}
          <button onClick={onBack} className="ml-2 bg-rose-600/20 text-rose-500 px-3 py-2 rounded-lg text-[10px] font-black">X</button>
        </div>
      </div>

      <div className="flex-grow overflow-hidden bg-slate-50/30">
        {activeTab === 'users' && (
          <div className="h-full overflow-y-auto p-6 space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center justify-between">
              নিবন্ধিত ইউজার ({users.length})
              <span className="text-[9px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full animate-pulse font-black uppercase">Syncing...</span>
            </h3>
            {users.length === 0 ? (
               <div className="p-20 text-center text-slate-300 font-black uppercase">কোনো ইউজার পাওয়া যায়নি</div>
            ) : (
              users.map(u => (
                <div key={u.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl flex flex-col md:flex-row gap-6 items-center relative group hover:scale-[1.01] transition-transform">
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black shadow-lg shadow-indigo-100">{u.points} PTS</div>
                  
                  <div className="w-20 h-20 rounded-2xl border-4 border-slate-50 overflow-hidden shrink-0 shadow-sm">
                    {u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-300">{u.name[0]}</div>}
                  </div>

                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">নাম ও আইডি</p>
                      <p className="font-black text-slate-800 leading-none text-lg">{u.name}</p>
                      <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-wider">ID: {u.id}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">পাসওয়ার্ড ও স্ট্যাটাস</p>
                      <p className="font-bold text-slate-600 text-xs">Pass: <span className="text-slate-800">{u.password}</span></p>
                      <p className={`text-[10px] font-black uppercase mt-1 tracking-widest ${u.isBlocked ? 'text-rose-500' : 'text-emerald-500'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setIdCardUser(u)} className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-sm hover:bg-amber-600 hover:text-white transition-all" title="আইডি কার্ড">🪪</button>
                    <button onClick={() => handleToggleBlock(u.id)} className={`p-3 rounded-xl shadow-sm transition-all ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white'}`} title={u.isBlocked ? 'আনব্লক' : 'ব্লক'}>{u.isBlocked ? '🔓' : '🚫'}</button>
                    <button onClick={() => handleRemoveUser(u.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all" title="মুছে ফেলুন">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto p-8 space-y-8 bg-white">
            <h3 className="text-2xl font-black text-slate-800 border-b pb-4">গ্লোবাল সেটিংস</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">অ্যাপের নাম</label>
                 <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-800 font-bold" value={globalSettings.appName} onChange={e => setGlobalSettings({...globalSettings, appName: e.target.value})} />
              </div>
              <div className="space-y-4">
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">সাবটাইটেল</label>
                 <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-800 font-bold" value={globalSettings.appSubtitle} onChange={e => setGlobalSettings({...globalSettings, appSubtitle: e.target.value})} />
              </div>
            </div>
            <button 
              onClick={() => syncStorage('global_settings', globalSettings)} 
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
            >
              সবগুলো পরিবর্তন সেভ করুন
            </button>
          </div>
        )}

        {/* Other tabs can be added here if needed, but 'users' is the priority for you now */}
        {(activeTab === 'support' || activeTab === 'notices' || activeTab === 'links' || activeTab === 'banners') && (
           <div className="h-full flex items-center justify-center text-slate-400 font-black uppercase text-xs tracking-widest">
             ইউজার ডাটা রিয়েল-টাইমে দেখতে প্রথম ট্যাব (ইউজার) ব্যবহার করুন।
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;