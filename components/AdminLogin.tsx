
import React, { useState } from 'react';

interface AdminLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Load admin credentials from localStorage or use defaults
    const savedCreds = JSON.parse(localStorage.getItem('admin_credentials') || '{"id":"Rimon","pass":"13457"}');
    
    if (identifier === savedCreds.id && password === savedCreds.pass) {
      onLogin();
    } else {
      setError('ভুল তথ্য! শুধুমাত্র অ্যাডমিন লগইন করতে পারবেন।');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto text-white text-4xl shadow-xl shadow-indigo-100 mb-6">🔐</div>
        <h2 className="text-3xl font-black text-slate-800">অ্যাডমিন লগইন</h2>
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mt-6 text-sm font-bold border border-rose-100">
          ⚠️ নোটিশ: শুধুমাত্র অনুমোদিত অ্যাডমিন লগইন করতে পারবেন।
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest ml-1">অ্যাডমিন ইউজার আইডি:</label>
          <input
            type="text"
            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
            placeholder="আপনার আইডি দিন"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest ml-1">পাসওয়ার্ড:</label>
          <input
            type="password"
            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
            placeholder="আপনার পাসওয়ার্ড দিন"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && <p className="text-rose-500 text-sm font-bold text-center animate-in shake duration-300">{error}</p>}

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform active:scale-95"
          >
            লগইন করুন
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full text-slate-400 font-bold py-2 hover:text-indigo-600 transition-colors text-sm uppercase tracking-widest"
          >
            ড্যাশবোর্ডে ফিরে যান
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
