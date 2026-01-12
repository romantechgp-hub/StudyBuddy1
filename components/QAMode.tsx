
import React, { useState } from 'react';
import { studyService } from '../services/gemini';

interface QAModeProps {
  onBack: () => void;
}

const QAMode: React.FC<QAModeProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const ans = await studyService.askQuestion(query);
      setResult(ans || '');
    } catch (error) {
      setResult('উত্তর খুঁজে পাওয়া যায়নি। আবার চেষ্টা করো।');
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
        <h2 className="text-xl font-bold text-slate-800">প্রশ্ন ও উত্তর</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">যেকোনো প্রশ্ন করো:</label>
          <input
            type="text"
            className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="যেমন: বাংলাদেশের রাজধানী কোথায়?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          onClick={handleAsk}
          disabled={loading || !query}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition"
        >
          {loading ? 'উত্তর খুঁজছি...' : 'উত্তর দাও'}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100">
            <h4 className="font-bold text-red-800 mb-4">উত্তর:</h4>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QAMode;
