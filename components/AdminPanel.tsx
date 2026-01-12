
import React, { useState, useEffect } from 'react';
import { UserProfile, BannerImage, AdminLink, AdminNotice } from '../types';
import ImageCropper from './ImageCropper';
import UserIdCard from './UserIdCard';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'support' | 'notices' | 'links' | 'banners' | 'settings'>('users');
  
  const [idCardUser, setIdCardUser] = useState<UserProfile | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperAspect, setCropperAspect] = useState(1);
  const [cropperTarget, setCropperTarget] = useState<'logo' | 'adminImg' | 'mainBanner' | 'customBanner' | null>(null);

  const [newBannerImage, setNewBannerImage] = useState<string>('');
  const [newBannerSize, setNewBannerSize] = useState<string>('728x90');

  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeType, setNoticeType] = useState<'info' | 'warning' | 'success'>('info');
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  const [newUserName, setNewUserName] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const [globalSettings, setGlobalSettings] = useState({
    appName: 'স্টাডিবাডি',
    appSubtitle: 'আপনার পড়াশোনার বন্ধু',
    appLogo: '',
    adminName: 'রিমন মাহমুদ রোমান',
    adminEmail: 'romantechgp@gmail.com',
    adminBio: 'প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস।',
    adminImage: '',
    aiSystemInstruction: "You are a friendly AI friend for students named 'Roman'. For every English sentence you say, you MUST provide its Bengali translation right after it. Gently correct any mistakes in Bengali first, then reply in dual-language (English + Bengali).",
    dailyRewardPoints: 10,
    footerText: '"প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস"',
    mainBannerTitle: 'অ্যাডমিন',
    mainBannerSubtitle: 'এআই-এর সাথে পড়াশোনা হোক আরও সহজ ও আনন্দদায়ক।',
    mainBannerImage: '',
    mainBannerBgColor: 'from-indigo-600 to-purple-600'
  });

  const [adminCreds, setAdminCreds] = useState({
    id: 'Rimon',
    pass: '13457'
  });

  useEffect(() => {
    loadData();
    // Real-time polling to refresh online statuses even if no storage event fires
    const interval = setInterval(loadData, 10000);

    const handleUpdate = () => loadData();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('local-storage-update', loadData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('local-storage-update', loadData);
    };
  }, []);

  const loadData = () => {
    const rawUsers = JSON.parse(localStorage.getItem('studybuddy_registered_users') || '[]');
    // Sort users by activity: most recent first
    const sortedUsers = rawUsers.sort((a: UserProfile, b: UserProfile) => {
      return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
    });
    setUsers(sortedUsers);
    
    setTickets(JSON.parse(localStorage.getItem('admin_tickets') || '[]'));
    setBanners(JSON.parse(localStorage.getItem('admin_banners') || '[]'));
    setLinks(JSON.parse(localStorage.getItem('admin_links') || '[]'));
    setNotices(JSON.parse(localStorage.getItem('admin_notices') || '[]'));
    
    const savedSettings = localStorage.getItem('global_settings');
    if (savedSettings) setGlobalSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    
    const savedCreds = localStorage.getItem('admin_credentials');
    if (savedCreds) setAdminCreds(JSON.parse(savedCreds));
  };

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false;
    const lastTime = new Date(lastActive).getTime();
    const now = new Date().getTime();
    return (now - lastTime) < 60000; // Active in the last 1 minute
  };

  const syncStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('local-storage-update'));
  };

  const updateGlobalUser = (updatedUser: UserProfile) => {
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    syncStorage('studybuddy_registered_users', updatedUsers);
    setIdCardUser(updatedUser);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: typeof cropperTarget, aspect: number = 1) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperImage(reader.result as string);
        setCropperAspect(aspect);
        setCropperTarget(target);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImage: string) => {
    if (cropperTarget === 'logo') setGlobalSettings(prev => ({ ...prev, appLogo: croppedImage }));
    if (cropperTarget === 'adminImg') setGlobalSettings(prev => ({ ...prev, adminImage: croppedImage }));
    if (cropperTarget === 'mainBanner') setGlobalSettings(prev => ({ ...prev, mainBannerImage: croppedImage }));
    if (cropperTarget === 'customBanner') setNewBannerImage(croppedImage);
    
    setCropperImage(null);
    setCropperTarget(null);
  };

  const saveBanner = () => {
    if (!newBannerImage) return;
    const newBanner: BannerImage = {
      id: Date.now().toString(),
      imageUrl: newBannerImage,
      size: newBannerSize,
      timestamp: Date.now()
    };
    const updated = [newBanner, ...banners];
    setBanners(updated);
    syncStorage('admin_banners', updated);
    setNewBannerImage('');
  };

  const removeBanner = (id: string) => {
    const updated = banners.filter(b => b.id !== id);
    setBanners(updated);
    syncStorage('admin_banners', updated);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserId || !newUserPassword) return;
    const exists = users.find(u => u.id === newUserId);
    if (exists) { alert('এই আইডিটি ইতিমধ্যে ব্যবহৃত হয়েছে!'); return; }
    const newUser: UserProfile = {
      id: newUserId.toLowerCase().replace(/\s/g, ''),
      name: newUserName, password: newUserPassword,
      points: 0, streak: 1, lastActive: new Date().toISOString(), isBlocked: false
    };
    const updated = [...users, newUser];
    setUsers(updated);
    syncStorage('studybuddy_registered_users', updated);
    setNewUserName(''); setNewUserId(''); setNewUserPassword('');
  };

  const handleToggleBlock = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u);
    setUsers(updated);
    syncStorage('studybuddy_registered_users', updated);
  };

  const handleRemoveUser = (userId: string) => {
    const confirm = window.confirm('আপনি কি নিশ্চিত যে এই ইউজারটিকে মুছে ফেলতে চান?');
    if (!confirm) return;
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    syncStorage('studybuddy_registered_users', updated);
  };

  const handleSaveLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    const normalizedUrl = linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`;
    const updated = editingLinkId 
      ? links.map(l => l.id === editingLinkId ? { ...l, title: linkTitle.trim(), url: normalizedUrl } : l)
      : [{ id: Date.now().toString(), title: linkTitle.trim(), url: normalizedUrl, timestamp: Date.now() }, ...links];
    setLinks(updated);
    syncStorage('admin_links', updated);
    setLinkTitle(''); setLinkUrl(''); setEditingLinkId(null);
  };

  const handleRemoveLink = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    syncStorage('admin_links', updated);
  };

  const handleSaveNotice = () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    const updated = editingNoticeId 
      ? notices.map(n => n.id === editingNoticeId ? { ...n, title: noticeTitle.trim(), content: noticeContent.trim(), type: noticeType } : n)
      : [{ id: Date.now().toString(), title: noticeTitle.trim(), content: noticeContent.trim(), type: noticeType, timestamp: Date.now() }, ...notices];
    setNotices(updated);
    syncStorage('admin_notices', updated);
    setNoticeTitle(''); setNoticeContent(''); setEditingNoticeId(null);
  };

  const handleRemoveNotice = (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    syncStorage('admin_notices', updated);
  };

  const handleReply = () => {
    if (!reply.trim() || !selectedTicket) return;
    const newMsg = { sender: 'admin', text: reply, time: new Date().toLocaleTimeString() };
    const key = `support_chat_${selectedTicket.userId}`;
    const currentMsgs = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedMessages = [...currentMsgs, newMsg];
    const updatedTickets = tickets.map(t => t.userId === selectedTicket.userId ? { ...t, messages: updatedMessages, lastUpdate: Date.now() } : t);
    setTickets(updatedTickets);
    localStorage.setItem('admin_tickets', JSON.stringify(updatedTickets));
    localStorage.setItem(key, JSON.stringify(updatedMessages));
    window.dispatchEvent(new CustomEvent('local-storage-update'));
    setSelectedTicket(prev => prev ? { ...prev, messages: updatedMessages } : null);
    setReply('');
  };

  const startMessageUser = (user: UserProfile) => {
    let ticket = tickets.find(t => t.userId === user.id);
    if (!ticket) {
      const key = `support_chat_${user.id}`;
      const messages = JSON.parse(localStorage.getItem(key) || '[]');
      ticket = { userId: user.id, userName: user.name, messages, lastUpdate: Date.now() };
      const updatedTickets = [...tickets, ticket];
      setTickets(updatedTickets);
      localStorage.setItem('admin_tickets', JSON.stringify(updatedTickets));
    }
    setSelectedTicket(ticket);
    setActiveTab('support');
  };

  const saveGlobalSettings = () => {
    localStorage.setItem('global_settings', JSON.stringify(globalSettings));
    localStorage.setItem('admin_credentials', JSON.stringify(adminCreds));
    window.dispatchEvent(new CustomEvent('local-storage-update'));
    alert('সেটিংস সফলভাবে সেভ হয়েছে!');
  };

  const bannerSizes = [
    { label: '728x90', value: '728x90', aspect: 728/90 },
    { label: '300x250', value: '300x250', aspect: 300/250 },
    { label: '336x280', value: '336x280', aspect: 336/280 },
    { label: '160x600', value: '160x600', aspect: 160/600 },
    { label: '300x600', value: '300x600', aspect: 300/600 },
    { label: '320x50', value: '320x50', aspect: 320/50 },
    { label: '320x100', value: '320x100', aspect: 320/100 }
  ];

  const currentSizeAspect = bannerSizes.find(s => s.value === newBannerSize)?.aspect || 1;

  // Real-time Dashboard Stats
  const totalUsers = users.length;
  const onlineUsers = users.filter(u => isOnline(u.lastActive)).length;
  const totalPoints = users.reduce((acc, u) => acc + u.points, 0);
  const avgPoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col h-[850px] overflow-hidden animate-in fade-in duration-500">
      {cropperImage && (
        <ImageCropper 
          image={cropperImage} 
          aspect={cropperAspect} 
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperImage(null)} 
        />
      )}

      {idCardUser && (
        <UserIdCard 
          user={idCardUser} 
          adminName={globalSettings.adminName} 
          onClose={() => setIdCardUser(null)} 
          isAdmin={true}
          onUpdateUser={updateGlobalUser}
        />
      )}

      <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">🛡️</div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-none">অ্যাডমিন ড্যাশবোর্ড</h2>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">রিয়েল-টাইম কন্ট্রোল</p>
          </div>
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 overflow-x-auto no-scrollbar">
          {['users', 'support', 'notices', 'links', 'banners', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              {tab === 'users' ? 'ইউজার' : tab === 'support' ? 'হেল্প' : tab === 'notices' ? 'নোটিশ' : tab === 'links' ? 'লিংক' : tab === 'banners' ? 'ব্যানার' : 'সেটিংস'}
            </button>
          ))}
          <button onClick={onBack} className="ml-4 bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all">বন্ধ করুন</button>
        </div>
      </div>

      <div className="flex-grow overflow-hidden bg-slate-50/30">
        {activeTab === 'users' && (
          <div className="h-full overflow-y-auto p-6 sm:p-8 space-y-8">
            
            {/* Real-time Statistics Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">মোট ইউজার</span>
                <span className="text-2xl font-black text-slate-800">{totalUsers}</span>
              </div>
              <div className="bg-indigo-600 p-5 rounded-[2rem] shadow-lg shadow-indigo-100 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6"></div>
                <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">অনলাইন এখন</span>
                <span className="text-2xl font-black flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
                  {onlineUsers}
                </span>
              </div>
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">মোট পয়েন্ট</span>
                <span className="text-2xl font-black text-indigo-600">{totalPoints}</span>
              </div>
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">গড় পয়েন্ট</span>
                <span className="text-2xl font-black text-slate-800">{avgPoints}</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-50 space-y-6">
              <h3 className="text-xl font-black text-slate-800">নতুন ইউজার তৈরি করুন</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-bold outline-none text-xs" placeholder="পূর্ণ নাম" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                <input type="text" className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-bold outline-none text-xs" placeholder="ইউজার আইডি" value={newUserId} onChange={e => setNewUserId(e.target.value)} />
                <input type="text" className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 font-bold outline-none text-xs" placeholder="পাসওয়ার্ড" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
              </div>
              <button onClick={handleCreateUser} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100">ইউজার সেভ করুন</button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 pb-10">
              <div className="flex items-center justify-between ml-2">
                <h3 className="text-xl font-black text-slate-800">নিবন্ধিত সকল ইউজার ({users.length})</h3>
                <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">সর্বশেষ সক্রিয়তা অনুযায়ী সাজানো</span>
              </div>
              {users.map(u => (
                <div key={u.id} className={`bg-white border-2 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col md:flex-row gap-8 items-start relative group overflow-hidden ${isOnline(u.lastActive) ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-50'}`}>
                  {/* Status Indicator */}
                  {isOnline(u.lastActive) && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest z-10 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      Online
                    </div>
                  )}

                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 rounded-bl-[1.5rem] text-xs font-black shadow-lg">
                    {u.points} PTS
                  </div>

                  {/* Profile Section */}
                  <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                    <div className={`w-32 h-32 rounded-[2rem] border-4 ${isOnline(u.lastActive) ? 'border-emerald-400 shadow-emerald-100' : 'border-slate-50'} bg-indigo-50 overflow-hidden shadow-lg flex items-center justify-center`}>
                      {u.profileImage ? (
                        <img src={u.profileImage} className="w-full h-full object-cover" alt={u.name} />
                      ) : (
                        <span className="font-black text-indigo-200 text-5xl">{u.name[0]}</span>
                      )}
                    </div>
                    <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.isBlocked ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                      {u.isBlocked ? 'ব্লকড' : 'সক্রিয়'}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-full">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">পুরো নাম:</span>
                      <p className="font-black text-slate-800 text-lg leading-none">{u.name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ইউজার আইডি (Login ID):</span>
                      <p className="font-bold text-indigo-600 leading-none">{u.id}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">পাসওয়ার্ড:</span>
                      <p className="font-bold text-slate-600 leading-none">{u.password}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">প্রতিষ্ঠান:</span>
                      <p className="font-bold text-slate-600 leading-none">{u.institution || 'দেওয়া হয়নি'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">শ্রেণী / গ্রেড:</span>
                      <p className="font-bold text-slate-600 leading-none">{u.grade || 'দেওয়া হয়নি'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">সবশেষ অ্যাক্টিভ:</span>
                      <p className={`text-[10px] font-bold leading-none ${isOnline(u.lastActive) ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {u.lastActive ? new Date(u.lastActive).toLocaleString('bn-BD') : 'তথ্য নেই'}
                        {isOnline(u.lastActive) && ' (এখন অনলাইনে আছে)'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex md:flex-col gap-3 shrink-0 self-center md:self-start w-full md:w-auto">
                    <button 
                      onClick={() => setIdCardUser(u)}
                      className="flex-grow md:w-14 md:h-14 py-3 md:py-0 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-lg shadow-lg hover:bg-amber-600 hover:text-white transition-all"
                      title="ID কার্ড তৈরি করুন"
                    >
                      🪪
                    </button>
                    <button 
                      onClick={() => startMessageUser(u)}
                      className="flex-grow md:w-14 md:h-14 py-3 md:py-0 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-lg shadow-lg hover:bg-indigo-600 hover:text-white transition-all"
                      title="মেসেজ পাঠান"
                    >
                      💬
                    </button>
                    <button 
                      onClick={() => handleToggleBlock(u.id)} 
                      className={`flex-grow md:w-14 md:h-14 py-3 md:py-0 rounded-2xl flex items-center justify-center text-lg shadow-lg transition-all ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'}`}
                      title={u.isBlocked ? 'আনব্লক করুন' : 'ব্লক করুন'}
                    >
                      {u.isBlocked ? '🔓' : '🚫'}
                    </button>
                    <button 
                      onClick={() => handleRemoveUser(u.id)} 
                      className="flex-grow md:w-14 md:h-14 py-3 md:py-0 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-lg shadow-lg hover:bg-rose-600 hover:text-white transition-all"
                      title="মুছে ফেলুন"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="h-full flex">
            <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-white/50">
              <div className="p-6 border-b bg-slate-50 font-black text-xs text-slate-400 uppercase tracking-widest">চ্যাট লিস্ট</div>
              {tickets.map(t => (
                <div key={t.userId} onClick={() => setSelectedTicket(t)} className={`p-6 border-b cursor-pointer transition-all ${selectedTicket?.userId === t.userId ? 'bg-white shadow-xl border-r-4 border-indigo-600' : 'hover:bg-indigo-50'}`}>
                  <div className="flex items-center gap-2">
                    <div className="font-black text-slate-800 truncate">{t.userName}</div>
                    {isOnline(users.find(u => u.id === t.userId)?.lastActive) && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    )}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">ID: {t.userId}</div>
                </div>
              ))}
            </div>
            <div className="w-2/3 flex flex-col bg-white">
              {selectedTicket ? (
                <>
                  <div className="p-6 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <h4 className="font-black text-slate-800">{selectedTicket.userName}</h4>
                       {isOnline(users.find(u => u.id === selectedTicket.userId)?.lastActive) && (
                         <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Online</span>
                       )}
                    </div>
                  </div>
                  <div className="flex-grow p-8 overflow-y-auto space-y-4 bg-slate-50/30">
                    {selectedTicket.messages.map((m: any, i: number) => (
                      <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-3xl max-w-[80%] text-sm font-medium shadow-sm ${m.sender === 'admin' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>{m.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 border-t flex gap-3">
                    <input className="flex-grow bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-8 py-6 outline-none font-bold text-xs" placeholder="মেসেজ লিখুন..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply()} />
                    <button onClick={handleReply} className="bg-indigo-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest">পাঠান</button>
                  </div>
                </>
              ) : <div className="flex-grow flex items-center justify-center text-slate-300 font-black">মেসেজ দেখতে ইউজার সিলেক্ট করুন</div>}
            </div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="h-full overflow-y-auto p-10 space-y-10">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 space-y-6">
              <h3 className="text-xl font-black text-slate-800">{editingNoticeId ? 'নোটিশ আপডেট করুন' : 'নতুন নোটিশ পোস্ট করুন'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-8 py-6 font-bold outline-none text-xs" placeholder="নোটিশের শিরোনাম" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} />
                <select className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-8 py-6 font-bold outline-none text-xs" value={noticeType} onChange={e => setNoticeType(e.target.value as any)}>
                  <option value="info">তথ্য (Blue)</option>
                  <option value="warning">সতর্কতা (Amber)</option>
                  <option value="success">অভিনন্দন (Green)</option>
                </select>
              </div>
              <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-8 py-6 font-bold outline-none h-40 resize-none text-xs" placeholder="নোটিশের বিস্তারিত লিখুন..." value={noticeContent} onChange={e => setNoticeContent(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={handleSaveNotice} className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg">পাবলিশ করুন</button>
                {editingNoticeId && <button onClick={() => { setEditingNoticeId(null); setNoticeTitle(''); setNoticeContent(''); }} className="px-8 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase">বাতিল</button>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notices.map(n => (
                <div key={n.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex items-start justify-between group hover:shadow-xl transition-all">
                  <div className="overflow-hidden pr-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 ${n.type === 'warning' ? 'bg-amber-100 text-amber-600' : n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>{n.type === 'warning' ? 'সতর্কতা' : n.type === 'success' ? 'অভিনন্দন' : 'তথ্য'}</span>
                    <h4 className="font-black text-slate-800 text-lg truncate mb-1">{n.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{n.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setNoticeTitle(n.title); setNoticeContent(n.content); setNoticeType(n.type); setEditingNoticeId(String(n.id)); }} className="p-3 bg-slate-50 text-indigo-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">✏️</button>
                    <button onClick={() => handleRemoveNotice(String(n.id))} className="p-3 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="h-full overflow-y-auto p-10 space-y-10">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 space-y-6">
              <h3 className="text-xl font-black text-slate-800">{editingLinkId ? 'লিংক আপডেট করুন' : 'নতুন লিংক পোস্ট করুন'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-8 py-6 font-bold outline-none text-xs" placeholder="লিংকের নাম" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} />
                <input type="text" className="bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-8 py-6 font-bold outline-none text-xs" placeholder="URL (যেমন: facebook.com)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveLink} className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg">লিংক সেভ করুন</button>
                {editingLinkId && <button onClick={() => { setEditingLinkId(null); setLinkTitle(''); setLinkUrl(''); }} className="px-8 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase">বাতিল</button>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {links.map(l => (
                <div key={l.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center justify-between group hover:-translate-y-1 transition-all">
                  <div className="overflow-hidden pr-4">
                    <h4 className="font-black text-slate-800 truncate">{l.title}</h4>
                    <p className="text-[10px] text-indigo-500 font-bold truncate opacity-60">{l.url}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setLinkTitle(l.title); setLinkUrl(l.url); setEditingLinkId(String(l.id)); }} className="p-3 bg-slate-50 text-indigo-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">✏️</button>
                    <button onClick={() => handleRemoveLink(String(l.id))} className="p-3 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="h-full overflow-y-auto p-10 space-y-10">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 space-y-6">
              <h3 className="text-xl font-black text-slate-800">নতুন ব্যানার পোস্ট করুন</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ব্যানার সাইজ সিলেক্ট করুন</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold outline-none text-xs"
                    value={newBannerSize}
                    onChange={(e) => setNewBannerSize(e.target.value)}
                  >
                    {bannerSizes.map(size => (
                      <option key={size.value} value={size.value}>{size.label} px</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-indigo-600">ইমেজ সিলেক্ট করে ক্রপ করুন</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileSelect(e, 'customBanner', currentSizeAspect)} 
                    className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-3 text-xs" 
                  />
                </div>
              </div>
              {newBannerImage && (
                <div className="p-4 border border-indigo-100 rounded-2xl bg-indigo-50/30">
                  <p className="text-[10px] font-black text-indigo-500 uppercase mb-2">ক্রপ করা প্রিভিউ ({newBannerSize}):</p>
                  <img src={newBannerImage} className="max-w-full h-auto rounded-lg shadow-sm mx-auto" alt="Preview" />
                </div>
              )}
              <button 
                onClick={saveBanner}
                disabled={!newBannerImage}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg disabled:opacity-50"
              >
                ব্যানার সেভ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <h3 className="text-xl font-black text-slate-800 ml-2">বর্তমান ব্যানারসমূহ ({banners.length})</h3>
              {banners.map(b => (
                <div key={b.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex-grow flex flex-col items-center sm:items-start gap-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase">সাইজ: {b.size} px</span>
                    <img src={b.imageUrl} className="max-h-32 rounded-lg" />
                  </div>
                  <button onClick={() => removeBanner(b.id)} className="shrink-0 p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all">🗑️ মুছুন</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto p-10">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50 space-y-8">
                <h3 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">১. অ্যাপ পরিচিতি</h3>
                <div className="flex flex-col md:flex-row gap-10 items-start mb-6">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-2xl bg-indigo-50 overflow-hidden border-2 border-slate-100 shadow-sm group relative flex items-center justify-center">
                         {globalSettings.appLogo ? <img src={globalSettings.appLogo} className="w-full h-full object-cover" /> : <div className="text-4xl">📖</div>}
                         <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] font-black uppercase">
                            বদলান
                            <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'logo', 1)} />
                         </label>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">লোগো</span>
                   </div>
                   <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">অ্যাপের নাম</label>
                        <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none text-xs" value={globalSettings.appName} onChange={e => setGlobalSettings({...globalSettings, appName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">সাবটাইটেল</label>
                        <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none text-xs" value={globalSettings.appSubtitle} onChange={e => setGlobalSettings({...globalSettings, appSubtitle: e.target.value})} />
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ফুটার টেক্সট</label>
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none text-xs" value={globalSettings.footerText} onChange={e => setGlobalSettings({...globalSettings, footerText: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-600 uppercase tracking-widest ml-1">ডেইলি রিওয়ার্ড পয়েন্ট (Reward Points)</label>
                    <input type="number" className="w-full bg-indigo-50/50 border-2 border-indigo-100 focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none text-sm" value={globalSettings.dailyRewardPoints} onChange={e => setGlobalSettings({...globalSettings, dailyRewardPoints: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50 space-y-8">
                <h3 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">২. মেইন ব্যানার সেটিংস (Home Page)</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none text-xs" placeholder="ব্যানার শিরোনাম" value={globalSettings.mainBannerTitle} onChange={e => setGlobalSettings({...globalSettings, mainBannerTitle: e.target.value})} />
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none text-xs" placeholder="ব্যানার সাবটাইটেল" value={globalSettings.mainBannerSubtitle} onChange={e => setGlobalSettings({...globalSettings, mainBannerSubtitle: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-40 h-20 bg-slate-50 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center relative group">
                      {globalSettings.mainBannerImage ? <img src={globalSettings.mainBannerImage} className="w-full h-full object-cover" /> : <span className="text-2xl">🖼️</span>}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white text-[9px] font-black uppercase">
                        বদলান
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'mainBanner', 5/1)} />
                      </label>
                    </div>
                    <div className="flex-grow space-y-2">
                       <p className="text-[10px] font-bold text-slate-400">হোম পেজের সবার উপরে এই ব্যানারটি শো করবে। ক্রপ করার সময় ৫:১ রেশিও ব্যবহার করুন।</p>
                       {globalSettings.mainBannerImage && <button onClick={() => setGlobalSettings({...globalSettings, mainBannerImage: ''})} className="text-[9px] font-black text-rose-500 uppercase tracking-widest underline">ছবি মুছুন</button>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900 p-10 rounded-[3rem] shadow-xl text-white space-y-8 border-4 border-white/20">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🛡️</div>
                  <h3 className="text-xl font-black">৩. অ্যাডমিন অ্যাক্সেস সেটিংস (Login ID & Password)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1">নতুন অ্যাডমিন লগইন আইডি</label>
                    <input 
                      className="w-full bg-white/10 border-2 border-white/10 rounded-2xl p-6 font-bold outline-none focus:border-white transition-all text-sm placeholder:text-white/20" 
                      placeholder="যেমন: Rimon"
                      value={adminCreds.id} 
                      onChange={e => setAdminCreds({...adminCreds, id: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-indigo-300 uppercase tracking-widest ml-1">নতুন অ্যাডমিন পাসওয়ার্ড</label>
                    <input 
                      type="text"
                      className="w-full bg-white/10 border-2 border-white/10 rounded-2xl p-6 font-bold outline-none focus:border-white transition-all text-sm placeholder:text-white/20" 
                      placeholder="যেমন: 13457"
                      value={adminCreds.pass} 
                      onChange={e => setAdminCreds({...adminCreds, pass: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-indigo-200 leading-relaxed italic">
                    <span className="text-amber-400">সতর্কতা:</span> এখানে ইউজার আইডি বা পাসওয়ার্ড পরিবর্তন করলে পরবর্তীবার লগইন করার সময় নতুন তথ্যগুলো ব্যবহার করতে হবে। সেভ করতে নিচের "সবগুলো সেটিংস সেভ করুন" বাটনে ক্লিক করুন।
                  </p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50 space-y-8">
                <h3 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">৪. অ্যাডমিন প্রোফাইল</h3>
                <div className="flex flex-col md:flex-row gap-10 items-start">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl group relative flex items-center justify-center">
                         {globalSettings.adminImage ? <img src={globalSettings.adminImage} className="w-full h-full object-cover" /> : <div className="text-5xl">👤</div>}
                         <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs font-bold">
                            বদলান
                            <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'adminImg', 1)} />
                         </label>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">প্রোফাইল ছবি</span>
                   </div>
                   <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                      <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none text-xs" placeholder="নাম" value={globalSettings.adminName} onChange={e => setGlobalSettings({...globalSettings, adminName: e.target.value})} />
                      <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none text-xs" placeholder="ইমেইল" value={globalSettings.adminEmail} onChange={e => setGlobalSettings({...globalSettings, adminEmail: e.target.value})} />
                      <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-bold outline-none h-32 resize-none text-xs sm:col-span-2" placeholder="বায়ো" value={globalSettings.adminBio} onChange={e => setGlobalSettings({...globalSettings, adminBio: e.target.value})} />
                   </div>
                </div>
              </div>
              <button onClick={saveGlobalSettings} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all">💾 সবগুলো সেটিংস সেভ করুন</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
