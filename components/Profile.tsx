
import React, { useState } from 'react';
import { UserProfile } from '../types';
import ImageCropper from './ImageCropper';

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
  
  // Cropper state
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

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

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (val: string) => setInterests(interests.filter(i => i !== val));

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {cropperSrc && (
        <ImageCropper 
          image={cropperSrc} 
          aspect={1} 
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperSrc(null)} 
        />
      )}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className={`h-56 bg-gradient-to-br ${editData.themeColor} relative transition-all duration-500`}>
          <button onClick={onBack} className="absolute top-6 left-6 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all shadow-lg z-10">←</button>
          <button onClick={onLogout} className="absolute top-6 right-6 px-4 py-2 bg-rose-500/80 hover:bg-rose-600 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-xs font-black transition-all shadow-lg z-10">লগ আউট</button>
          
          <div className="absolute -bottom-16 left-8 sm:left-12 flex flex-col sm:flex-row items-end gap-6 w-full">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] border-8 border-white bg-slate-100 overflow-hidden shadow-2xl flex items-center justify-center">
                {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <div className="text-6xl bg-indigo-50 text-indigo-300 font-black">{user.name[0]}</div>}
              </div>
              <label className="absolute bottom-2 right-2 w-11 h-11 bg-indigo-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl border-4 border-white hover:scale-110 transition-all">
                📷
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
            {!isEditing && (
              <div className="mb-4 flex flex-col gap-1 items-start">
                <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-white">Student ID: {user.id}</div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 sm:px-12 pt-24 pb-12">
          {isEditing ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">নাম</label>
                    <input className="w-full text-lg font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-5 py-3 rounded-2xl transition-all" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">বায়ো</label>
                    <textarea className="w-full text-sm font-medium text-slate-600 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all h-28 resize-none" placeholder="নিজের সম্পর্কে কিছু লিখুন..." value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">প্রতিষ্ঠান</label>
                    <input className="w-full text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-5 py-3 rounded-2xl transition-all" placeholder="শিক্ষা প্রতিষ্ঠানের নাম..." value={editData.institution} onChange={(e) => setEditData({ ...editData, institution: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">গ্রেড</label>
                    <input className="w-full text-sm font-bold text-slate-800 border-2 border-slate-100 focus:border-indigo-500 outline-none bg-slate-50 px-5 py-3 rounded-2xl transition-all" placeholder="শ্রেণী..." value={editData.grade} onChange={(e) => setEditData({ ...editData, grade: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">প্রোফাইল থিম</label>
                    <div className="flex gap-3">
                      {themeOptions.map((theme) => (
                        <button key={theme.value} onClick={() => setEditData({ ...editData, themeColor: theme.value })} className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.value} transition-all border-4 ${editData.themeColor === theme.value ? 'border-white ring-2 ring-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`} title={theme.label} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button onClick={handleSave} className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all">সবগুলো সেভ করুন</button>
                <button onClick={() => setIsEditing(false)} className="px-8 bg-slate-100 text-slate-600 rounded-2xl font-bold transition-all">বাতিল</button>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                <div className="space-y-4 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight">{user.name}</h3>
                    <button onClick={() => setIsEditing(true)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl flex items-center justify-center transition-all shadow-sm">✏️</button>
                  </div>
                  <p className="text-slate-500 text-lg font-bold">{user.bio || 'বায়ো যোগ করুন...'}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-[2rem] text-center min-w-[120px]">
                  <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">STREAK</span>
                  <span className="text-3xl font-black text-indigo-600">🔥 {user.streak}</span>
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