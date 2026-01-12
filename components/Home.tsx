
import React, { useState, useEffect } from 'react';
import { View, UserProfile, BannerImage, AdminLink, AdminNotice } from '../types';
import AdminBioBanner from './AdminBioBanner';
import Banner from './Banner';

interface HomeProps {
  setView: (v: View) => void;
  user: UserProfile;
}

const Home: React.FC<HomeProps> = ({ setView, user }) => {
  const [adminBanners, setAdminBanners] = useState<BannerImage[]>([]);
  const [adminLinks, setAdminLinks] = useState<AdminLink[]>([]);
  const [adminNotices, setAdminNotices] = useState<AdminNotice[]>([]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('local-storage-update', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('local-storage-update', handleUpdate);
    };
  }, []);

  const loadData = () => {
    setAdminBanners(JSON.parse(localStorage.getItem('admin_banners') || '[]'));
    setAdminLinks(JSON.parse(localStorage.getItem('admin_links') || '[]'));
    setAdminNotices(JSON.parse(localStorage.getItem('admin_notices') || '[]'));
  };

  const menuItems = [
    { title: 'সহজ পড়া মোড', icon: '📚', view: View.STUDY_MODE, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200/50', desc: 'টপিক সহজে বুঝতে' },
    { title: 'অংক সমাধানকারী', icon: '🔢', view: View.MATH_SOLVER, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200/50', desc: 'অংকের সহজ সমাধান' },
    { title: 'সঠিক বানান শিখুন', icon: '✏️', view: View.SPELLING_CHECKER, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200/50', desc: 'বানান ও ব্যাকরণ ঠিক করো' },
    { title: 'অনুবাদ ও স্পিকিং', icon: '🗣️', view: View.SPEAKING_HELPER, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-200/50', desc: 'ইংরেজি শিখুন সহজেই' },
    { title: 'স্ক্রিপ্ট লিখে নাও', icon: '📜', view: View.SCRIPT_WRITER, color: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-200/50', desc: 'যেকোনো বিষয়ের স্ক্রিপ্ট' },
    { title: 'প্রশ্ন ও উত্তর', icon: '❓', view: View.QA_MODE, color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-200/50', desc: 'যেকোনো প্রশ্নের উত্তর' },
    { title: 'এআই বন্ধু চ্যাট', icon: '🤖', view: View.TALK_MODE, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-200/50', desc: 'ভয় ছাড়া ইংরেজি বলা' },
    { title: 'আজকের লক্ষ্য', icon: '🏆', view: View.DAILY_CHALLENGE, color: 'from-sky-500 to-sky-600', shadow: 'shadow-sky-200/50', desc: 'পুরস্কার জিতে নাও' },
    { title: 'হেল্প লাইন', icon: '📞', view: View.SUPPORT_CHAT, color: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-200/50', desc: 'অ্যাডমিনের সাথে চ্যাট' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Main Banner (Configurable via Admin Settings) */}
      <Banner />

      {/* Welcome Hero */}
      <div className={`relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br ${user.themeColor || 'from-indigo-600 via-indigo-500 to-purple-700'} p-10 sm:p-14 text-white shadow-2xl shadow-indigo-100`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-grow space-y-6 text-center md:text-left max-w-xl">
             <div className="inline-flex items-center gap-2 bg-white/15 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
              লাইভ লার্নিং ড্যাশবোর্ড
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">হ্যালো, <span className="text-indigo-200">{user.name}</span>!</h2>
              <p className="text-white/80 text-lg sm:text-xl font-medium leading-relaxed">তুমি আজ <span className="text-amber-300 font-bold">{user.points} পয়েন্ট</span> নিয়ে ড্যাশবোর্ডে আছো। চলো নতুন কিছু শিখি!</p>
            </div>
            <button onClick={() => setView(View.PROFILE)} className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 shadow-xl transition-all">প্রোফাইল আপডেট করো</button>
          </div>
          <div className="relative shrink-0 cursor-pointer group" onClick={() => setView(View.PROFILE)}>
             <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-[3.5rem] border-8 border-white/20 overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-7xl font-black text-indigo-200">{user.name.charAt(0)}</div>}
             </div>
             <div className="absolute -bottom-4 -right-4 bg-amber-400 text-slate-900 w-16 h-16 rounded-3xl flex flex-col items-center justify-center shadow-2xl border-4 border-white rotate-12">
                <span className="text-[8px] font-black uppercase leading-none mb-0.5">লেভেল</span>
                <span className="text-xl font-black leading-none">{Math.floor(user.points/100) + 1}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Ad Banners Section (Uploaded via Admin Banners Tab) */}
      {adminBanners.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-6">
            {adminBanners.map(banner => (
              <div 
                key={banner.id} 
                className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 hover:scale-[1.02] transition-transform bg-white flex items-center justify-center"
                style={{
                  width: banner.size.split('x')[0] + 'px',
                  maxWidth: '100%',
                  aspectRatio: banner.size.replace('x', '/')
                }}
              >
                <img src={banner.imageUrl} className="w-full h-full object-contain" alt="Admin Banner" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice Board */}
      {adminNotices.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <span className="text-2xl animate-bounce">📢</span>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">নোটিশ বোর্ড</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminNotices.map(notice => (
              <div key={notice.id} className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group hover:shadow-xl transition-all ${notice.type === 'warning' ? 'bg-amber-50 border-amber-100' : notice.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                <div className="relative z-10">
                  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 ${notice.type === 'warning' ? 'bg-amber-100 text-amber-600' : notice.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {notice.type === 'warning' ? 'সতর্কতা' : notice.type === 'success' ? 'অভিনন্দন' : 'তথ্য'}
                  </span>
                  <h4 className="text-xl font-black text-slate-800 mb-2 leading-tight">{notice.title}</h4>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed">{notice.content}</p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase mt-4">{new Date(notice.timestamp).toLocaleDateString('bn-BD')}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 grayscale">{notice.type === 'warning' ? '⚠️' : notice.type === 'success' ? '✅' : '📢'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <button key={item.view} onClick={() => setView(item.view)} className="group flex flex-col items-center text-center p-10 bg-white rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className={`mb-8 p-6 bg-gradient-to-br ${item.color} rounded-[2rem] text-4xl shadow-xl ${item.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all`}>
              {item.icon}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">{item.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.desc}</p>
          </button>
        ))}
      </div>
      
      {/* Links Section */}
      {adminLinks.length > 0 && (
        <div className="space-y-6 pt-10">
          <div className="flex items-center gap-3 ml-2 border-b border-slate-100 pb-4">
            <span className="text-2xl">🔗</span>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">প্রয়োজনীয় লিংকসমূহ</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {adminLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group p-6 bg-white border border-slate-50 rounded-[2.5rem] shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[1.2rem] flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all">🔗</div>
                <h4 className="font-black text-slate-800 mb-2 truncate group-hover:text-indigo-600">{link.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">ভিজিট করো</p>
                   <span className="text-indigo-400 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <AdminBioBanner />
    </div>
  );
};

export default Home;
