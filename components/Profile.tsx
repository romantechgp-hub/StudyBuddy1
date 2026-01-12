
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import ImageCropper from './ImageCropper';
import UserIdCard from './UserIdCard';

interface ProfileProps {
  onBack: () => void;
  user: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack, user, onUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [adminName, setAdminName] = useState('রিমন মাহমুদ রোমান');
  const [editData, setEditData] = useState({
    name: user.name,
    bio: user.bio || '',
    institution: user.institution || '',
    grade: user.grade || '',
    themeColor: user.themeColor || 'from-indigo-600 via-purple-600 to-pink-500',
    bloodGroup: user.idCardBloodGroup || '',
    phone: user.idCardPhone || '',
    address: user.idCardAddress || ''
  });
  const [newInterest, setNewInterest] = useState('');
  const [interests, setInterests] = useState<string[]>(user.interests || []);
  
  // Cropper state
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('global_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.adminName) setAdminName(parsed.adminName);
    }
  }, []);

  const themeOptions = [
    { label: 'Default Spark', value: 'from-indigo-600 via-purple-600 to-pink-500' },
    { label: 'Deep Ocean', value: 'from-blue-700 via-blue-600 to-cyan-500' },
    { label: 'Midnight', value: 'from-slate-900 via-indigo-900 to-slate-900' },
    { label: 'Sunset Glow', value: 'from-orange-500 via-rose-500 to-pink-600' },
    { label: 'Fresh Mint', value: 'from-emerald-500 via-teal-500 to-cyan-600' },
    { label: 'Cyberpunk', value: 'from-fuchsia-600 via-purple-600 to-indigo-600' },
    { label: 'Golden Hour', value: 'from-amber-400 via-orange-500 to-rose-500' },
    { label: 'Royal Rose', value: 'from-rose-600 via-pink-600 to-purple-600' },
    { label: 'Soft Lavender', value: 'from-violet-400 via-purple-400 to-indigo-400' },
    { label: 'Tropical', value: 'from-teal-400 via-emerald-400 to-yellow-200' },
    { label: 'Dark Graphite', value: 'from-gray-700 via-gray-800 to-gray-900' },
  ];

  const handleSave = () => {
    onUpdate({ 
      ...editData, 
      interests,
      idCardBloodGroup: editData.bloodGroup,
      idCardPhone: editData.phone,
      idCardAddress: editData.address
    });
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCropperSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImage: string) => {
    onUpdate({ profileImage: croppedImage });
    setCropperSrc(null);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {cropperSrc && (
        <ImageCropper 
          image={cropperSrc} 
          aspect={1} 
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperSrc(null)} 
        />
      )}

      {showIdCard && (
        <UserIdCard 
          user={user} 
          adminName={adminName} 
          onClose={() => setShowIdCard(false)} 
        />
      )}

      <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className={`h-40 sm:h-56 bg-gradient-to-br ${editData.themeColor} relative transition-all duration-700`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <button onClick={onBack} className="absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all shadow-lg z-10 text-sm">←</button>
          <button onClick={onLogout} className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1.5 sm:px-4 sm:py-2 bg-rose-500/80 hover:bg-rose-600 backdrop-blur-md rounded-lg sm:rounded-xl flex items-center justify-center text-white text-[10px] sm:text-xs font-black transition-all shadow-lg z-10 uppercase tracking-widest">লগ আউট</button>
          
          <div className="absolute -bottom-10 sm:-bottom-16 left-0 right-0 sm:left-12 sm:right-auto flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-[1.8rem] sm:rounded-[2.5rem] border-4 sm:border-8 border-white bg-slate-100 overflow-hidden shadow-2xl flex items-center justify-center">
                {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl bg-indigo-50 text-indigo-300 font-black">{user.name[0]}</div>}
              </div>
              <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 sm:w-11 sm:h-11 bg-indigo-600 text-white rounded-lg sm:rounded-2xl flex items-center justify-center cursor-pointer shadow-xl border-2 sm:border-4 border-white hover:scale-110 transition-all text-xs sm:text-base">
                📷
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-12 pt-14 sm:pt-24 pb-8 sm:pb-12">
          {isEditing ? (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 sm:mb-2 block">নাম</label>
                    <input className="w-full text-base sm:text-lg font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-4 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl transition-all" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 sm:mb-2 block">বায়ো</label>
                    <textarea className="w-full text-[12px] sm:text-sm font-medium text-slate-600 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all h-24 sm:h-28 resize-none" placeholder="নিজের সম্পর্কে কিছু লিখুন..." value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 sm:mb-2 block">ঠিকানা</label>
                    <input className="w-full text-[12px] sm:text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-4 py-2 rounded-xl sm:rounded-2xl transition-all" placeholder="আপনার পূর্ণ ঠিকানা..." value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 sm:mb-2 block">প্রতিষ্ঠান</label>
                    <input className="w-full text-[12px] sm:text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-4 py-2 rounded-xl sm:rounded-2xl transition-all" placeholder="শিক্ষা প্রতিষ্ঠানের নাম..." value={editData.institution} onChange={(e) => setEditData({ ...editData, institution: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 sm:mb-2 block">শ্রেণী / গ্রেড</label>
                      <input className="w-full text-[12px] sm:text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-4 py-2 rounded-xl sm:rounded-2xl transition-all" placeholder="যেমন: ১০ম" value={editData.grade} onChange={(e) => setEditData({ ...editData, grade: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 sm:mb-2 block">রক্তের গ্রুপ</label>
                      <input className="w-full text-[12px] sm:text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-4 py-2 rounded-xl sm:rounded-2xl transition-all" placeholder="A+" value={editData.bloodGroup} onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 sm:mb-2 block">ফোন নম্বর</label>
                    <input className="w-full text-[12px] sm:text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-4 py-2 rounded-xl sm:rounded-2xl transition-all" placeholder="মোবাইল নম্বর..." value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">প্রোফাইল থিম সিলেক্ট করুন</label>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                      {themeOptions.map((theme) => (
                        <button 
                          key={theme.value} 
                          onClick={() => setEditData({ ...editData, themeColor: theme.value })} 
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${theme.value} transition-all border-2 sm:border-4 ${editData.themeColor === theme.value ? 'border-white ring-2 ring-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`} 
                          title={theme.label} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button onClick={handleSave} className="flex-grow bg-indigo-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest">সেভ করুন</button>
                <button onClick={() => setIsEditing(false)} className="px-5 sm:px-8 bg-slate-100 text-slate-600 rounded-xl sm:rounded-2xl font-bold text-xs transition-all uppercase">বাতিল</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 sm:gap-8">
                <div className="space-y-3 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">{user.name}</h3>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="px-4 py-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl flex items-center gap-2 transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <span>✏️</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                    </button>
                  </div>
                  <p className="text-slate-500 text-sm sm:text-lg font-bold">{user.bio || 'বায়ো যোগ করুন...'}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className="text-indigo-500">🎓</span> {user.institution || 'প্রতিষ্ঠান যোগ করুন'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className="text-indigo-500">📚</span> {user.grade || 'শ্রেণী যোগ করুন'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className="text-indigo-500">📍</span> {user.idCardAddress || 'ঠিকানা যোগ করুন'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className="text-indigo-500">📞</span> {user.idCardPhone || 'ফোন নম্বর যোগ করুন'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className="text-indigo-500">🩸</span> Blood Group: {user.idCardBloodGroup || 'N/A'}
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-4 inline-block">Student ID: {user.id}</div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={() => setShowIdCard(true)}
                      className="bg-amber-50 text-amber-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 border border-amber-100 hover:bg-amber-100 transition-all shadow-sm mx-auto sm:mx-0"
                    >
                      <span>🪪</span> আপনার আইডি কার্ড দেখুন
                    </button>
                  </div>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] text-center min-w-[100px] sm:min-w-[120px] self-center sm:self-auto shadow-sm">
                  <span className="block text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5 sm:mb-1">STREAK</span>
                  <span className="text-xl sm:text-3xl font-black text-indigo-600">🔥 {user.streak}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
