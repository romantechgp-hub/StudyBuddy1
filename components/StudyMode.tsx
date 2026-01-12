
import React, { useState } from 'react';
import { studyService } from '../services/gemini';

interface StudyModeProps {
  onBack: () => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'basic' | 'standard'>('standard');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const explanation = await studyService.explainTopic(topic, level);
      setResult(explanation || '');
    } catch (error) {
      setResult('দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করো।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">সহজ পড়া মোড</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">যেকোনো বিষয় লেখো:</label>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
            placeholder="যেমন: সালোকসংশ্লেষণ কী? বা মহাকর্ষ বল বলতে কী বোঝো?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              checked={level === 'basic'} 
              onChange={() => setLevel('basic')} 
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-sm">একদম বেসিক লেভেলে</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              checked={level === 'standard'} 
              onChange={() => setLevel('standard')} 
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-sm">সাধারণ লেভেলে</span>
          </label>
        </div>

        <button
          onClick={handleExplain}
          disabled={loading || !topic}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? 'বুঝিয়ে দিচ্ছি...' : 'সহজে বুঝিয়ে দাও'}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 prose prose-indigo max-w-none">
            <h4 className="font-bold text-blue-800 mb-4">ব্যাখ্যা:</h4>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMode;
