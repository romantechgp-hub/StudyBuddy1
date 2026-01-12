
import React, { useState, useEffect } from 'react';
import { UserProfile, BannerImage, AdminLink } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'support' | 'banners' | 'links' | 'settings'>('users');

  // New Link Form State
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  // New Banner Form State
  const [bannerFile, setBannerFile] = useState<string | null>(null);
  const [bannerSize, setBannerSize] = useState('728x90 px');
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState({
    adminName: 'রিমন মাহমুদ রোমান',
    adminEmail: 'romantechgp@gmail.com',
    adminBio: 'প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস।',
    adminImage: ''
  });

  // Admin Credentials State
  const [adminCreds, setAdminCreds] = useState({
    id: 'Rimon',
    pass: '13457@Roman'
  });

  const bannerSizes = [
    '728x90 px',
    '300x250 px',
    '336x280 px',
    '160x600 px',
    '300x600 px',
    '320x50 px',
    '320x100 px'
  ];

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    window.addEventListener('storage', loadData);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const loadData = () => {
    const savedTickets = localStorage.getItem('admin_tickets');
    if (savedTickets) setTickets(JSON.parse(savedTickets));

    const savedUsers = localStorage.getItem('studybuddy_registered_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    const savedBanners = localStorage.getItem('admin_banners');
    if (savedBanners) setBanners(JSON.parse(savedBanners));

    const savedLinks = localStorage.getItem('admin_links');
    if (savedLinks) setLinks(JSON.parse(savedLinks));

    const savedSettings = localStorage.getItem('global_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setGlobalSettings(prev => ({ ...prev, ...parsed }));
    }

    const savedCreds = localStorage.getItem('admin_credentials');
    if (savedCreds) setAdminCreds(JSON.parse(savedCreds));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserId || !newUserPassword) {
      alert('সবগুলো ঘর পূরণ করুন।');
      return;
    }

    const exists = users.find(u => u.id === newUserId);
    if (exists) {
      alert('এই ইউজার আইডিটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
      return;
    }

    const newUser: UserProfile = {
      id: newUserId.toLowerCase().replace(/\s/g, ''),
      name: newUserName,
      password: newUserPassword,
      points: 0,
      streak: 1,
      lastActive: new Date().toISOString(),
      isBlocked: false
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('studybuddy_registered_users', JSON.stringify(updatedUsers));
    
    setNewUserName('');
    setNewUserId('');
    setNewUserPassword('');
    alert('নতুন ইউজার সফলভাবে তৈরি করা হয়েছে!');
  };

  const handleReply = () => {
    if (!reply.trim() || !selectedTicket) return;
    
    const newMsg = { sender: 'admin', text: reply, time: new Date().toLocaleTimeString() };
    const key = `support_chat_${selectedTicket.userId}`;
    const currentMsgs = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedMessages = [...currentMsgs, newMsg];
    
    const updatedTickets = tickets.map(t => 
      t.userId === selectedTicket.userId ? { ...t, messages: updatedMessages, lastUpdate: Date.now() } : t
    );
    
    setTickets(updatedTickets);
    localStorage.setItem('admin_tickets', JSON.stringify(updatedTickets));
    localStorage.setItem(key, JSON.stringify(updatedMessages));
    
    setSelectedTicket({ ...selectedTicket, messages: updatedMessages });
    setReply('');
  };

  const handleToggleBlock = (userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u);
    setUsers(updatedUsers);
    localStorage.setItem('studybuddy_registered_users', JSON.stringify(updatedUsers));
  };

  const handleRemoveUser = (userId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি এই ইউজারকে ডিলিট করতে চান?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('studybuddy_registered_users', JSON.stringify(updatedUsers));
    }
  };

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) {
      alert('সিলোনাম এবং লিংক উভয়ই দিন।');
      return;
    }
    const newLink: AdminLink = {
      id: Date.now().toString(),
      title: linkTitle,
      url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
      timestamp: Date.now()
    };
    const updated = [newLink, ...links];
    setLinks(updated);
    localStorage.setItem('admin_links', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setLinkTitle('');
    setLinkUrl('');
    alert('লিংকটি সফলভাবে পোস্ট করা হয়েছে!');
  };

  const handleRemoveLink = (id: string) => {
    if (confirm('লিংকটি ডিলিট করতে চান?')) {
      const updated = links.filter(l => l.id !== id);
      setLinks(updated);
      localStorage.setItem('admin_links', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleAdminImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGlobalSettings({ ...globalSettings, adminImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBanner = () => {
    if (!bannerFile) return;

    let updatedBanners: BannerImage[];

    if (editingBannerId) {
      updatedBanners = banners.map(b => 
        b.id === editingBannerId 
          ? { ...b, imageUrl: bannerFile, size: bannerSize, timestamp: Date.now() } 
          : b
      );
      alert('ব্যানারটি সফলভাবে আপডেট করা হয়েছে।');
    } else {
      const newBanner: BannerImage = {
        id: Date.now().toString(),
        imageUrl: bannerFile,
        size: bannerSize,
        timestamp: Date.now()
      };
      updatedBanners = [newBanner, ...banners];
      alert('নতুন ব্যানার পাবলিশ করা হয়েছে।');
    }

    setBanners(updatedBanners);
    localStorage.setItem('admin_banners', JSON.stringify(updatedBanners));
    window.dispatchEvent(new Event('storage'));
    resetBannerForm();
  };

  const saveGlobalSettings = () => {
    localStorage.setItem('global_settings', JSON.stringify(globalSettings));
    localStorage.setItem('admin_credentials', JSON.stringify(adminCreds));
    window.dispatchEvent(new Event('storage'));
    alert('আপডেট সফল হয়েছে!');
  };

  const resetBannerForm = () => {
    setBannerFile(null);
    setBannerSize('728x90 px');
    setEditingBannerId(null);
  };

  const startEditBanner = (banner: BannerImage) => {
    setBannerFile(banner.imageUrl);
    setBannerSize(banner.size);
    setEditingBannerId(banner.id);
    const element = document.getElementById('banner-form-top');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteBanner = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ব্যানারটি ডিলিট করতে চান?')) {
      const updatedBanners = banners.filter(b => b.id !== id);
      setBanners(updatedBanners);
      localStorage.setItem('admin_banners', JSON.stringify(updatedBanners));
      window.dispatchEvent(new Event('storage'));
      if (editingBannerId === id) resetBannerForm();
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col h-[850px] overflow-hidden animate-in fade-in duration-500">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-900">🛡️</div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-none">অ্যাডমিন ড্যাশবোর্ড</h2>
            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mt-1">রিয়েল-টাইম কন্ট্রোল প্যানেল</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-xl p-1 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>ইউজার লিস্ট</button>
            <button onClick={() => setActiveTab('support')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'support' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>হেল্প লাইন</button>
            <button onClick={() => setActiveTab('banners')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'banners' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>ব্যানার</button>
            <button onClick={() => setActiveTab('links')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'links' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>লিংক</button>
            <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>সেটিংস</button>
          </div>
          <button onClick={onBack} className="bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-rose-500/30">ফিরে যান</button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {activeTab === 'users' && (
          <div className="flex-grow flex flex-col overflow-y-auto">
            <div className="p-8 bg-indigo-50/50 border-b border-indigo-100">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl">👤</div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">নতুন ইউজার তৈরি করুন</h3>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">ম্যানুয়ালি স্টুডেন্ট আইডি ও পাসওয়ার্ড সেট করুন</p>
                  </div>
                </div>
                
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-indigo-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পূর্ণ নাম:</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500" placeholder="যেমন: রিমন মাহমুদ" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ইউজার আইডি:</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500" placeholder="ইউনিক আইডি" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পাসওয়ার্ড:</label>
                    <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500" placeholder="পাসওয়ার্ড" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3 mt-2">
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all">ইউজার রেজিস্টার করুন</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-black text-slate-700 flex items-center gap-2">সকল ইউজারের ডাটাবেস <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">{users.length}</span></h3>
              <button onClick={loadData} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">রিফ্রেশ করুন</button>
            </div>
            
            <div className="p-6 bg-slate-100/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((u) => (
                  <div key={u.id} className={`bg-white border-2 rounded-[2.5rem] p-7 shadow-sm transition-all group relative overflow-hidden ${u.isBlocked ? 'border-rose-100 bg-rose-50/10' : 'border-white hover:border-indigo-100 hover:shadow-2xl'}`}>
                    <div className="flex items-start gap-5 mb-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border-2 border-white shadow-md overflow-hidden flex-shrink-0">
                        {u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-indigo-200">{u.name.charAt(0)}</div>}
                      </div>
                      <div className="flex-grow overflow-hidden pt-1">
                        <h4 className="font-black text-slate-800 text-lg leading-tight truncate flex items-center gap-2">{u.name} {u.isBlocked && <span className="bg-rose-500 text-white text-[7px] px-1.5 py-0.5 rounded-full">ব্লকড</span>}</h4>
                        <div className="mt-2 space-y-1.5">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">আইডি: <span className="text-slate-700">{u.id}</span></p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">পাসওয়ার্ড: <span className="text-emerald-600">{u.password}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleToggleBlock(u.id)} className={`flex-grow py-3 rounded-2xl text-[9px] font-black uppercase ${u.isBlocked ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-600'}`}>{u.isBlocked ? 'আনব্লক করুন' : 'ইউজার ব্লক করুন'}</button>
                      <button onClick={() => handleRemoveUser(u.id)} className="px-6 py-3 bg-slate-100 text-slate-400 hover:bg-rose-600 hover:text-white rounded-2xl text-[9px] font-black uppercase">মুছে ফেলুন</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <>
            <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50">
              <div className="p-5 font-black border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[10px]">সক্রিয় সাপোর্ট টিকিট ({tickets.length})</div>
              {tickets.map((t, idx) => (
                <div key={idx} onClick={() => setSelectedTicket(t)} className={`p-6 border-b border-slate-100 cursor-pointer transition-all ${selectedTicket?.userId === t.userId ? 'bg-white shadow-xl border-r-4 border-indigo-600 scale-[1.02]' : 'hover:bg-indigo-50/50'}`}>
                  <div className="font-black text-slate-800 mb-1">{t.userName}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">ইউজার আইডি: {t.userId}</div>
                </div>
              ))}
            </div>
            <div className="w-2/3 flex flex-col bg-white">
              {selectedTicket ? (
                <>
                  <div className="p-6 border-b border-slate-100 bg-white shadow-sm z-10"><h4 className="font-black text-slate-800 text-lg">{selectedTicket.userName}</h4></div>
                  <div className="flex-grow p-8 overflow-y-auto space-y-5 bg-slate-50/30">
                    {selectedTicket.messages.map((m: any, i: number) => (
                      <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-[1.8rem] max-w-[80%] shadow-md ${m.sender === 'admin' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                          <p className="text-sm font-medium">{m.text}</p>
                          <p className="text-[8px] opacity-60 mt-2 text-right">{m.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 border-t border-slate-100 flex gap-3 bg-white">
                    <input className="flex-grow bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 outline-none font-bold text-slate-800" placeholder="এখানে রিপ্লাই লেখো..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleReply()} />
                    <button onClick={handleReply} className="bg-indigo-600 text-white px-10 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700">পাঠান</button>
                  </div>
                </>
              ) : <div className="flex-grow flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50"><span className="text-6xl">💬</span><p className="font-black text-sm uppercase">একটি টিকিট সিলেক্ট করুন</p></div>}
            </div>
          </>
        )}

        {activeTab === 'links' && (
          <div className="flex-grow flex flex-col overflow-y-auto p-10 space-y-8 bg-slate-50">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
              <h3 className="text-xl font-black text-slate-800">নতুন লিংক পোস্ট করুন</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">লিংক শিরোনাম:</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="যেমন: রেজাল্ট দেখার লিংক" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL (লিংক):</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="https://example.com" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                </div>
              </div>
              <button onClick={handleAddLink} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">🚀 লিংক পাবলিশ করুন</button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">পাবলিশ করা লিংকসমূহ ({links.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {links.map(link => (
                  <div key={link.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">🔗</div>
                      <div className="overflow-hidden">
                        <h4 className="font-black text-slate-800 truncate">{link.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{link.url}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveLink(link.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="flex-grow flex flex-col overflow-y-auto p-10 space-y-10 bg-slate-50">
            <div id="banner-form-top" className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8"><h3 className="text-xl font-black text-slate-800">{editingBannerId ? 'ব্যানার এডিট করুন' : 'নতুন ব্যানার যুক্ত করুন'}</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center overflow-hidden relative group">
                    {bannerFile ? <img src={bannerFile} className="w-full h-full object-contain" /> : <span className="text-[10px] font-black text-slate-400 uppercase">ইমেজ সিলেক্ট করুন</span>}
                    <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="flex flex-col justify-between py-2">
                  <select value={bannerSize} onChange={(e) => setBannerSize(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-black text-slate-700 outline-none focus:border-indigo-500 appearance-none cursor-pointer">
                    {bannerSizes.map(size => <option key={size} value={size}>{size}</option>)}
                  </select>
                  <button onClick={saveBanner} disabled={!bannerFile} className={`w-full text-white h-16 rounded-[1.5rem] font-black text-lg transition-all ${editingBannerId ? 'bg-amber-500' : 'bg-indigo-600'} disabled:opacity-50`}>{editingBannerId ? '✨ আপডেট করুন' : '🚀 পাবলিশ করুন'}</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {banners.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-[2.5rem] border shadow-lg relative group">
                  <div className="aspect-video bg-slate-100 rounded-[1.8rem] overflow-hidden mb-4"><img src={b.imageUrl} className="w-full h-full object-contain" /></div>
                  <div className="flex justify-between items-center"><span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">{b.size}</span>
                    <div className="flex gap-3"><button onClick={() => startEditBanner(b)} className="text-[10px] font-black text-indigo-500">✏️ এডিট</button><button onClick={() => deleteBanner(b.id)} className="text-[10px] font-black text-rose-500">🗑️ ডিলিট</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-grow p-10 bg-slate-50 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl space-y-8">
              
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative w-32 h-32 rounded-[2rem] border-4 border-slate-100 bg-slate-50 overflow-hidden group shadow-inner">
                  {globalSettings.adminImage ? (
                    <img src={globalSettings.adminImage} className="w-full h-full object-cover" alt="Admin Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-sm">
                    <span className="text-white text-xs font-bold">আপলোড</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAdminImageUpload} />
                  </label>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">অ্যাডমিন প্রোফাইল ছবি</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">অ্যাডমিন নাম:</label><input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold outline-none focus:border-indigo-500" value={globalSettings.adminName} onChange={(e) => setGlobalSettings({...globalSettings, adminName: e.target.value})} /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">ইমেইল অ্যাড্রেস:</label><input type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold outline-none focus:border-indigo-500" value={globalSettings.adminEmail} onChange={(e) => setGlobalSettings({...globalSettings, adminEmail: e.target.value})} /></div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">অ্যাডমিন বায়ো (About Me):</label>
                <textarea 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 font-bold outline-none focus:border-indigo-500 h-32 resize-none" 
                  value={globalSettings.adminBio} 
                  onChange={(e) => setGlobalSettings({...globalSettings, adminBio: e.target.value})} 
                  placeholder="আপনার সম্পর্কে ছোট কিছু লিখুন..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">অ্যাডমিন আইডি:</label><input type="text" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold outline-none" value={adminCreds.id} onChange={(e) => setAdminCreds({...adminCreds, id: e.target.value})} /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">অ্যাডমিন পাসওয়ার্ড:</label><input type="text" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold outline-none" value={adminCreds.pass} onChange={(e) => setAdminCreds({...adminCreds, pass: e.target.value})} /></div>
              </div>
              
              <button onClick={saveGlobalSettings} className="w-full bg-indigo-600 text-white h-16 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">💾 সবগুলো সেটিংস সেভ করুন</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
