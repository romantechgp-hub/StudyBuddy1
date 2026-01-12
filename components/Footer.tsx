
import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  const [footerText, setFooterText] = useState('"প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস"');

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('global_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.footerText) setFooterText(parsed.footerText);
      }
    };
    loadSettings();
    window.addEventListener('local-storage-update', loadSettings);
    return () => window.removeEventListener('local-storage-update', loadSettings);
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-600 font-medium italic">
          {footerText}
        </p>
        <p className="text-slate-400 text-xs mt-2 font-black uppercase tracking-widest">
          &copy; {new Date().getFullYear()} StudyBuddy AI Team
        </p>
      </div>
    </footer>
  );
};

export default Footer;
