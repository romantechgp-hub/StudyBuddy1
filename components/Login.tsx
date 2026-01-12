
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (id: string, pass: string) => string | null;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    appName: 'স্টাডিবাডি',
    appSubtitle: 'আপনার পড়াশোনার বন্ধু',
    appLogo: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('global_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({
        appName: parsed.appName || 'স্টাডিবাডি',
        appSubtitle: parsed.appSubtitle || 'আপনার পড়াশোনার বন্ধু',
        appLogo: parsed.appLogo || ''
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errorMessage = onLogin(userId, password);
    if (errorMessage) {
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto shadow-xl shadow-indigo-100 mb-6 overflow-hidden">
            {settings.appLogo ? (
              <img src={settings.appLogo} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <span>📖</span>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-800">{settings.appName}-তে লগইন করুন</h2>
          <p className="text-slate-500 mt-3 font-medium text-lg leading-relaxed">
            {settings.appSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ইউজার আইডি:</label>
            <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
              placeholder="আপনার ইউজার আইডি দিন"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">পাসওয়ার্ড:</label>
            <input
              type="password"
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
              placeholder="আপনার পাসওয়ার্ড দিন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold animate-in shake duration-300">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all transform active:scale-95"
          >
            লগইন করুন
          </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-100 pt-6">
          <p className="text-slate-500 font-bold mb-3">নতুন অ্যাকাউন্ট খুলতে চান?</p>
          <button
            onClick={onGoToRegister}
            className="text-indigo-600 font-black hover:text-indigo-800 transition-colors uppercase tracking-widest text-sm"
          >
            রেজিস্ট্রেশন করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;