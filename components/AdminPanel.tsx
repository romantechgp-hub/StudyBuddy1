
import React, { useState, useEffect } from 'react';
import { UserProfile, BannerImage, AdminLink, AdminNotice } from '../types';
import ImageCropper from './ImageCropper';
import UserIdCard from './UserIdCard';

interface AdminPanelProps {
  onBack: () => void;
}

const bannerSizes = [
  { label: 'Leaderboard (728x90)', width: 728, height: 90, aspect: 728 / 90 },
  { label: 'Medium Rectangle (300x250)', width: 300, height: 250, aspect: 300 / 250 },
  { label: 'Large Rectangle (336x280)', width: 336, height: 280, aspect: 336 / 280 },
  { label: 'Wide Skyscraper (160x600)', width: 160, height: 600, aspect: 160 / 600 },
  { label: 'Half Page (300x600)', width: 300, height: 600, aspect: 300 / 600 },
  { label: 'Mobile Banner (320x50)', width: 320, height: 50, aspect: 320 / 50 },
  { label: 'Large Mobile Banner (320x100)', width: 320, height: 100, aspect: 320 / 100 }
];

const bgGradients = [
  { label: 'Indigo Purple', value: 'from-indigo-600 to-purple-600' },
  { label: 'Sky Blue', value: 'from-sky-500 to-indigo-600' },
  { label: 'Rose Pink', value: 'from-rose-500 to-pink-600' },
  { label: 'Emerald Teal', value: 'from-emerald-500 to-teal-600' },
  { label: 'Amber Orange', value: 'from-amber-400 to-orange-600' },
  { label: 'Midnight Black', value: 'from-slate-800 to-slate-950' },
  { label: 'Deep Ocean', value: 'from-blue-800 to-blue-600' }
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'support' | 'notices' | 'links' | 'banners' | 'settings'>('users');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  
  // Admin Credentials form
  const [adminCreds, setAdminCreds] = useState({ id: 'Rimon', pass: '13457' });

  // Form states
  const [newNotice, setNewNotice] = useState({ title: '', content: '', type: 'info' as 'info' | 'warning' | 'success' });
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [newUser, setNewUser] = useState({ name: '', id: '', password: '' });
  const [editingCreds, setEditingCreds] = useState<{ userId: string, newId: string, newPass: string } | null>(null);
  const [selectedBannerSizeIndex, setSelectedBannerSizeIndex] = useState(0);

  const [idCardUser, setIdCardUser] = useState<UserProfile | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperAspect, setCropperAspect] = useState(1);
  const [cropperTarget, setCropperTarget] = useState<'logo' | 'adminImg' | 'mainBanner' | 'newBanner' | null>(null);

  const [globalSettings, setGlobalSettings] = useState({
    appName: 'স্টাডিবাডি',
    appSubtitle: 'আপনার পড়াশোনার বন্ধু',
    appLogo: '',
    adminName: 'রিমন মাহমুদ রোমান',
    adminEmail: 'romantechgp@gmail.com',
    adminTagLine: 'অ্যাডমিন ও ডেভেলপার',
    adminBio: 'প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস।',
    adminImage: '',
    aiSystemInstruction: "You are Roman, a friendly AI tutor. Correct errors in Bengali and reply in English with Bengali translations in brackets.",
    dailyRewardPoints: 10,
    footerText: '"প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস"',
    mainBannerTitle: 'অ্যাডমিন',
    mainBannerSubtitle: 'এআই-এর সাথে পড়াশোনা হোক আরও সহজ ও আনন্দদায়ক।',
    mainBannerImage: '',
    mainBannerBgColor: 'from-indigo-600 to-purple-600'
  });

  const loadData = () => {
    setUsers(JSON.parse(localStorage.getItem('studybuddy_registered_users') || '[]'));
    setTickets(JSON.parse(localStorage.getItem('admin_tickets') || '[]'));
    setBanners(JSON.parse(localStorage.getItem('admin_banners') || '[]'));
    setLinks(JSON.parse(localStorage.getItem('admin_links') || '[]'));
    setNotices(JSON.parse(localStorage.getItem('admin_notices') || '[]'));
    
    const savedSettings = localStorage.getItem('global_settings');
    if (savedSettings) setGlobalSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));

    const savedCreds = localStorage.getItem('admin_credentials');
    if (savedCreds) setAdminCreds(JSON.parse(savedCreds));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
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

  const handleAdminLogout = () => {
    if(confirm('আপনি কি অ্যাডমিন ড্যাশবোর্ড থেকে লগআউট করতে চান?')) {
      onBack();
    }
  };

  const handleUpdateAdminCreds = () => {
    if (!adminCreds.id || !adminCreds.pass) {
      alert('আইডি এবং পাসওয়ার্ড উভয়ই প্রদান করুন।');
      return;
    }
    syncStorage('admin_credentials', adminCreds);
    alert('অ্যাডমিন ক্রেডেনশিয়াল সফলভাবে আপডেট করা হয়েছে। পরবর্তী লগইনে এটি কার্যকর হবে।');
  };

  // Manual User Registration
  const handleManualRegister = () => {
    if (!newUser.name || !newUser.id || !newUser.password) {
      alert('সবগুলো ঘর পূরণ করুন।');
      return;
    }
    if (users.find(u => u.id === newUser.id)) {
      alert('এই আইডি ইতিমধ্যে অন্য ইউজার ব্যবহার করছে।');
      return;
    }
    const user: UserProfile = {
      ...newUser,
      points: 0,
      streak: 1,
      lastActive: new Date().toISOString(),
      isBlocked: false
    };
    const updated = [...users, user];
    syncStorage('studybuddy_registered_users', updated);
    setNewUser({ name: '', id: '', password: '' });
    alert('ইউজার সফলভাবে রেজিস্টার হয়েছে।');
  };

  const handleUpdateCreds = () => {
    if (!editingCreds) return;
    const { userId, newId, newPass } = editingCreds;
    if (!newId || !newPass) return;
    
    if (newId !== userId && users.find(u => u.id === newId)) {
      alert('এই আইডিটি অন্য কেউ ব্যবহার করছে।');
      return;
    }

    const updated = users.map(u => u.id === userId ? { ...u, id: newId, password: newPass } : u);
    syncStorage('studybuddy_registered_users', updated);
    setEditingCreds(null);
    alert('ক্রেডেনশিয়াল আপডেট হয়েছে।');
  };

  // Support Reply Logic
  const handleReply = () => {
    if (!selectedTicket || !reply.trim()) return;
    const timestamp = new Date().toLocaleTimeString();
    const newMsg = { sender: 'admin', text: reply, time: timestamp };
    const userChatKey = `support_chat_${selectedTicket.userId}`;
    const userChat = JSON.parse(localStorage.getItem(userChatKey) || '[]');
    const updatedUserChat = [...userChat, newMsg];
    localStorage.setItem(userChatKey, JSON.stringify(updatedUserChat));

    const updatedTickets = tickets.map(t => 
      t.userId === selectedTicket.userId 
        ? { ...t, messages: updatedUserChat, lastUpdate: Date.now() } 
        : t
    );
    syncStorage('admin_tickets', updatedTickets);
    setReply('');
    setSelectedTicket({ ...selectedTicket, messages: updatedUserChat });
  };

  // Notice Logic
  const handleAddNotice = () => {
    if (!newNotice.title || !newNotice.content) return;
    const notice: AdminNotice = {
      id: Math.random().toString(36).substr(2, 9),
      ...newNotice,
      timestamp: Date.now()
    };
    const updated = [notice, ...notices];
    syncStorage('admin_notices', updated);
    setNewNotice({ title: '', content: '', type: 'info' });
  };

  const handleDeleteNotice = (id: string) => {
    syncStorage('admin_notices', notices.filter(n => n.id !== id));
  };

  // Link Logic
  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) return;
    const link: AdminLink = {
      id: Math.random().toString(36).substr(2, 9),
      ...newLink,
      timestamp: Date.now()
    };
    const updated = [link, ...links];
    syncStorage('admin_links', updated);
    setNewLink({ title: '', url: '' });
  };

  const handleDeleteLink = (id: string) => {
    syncStorage('admin_links', links.filter(l => l.id !== id));
  };

  const handleDeleteBanner = (id: string) => {
    syncStorage('admin_banners', banners.filter(b => b.id !== id));
  };

  const handleToggleBlock = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u);
    syncStorage('studybuddy_registered_users', updated);
  };

  const triggerCropper = (target: 'logo' | 'adminImg' | 'mainBanner' | 'newBanner', aspect: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const f = e.target.files?.[0];
      if (f) {
        const r = new FileReader();
        r.onload = () => {
          setCropperAspect(aspect);
          setCropperTarget(target);
          setCropperImage(r.result as string);
        };
        r.readAsDataURL(f);
      }
    };
    input.click();
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col h-[850px] overflow-hidden animate-in fade-in duration-500">
      {cropperImage && (
        <ImageCropper 
          image={cropperImage} aspect={cropperAspect} 
          onCropComplete={(cropped) => {
            if (cropperTarget === 'logo') setGlobalSettings(p => ({...p, appLogo: cropped}));
            if (cropperTarget === 'adminImg') setGlobalSettings(p => ({...p, adminImage: cropped}));
            if (cropperTarget === 'mainBanner') setGlobalSettings(p => ({...p, mainBannerImage: cropped}));
            if (cropperTarget === 'newBanner') {
              const sizeData = bannerSizes[selectedBannerSizeIndex];
              const banner: BannerImage = {
                id: Math.random().toString(36).substr(2, 9),
                imageUrl: cropped,
                size: `${sizeData.width}x${sizeData.height} px`,
                timestamp: Date.now()
              };
              syncStorage('admin_banners', [banner, ...banners]);
            }
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

      {editingCreds && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-slate-800 text-center">ইউজার ক্রেডেনশিয়াল</h3>
            <div className="space-y-4">
              <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" placeholder="নতুন আইডি" value={editingCreds.newId} onChange={e => setEditingCreds({...editingCreds, newId: e.target.value})} />
              <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" placeholder="নতুন পাসওয়ার্ড" value={editingCreds.newPass} onChange={e => setEditingCreds({...editingCreds, newPass: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpdateCreds} className="flex-grow bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">আপডেট</button>
              <button onClick={() => setEditingCreds(null)} className="px-6 bg-slate-100 text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest">বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl">🛡️</div>
          <div>
            <h2 className="font-black text-lg tracking-tight leading-none uppercase">Admin Dashboard</h2>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">Real-time Control</p>
          </div>
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 overflow-x-auto no-scrollbar max-w-full">
          {['users', 'support', 'notices', 'links', 'banners', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              {tab === 'users' ? 'ইউজার' : tab === 'support' ? 'হেল্প' : tab === 'notices' ? 'নোটিশ' : tab === 'links' ? 'লিংক' : tab === 'banners' ? 'ব্যানার' : 'সেটিংস'}
            </button>
          ))}
          <div className="flex gap-1 ml-2 border-l border-slate-700 pl-2">
            <button onClick={handleAdminLogout} className="bg-rose-600/20 text-rose-500 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Logout</button>
            <button onClick={onBack} className="bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">X</button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-hidden bg-slate-50/30">
        
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="h-full overflow-y-auto p-6 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-black text-slate-800 text-center">নতুন ইউজার রেজিস্ট্রেশন (ম্যানুয়াল)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-4 text-xs font-bold outline-none" placeholder="ইউজার নাম" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-4 text-xs font-bold outline-none" placeholder="ইউজার আইডি (Login ID)" value={newUser.id} onChange={e => setNewUser({...newUser, id: e.target.value.toLowerCase().replace(/\s/g, '')})} />
                <input className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-4 text-xs font-bold outline-none" placeholder="পাসওয়ার্ড" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <button onClick={handleManualRegister} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-50 active:scale-95 transition-all">রেজিস্টার করুন</button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-800 px-2 flex justify-between items-center">
                <span>নিবন্ধিত ইউজার ({users.length})</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">পাসওয়ার্ড সহ দেখা যাচ্ছে</span>
              </h3>
              {users.length === 0 ? (
                <div className="p-20 text-center text-slate-300 font-black uppercase">কোনো ইউজার পাওয়া যায়নি</div>
              ) : (
                users.map(u => (
                  <div key={u.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-2xl border-2 border-slate-50 overflow-hidden shrink-0 shadow-sm">
                      {u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xl font-black text-slate-300">{u.name[0]}</div>}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black text-slate-800 text-lg leading-none mb-2">{u.name}</h4>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full"><span className="text-[9px] font-black text-indigo-400">ID:</span> <span className="text-[10px] font-black text-indigo-700">{u.id}</span></div>
                        <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full"><span className="text-[9px] font-black text-rose-400">PASS:</span> <span className="text-[10px] font-black text-rose-700">{u.password}</span></div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full"><span className="text-[9px] font-black text-slate-400">PTS:</span> <span className="text-[10px] font-black text-slate-800">{u.points}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingCreds({ userId: u.id, newId: u.id, newPass: u.password || '' })} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="ক্রেডেনশিয়াল পরিবর্তন">✏️</button>
                      <button onClick={() => setIdCardUser(u)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm">🪪</button>
                      <button onClick={() => handleToggleBlock(u.id)} className={`p-3 rounded-xl shadow-sm transition-all ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white'}`}>{u.isBlocked ? '🔓' : '🚫'}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="h-full flex flex-col sm:flex-row overflow-hidden">
            <div className="w-full sm:w-72 bg-white border-r border-slate-100 h-full overflow-y-auto">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                 <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">টিকেট লিস্ট ({tickets.length})</h3>
              </div>
              {tickets.length === 0 ? (
                 <div className="p-10 text-center text-slate-300 text-[10px] font-black uppercase">কোনো টিকেট নেই</div>
              ) : (
                tickets.sort((a,b) => b.lastUpdate - a.lastUpdate).map(t => (
                  <button key={t.userId} onClick={() => setSelectedTicket(t)} className={`w-full p-4 text-left border-b border-slate-50 hover:bg-indigo-50 transition-all flex items-center gap-3 ${selectedTicket?.userId === t.userId ? 'bg-indigo-50 border-r-4 border-r-indigo-600' : ''}`}>
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">{t.userName[0]}</div>
                    <div className="overflow-hidden">
                      <p className="font-black text-slate-800 text-sm truncate">{t.userName}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(t.lastUpdate).toLocaleTimeString()}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="flex-grow bg-white flex flex-col h-full">
              {selectedTicket ? (
                <>
                  <div className="p-4 border-b border-slate-100 bg-indigo-600 text-white flex justify-between items-center">
                    <h4 className="font-black text-sm uppercase tracking-widest">{selectedTicket.userName} এর সাথে কথা</h4>
                    <button onClick={() => setSelectedTicket(null)} className="text-[10px] font-black opacity-60 hover:opacity-100">বন্ধ করো</button>
                  </div>
                  <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                    {selectedTicket.messages.map((m: any, i: number) => (
                      <div key={i} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-4 rounded-3xl text-xs font-medium shadow-sm ${m.sender === 'user' ? 'bg-white border border-slate-100' : 'bg-indigo-600 text-white'}`}>
                          {m.text}
                          <span className="block text-[7px] opacity-40 mt-1 text-right uppercase font-black">{m.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-100 flex gap-2">
                    <input className="flex-grow bg-slate-50 rounded-xl px-5 py-4 text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-500" placeholder="ইউজারকে উত্তর লিখুন..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply()} />
                    <button onClick={handleReply} className="bg-indigo-600 text-white px-8 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">পাঠান</button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <span className="text-6xl">💬</span>
                  <p className="font-black text-xs uppercase tracking-[0.2em]">মেসেজ সিলেক্ট করুন</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="h-full overflow-y-auto p-8 space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
               <h3 className="text-xl font-black text-slate-800">নতুন নোটিশ যোগ করুন</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none" placeholder="নোটিশ শিরোনাম" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} />
                  <select className="bg-slate-50 rounded-xl p-4 text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-500" value={newNotice.type} onChange={e => setNewNotice({...newNotice, type: e.target.value as any})}>
                     <option value="info">সাধারণ তথ্য (Info)</option>
                     <option value="warning">সতর্কতা (Warning)</option>
                     <option value="success">সফলতা (Success)</option>
                  </select>
               </div>
               <textarea className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none h-32" placeholder="নোটিশের বিস্তারিত লিখুন..." value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} />
               <button onClick={handleAddNotice} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">পাবলিশ করুন</button>
            </div>

            <div className="space-y-4">
               <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs px-2">অ্যাক্টিভ নোটিশসমূহ ({notices.length})</h3>
               {notices.map(n => (
                 <div key={n.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center group shadow-sm">
                    <div>
                       <span className={`inline-block px-2 py-0.5 rounded-full text-[7px] font-black uppercase mb-1 ${n.type === 'warning' ? 'bg-amber-100 text-amber-600' : n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>{n.type}</span>
                       <h4 className="font-black text-slate-800 text-base">{n.title}</h4>
                       <p className="text-slate-500 text-xs font-medium">{n.content}</p>
                    </div>
                    <button onClick={() => handleDeleteNotice(n.id)} className="text-slate-200 hover:text-rose-500 font-black text-xl transition-all opacity-0 group-hover:opacity-100">🗑️</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="h-full overflow-y-auto p-8 space-y-8 max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
               <h3 className="text-xl font-black text-slate-800">প্রয়োজনীয় লিংক শেয়ার করুন</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold outline-none" placeholder="লিংকের নাম/শিরোনাম" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} />
                  <input className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold outline-none" placeholder="URL (যেমন: https://...)" value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} />
               </div>
               <button onClick={handleAddLink} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all">লিংক যোগ করুন</button>
            </div>

            <div className="space-y-3">
               <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs px-2">বর্তমান লিংকসমূহ</h3>
               {links.map(l => (
                 <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center group shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">🔗</div>
                       <div>
                          <h4 className="font-black text-slate-800 text-sm">{l.title}</h4>
                          <p className="text-indigo-400 text-[10px] font-bold truncate max-w-xs">{l.url}</p>
                       </div>
                    </div>
                    <button onClick={() => handleDeleteLink(l.id)} className="text-rose-500 font-black text-lg opacity-0 group-hover:opacity-100 transition-all">✕</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="h-full overflow-y-auto p-8 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 text-center max-w-4xl mx-auto">
              <div>
                <h3 className="text-2xl font-black text-slate-800">ব্যানার ইমেজ আপলোড</h3>
                <p className="text-slate-400 text-sm mt-1">ড্যাশবোর্ডের জন্য ব্যেনার সাইজ সিলেক্ট করে ছবি আপলোড করুন</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">সাইজ নির্বাচন করুন:</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {bannerSizes.map((size, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedBannerSizeIndex(idx)}
                      className={`px-4 py-2.5 rounded-xl text-[9px] font-black transition-all border-2 uppercase tracking-widest ${selectedBannerSizeIndex === idx ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  const size = bannerSizes[selectedBannerSizeIndex];
                  triggerCropper('newBanner', size.aspect);
                }}
                className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-3 mx-auto hover:bg-indigo-700 transition-all active:scale-95"
              >
                <span>➕</span> ব্যানার আপলোড ও ক্রপ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {banners.map(b => (
                <div key={b.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm group relative">
                  <div className="bg-slate-100 min-h-[160px] flex items-center justify-center p-2">
                    <img src={b.imageUrl} className="max-w-full max-h-[300px] object-contain rounded-lg" alt="Banner" />
                  </div>
                  <button 
                    onClick={() => handleDeleteBanner(b.id)}
                    className="absolute top-4 right-4 bg-rose-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    🗑️
                  </button>
                  <div className="p-5 flex justify-between items-center bg-white border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{b.size}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Added: {new Date(b.timestamp).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[8px] font-black uppercase">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Settings Tab */}
        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto p-8 space-y-12 bg-white">
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
               <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-2xl font-black text-slate-800">অ্যাপ কনফিগারেশন ও সেটিংস</h3>
                  <button onClick={() => syncStorage('global_settings', globalSettings)} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">সব সেভ করুন</button>
               </div>

               {/* Admin Access Control */}
               <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                 <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-l-4 border-rose-600 pl-3">অ্যাডমিন অ্যাক্সেস কন্ট্রোল</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">অ্যাডমিন আইডি</label>
                       <input className="w-full bg-white border-2 border-slate-100 focus:border-rose-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" value={adminCreds.id} onChange={e => setAdminCreds({...adminCreds, id: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">অ্যাডমিন পাসওয়ার্ড</label>
                       <input type="text" className="w-full bg-white border-2 border-slate-100 focus:border-rose-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" value={adminCreds.pass} onChange={e => setAdminCreds({...adminCreds, pass: e.target.value})} />
                    </div>
                 </div>
                 <button onClick={handleUpdateAdminCreds} className="w-full bg-rose-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-100">অ্যাডমিন ক্রেডেনশিয়াল আপডেট করুন</button>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <section className="space-y-6">
                     <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-l-4 border-indigo-600 pl-3">ব্র্যান্ডিং ও লোগো</h4>
                     <div className="space-y-4">
                        <div className="flex flex-col items-center gap-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                          <div className="w-24 h-24 bg-white rounded-[2rem] border-4 border-slate-200 overflow-hidden relative group cursor-pointer shadow-sm" onClick={() => triggerCropper('logo', 1)}>
                            {globalSettings.appLogo ? <img src={globalSettings.appLogo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">📖</div>}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <span className="text-white text-[8px] font-black uppercase tracking-widest">বদলান</span>
                            </div>
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">অ্যাপ লোগো (বর্গাকার)</p>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">অ্যাপের নাম</label>
                           <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" value={globalSettings.appName} onChange={e => setGlobalSettings({...globalSettings, appName: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">সাবটাইটেল</label>
                           <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" value={globalSettings.appSubtitle} onChange={e => setGlobalSettings({...globalSettings, appSubtitle: e.target.value})} />
                        </div>
                     </div>
                  </section>

                  <section className="space-y-6">
                     <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-l-4 border-indigo-600 pl-3">অ্যাডমিন প্রোফাইল সেটিংস</h4>
                     <div className="space-y-4">
                        <div className="flex flex-col items-center gap-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                          <div className="w-20 h-20 bg-white rounded-full border-4 border-slate-200 overflow-hidden relative group cursor-pointer shadow-sm" onClick={() => triggerCropper('adminImg', 1)}>
                            {globalSettings.adminImage ? <img src={globalSettings.adminImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">👤</div>}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <span className="text-white text-[8px] font-black uppercase tracking-widest">বদলান</span>
                            </div>
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">অ্যাডমিন ফটো</p>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">অ্যাডমিন নাম</label>
                           <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" value={globalSettings.adminName} onChange={e => setGlobalSettings({...globalSettings, adminName: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">অ্যাডমিন ইমেইল</label>
                           <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" value={globalSettings.adminEmail} onChange={e => setGlobalSettings({...globalSettings, adminEmail: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ট্যাগ লাইন (যেমন: অ্যাডমিন ও ডেভেলপার)</label>
                           <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" value={globalSettings.adminTagLine} onChange={e => setGlobalSettings({...globalSettings, adminTagLine: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">বায়ো / ডেসক্রিপশন (নামের নিচে যেটা থাকে)</label>
                           <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none h-24 resize-none" value={globalSettings.adminBio} onChange={e => setGlobalSettings({...globalSettings, adminBio: e.target.value})} />
                        </div>
                     </div>
                  </section>

                  <section className="space-y-6 md:col-span-2 bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
                     <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-l-4 border-indigo-600 pl-3">মেইন ড্যাশবোর্ড ব্যানার এডিটর</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-5">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ব্যানার টাইটেল</label>
                              <input className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none" value={globalSettings.mainBannerTitle} onChange={e => setGlobalSettings({...globalSettings, mainBannerTitle: e.target.value})} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ব্যানার সাবটাইটেল</label>
                              <textarea className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-5 py-3 text-slate-800 font-bold outline-none h-20 resize-none" value={globalSettings.mainBannerSubtitle} onChange={e => setGlobalSettings({...globalSettings, mainBannerSubtitle: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ব্যাকগ্রাউন্ড থিম কালার</label>
                             <div className="flex flex-wrap gap-2">
                                {bgGradients.map((grad, i) => (
                                   <button 
                                      key={i} 
                                      onClick={() => setGlobalSettings({...globalSettings, mainBannerBgColor: grad.value})}
                                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad.value} border-2 ${globalSettings.mainBannerBgColor === grad.value ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                                      title={grad.label}
                                   />
                                ))}
                             </div>
                           </div>
                        </div>
                        <div className="space-y-4 text-center">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">মেইন ব্যানার ইমেজ (Dashboard)</label>
                           <div className="h-44 rounded-[2rem] bg-white relative group overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer shadow-sm" onClick={() => triggerCropper('mainBanner', 16/9)}>
                              {globalSettings.mainBannerImage ? <img src={globalSettings.mainBannerImage} className="w-full h-full object-cover" /> : <div className="text-4xl text-slate-300">🖼️</div>}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">ছবি বদলান</span>
                              </div>
                           </div>
                           <p className="text-[8px] font-black text-slate-400 uppercase mt-2">ইমেজ থাকলে ব্যাকগ্রাউন্ড কালার দেখা যাবে না</p>
                        </div>
                     </div>
                  </section>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
