import React, { useState, useEffect } from 'react';
import { GLOBAL_SUCCESS_CURRICULUM } from '../../data/globalSuccessCurriculum';
import { explainGrammarForTopics } from '../../services/aiService';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, CheckSquare, Square, Volume2, ArrowRight } from 'lucide-react';

export const CurriculumBank = () => {
  const navigate = useNavigate();

  const [activeGrade, setActiveGrade] = useState(6);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  const [aiGrammarList, setAiGrammarList] = useState(null);
  const [loadingAiGrammar, setLoadingAiGrammar] = useState(false);

  const currentGradeUnits = GLOBAL_SUCCESS_CURRICULUM[activeGrade] || [];

  useEffect(() => {
    if (currentGradeUnits.length > 0) {
      setSelectedUnit(currentGradeUnits[0]);
      setSelectedTopics([currentGradeUnits[0].topic]);
    }
  }, [activeGrade]);

  const toggleTopic = (t) => {
    if (selectedTopics.includes(t)) {
      setSelectedTopics(selectedTopics.filter((item) => item !== t));
    } else {
      setSelectedTopics([...selectedTopics, t]);
    }
  };

  const handleFetchAiGrammar = async () => {
    if (!selectedUnit || selectedTopics.length === 0) return;
    setLoadingAiGrammar(true);
    setAiGrammarList(null);

    try {
      const data = await explainGrammarForTopics({
        grade: activeGrade,
        unit: selectedUnit.unit,
        topics: selectedTopics,
      });
      setAiGrammarList(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAiGrammar(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Kho Học Liệu & Ngữ Pháp Global Success 6-9</h1>
          <p className="text-xs text-slate-400">Từ vựng từng Unit & Tích hợp AI liệt kê tự động điểm NGỮ PHÁP khi chọn Topic</p>
        </div>

        <Button onClick={() => navigate('/ai-test-gen')} variant="primary" icon={Sparkles}>
          Sinh Đề Thi AI Ngay
        </Button>
      </div>

      {/* Grade Selector Tabs */}
      <div className="flex items-center gap-3">
        {[6, 7, 8, 9].map((g) => (
          <button
            key={g}
            onClick={() => setActiveGrade(g)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all border ${
              activeGrade === g
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white border-brand-400/40 shadow-lg shadow-brand-500/25 scale-105'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Sách Tiếng Anh Lớp {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Units & Topic Selector */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
            DANH SÁCH UNIT (LỚP {activeGrade})
          </h3>

          <div className="space-y-3">
            {currentGradeUnits.map((u) => {
              const isSelected = selectedUnit?.unit === u.unit;
              const isTopicChecked = selectedTopics.includes(u.topic);

              return (
                <div
                  key={u.unit}
                  onClick={() => {
                    setSelectedUnit(u);
                    if (!selectedTopics.includes(u.topic)) {
                      setSelectedTopics([u.topic]);
                    }
                  }}
                  className={`glass-card rounded-2xl p-4 cursor-pointer border transition-all ${
                    isSelected
                      ? 'border-brand-500/60 bg-brand-500/10 shadow-lg shadow-brand-500/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="brand">UNIT {u.unit}</Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopic(u.topic);
                      }}
                      className="flex items-center gap-1.5 text-xs text-brand-300 font-semibold"
                    >
                      {isTopicChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                      <span>Topic selected</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-100 text-base">{u.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Chủ đề: {u.topic}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Button
              onClick={handleFetchAiGrammar}
              loading={loadingAiGrammar}
              variant="emerald"
              className="w-full"
              icon={Sparkles}
            >
              Phân Tích Ngữ Pháp AI (Theo Topic)
            </Button>
          </div>
        </div>

        {/* Right Column: Vocabulary & AI Grammar Explanation */}
        <div className="lg:col-span-2 space-y-6">
          {selectedUnit && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <Badge variant="emerald">UNIT {selectedUnit.unit}</Badge>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">{selectedUnit.title}</h3>
                </div>
                <span className="text-xs text-slate-400 italic">Global Success Standard</span>
              </div>

              {/* Vocabulary Table */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  TỪ VỰNG TRỌNG TÂM (VOCABULARY)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedUnit.vocabulary?.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-100">{v.word}</span>{' '}
                        <span className="text-brand-400 font-mono">({v.pos})</span>
                      </div>
                      <span className="text-slate-400">{v.mean}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Native Grammar Rules */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  NGỮ PHÁP SÁCH GIÁO KHOA (GRAMMAR RULES)
                </h4>
                <div className="space-y-3">
                  {selectedUnit.grammar?.map((g, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                      <h5 className="font-bold text-brand-300">{g.title}</h5>
                      <p className="text-slate-300">{g.rule}</p>
                      <div className="pl-3 border-l-2 border-brand-500/40 text-slate-400 italic">
                        {g.examples?.map((ex, i) => (
                          <div key={i}>• {ex}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* AI Grammar Analysis Card */}
          {loadingAiGrammar && <LoadingSpinner label="AI Gemini đang liệt kê các điểm ngữ pháp cho các topic đã chọn..." />}

          {aiGrammarList && (
            <Card className="border-emerald-500/30 space-y-4 animate-scaleUp">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Phân Tích Ngữ Pháp Chuyên Sâu Tự Động Với AI</h3>
              </div>

              <div className="space-y-4">
                {aiGrammarList.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                    <h4 className="font-extrabold text-sm text-emerald-300">{item.title}</h4>
                    <p className="text-slate-200">{item.rule}</p>
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-400">Ví dụ minh họa:</p>
                      {item.examples?.map((ex, i) => (
                        <p key={i} className="text-emerald-400 font-mono pl-3 border-l-2 border-emerald-500">
                          {ex}
                        </p>
                      ))}
                    </div>

                    {item.common_errors && (
                      <p className="text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                        ⚠️ <strong>Lỗi sai thường gặp:</strong> {item.common_errors}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
