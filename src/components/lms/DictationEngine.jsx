import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Volume2, Gauge, Check, RotateCcw, Eye, Play, ArrowLeft, ArrowRight, Plus, Trash2, Save, Edit3, Headphones, Star, AlertCircle, X, Sparkles, CheckCircle2, Download, FileSpreadsheet } from 'lucide-react';
import { supabase, uploadLMSFile } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// MODAL THỐNG KÊ LỖI CHÍNH TẢ VÀ XUẤT EXCEL CHO GIÁO VIÊN V90
function DictationAnalyticsModal({ isOpen, onClose, activity }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && activity?.id) {
      setLoading(true);
      supabase
        .from('submissions')
        .select('*')
        .eq('activity_id', activity.id)
        .order('submitted_at', { ascending: false })
        .then(async ({ data, error }) => {
          if (data && data.length > 0) {
            setSubmissions(data);
          } else {
            const fallbackRes = await supabase
              .from('activity_submissions')
              .select('*')
              .eq('activity_id', activity.id)
              .order('created_at', { ascending: false });
            if (fallbackRes.data) setSubmissions(fallbackRes.data);
          }
          setLoading(false);
        });
    }
  }, [isOpen, activity]);

  // THỐNG KÊ CÁC TỪ VIẾT SAI THƯỜNG GẶP NHẤT BỞI HỌC SINH V90
  const commonMistakes = useMemo(() => {
    const mistakeMap = {};
    submissions.forEach((sub) => {
      const details = sub.answers?.mistakeDetails || [];
      details.forEach((d) => {
        const key = d.targetWord ? d.targetWord.toLowerCase() : 'từ thừa';
        if (!mistakeMap[key]) {
          mistakeMap[key] = { targetWord: d.targetWord || 'Từ thừa', count: 0, userVariants: [] };
        }
        mistakeMap[key].count += 1;
        if (d.userWord && !mistakeMap[key].userVariants.includes(d.userWord)) {
          mistakeMap[key].userVariants.push(d.userWord);
        }
      });
    });

    return Object.values(mistakeMap).sort((a, b) => b.count - a.count);
  }, [submissions]);

  // XUẤT BẢNG ĐIỂM RA EXCEL (.CSV UTF-8 KHÔNG LỖI FONT TIẾNG VIỆT) V90
  const handleExportExcel = () => {
    if (submissions.length === 0) {
      alert('Chưa có bài làm nào của học sinh để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'STT,Họ và Tên Học Sinh,Bài Học,Số Từ Đúng,Số Lỗi Sai,Tỷ Lệ Chính Tả (%),Các Từ Viết Sai,Thời Gian Nộp Bài\n';

    submissions.forEach((sub, idx) => {
      const name = `"${(sub.student_name || 'Học Sinh').replace(/"/g, '""')}"`;
      const actTitle = `"${(activity?.title || 'Bài Dictation').replace('[DICTATION]', '').replace(/"/g, '""')}"`;
      const score = sub.score !== null ? sub.score : 0;
      const mistakes = sub.answers?.totalMistakes || 0;
      const accuracy = sub.answers?.accuracyPct ? `${sub.answers.accuracyPct}%` : '100%';
      const mistakeWords = `"${(sub.answers?.mistakeDetails || []).map((m) => `${m.targetWord || 'Từ thừa'}${m.userWord ? ` -> ${m.userWord}` : ' (bỏ sót)'}`).join('; ').replace(/"/g, '""')}"`;
      const dateStr = `"${new Date(sub.created_at).toLocaleString('vi-VN')}"`;

      csvContent += `${idx + 1},${name},${actTitle},${score},${mistakes},${accuracy},${mistakeWords},${dateStr}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `Bang_Diem_Dictation_${(activity?.title || 'LMS').replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans select-none">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-scale-up">
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            <h3 className="font-extrabold text-base">📊 Bảng Điểm & Thống Kê Lỗi Sai Chính Tả Bài Dictation</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg font-bold">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* NÚT XUẤT EXCEL VÀ THỐNG KÊ TỔNG QUAN */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 gap-3">
            <div>
              <h4 className="font-extrabold text-emerald-950 text-sm">
                Tổng số bài học sinh đã nộp: <span className="text-emerald-700">{submissions.length} bài</span>
              </h4>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                Dữ liệu tự động cập nhật & truy vết tất cả lỗi chính tả của học sinh trong lớp.
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Bảng Điểm Ra Excel (.CSV)</span>
            </button>
          </div>

          {/* BẢNG TOP TỪ LỖI THƯỜNG GẶP NHẤT CỦA CẢ LỚP */}
          {commonMistakes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>🔥 Danh Sách Lỗi Chính Tả Thường Gặp Nhất Của Học Sinh</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {commonMistakes.slice(0, 6).map((m, idx) => (
                  <div key={idx} className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center font-extrabold text-rose-950">
                      <span>Từ đúng: "{m.targetWord}"</span>
                      <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full">{m.count} lượt sai</span>
                    </div>
                    {m.userVariants.length > 0 && (
                      <p className="text-[11px] text-rose-800 font-medium">
                        Học sinh gõ nhầm: <span className="font-bold underline">{m.userVariants.join(', ')}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BẢNG CHI TIẾT BÀI LÀM CÁC HỌC SINH */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Danh Sách Bài Làm Chi Tiết ({submissions.length})
            </h4>
            {loading ? (
              <div className="py-8 text-center text-slate-500 font-bold text-xs">Đang tải bảng điểm...</div>
            ) : submissions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-medium text-xs bg-slate-50 rounded-2xl border border-slate-200">
                Chưa có bài nộp nào của học sinh cho bài tập này.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Học Sinh</th>
                      <th className="p-3">Từ Đúng</th>
                      <th className="p-3">Số Lỗi</th>
                      <th className="p-3">Tỷ Lệ Điểm</th>
                      <th className="p-3">Từ Viết Sai</th>
                      <th className="p-3">Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {submissions.map((sub, idx) => (
                      <tr key={sub.id || idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-slate-900">{sub.student_name || 'Học Sinh'}</td>
                        <td className="p-3 font-bold text-emerald-700">{sub.score} từ</td>
                        <td className="p-3 font-bold text-rose-600">{sub.answers?.totalMistakes || 0} từ</td>
                        <td className="p-3 font-extrabold text-emerald-600">
                          {sub.answers?.accuracyPct ? `${sub.answers.accuracyPct}%` : '100%'}
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate">
                          {(sub.answers?.mistakeDetails || []).map((m) => m.targetWord || 'Thừa').join(', ') || '✅ Đúng 100%'}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {new Date(sub.created_at).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// HÀM SO SÁNH PHÂN TÍCH LỖI TỪNG TỪ CHUẨN XÁC THEO ẢNH 2 media_1787570245949.png
const evaluateDictationSentence = (userText = '', targetText = '') => {
  const cleanTargetWords = targetText.trim().split(/\s+/).filter(Boolean);
  const cleanUserWords = userText.trim().split(/\s+/).filter(Boolean);

  if (cleanTargetWords.length === 0) {
    return { wordDiffs: [], totalTargetWords: 0, mistakesCount: 0, isPerfect: true };
  }

  const wordDiffs = [];
  let mistakesCount = 0;
  const maxLen = Math.max(cleanTargetWords.length, cleanUserWords.length);

  for (let i = 0; i < maxLen; i++) {
    const targetWord = cleanTargetWords[i];
    const userWord = cleanUserWords[i];

    if (!userWord) {
      // Học sinh bị thiếu từ
      wordDiffs.push({
        type: 'missing',
        targetWord: targetWord,
        userWord: '',
        penalty: -1,
      });
      mistakesCount++;
    } else if (!targetWord) {
      // Học sinh gõ thừa từ
      wordDiffs.push({
        type: 'extra',
        targetWord: '',
        userWord: userWord,
        penalty: -1,
      });
      mistakesCount++;
    } else {
      // So sánh từ học sinh gõ vs từ đáp án (bỏ qua hoa thường và dấu câu để đánh giá chính xác)
      const normUser = userWord.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
      const normTarget = targetWord.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

      if (normUser === normTarget) {
        wordDiffs.push({
          type: 'correct',
          targetWord: targetWord,
          userWord: userWord,
        });
      } else {
        wordDiffs.push({
          type: 'incorrect',
          targetWord: targetWord,
          userWord: userWord,
          penalty: -1,
        });
        mistakesCount++;
      }
    }
  }

  return {
    wordDiffs,
    totalTargetWords: cleanTargetWords.length,
    mistakesCount,
    isPerfect: mistakesCount === 0,
  };
};

export default function DictationEngine({ activity, isTeacher, onSaveActivity }) {
  const { user, profile } = useAuth();
  const settings = activity?.settings || {};
  const [taskTitle, setTaskTitle] = useState(settings.title || "It's dictation time!");
  const [taskDesc, setTaskDesc] = useState(
    settings.description ||
      'This is a very simple exercise. Just click on the audio play buttons below, listen to the samples and type what you heard.'
  );

  // V89: CÀI ĐẶT TỐC ĐỘ CHẬM VÀ GIỚI HẠN SỐ LẦN NGHE CHO HỌC SINH (TỐI ĐA 3 LẦN CHUẨN THẦY HẢI)
  const [maxPlaysLimit, setMaxPlaysLimit] = useState(typeof settings.maxPlaysLimit === 'number' ? settings.maxPlaysLimit : 3);
  const [slowPlaybackRate, setSlowPlaybackRate] = useState(settings.slowPlaybackRate || 0.65);

  // V89: ĐẾM SỐ LẦN HỌC SINH BẤM NGHE AUDIO: { [sampleId]: number }
  const [playCounts, setPlayCounts] = useState({});

  // V90: MODAL XEM BẢNG ĐIỂM VÀ XUẤT EXCEL THỐNG KÊ LỖI SAI CHO GIÁO VIÊN
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  // Mẫu các câu dictation (mặc định lấy từ settings hoặc tạo bài mẫu H5P Dictation)
  const [samples, setSamples] = useState(
    settings.samples || [
      {
        id: 's1',
        audioUrl: 'https://cdn.freesound.org/previews/536/536775_11861866-lq.mp3',
        slowAudioUrl: '',
        slowSpeedRate: 0.65,
        targetText: 'The cake is a lie.',
      },
      {
        id: 's2',
        audioUrl: 'https://cdn.freesound.org/previews/536/536774_11861866-lq.mp3',
        slowAudioUrl: '',
        slowSpeedRate: 0.65,
        targetText: 'The quick brown fox jumps over the lazy dog.',
      },
    ]
  );

  // Index mẫu câu hiện tại trong Player (1 of N)
  const [currentSampleIdx, setCurrentSampleIdx] = useState(0);

  // Bài làm của học sinh cho tất cả các mẫu câu: { [sampleId]: 'user typed string' }
  const [userAnswers, setUserAnswers] = useState({});

  // Kết quả kiểm tra: null hoặc object chứa đánh giá từng mẫu câu { [sampleId]: evalResult }
  const [evalResults, setEvalResults] = useState(null);
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);

  // State chế độ soạn thảo của Giáo viên (Studio Edit Mode)
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingAudioIdx, setUploadingAudioIdx] = useState(null);

  // Audio elements management
  const audioRef = useRef(null);
  const [playingState, setPlayingState] = useState(null); // { sampleId, speed: 'normal' | 'slow' }

  // TÍNH TỔNG SỐ TỪ VÀ TỔNG SỐ LỖI ĐỂ TÍNH ĐIỂM ⭐
  const overallStats = useMemo(() => {
    let totalWords = 0;
    let totalMistakes = 0;

    samples.forEach((sample) => {
      const targetWords = (sample.targetText || '').trim().split(/\s+/).filter(Boolean).length;
      totalWords += targetWords;

      if (evalResults && evalResults[sample.id]) {
        totalMistakes += evalResults[sample.id].mistakesCount;
      }
    });

    const score = Math.max(0, totalWords - totalMistakes);
    return { totalWords, totalMistakes, score };
  }, [samples, evalResults]);

  // PHÁT AUDIO TỐC ĐỘ CHUẨN (1.0x) VÀ TỐC ĐỘ CHẬM CÓ GIỚI HẠN N LẦN NGHE V90
  const handlePlayAudio = (sample, speed = 'normal') => {
    const currentCount = playCounts[sample.id] || 0;
    if (maxPlaysLimit > 0 && currentCount >= maxPlaysLimit) {
      alert(`⚠️ Bài tập này được giới hạn tối đa ${maxPlaysLimit} lần nghe. Bạn đã sử dụng hết ${maxPlaysLimit} lượt nghe cho mẫu câu này!`);
      return;
    }

    const isLastPlay = maxPlaysLimit > 0 && currentCount === maxPlaysLimit - 1;
    if (isLastPlay) {
      alert(`⚠️ Đây là lượt nghe cuối cùng của em! (Lượt ${currentCount + 1}/${maxPlaysLimit})`);
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const targetUrl = speed === 'slow' && sample.slowAudioUrl ? sample.slowAudioUrl : sample.audioUrl;
    if (!targetUrl) {
      alert('Chưa có file audio cho mẫu câu này!');
      return;
    }

    const effectiveSlowRate = Number(sample.slowSpeedRate || slowPlaybackRate || 0.65);
    const audio = new Audio(targetUrl);
    audio.playbackRate = speed === 'slow' ? effectiveSlowRate : 1.0;
    audioRef.current = audio;

    setPlayingState({ sampleId: sample.id, speed });
    setPlayCounts((prev) => ({ ...prev, [sample.id]: currentCount + 1 }));

    audio.play().catch(() => {
      setPlayingState(null);
    });

    audio.onended = () => {
      setPlayingState(null);
    };

    audio.onerror = () => {
      setPlayingState(null);
      alert('Không thể tải file âm thanh. Vui lòng kiểm tra lại đường dẫn audio!');
    };
  };

  // CHẤM BÀI CHÍNH TẢ H5P DICTATION VÀ TỰ ĐỘNG LƯU BÀI NỘP V90
  const handleCheckAll = async () => {
    const results = {};
    samples.forEach((sample) => {
      const typed = userAnswers[sample.id] || '';
      results[sample.id] = evaluateDictationSentence(typed, sample.targetText || '');
    });
    setEvalResults(results);

    // TỰ ĐỘNG LƯU BÀI NỘP CỦA HỌC SINH VÀO CSDL SUPABASE CHO BẢNG ĐIỂM GIÁO VIÊN V90
    if (activity?.id) {
      try {
        let totalW = 0;
        let totalM = 0;
        const allDiffs = [];
        samples.forEach((s) => {
          const res = results[s.id];
          if (res) {
            totalW += res.totalTargetWords;
            totalM += res.mistakesCount;
            res.wordDiffs.forEach((d) => {
              if (d.type !== 'correct') {
                allDiffs.push({ targetWord: d.targetWord, userWord: d.userWord, type: d.type });
              }
            });
          }
        });

        const score = Math.max(0, totalW - totalM);
        const accuracyPct = Math.round((score / (totalW || 1)) * 100);

        const studentId = user?.id || profile?.id;
        const payload = {
          activity_id: activity.id,
          student_id: studentId,
          score: score,
          answers: {
            totalWords: totalW,
            totalMistakes: totalM,
            accuracyPct: accuracyPct,
            mistakeDetails: allDiffs,
            userAnswers: userAnswers,
            student_name: profile?.full_name || user?.email || 'Học Sinh',
          },
          submitted_at: new Date().toISOString(),
        };

        let { error } = await supabase.from('submissions').insert([payload]);
        if (error) {
          await supabase.from('activity_submissions').insert([{
            activity_id: activity.id,
            user_id: studentId,
            student_name: profile?.full_name || user?.email || 'Học Sinh',
            score: score,
            answers: payload.answers,
          }]);
        }
      } catch (e) {
        console.error('Lỗi tự động lưu bài nộp Dictation:', e);
      }
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setEvalResults(null);
    setIsSolutionVisible(false);
    setPlayCounts({});
  };

  // UPLOAD FILE AUDIO CHO GIÁO VIÊN
  const handleAudioUpload = async (e, index, fieldName = 'audioUrl') => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAudioIdx(index);
    try {
      const url = await uploadLMSFile(file, 'dictation_audio');
      setSamples((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [fieldName]: url };
        return updated;
      });
    } catch (err) {
      alert('Lỗi upload file âm thanh: ' + err.message);
    } finally {
      setUploadingAudioIdx(null);
    }
  };

  // LƯU CẤU HÌNH STUDIO V89
  const handleSaveStudio = () => {
    if (onSaveActivity) {
      onSaveActivity({
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        maxPlaysLimit: Number(maxPlaysLimit),
        slowPlaybackRate: Number(slowPlaybackRate),
        samples: samples.filter((s) => s.targetText.trim() !== ''),
      });
    }
    setIsEditMode(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 sm:p-6 bg-slate-50 min-h-[600px] rounded-3xl border border-slate-200 shadow-sm font-sans select-text">
      {/* THANH THAO TÁC GIÁO VIÊN (SOẠN BÀI / XEM BÀI LÀM / BẢNG ĐIỂM EXCEL) V90 */}
      {isTeacher && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs gap-3">
          <div className="flex items-center space-x-2 text-purple-900 font-extrabold text-sm">
            <Headphones className="w-5 h-5 text-purple-600" />
            <span>Chế Độ Quản Lý Bài Dictation (Nghe Chép Chính Tả)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsAnalyticsModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs border border-emerald-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>📊 Xem Bảng Điểm & Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditMode ? 'Xem Giao Diện Học Sinh' : 'Chỉnh Sửa Câu Hỏi (Studio)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CHẾ ĐỘ GIÁO VIÊN SOẠN BÀI (STUDIO MODE) */}
      {isEditMode ? (
        <div className="bg-white p-6 rounded-3xl border border-purple-200 shadow-md space-y-6 animate-fade-in">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Cấu Hình Bài Tập Dictation H5P</span>
            </h3>
            <button
              type="button"
              onClick={handleSaveStudio}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Bài Dictation</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Tiêu Đề Bài Tập (Task Title)
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Hướng Dẫn Làm Bài (Task Description)
              </label>
              <textarea
                rows={2}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* V89: KHUNG CẤU HÌNH TỐC ĐỘ PHÁT VÀ GIỚI HẠN LƯỢT NGHE TỐI ĐA CHUẨN THẦY HẢI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/60 p-4 rounded-2xl border border-purple-200">
              <div>
                <label className="block text-xs font-extrabold text-purple-950 uppercase mb-1 flex items-center space-x-1">
                  <span>🎧 Giới Hạn Lượt Nghe Tối Đa (Max Plays)</span>
                </label>
                <select
                  value={maxPlaysLimit}
                  onChange={(e) => setMaxPlaysLimit(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-purple-300 rounded-xl text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-purple-500"
                >
                  <option value={3}>3 lần nghe tối đa (Chuẩn theo yêu cầu Thầy Hải)</option>
                  <option value={1}>1 lần nghe (Chế độ thi thử thách)</option>
                  <option value={2}>2 lần nghe</option>
                  <option value={5}>5 lần nghe</option>
                  <option value={0}>Không giới hạn số lượt nghe</option>
                </select>
                <span className="text-[11px] text-purple-700 mt-1 block font-medium">
                  Giới hạn số lần bấm nút nghe Audio của Học sinh.
                </span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-purple-950 uppercase mb-1 flex items-center space-x-1">
                  <span>⏱️ Tốc Độ Tua Chậm Tự Động (Slow Playback Speed)</span>
                </label>
                <select
                  value={slowPlaybackRate}
                  onChange={(e) => setSlowPlaybackRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-purple-300 rounded-xl text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-purple-500"
                >
                  <option value={0.5}>0.50x (Rất chậm)</option>
                  <option value={0.6}>0.60x (Chậm vừa)</option>
                  <option value={0.65}>0.65x (Tốc độ chuẩn H5P Dictation)</option>
                  <option value={0.75}>0.75x (Hơi chậm)</option>
                  <option value={0.85}>0.85x (Chậm nhẹ)</option>
                </select>
                <span className="text-[11px] text-purple-700 mt-1 block font-medium">
                  Tự động điều chỉnh tốc độ khi bấm nút Rùa / Đồng hồ ⏱️.
                </span>
              </div>
            </div>

            {/* DANH SÁCH CÁC CÂU NGHEN CHÉP */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Danh Sách Mẫu Audio & Câu Văn Chính Tả ({samples.length} mẫu)
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setSamples((prev) => [
                      ...prev,
                      { id: 's_' + Date.now(), audioUrl: '', slowAudioUrl: '', slowSpeedRate: slowPlaybackRate, targetText: '' },
                    ])
                  }
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                  <span>Thêm Mẫu Audio</span>
                </button>
              </div>

              {samples.map((sample, idx) => (
                <div key={sample.id || idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
                      Mẫu Audio #{idx + 1}
                    </span>
                    {samples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSamples((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 p-1 transition cursor-pointer"
                        title="Xóa mẫu câu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        🔊 Audio Tốc độ Chuẩn (Normal Speed MP3 URL / File)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={sample.audioUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSamples((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], audioUrl: val };
                              return updated;
                            });
                          }}
                          placeholder="Dán link audio MP3..."
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                        <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap">
                          {uploadingAudioIdx === idx ? 'Đang tải...' : 'Tải File'}
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleAudioUpload(e, idx, 'audioUrl')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        ⏱️ Audio Tốc độ Chậm (Slow Speed MP3 / Tải File / Tùy chỉnh tốc độ)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={sample.slowAudioUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSamples((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], slowAudioUrl: val };
                              return updated;
                            });
                          }}
                          placeholder={`Tự động tua chậm ${sample.slowSpeedRate || slowPlaybackRate || 0.65}x nếu để trống...`}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                        <label className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border border-purple-300">
                          {uploadingAudioIdx === idx ? 'Đang tải...' : 'Tải File'}
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleAudioUpload(e, idx, 'slowAudioUrl')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      ✍️ Câu Văn Mẫu Học Sinh Cần Chép Đúng (Target Text) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sample.targetText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSamples((prev) => {
                          const updated = [...prev];
                          updated[idx] = { ...updated[idx], targetText: val };
                          return updated;
                        });
                      }}
                      placeholder="Ví dụ: The quick brown fox jumps over the lazy dog."
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* CHẾ ĐỘ HỌC SINH LÀM BÀI (STUDENT PLAYER VIEW CHUẨN 100% 3 ẢNH) */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden animate-fade-in">
          {/* HEADER CHUẨN H5P CÓ ĐIỀU HƯỚNG PREVIOUS / NEXT VÀ 1 of N (ẢNH 1) */}
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/70">
            <button
              type="button"
              disabled={currentSampleIdx === 0}
              onClick={() => setCurrentSampleIdx((prev) => Math.max(0, prev - 1))}
              className={`flex items-center space-x-1 text-xs font-bold transition cursor-pointer ${
                currentSampleIdx === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider">
                {currentSampleIdx + 1} of {samples.length}
              </span>
              <h2 className="text-lg font-extrabold text-slate-800">{taskTitle}</h2>
            </div>

            <button
              type="button"
              disabled={currentSampleIdx === samples.length - 1}
              onClick={() => setCurrentSampleIdx((prev) => Math.min(samples.length - 1, prev + 1))}
              className={`flex items-center space-x-1 text-xs font-bold transition cursor-pointer ${
                currentSampleIdx === samples.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* TIÊU ĐỀ NỘI DUNG VÀ HƯỚNG DẪN BÀI NGHE (ẢNH 1) */}
            <div className="space-y-1.5 text-left border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">{taskTitle}</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{taskDesc}</p>
            </div>

            {/* DANH SÁCH TẤT CẢ CÁC MẪU CÂU AUDIO VÀ KHUNG NHẬP CHÍNH TẢ (ẢNH 1, 2, 3) */}
            <div className="space-y-6">
              {samples.map((sample, idx) => {
                const userVal = userAnswers[sample.id] || '';
                const sampleEval = evalResults ? evalResults[sample.id] : null;

                const isNormalPlaying = playingState?.sampleId === sample.id && playingState?.speed === 'normal';
                const isSlowPlaying = playingState?.sampleId === sample.id && playingState?.speed === 'slow';

                const currentCount = playCounts[sample.id] || 0;
                const isMaxReached = maxPlaysLimit > 0 && currentCount >= maxPlaysLimit;
                const isLastPlay = maxPlaysLimit > 0 && currentCount === maxPlaysLimit - 1;
                const slowSpeedText = sample.slowSpeedRate || slowPlaybackRate || 0.65;

                return (
                  <div key={sample.id || idx} className="space-y-2 text-left">
                    <div className="flex items-center space-x-3">
                      {/* NÚT LOA TỐC ĐỘ THƯỜNG 🔊 MÀU XANH LÁ CÂY THEO YÊU CẦU CỦA THẦY HẢI (ẢNH media_1787572271401.png) */}
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(sample, 'normal')}
                        title={
                          isMaxReached
                            ? `Đã dùng hết ${maxPlaysLimit} lượt nghe tối đa!`
                            : isLastPlay
                            ? `⚠️ Đây là lượt nghe cuối cùng của em! (${currentCount + 1}/${maxPlaysLimit})`
                            : `Phát Audio tốc độ chuẩn (1.0x) - Đã nghe ${currentCount}/${maxPlaysLimit} lượt`
                        }
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-md border-2 ${
                          isMaxReached
                            ? 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed opacity-60'
                            : isLastPlay
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600 ring-4 ring-amber-300 scale-105 animate-pulse cursor-pointer'
                            : isNormalPlaying
                            ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-300 scale-105 animate-pulse cursor-pointer'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 hover:border-emerald-800 cursor-pointer'
                        }`}
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>

                      {/* NÚT TỐC ĐỘ CHẬM ⏱️ MÀU XANH TƯƠI LÁ CÂY / NGỌC THEO YÊU CẦU CỦA THẦY HẢI */}
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(sample, 'slow')}
                        title={
                          isMaxReached
                            ? `Đã dùng hết ${maxPlaysLimit} lượt nghe tối đa!`
                            : isLastPlay
                            ? `⚠️ Đây là lượt nghe cuối cùng của em! (${currentCount + 1}/${maxPlaysLimit})`
                            : `Phát Audio tốc độ chậm (${slowSpeedText}x) - Đã nghe ${currentCount}/${maxPlaysLimit} lượt`
                        }
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-md border-2 ${
                          isMaxReached
                            ? 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed opacity-60'
                            : isLastPlay
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600 ring-4 ring-amber-300 scale-105 animate-pulse cursor-pointer'
                            : isSlowPlaying
                            ? 'bg-teal-500 text-white border-teal-600 ring-4 ring-teal-300 scale-105 animate-pulse cursor-pointer'
                            : 'bg-teal-600 hover:bg-teal-500 text-white border-teal-700 hover:border-teal-800 cursor-pointer'
                        }`}
                      >
                        <Gauge className="w-5 h-5" />
                      </button>

                      {/* BADGE BÁO LƯỢT NGHE / CẢNH BÁO LƯỢT NGHE CUỐI CÙNG V90 (CHUẨN YÊU CẦU THẦY HẢI) */}
                      {maxPlaysLimit > 0 && (
                        <span className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl border flex items-center space-x-1 whitespace-nowrap shadow-2xs ${
                          isMaxReached
                            ? 'bg-rose-100 text-rose-950 border-rose-300'
                            : isLastPlay
                            ? 'bg-amber-500 text-slate-950 border-amber-600 animate-bounce font-black'
                            : currentCount > 0
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <span>
                            {isMaxReached
                              ? `🔒 Hết lượt (${maxPlaysLimit}/${maxPlaysLimit})`
                              : isLastPlay
                              ? `⚠️ Đây là lượt nghe cuối cùng của em! (${currentCount + 1}/${maxPlaysLimit})`
                              : `🎧 ${currentCount}/${maxPlaysLimit} lượt`}
                          </span>
                        </span>
                      )}

                      {/* KHUNG Ô NHẬP NỘI DUNG NGHEN ĐƯỢC (INPUT FIELD) */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={userVal}
                          disabled={evalResults !== null}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserAnswers((prev) => ({ ...prev, [sample.id]: val }));
                          }}
                          placeholder="Nhập những gì bạn nghe thấy..."
                          className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition bg-slate-100/80 focus:bg-white text-slate-900 focus:outline-none ${
                            evalResults
                              ? sampleEval?.isPerfect
                                ? 'border-emerald-400 bg-emerald-50/50'
                                : 'border-rose-400 bg-rose-50/50'
                              : 'border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-400/40'
                          }`}
                        />
                      </div>
                    </div>

                    {/* HIỂN THỊ CHI TIẾT ĐÁNH GIÁ TỪNG TỪ SAI / THIẾU CÓ DẤU ✕ VÀ THẺ -1 CHUẨN XÁC ẢNH 2 media_1787570245949.png */}
                    {sampleEval && (
                      <div className="ml-24 pt-1 space-y-2 animate-fade-in">
                        <div className="bg-rose-50/80 border border-rose-200 p-3 rounded-2xl flex flex-wrap gap-2 items-center text-xs font-bold">
                          {sampleEval.wordDiffs.map((diff, dIdx) => {
                            if (diff.type === 'correct') {
                              return (
                                <span
                                  key={dIdx}
                                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold shadow-2xs"
                                >
                                  <span>{diff.userWord}</span>
                                  <span className="ml-1 text-emerald-600 font-extrabold">✓</span>
                                </span>
                              );
                            }

                            if (diff.type === 'incorrect') {
                              return (
                                <span
                                  key={dIdx}
                                  className="inline-flex items-center space-x-1 bg-rose-100 text-rose-950 border border-rose-300 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs"
                                >
                                  <span className="line-through opacity-85">{diff.userWord}</span>
                                  <span className="bg-rose-600 text-white text-[10px] font-black px-1 rounded-md">
                                    -1
                                  </span>
                                  <span className="text-rose-600 font-black">✕</span>
                                  {isSolutionVisible && (
                                    <span className="text-emerald-700 font-extrabold ml-1 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300">
                                      {diff.targetWord}
                                    </span>
                                  )}
                                </span>
                              );
                            }

                            if (diff.type === 'missing') {
                              return (
                                <span
                                  key={dIdx}
                                  className="inline-flex items-center space-x-1 bg-rose-100 text-rose-950 border border-rose-300 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs"
                                >
                                  <span className="bg-rose-600 text-white text-[10px] font-black px-1 rounded-md">
                                    -1
                                  </span>
                                  <span className="text-rose-600 font-black">✕</span>
                                  {isSolutionVisible && (
                                    <span className="text-emerald-700 font-extrabold ml-1 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300">
                                      {diff.targetWord}
                                    </span>
                                  )}
                                </span>
                              );
                            }

                            return null;
                          })}
                        </div>

                        {/* HIỂN THỊ ĐÁP ÁN ĐÚNG TOÀN BỘ CÂU KHI BẤM SHOW SOLUTION */}
                        {isSolutionVisible && (
                          <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl text-xs text-emerald-950 font-bold flex items-center space-x-2 animate-scale-up">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>
                              Đáp án chuẩn: <strong className="text-emerald-800 font-black">{sample.targetText}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DÒNG THÔNG BÁO TỔNG SỐ LỖI "You have made X mistake(s). Hmm ..." (ẢNH 1, 2) */}
            {evalResults && (
              <div className="pt-2 text-left animate-fade-in">
                <p className="text-blue-600 font-extrabold text-sm sm:text-base">
                  {overallStats.totalMistakes === 0
                    ? '🎉 Perfect! You have made 0 mistakes! Excellent work!'
                    : `You have made ${overallStats.totalMistakes} mistake(s). Hmm ...`}
                </p>
              </div>
            )}

            {/* THANH ĐÁNH GIÁ THỐNG KÊ SAO ⭐ & BỘ NÚT ĐIỀU KHIỂN CHUẨN H5P ẢNH 1, 2 */}
            <div className="flex flex-wrap items-center justify-between pt-6 border-t border-slate-200 gap-4">
              {/* CỘT TRÁI: THANH ĐIỂM VÀ NGÔI SAO ⭐ X/TotalWords */}
              <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
                <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{
                      width: evalResults
                        ? `${(overallStats.score / (overallStats.totalWords || 1)) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-slate-800 font-extrabold text-sm">
                  {evalResults ? `${overallStats.score}/${overallStats.totalWords}` : `0/${overallStats.totalWords}`}
                </span>
              </div>

              {/* CỘT PHẢI: BỘ NÚT CHECK / SHOW SOLUTION / RETRY CHUẨN ẢNH 1, 2 */}
              <div className="flex items-center space-x-2.5">
                {!evalResults ? (
                  <button
                    type="button"
                    onClick={handleCheckAll}
                    className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-full text-sm shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsSolutionVisible(!isSolutionVisible)}
                      className={`px-5 py-2.5 rounded-full font-extrabold text-xs transition cursor-pointer shadow-md flex items-center space-x-1.5 ${
                        isSolutionVisible
                          ? 'bg-blue-700 text-white ring-4 ring-blue-300'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Show solution</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-full text-xs transition cursor-pointer shadow-md flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retry</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BẢNG ĐIỂM & XUẤT EXCEL CHO GIÁO VIÊN V90 */}
      <DictationAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        activity={activity}
      />
    </div>
  );
}
