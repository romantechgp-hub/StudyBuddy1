
import React, { useState } from 'react';
import ImageCropper from './ImageCropper';

interface UserSetupProps {
  onComplete: (name: string, id: string, email: string, pass: string, image?: string) => void;
  onGoToLogin: () => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onComplete, onGoToLogin }) => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  
  // Cropper state
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCropperSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImage: string) => {
    setImage(croppedImage);
    setCropperSrc(null);
  };

  const handleFinish = () => {
    if (!name || !userId || !password) {
      setError('সবগুলো ঘর পূরণ করুন।');
      return;
    }
    const usersRaw = localStorage.getItem('studybuddy_registered_users');
    if (usersRaw) {
      const users: any[] = JSON.parse(usersRaw);
      if (users.find(u => u.id === userId)) {
        setError('এই ইউজার আইডিটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
        return;
      }
    }
    onComplete(name, userId, '', password, image);
  };

  return (
    <div className="max-w-md mx-auto mt-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {cropperSrc && (
        <ImageCropper 
          image={cropperSrc} 
          aspect={1} 
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperSrc(null)} 
        />
      )}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800">নতুন অ্যাকাউন্ট খুলুন</h2>
          <p className="text-slate-500 mt-2 font-medium">সহজেই রেজিস্ট্রেশন করে পড়াশোনা শুরু করুন।</p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative w-28 h-28 rounded-[2rem] border-4 border-slate-50 bg-slate-100 overflow-hidden group shadow-inner flex items-center justify-center">
              {image ? <img src={image} className="w-full h-full object-cover" /> : <div className="text-4xl grayscale">📸</div>}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-sm text-white text-xs font-bold">
                আপলোড
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্রোফাইল ছবি (ক্রপ করুন)</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">আপনার পূর্ণ নাম:</label>
            <input type="text" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm" placeholder="যেমন: রিমন মাহমুদ" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ইউজার আইডি (Login ID):</label>
            <input type="text" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm" placeholder="একটি ইউনিক আইডি দিন" value={userId} onChange={(e) => setUserId(e.target.value.toLowerCase().replace(/\s/g, ''))} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">পাসওয়ার্ড সেট করুন:</label>
            <input type="password" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm" placeholder="গোপন পাসওয়ার্ড দিন" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold text-center">{error}</div>}

          <button onClick={handleFinish} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl active:scale-95 transition-all">অ্যাকাউন্ট তৈরি করুন</button>
        </div>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-slate-500 font-bold mb-2">ইতিমধ্যে অ্যাকাউন্ট আছে?</p>
          <button onClick={onGoToLogin} className="text-indigo-600 font-black uppercase tracking-widest text-sm underline">লগইন করুন</button>
        </div>
      </div>
    </div>
  );
};

export default UserSetup;