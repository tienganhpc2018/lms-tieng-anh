import React, { useState } from 'react';
import { evaluateSpeakingSubmission } from '../../services/aiService';
import { AudioRecorder } from '../../components/AudioRecorder';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Mic, Sparkles, Volume2, CheckCircle2, MessageSquare } from 'lucide-react';

export const AISpeakingGrader = () => {
  const [promptText, setPromptText] = useState(
    'Introduce yourself and describe your favorite school subject in 1 minute.'
  );
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecordComplete = ({ transcript }) => {
    setRecordedTranscript(transcript);
  };

  const handleEvaluate = async () => {
    if (!recordedTranscript.trim()) {
      alert('Vui lòng bật thu âm nói trước khi bấm phân tích AI.');
      return;
    }

    setLoading(true);
    setEvaluation(null);

    try {
      const result = await evaluateSpeakingSubmission({
        promptText,
        transcript: recordedTranscript,
      });
      setEvaluation(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Công Cụ AI Chấm Bài Speaking Tự Động</h1>
          <p className="text-xs text-slate-400">Thu âm giọng nói trực tiếp, nhận diện phát âm, độ trôi chảy & từ vựng gợi ý</p>
        </div>

        <Badge variant="emerald" className="text-xs py-1">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Speech AI Evaluator
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Audio Recorder & Prompt */}
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chủ Đề Nói (Speaking Prompt)</label>
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <AudioRecorder onRecordComplete={handleRecordComplete} />

            <Button
              onClick={handleEvaluate}
              loading={loading}
              disabled={!recordedTranscript}
              variant="emerald"
              icon={Mic}
              className="w-full"
              size="lg"
            >
              Phân Tích & Chấm Bài Speaking AI
            </Button>
          </div>
        </div>

        {/* Right Column: Speaking Feedback Result */}
        <div className="space-y-4">
          {loading && <LoadingSpinner label="AI đang phân tích ngữ âm, phát âm & độ trôi chảy..." />}

          {!loading && !evaluation && (
            <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center space-y-3">
              <Mic className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Bấm Thu Âm và nói bằng tiếng Anh</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hệ thống sẽ chuyển giọng nói thành transcript và nhờ AI chấm phát âm, độ mượt & phản hồi âm thanh.
              </p>
            </div>
          )}

          {evaluation && (
            <div className="space-y-4 animate-scaleUp">
              <Card className="border-emerald-500/40 bg-emerald-950/20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <Badge variant="emerald">SPEAKING BAND SCORE</Badge>
                    <h3 className="text-2xl font-black text-white mt-1">ĐIỂM NÓI: {evaluation.score} / 10.0</h3>
                  </div>
                  <Mic className="w-8 h-8 text-emerald-400" />
                </div>
              </Card>

              <Card className="border-slate-800 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand-300">
                  NHẬN XÉT CHI TIẾT
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-slate-200">Phát âm & Âm điệu:</strong> {evaluation.pronunciation_feedback}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-slate-200">Độ trôi chảy (Fluency):</strong> {evaluation.fluency_feedback}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-slate-200">Ngữ pháp & Từ vựng:</strong> {evaluation.grammar_lexical_feedback}
                  </div>
                </div>
              </Card>

              {evaluation.sample_speaking_transcript && (
                <Card className="border-purple-500/30 bg-purple-950/20 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-300">
                    BÀI NÓI MẪU HOÀN CHỈNH (SAMPLE SCRIPT)
                  </h4>
                  <p className="text-xs text-slate-200 italic bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    "{evaluation.sample_speaking_transcript}"
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
