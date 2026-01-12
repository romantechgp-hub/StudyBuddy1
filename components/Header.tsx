
import React from 'react';
import { View, UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  setView: (v: View) => void;
}

const Header: React.FC<HeaderProps> = ({ user, setView }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setView(View.HOME)}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <span className="text-white font-black text-xl">📖</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">স্টাডিবাডি</h1>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">আপনার পড়াশোনার বন্ধু</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => setView(View.ADMIN_LOGIN)}
            className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors"
          >
            ADMIN
          </button>
          
          <div className="h-8 w-[1px] bg-slate-100"></div>

          <div 
            onClick={() => setView(View.PROFILE)}
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 p-1 rounded-xl sm:p-1.5 sm:pr-4 sm:rounded-2xl transition-all duration-300"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-white bg-indigo-100 overflow-hidden shadow-sm group-hover:shadow-indigo-100 transition-all">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-xs sm:text-sm">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-left hidden xs:block">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Points</p>
              <p className="text-xs sm:text-sm font-black text-indigo-600 leading-none">{user.points}</p>
            </div>
            {/* Fallback for very small screens to show points */}
            <div className="xs:hidden font-black text-indigo-600 text-[10px]">{user.points}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
