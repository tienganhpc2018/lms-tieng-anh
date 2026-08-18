import React, { useState } from 'react';
import { Database, ArrowLeft, Search, Filter, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuestionBankView() {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState('Khối 8');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Database className="w-6 h-6 text-sky-500" />
            <span>Ngân Hàng Câu Hỏi Nguồn Mẫu Global Success</span>
          </h1>
          <p className="text-xs text-slate-500">
            Kho lưu trữ 500+ câu hỏi trắc nghiệm, bài đọc hiểu và bài nghe audio phân loại theo từng Khối 6,7,8,9 và Categories Kỹ năng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        {['Khối 6', 'Khối 7', 'Khối 8', 'Khối 9'].map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g)}
            className={`p-4 rounded-2xl border text-center font-extrabold text-sm transition ${
              selectedGrade === g
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {g} - Global Success
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">
          Danh Sách Câu Hỏi Nguồn Mẫu - {selectedGrade}
        </h3>

        <div className="space-y-3">
          {[
            { q: 'The children in my home village used to go _______, even in winter.', opts: ['on foot', 'bare-footed', 'playing around'], ans: 'B' },
            { q: 'Giving lucky money to the young and the old at Tet is a common _______ in many Asian countries.', opts: ['behavior', 'practice', 'tradition'], ans: 'B' },
            { q: 'In Viet Nam, _______ often refers to age and social position, not to wealth.', opts: ['seniority', 'tradition', 'generation'], ans: 'A' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded uppercase">
                Categories: Knowledge of English (Vocab & Grammar)
              </span>
              <h4 className="font-extrabold text-sm text-slate-900">Câu {idx + 1}: {item.q}</h4>
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
                {item.opts.map((o, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-700">
                    {String.fromCharCode(65 + i)}. {o}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
