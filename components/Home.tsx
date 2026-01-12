
import React, { useState, useEffect } from 'react';
import { View, UserProfile, BannerImage, AdminLink } from '../types';
import AdminBioBanner from './AdminBioBanner';

interface HomeProps {
  setView: (v: View) => void;
  user: UserProfile;
}

const Home: React.FC<HomeProps> = ({ setView, user }) => {
  const [adminBanners, setAdminBanners] = useState<BannerImage[]>([]);
  const [adminLinks, setAdminLinks] = useState<AdminLink[]>([]);

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const loadData = () => {
    const savedBanners = localStorage.getItem('admin_banners');
    if (savedBanners) setAdminBanners(JSON.parse(savedBanners));

    const savedLinks = localStorage.getItem('admin_links');
    if (savedLinks) setAdminLinks(JSON.parse(savedLinks));
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

  const getBannerStyle = (sizeStr: string) => {
    const size = sizeStr.split(' ')[0];
    switch (size) {
      case '728x90': return 'w-full max-w-[728px] h-[90px]';
      case '300x250': return 'w-[300px] h-[250px]';
      case '336x280': return 'w-[336px] h-[280px]';
      case '160x600': return 'w-[160px] h-[600px] mx-auto';
      case '300x600': return 'w-[300px] h-[600px] mx-auto';
      case '320x50': return 'w-[320px] h-[50px]';
      case '320x100': return 'w-[320px] h-[100px]';
      default: return 'w-full h-auto';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Hero */}
      <div className={`relative overflow-hidden rounded-[3rem] bg-gradient-to-br ${user.themeColor || 'from-indigo-600 via-indigo-500 to-purple-700'} p-8 sm:p-14 text-white shadow-2xl shadow-indigo-200 group transition-all duration-700`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-grow space-y-6 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400"></span>
              লাইভ লার্নিং ড্যাশবোর্ড
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
                হ্যালো, <span className="text-indigo-200 relative group-hover:text-white transition-colors">{user.name}</span>!
              </h2>
              <p className="text-white/80 text-lg sm:text-xl font-medium leading-relaxed">
                তুমি আজ <span className="text-amber-300 font-bold">{user.points} পয়েন্ট</span> নিয়ে ড্যাশবোর্ডে আছো। চলো নতুন কিছু শিখে পয়েন্ট বাড়িয়ে নেই!
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button 
                onClick={() => setView(View.PROFILE)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 shadow-xl shadow-black/10 transition-all transform active:scale-95"
              >
                প্রোফাইল আপডেট করো
              </button>
            </div>
          </div>
          
          <div className="relative flex-shrink-0">
            <div 
              onClick={() => setView(View.PROFILE)}
              className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-[3.5rem] border-8 border-white/20 overflow-hidden shadow-2xl group-hover:scale-105 transition-all duration-700 cursor-pointer ring-4 ring-indigo-400/20"
            >
              {user.profileImage ? (
                <img src={user.profileImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Avatar" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-7xl font-black text-indigo-200">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-amber-400 text-slate-900 w-16 h-16 rounded-3xl flex flex-col items-center justify-center shadow-2xl border-4 border-white transform -rotate-12 group-hover:rotate-0 transition-all">
              <span className="text-[8px] font-black uppercase tracking-tighter leading-none mb-0.5">লেভেল</span>
              <span className="text-xl font-black leading-none">০{Math.floor(user.points/100) + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Links Section */}
      {adminLinks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <span className="text-2xl">🔗</span>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">গুরুত্বপূর্ণ লিংকসমূহ</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {adminLinks.map(link => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col p-6 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/30 hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-black text-slate-800 text-sm leading-tight line-clamp-2">{link.title}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-1">
                  ভিজিট করুন <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">→</span>
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Admin Post Banners Area */}
      {adminBanners.length > 0 && (
        <div className="flex flex-col items-center gap-10 py-6 animate-in fade-in zoom-in duration-1000">
          <div className="flex flex-col items-center gap-2">
            <div className="h-1 w-20 bg-indigo-100 rounded-full"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">স্পেশাল নোটিশ ও অফার</p>
          </div>
          {adminBanners.map(banner => (
            <div 
              key={banner.id} 
              className={`bg-white rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden flex items-center justify-center p-2 ${getBannerStyle(banner.size)}`}
            >
              <img src={banner.imageUrl} alt="Promotion" className="w-full h-full object-contain rounded-2xl" />
            </div>
          ))}
          <div className="h-1 w-20 bg-indigo-100 rounded-full"></div>
        </div>
      )}

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item, idx) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className="group relative flex flex-col items-center text-center p-10 bg-white rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-500"
          >
            <div className={`mb-8 p-6 bg-gradient-to-br ${item.color} rounded-[2rem] text-4xl shadow-xl ${item.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
              {item.icon}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">
              {item.title}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
      
      {/* Motivational Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">💡</div>
           <div className="text-left">
             <p className="text-sm font-black text-slate-800">বাডির আজকের টিপস:</p>
             <p className="text-xs font-medium text-slate-500 max-w-sm">প্রতিদিন অন্তত ৩টি ইংরেজি বাক্য লিখলে এবং বাডির সাথে কথা বললে তোমার জড়তা দ্রুত কেটে যাবে!</p>
           </div>
        </div>
        <button 
          onClick={() => setView(View.DAILY_CHALLENGE)}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform active:scale-95 whitespace-nowrap"
        >
          চ্যালেঞ্জ শুরু করো
        </button>
      </div>

      {/* Dynamic Admin Bio Banner */}
      <AdminBioBanner />
    </div>
  );
};

export default Home;
