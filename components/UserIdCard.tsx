
import React, { useRef, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import ImageCropper from './ImageCropper';

interface UserIdCardProps {
  user: UserProfile;
  adminName: string;
  onClose: () => void;
  isAdmin?: boolean;
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

type IdTheme = 'indigo' | 'gold' | 'dark' | 'green' | 'rose' | 'violet' | 'cyan' | 'orange';
type IdLayout = 'classic' | 'premium_pro' | 'modern' | 'executive' | 'minimalist';

const UserIdCard: React.FC<UserIdCardProps> = ({ user, adminName, onClose, isAdmin, onUpdateUser }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Initialize from user data
  const [theme, setTheme] = useState<IdTheme>((user.idCardTheme as IdTheme) || 'indigo');
  const [layout, setLayout] = useState<IdLayout>((user.idCardLayout as IdLayout) || 'premium_pro');
  const [issuedBy, setIssuedBy] = useState(user.idCardIssuedBy || adminName);
  
  const [editData, setEditData] = useState({
    name: user.name,
    institution: user.institution || 'Study Buddy',
    grade: user.grade || '',
    points: user.points,
    streak: user.streak,
    profileImage: user.profileImage,
    bloodGroup: user.idCardBloodGroup || '',
    phone: user.idCardPhone || '',
    issueDate: user.idCardIssueDate || 'N/A',
    validity: user.idCardValidity || 'N/A',
    address: user.idCardAddress || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

  useEffect(() => {
    setEditData({
      name: user.name,
      institution: user.institution || 'Study Buddy',
      grade: user.grade || '',
      points: user.points,
      streak: user.streak,
      profileImage: user.profileImage,
      bloodGroup: user.idCardBloodGroup || '',
      phone: user.idCardPhone || '',
      issueDate: user.idCardIssueDate || 'N/A',
      validity: user.idCardValidity || 'N/A',
      address: user.idCardAddress || ''
    });
    if (user.idCardTheme) setTheme(user.idCardTheme as IdTheme);
    if (user.idCardLayout) setLayout(user.idCardLayout as IdLayout);
    if (user.idCardIssuedBy) setIssuedBy(user.idCardIssuedBy);
  }, [user]);

  const themes: Record<IdTheme, { border: string, header: string, text: string, sub: string, accent: string, hex: string }> = {
    indigo: { border: 'border-indigo-600', header: 'bg-indigo-600', text: 'text-slate-800', sub: 'text-indigo-600', accent: 'text-indigo-200', hex: '#4f46e5' },
    gold: { border: 'border-amber-500', header: 'bg-amber-500', text: 'text-slate-800', sub: 'text-amber-600', accent: 'text-amber-100', hex: '#f59e0b' },
    dark: { border: 'border-slate-800', header: 'bg-slate-800', text: 'text-slate-800', sub: 'text-slate-700', accent: 'text-slate-400', hex: '#1e293b' },
    green: { border: 'border-emerald-600', header: 'bg-emerald-600', text: 'text-slate-800', sub: 'text-emerald-600', accent: 'text-emerald-100', hex: '#10b981' },
    rose: { border: 'border-rose-500', header: 'bg-rose-500', text: 'text-slate-800', sub: 'text-rose-600', accent: 'text-rose-100', hex: '#f43f5e' },
    violet: { border: 'border-violet-600', header: 'bg-violet-600', text: 'text-slate-800', sub: 'text-violet-600', accent: 'text-violet-100', hex: '#7c3aed' },
    cyan: { border: 'border-cyan-600', header: 'bg-cyan-600', text: 'text-slate-800', sub: 'text-cyan-600', accent: 'text-cyan-100', hex: '#0891b2' },
    orange: { border: 'border-orange-500', header: 'bg-orange-500', text: 'text-slate-800', sub: 'text-orange-600', accent: 'text-orange-100', hex: '#f97316' }
  };

  const handlePrint = () => {
    if (!cardRef.current) return;
    const cardContent = cardRef.current.innerHTML;
    const currentTheme = themes[theme];

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card - ${editData.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700;900&display=swap');
            body { font-family: 'Hind Siliguri', sans-serif !important; background: white; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .card-container-print { width: 350px; height: 600px; border: 12px solid ${currentTheme.hex}; border-radius: 2.5rem; overflow: hidden; position: relative; background: white; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: none; page-break-inside: avoid; }
            @media print { @page { margin: 0; size: auto; } body { margin: 0; } .card-container-print { margin: auto; } }
          </style>
        </head>
        <body>
          <div class="card-container-print">${cardContent}</div>
          <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 1200); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
    setEditData(prev => ({ ...prev, profileImage: croppedImage }));
    setCropperSrc(null);
  };

  const handleSaveAndBack = () => {
    if (onUpdateUser) {
      setIsSaving(true);
      const updatedUser: UserProfile = { 
        ...user, 
        ...editData,
        idCardTheme: theme,
        idCardLayout: layout,
        idCardIssuedBy: issuedBy,
        idCardBloodGroup: editData.bloodGroup,
        idCardPhone: editData.phone,
        idCardIssueDate: editData.issueDate,
        idCardValidity: editData.validity,
        idCardAddress: editData.address
      };
      onUpdateUser(updatedUser);
      setTimeout(() => { setIsSaving(false); onClose(); }, 500);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Verify_Student_ID:${user.id}`;
  const currentTheme = themes[theme];

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/98 backdrop-blur-xl flex flex-col items-center p-0 overflow-x-hidden overflow-y-auto font-['Hind_Siliguri']">
      
      {cropperSrc && (
        <ImageCropper 
          image={cropperSrc} 
          aspect={1} 
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperSrc(null)} 
        />
      )}

      <div className="sticky top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 p-4 sm:p-6 mb-4 no-print flex flex-col sm:flex-row justify-between items-center gap-4 z-[160] shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${currentTheme.header} rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg`}>🪪</div>
          <div className="text-left">
            <h2 className="text-white font-black text-lg sm:text-xl leading-none">{isAdmin ? 'আইডি কার্ড ডিজাইনার' : 'আপনার স্টুডেন্ট আইডি'}</h2>
            {isAdmin && <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mt-1">অ্যাডমিন কন্ট্রোল প্যানেল</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="bg-white/10 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all">✕ ফিরে যান</button>
          <button onClick={handlePrint} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all">🖨️ PDF প্রিন্ট / সেভ</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-7xl px-4 pb-20">
        
        {isAdmin && (
          <div className="w-full lg:w-[420px] bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 space-y-6 no-print">
            <h3 className="text-slate-800 font-black text-lg border-b pb-4 flex items-center gap-2"><span>🛠️</span> কার্ড কাস্টমাইজেশন</h3>
            
            <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ডিজাইন লেআউট নির্বাচন করুন</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['classic', 'premium_pro', 'modern', 'executive', 'minimalist'] as IdLayout[]).map(l => (
                    <button key={l} onClick={() => setLayout(l)} className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${layout === l ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}>{l.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">রঙের থিম</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(themes) as IdTheme[]).map(t => (
                    <button key={t} onClick={() => setTheme(t)} className={`w-8 h-8 rounded-xl border-4 ${theme === t ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent opacity-60'} ${themes[t].header}`} />
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">নাম</label>
                  <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none text-xs" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">প্রতিষ্ঠান</label>
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none text-xs" value={editData.institution} onChange={e => setEditData({...editData, institution: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">শ্রেণী / গ্রেড</label>
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none text-xs" value={editData.grade} onChange={e => setEditData({...editData, grade: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">রক্তের গ্রুপ</label>
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none text-xs" value={editData.bloodGroup} onChange={e => setEditData({...editData, bloodGroup: e.target.value})} placeholder="যেমন: A+" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">ফোন নম্বর</label>
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none text-xs" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="জরুরী যোগাযোগ" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">ইস্যু তারিখ</label>
                    <div className="flex gap-1">
                      <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none text-xs" value={editData.issueDate} onChange={e => setEditData({...editData, issueDate: e.target.value})} />
                      <button onClick={() => setEditData({...editData, issueDate: new Date().toLocaleDateString('bn-BD')})} className="bg-indigo-50 text-indigo-600 px-2 rounded-lg text-[8px] font-black">TODAY</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">মেয়াদ</label>
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none text-xs" value={editData.validity} onChange={e => setEditData({...editData, validity: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">ঠিকানা</label>
                  <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none text-xs" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} placeholder="স্থায়ী ঠিকানা" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-indigo-600 uppercase">ইস্যু করেছেন (Issued By)</label>
                  <input className="w-full bg-indigo-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-2 text-indigo-600 font-black outline-none text-xs" value={issuedBy} onChange={e => setIssuedBy(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-100 cursor-pointer">
                  {editData.profileImage ? <img src={editData.profileImage} className="w-full h-full object-cover" alt="Student Photo" /> : <div className="bg-slate-100 w-full h-full flex items-center justify-center">👤</div>}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] text-white font-black uppercase">বদলান</span>
                    <input type="file" className="hidden" onChange={handleFileSelect} />
                  </label>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase">প্রোফাইল ছবি</p>
              </div>
            </div>

            <button onClick={handleSaveAndBack} disabled={isSaving} className={`w-full ${currentTheme.header} text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transform active:scale-95 transition-all`}>💾 সবগুলো তথ্য সেভ করুন</button>
          </div>
        )}

        <div className="w-full flex justify-center items-center py-4">
          <div className="shrink-0 animate-in zoom-in duration-500 origin-top transform scale-[0.8] xs:scale-100">
            {/* The Main Card Container */}
            <div ref={cardRef} className={`card-container-base w-[350px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[12px] ${currentTheme.border} relative flex flex-col items-center p-0 transition-all`}>
              
              {/* Layout: PREMIUM PRO */}
              {layout === 'premium_pro' && (
                <>
                  <div className={`w-full h-44 ${currentTheme.header} relative flex flex-col items-center justify-start pt-10 overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -mr-28 -mt-28"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full -ml-20 -mb-20"></div>
                    {/* Removed text from header */}
                  </div>
                  <div className="relative -mt-20 z-20 mb-4 px-10">
                    <div className="w-48 h-48 rounded-[3.5rem] border-[10px] border-white bg-slate-50 overflow-hidden shadow-2xl flex items-center justify-center">
                      {editData.profileImage ? <img src={editData.profileImage} className="w-full h-full object-cover" alt="Student Profile" /> : <span className={`text-8xl font-black ${currentTheme.accent}`}>{editData.name[0]}</span>}
                    </div>
                  </div>
                  <div className="px-8 flex-grow w-full text-center">
                    <h2 className={`text-2xl font-black ${currentTheme.text} mb-1 truncate leading-tight tracking-tight`}>{editData.name}</h2>
                    <p className={`${currentTheme.sub} font-black text-[10px] uppercase tracking-[0.2em] mb-3`}>ID: {user.id.toUpperCase()}</p>
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-left border-t border-slate-100 pt-4">
                      <div className="col-span-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Institution</p>
                        <p className={`text-[12px] font-black ${currentTheme.text} truncate`}>{editData.institution}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Grade/Class</p>
                        <p className={`text-[12px] font-black ${currentTheme.text} truncate`}>{editData.grade || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Blood Group</p>
                        <p className="text-[12px] font-black text-rose-600">{editData.bloodGroup || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone No</p>
                        <p className={`text-[12px] font-black ${currentTheme.text}`}>{editData.phone || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Address</p>
                        <p className={`text-[10px] font-bold ${currentTheme.text} line-clamp-2`}>{editData.address || 'Not Provided'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Issue Date</p>
                        <p className={`text-[11px] font-bold ${currentTheme.text}`}>{editData.issueDate}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Expiry</p>
                        <p className={`text-[11px] font-bold ${currentTheme.sub}`}>{editData.validity}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto w-full p-5 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorized By</p>
                      <p className={`text-[14px] font-black ${currentTheme.sub} italic leading-none`}>{issuedBy}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <img src={qrCodeUrl} className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shadow-sm" alt="QR" />
                    </div>
                  </div>
                </>
              )}

              {/* Layout: EXECUTIVE */}
              {layout === 'executive' && (
                <div className="w-full h-full flex">
                  <div className={`w-24 h-full ${currentTheme.header} flex flex-col items-center justify-between py-12 relative overflow-hidden`}>
                     <div className="absolute top-0 w-40 h-40 bg-white/10 rounded-full -mt-20"></div>
                     {/* Removed identity text and logo from sidebar */}
                  </div>
                  <div className="flex-grow flex flex-col p-8 items-start text-left bg-white relative">
                     <div className="w-28 h-28 rounded-3xl border-4 border-slate-50 overflow-hidden shadow-xl mb-6 self-start">
                        {editData.profileImage ? <img src={editData.profileImage} className="w-full h-full object-cover" alt="Student Profile" /> : <div className="bg-slate-50 w-full h-full"></div>}
                     </div>
                     <h2 className={`text-2xl font-black ${currentTheme.text} leading-none mb-1 tracking-tighter`}>{editData.name}</h2>
                     <p className={`${currentTheme.sub} font-black text-[9px] uppercase tracking-widest mb-5`}>Member #SB-{user.id.toUpperCase()}</p>
                     
                     <div className="space-y-3.5 w-full">
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Institution</p>
                           <p className={`text-[11px] font-black ${currentTheme.text}`}>{editData.institution}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Blood</p>
                              <p className="text-[11px] font-black text-rose-500">{editData.bloodGroup || '-'}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Grade</p>
                              <p className={`text-[11px] font-black ${currentTheme.text}`}>{editData.grade || '-'}</p>
                           </div>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                           <p className={`text-[11px] font-black ${currentTheme.text}`}>{editData.phone || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Address</p>
                           <p className={`text-[10px] font-bold ${currentTheme.text} line-clamp-2 leading-tight`}>{editData.address || '-'}</p>
                        </div>
                     </div>

                     <div className="mt-auto w-full pt-4 flex justify-between items-end border-t border-slate-100">
                        <div className="text-left space-y-2">
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Issue Date</p>
                              <p className={`text-[11px] font-black ${currentTheme.text}`}>{editData.issueDate}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Validity</p>
                              <p className={`text-[11px] font-black ${currentTheme.sub}`}>{editData.validity}</p>
                           </div>
                        </div>
                        <img src={qrCodeUrl} className="w-14 h-14 bg-white p-1 rounded-2xl shadow-lg border border-slate-100" alt="QR" />
                     </div>
                  </div>
                </div>
              )}

              {/* Layout: MODERN */}
              {layout === 'modern' && (
                <div className="p-10 w-full h-full flex flex-col items-center bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>
                    <div className="flex justify-center w-full items-center mb-6 relative z-10">
                       {/* Removed Identity Card text and logo */}
                    </div>
                    
                    <div className="w-44 h-44 rounded-full border-8 border-white overflow-hidden shadow-2xl mb-6 flex items-center justify-center bg-slate-50 ring-4 ring-slate-50">
                       {editData.profileImage ? <img src={editData.profileImage} className="w-full h-full object-cover" alt="Student Profile" /> : <span className={`text-7xl font-black ${currentTheme.accent}`}>{editData.name[0]}</span>}
                    </div>

                    <div className="text-center w-full relative z-10">
                       <h2 className={`text-3xl font-black ${currentTheme.text} mb-1 tracking-tight`}>{editData.name}</h2>
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Official Student</p>
                       
                       <div className={`mt-6 p-5 rounded-[2.5rem] bg-slate-50 border border-slate-100 grid grid-cols-2 gap-y-3.5 text-left shadow-inner`}>
                          <div className="col-span-2">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Institution & Class</p>
                             <p className={`text-[11px] font-black ${currentTheme.text} truncate`}>{editData.institution} • {editData.grade}</p>
                          </div>
                          <div className="col-span-1">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                             <p className={`text-[11px] font-black ${currentTheme.text}`}>{editData.phone || 'N/A'}</p>
                          </div>
                          <div className="col-span-1 text-right">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Blood</p>
                             <p className="text-[11px] font-black text-rose-500">{editData.bloodGroup || '-'}</p>
                          </div>
                          <div className="col-span-2">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Address</p>
                             <p className={`text-[10px] font-black ${currentTheme.text} truncate`}>{editData.address || '-'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="mt-auto w-full flex items-center justify-between pt-6">
                       <div className="text-left">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                          <p className={`text-sm font-black ${currentTheme.sub}`}>{editData.validity}</p>
                       </div>
                       <img src={qrCodeUrl} className="w-14 h-14 rounded-xl border-2 border-slate-50" alt="QR" />
                    </div>
                </div>
              )}

              {/* Layout: CLASSIC or MINIMALIST */}
              {(layout === 'classic' || layout === 'minimalist') && (
                 <>
                  <div className={`w-full h-32 ${currentTheme.header} relative overflow-hidden flex flex-col items-center justify-start pt-6 shrink-0`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    {/* Removed Identity Card text from header */}
                  </div>
                  <div className="relative -mt-20 z-10 mb-4 shrink-0">
                    <div className="w-44 h-44 rounded-[4rem] border-[10px] border-white bg-slate-100 overflow-hidden shadow-2xl flex items-center justify-center">
                      {editData.profileImage ? <img src={editData.profileImage} className="w-full h-full object-cover" alt="Student Profile" /> : <span className={`text-7xl font-black ${currentTheme.accent}`}>{editData.name.charAt(0)}</span>}
                    </div>
                  </div>
                  <div className="px-10 space-y-4 w-full flex-grow text-center">
                    <div className="space-y-0.5">
                      <h2 className={`text-2xl font-black ${currentTheme.text} leading-none mb-1 tracking-tight`}>{editData.name}</h2>
                      <p className={`${currentTheme.sub} font-black text-[10px] uppercase tracking-[0.2em]`}>#ID-{user.id.toUpperCase()}</p>
                    </div>
                    
                    <div className="h-[2px] bg-slate-100 w-full rounded-full mx-auto"></div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-left">
                      <div className="overflow-hidden">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Institution</p>
                        <p className={`text-[11px] font-black ${currentTheme.text} truncate`}>{editData.institution}</p>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Grade</p>
                        <p className={`text-[11px] font-black ${currentTheme.text} truncate`}>{editData.grade || '-'}</p>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                        <p className={`text-[11px] font-black ${currentTheme.text} truncate`}>{editData.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Blood</p>
                        <p className={`text-[11px] font-black text-rose-500`}>{editData.bloodGroup || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Address</p>
                        <p className={`text-[10px] font-black ${currentTheme.text} truncate`}>{editData.address || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center pt-1">
                       <img src={qrCodeUrl} className="w-14 h-14 bg-white border-2 border-slate-50 rounded-2xl p-1" alt="QR" />
                    </div>
                  </div>
                  <div className="mt-auto w-full p-5 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                      <p className={`text-[14px] font-black ${currentTheme.sub} italic leading-none`}>{editData.validity}</p>
                    </div>
                    {/* Removed Emoji logo from bottom right */}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIdCard;
