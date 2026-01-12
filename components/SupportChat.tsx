
import React, { useState, useEffect, useRef } from 'react';

interface SupportChatProps {
  onBack: () => void;
  userId: string;
  userName: string;
}

const SupportChat: React.FC<SupportChatProps> = ({ onBack, userId, userName }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'admin', text: string, time: string }[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Simple interval to simulate real-time polling from local storage
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark as read when messages change or component mounts
    if (messages.length > 0) {
      localStorage.setItem(`support_read_count_${userId}`, messages.length.toString());
      window.dispatchEvent(new CustomEvent('local-storage-update'));
    }
  }, [messages, userId]);

  const loadMessages = () => {
    const key = `support_chat_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only update if messages length is different to avoid unnecessary re-renders
      if (prev => prev.length !== parsed.length) {
        setMessages(parsed);
      }
    }
  };

  const saveMessage = (newMsgs: any) => {
    setMessages(newMsgs);
    localStorage.setItem(`support_chat_${userId}`, JSON.stringify(newMsgs));
    
    // Update read count immediately for local user
    localStorage.setItem(`support_read_count_${userId}`, newMsgs.length.toString());

    // Also save to a central 'tickets' key for admin
    const tickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
    const ticketIdx = tickets.findIndex((t: any) => t.userId === userId);
    if (ticketIdx > -1) {
      tickets[ticketIdx].messages = newMsgs;
      tickets[ticketIdx].lastUpdate = Date.now();
      tickets[ticketIdx].userName = userName; // ensure name is fresh
    } else {
      tickets.push({ userId, userName, messages: newMsgs, lastUpdate: Date.now() });
    }
    localStorage.setItem('admin_tickets', JSON.stringify(tickets));
    window.dispatchEvent(new CustomEvent('local-storage-update'));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { sender: 'user', text: input, time: new Date().toLocaleTimeString() };
    const updated = [...messages, newMsg];
    saveMessage(updated);
    setInput('');
  };

  return (
    <div className="bg-white rounded-[2.5rem] flex flex-col h-[600px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">←</button>
          <div>
            <h2 className="font-black tracking-tight leading-none">হেল্প লাইন</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">সরাসরি অ্যাডমিন সহায়তা</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400"></div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center mb-6">
          <p className="text-xs font-bold text-slate-500">আপনার সমস্যা এখানে লিখুন। অ্যাডমিন দ্রুত উত্তর দেওয়ার চেষ্টা করবেন।</p>
        </div>
        
        {messages.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center gap-4 opacity-20">
            <span className="text-6xl">💬</span>
            <p className="font-black text-sm uppercase tracking-widest">শুরু করতে কিছু লিখুন</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-3xl max-w-[85%] shadow-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                <span className="text-[9px] opacity-60 block mt-2 font-black uppercase tracking-tighter text-right">{m.time}</span>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
        <input
          className="flex-grow bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-8 py-6 outline-none transition-all font-bold text-slate-800 text-sm"
          placeholder="তোমার সমস্যা লেখো..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          disabled={!input.trim()}
          className="bg-indigo-600 text-white px-8 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform active:scale-95"
        >
          পাঠান
        </button>
      </div>
    </div>
  );
};

export default SupportChat;
