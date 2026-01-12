
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  onBack: () => void;
  user: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack, user, onUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    bio: user.bio || '',
    institution: user.institution || '',
    grade: user.grade || '',
    themeColor: user.themeColor || 'from-indigo-600 via-indigo-500 to-purple-600'
  });
  const [newInterest, setNewInterest] = useState('');
  const [interests, setInterests] = useState<string[]>(user.interests || []);

  const themeOptions = [
    { label: 'Indigo Night', value: 'from-indigo-600 via-indigo-500 to-purple-600' },
    { label: 'Sunset Glow', value: 'from-orange-500 via-rose-500 to-pink-600' },
    { label: 'Ocean Breeze', value: 'from-cyan-500 via-blue-500 to-indigo-600' },
    { label: 'Forest Green', value: 'from-emerald-500 via-teal-500 to-cyan-600' },
  ];

  const handleSave = () => {
    onUpdate({ ...editData, interests });
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (val: string) => {
    setInterests(interests.filter(i => i !== val));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-50 overflow-hidden">
        {/* Dynamic Cover / Header */}
        <div className={`h-56 bg-gradient-to-br ${editData.themeColor} relative transition-all duration-500`}>
          <button 
            onClick={onBack} 
            className="absolute top-6 left-6 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all shadow-lg z-10"
          >
            ←
          </button>
          
          <button 
            onClick={onLogout}
            className="absolute top-6 right-6 px-4 py-2 bg-rose-500/80 hover:bg-rose-600 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-xs font-black transition-all shadow-lg z-10"
          >
            লগ আউট
          </button>
          
          <div className="absolute -bottom-16 left-8 sm:left-12 flex flex-col sm:flex-row items-end gap-6 w-full px-8 sm:px-0">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] border-8 border-white bg-slate-100 overflow-hidden shadow-2xl shadow-slate-200">
                {user.profileImage ? (
                  <img src={user.profileImage} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-indigo-50 text-indigo-300 font-black">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 w-11 h-11 bg-indigo-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-indigo-700 hover:scale-110 transition-all border-4 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            
            {!isEditing && (
              <div className="mb-4 flex flex-col gap-1 items-start">
                <div className="bg-white/90 backdrop-blur shadow-sm px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest inline-block border border-white">
                  Student ID: {user.id}
                </div>
                <h3 className="text-4xl font-black text-white drop-shadow-md sm:hidden">{user.name}</h3>
              </div>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="px-8 sm:px-12 pt-24 pb-12">
          {isEditing ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">নাম</label>
                    <input 
                      className="w-full text-lg font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-5 py-3 rounded-2xl transition-all"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">বায়ো</label>
                    <textarea 
                      className="w-full text-sm font-medium text-slate-600 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all h-28 resize-none"
                      placeholder="নিজের সম্পর্কে কিছু লিখুন..."
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">প্রতিষ্ঠান (স্কুল/কলেজ)</label>
                    <input 
                      className="w-full text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-5 py-3 rounded-2xl transition-all"
                      placeholder="আপনার শিক্ষা প্রতিষ্ঠানের নাম..."
                      value={editData.institution}
                      onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">শ্রেণী / গ্রেড</label>
                    <input 
                      className="w-full text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-5 py-3 rounded-2xl transition-all"
                      placeholder="যেমন: ১০ম শ্রেণী"
                      value={editData.grade}
                      onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">প্রোফাইল থিম</label>
                    <div className="flex gap-3">
                      {themeOptions.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setEditData({ ...editData, themeColor: theme.value })}
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.value} transition-all border-4 ${editData.themeColor === theme.value ? 'border-white ring-2 ring-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          title={theme.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">পছন্দের বিষয় (Interests)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {interests.map((int) => (
                    <span key={int} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-indigo-100">
                      {int}
                      <button onClick={() => removeInterest(int)} className="hover:text-rose-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    className="flex-grow text-sm font-medium text-slate-600 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all"
                    placeholder="নতুন বিষয় যোগ করুন (যেমন: অংক, বিজ্ঞান...)"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <button onClick={addInterest} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm">যোগ করুন</button>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button onClick={handleSave} className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">সবগুলো সেভ করুন</button>
                <button onClick={() => setIsEditing(false)} className="px-8 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">বাতিল</button>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                <div className="space-y-4 text-center sm:text-left">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      <h3 className="text-4xl font-black text-slate-800 tracking-tight">{user.name}</h3>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-all shadow-sm"
                        title="এডিট প্রোফাইল"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-slate-500 text-lg font-bold mt-2">
                      {user.bio || 'বায়ো এডিট করে নিজের সম্পর্কে কিছু লিখুন...'}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    {user.institution && (
                      <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold border border-slate-100 flex items-center gap-2">
                        🏫 {user.institution}
                      </span>
                    )}
                    {user.grade && (
                      <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold border border-slate-100 flex items-center gap-2">
                        🎓 {user.grade}
                      </span>
                    )}
                  </div>

                  {interests.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {interests.map(int => (
                        <span key={int} className="text-xs font-black text-indigo-500 bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
                          #{int}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-row sm:flex-col gap-4 justify-center">
                   <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-[2rem] text-center min-w-[120px] shadow-sm transform hover:scale-105 transition-all">
                      <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">STREAK</span>
                      <span className="text-3xl font-black text-indigo-600">🔥 {user.streak}</span>
                   </div>
                   <div className="bg-amber-50 border border-amber-100 p-5 rounded-[2rem] text-center min-w-[120px] shadow-sm transform hover:scale-105 transition-all">
                      <span className="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">BADGE</span>
                      <span className="text-3xl font-black text-amber-600">🏅</span>
                   </div>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all">💎</div>
                    <span className="block text-4xl font-black text-slate-800 mb-1">{user.points}</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">অর্জিত পয়েন্ট</span>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">💎</div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all">✅</div>
                    <span className="block text-4xl font-black text-slate-800 mb-1">১৮</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">টপিক সমাধান</span>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">✅</div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all">📈</div>
                    <span className="block text-4xl font-black text-slate-800 mb-1">৭২%</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">শিখার গতি</span>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">📈</div>
                </div>
              </div>

              <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-100">
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h4 className="text-2xl font-black mb-2">প্রতিদিন নতুন কিছু শিখুন!</h4>
                    <p className="text-indigo-100 font-medium opacity-90">বাডির সাথে চ্যাট শুরু করলে শিখা আরও সহজ হয়।</p>
                  </div>
                  <button 
                    onClick={onBack}
                    className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg shadow-black/10 active:scale-95"
                  >
                    শেখা শুরু করো
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl -rotate-12 group-hover:rotate-0 transition-all duration-700">🎓</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
