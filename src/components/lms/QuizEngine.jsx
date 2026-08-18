import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, CheckCircle, Volume2, Eye, EyeOff, FileText, Clock, Award, User, AlertCircle, RefreshCw, XCircle, Lightbulb, Headphones, BookOpen, Search, MessageSquareText, Tag, Camera, UploadCloud, Image as ImageIcon, Printer, Download, Sparkles, Bot, ShieldAlert, BookMarked, Mic, MicOff, Shuffle, Trophy } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { compressImage } from '../../utils/imageCompressor';
import { gradeWritingSubmissionWithAI } from '../../services/writingAiGrader';
import { exportStudentPdfReport } from '../../utils/exportQuizReport';
import { calculateGamificationBadges } from '../../utils/gamificationBadges';
import AiTutorChatModal from './AiTutorChatModal';
import FlashcardReviewModal from './FlashcardReviewModal';
import ClassLeaderboard from './ClassLeaderboard';
import { speakText } from '../../utils/textToSpeech';
import { exportQuizToWord } from '../../utils/exportQuizWord';
import AdaptiveLearningModal from './AdaptiveLearningModal';
import AiOmrScannerModal from './AiOmrScannerModal';
import { exportOmrSheet } from '../../utils/exportOmrSheet';

export default function QuizEngine({ activity }) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [uploadedStudentImages, setUploadedStudentImages] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [aiGradingResult, setAiGradingResult] = useState(null);
  const [isAiGradingLoading, setIsAiGradingLoading] = useState(false);

  // GAMIFICATION BADGES
  const [earnedBadges, setEarnedBadges] = useState([]);

  // AI TUTOR MODAL CHAT
  const [aiTutorModalOpen, setAiTutorModalOpen] = useState(false);
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [adaptiveModalOpen, setAdaptiveModalOpen] = useState(false);
  const [wrongQuestionsList, setWrongQuestionsList] = useState([]);
  const [selectedQuestionForTutor, setSelectedQuestionForTutor] = useState(null);

  // WEB SPEECH API (SPEAKING TEST RECOGNITION)
  const [recordingKey, setRecordingKey] = useState(null);
  const [speechTranscripts, setSpeechTranscripts] = useState({});

  // PHÁT HIỆN GIAN LẬN / THEO DÕI CHUYỂN TAB (ANTI-CHEATING / FOCUS TRACKER)
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showCheatingWarning, setShowCheatingWarning] = useState(false);
  const [maxTabSwitchesAllowed, setMaxTabSwitchesAllowed] = useState(3);
  const [passcodeRequired, setPasscodeRequired] = useState('');
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [omrScannerOpen, setOmrScannerOpen] = useState(false);
  const [scheduledOpenTime, setScheduledOpenTime] = useState(null); // Giới hạn 3 lần rời tab mặc định

  // Bộ đếm thời gian
  const [isCountdownMode, setIsCountdownMode] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Kết quả tổng kết
  const [resultData, setResultData] = useState({
    studentName: '',
    timeTakenStr: '',
    correctCount: 0,
    totalQuestions: 0,
    score: 0,
    totalMarks: 0,
    isPassed: false,
    submittedAt: null,
  });

  // PHÁT HIỆN CHUYỂN TAB -> TỰ ĐỘNG THU BÀI NẾU VƯỢT QUÁ GIỚI HẠN
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerActive && !submitted && isCountdownMode) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          setShowCheatingWarning(true);

          if (nextCount >= maxTabSwitchesAllowed) {
            alert(`🚫 BÀI THI BỊ TỰ ĐỘNG THU BÀI!\n\nBạn đã vi phạm rời khỏi tab thi ${nextCount}/${maxTabSwitchesAllowed} lần!`);
            handleSubmitQuiz(true);
          }
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerActive, submitted, isCountdownMode, maxTabSwitchesAllowed]);

  // TIMER LOGIC
  useEffect(() => {
    let interval = null;
    if (timerActive && !submitted) {
      if (isCountdownMode && secondsRemaining > 0) {
        interval = setInterval(() => {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleSubmitQuiz(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (!isCountdownMode) {
        interval = setInterval(() => {
          setSecondsElapsed((prev) => prev + 1);
        }, 1000);
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, submitted, isCountdownMode, secondsRemaining]);

  useEffect(() => {
    async function fetchQuestions() {
      if (!activity?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('activity_id', activity.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Lỗi fetch questions:', error);
          setQuestions([]);
        } else {
          let totalCustomMinutes = 0;
          let safeData = (data || []).map((q) => {
            let cObj = q.content;
            if (typeof cObj === 'string') {
              try {
                cObj = JSON.parse(cObj);
              } catch (e) {
                cObj = { question: q.content };
              }
            }
            if (cObj?.timeLimit && Number(cObj.timeLimit) > 0) {
              totalCustomMinutes += Number(cObj.timeLimit);
            }
            if (cObj?.openTime) {
              setScheduledOpenTime(cObj.openTime);
            }
            if (cObj?.passcode) {
              setPasscodeRequired(String(cObj.passcode));
            }
            if (cObj?.maxTabSwitches && Number(cObj.maxTabSwitches) > 0) {
              setMaxTabSwitchesAllowed(Number(cObj.maxTabSwitches));
            }
            return {
              ...q,
              content: cObj || {},
            };
          });

          // TRỘN ĐỀ NẾU CÓ CẤU HÌNH TRỘN ĐỀ NGẪU NHIÊN
          const isRandom = activity?.settings?.isRandomized || safeData[0]?.content?.isRandomized;
          if (isRandom) {
            safeData = safeData.sort(() => Math.random() - 0.5);
          }

          if (totalCustomMinutes > 0) {
            setIsCountdownMode(true);
            const totalSecs = totalCustomMinutes * 60;
            setTimeLimitSeconds(totalSecs);
            setSecondsRemaining(totalSecs);
          } else {
            setIsCountdownMode(false);
            setSecondsElapsed(0);
          }

          setQuestions(safeData);
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [activity]);

  const handleSelectAnswer = (questionKey, value) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  // NÚT THU ÂM BÀI NÓI SPEAKING TEST (WEB SPEECH API)
  const handleStartSpeechRecognition = (qKey) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ Web Speech API. Vui lòng thử dùng Google Chrome / Microsoft Edge!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setRecordingKey(qKey);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechTranscripts((prev) => ({ ...prev, [qKey]: transcript }));
      setUserAnswers((prev) => ({ ...prev, [qKey]: transcript }));
      setRecordingKey(null);
      alert(`🎙️ Nhận diện giọng nói thành công: "${transcript}"`);
    };

    recognition.onerror = (err) => {
      console.error('Speech recognition error:', err);
      setRecordingKey(null);
      alert('Không nhận diện được giọng nói. Vui lòng kiểm tra micro và thử lại!');
    };

    recognition.onend = () => {
      setRecordingKey(null);
    };

    recognition.start();
  };

  // HỌC SINH TẢI ẢNH BÀI LÀM TỰ LUẬN -> TỰ ĐỘNG NÉN ẢNH DƯỚI 1MB
  const handleStudentImageUpload = async (e, questionKey) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file, 1200, 1200, 0.75);
      setUploadedStudentImages((prev) => ({ ...prev, [questionKey]: compressedBase64 }));
      alert('📸 Đã nén & tải ảnh bài làm thành công (Tối ưu dung lượng < 1MB)!');
    } catch (err) {
      console.error('Error compressing image:', err);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setUploadedStudentImages((prev) => ({ ...prev, [questionKey]: evt.target.result }));
        alert('📸 Đã tải ảnh bài làm thành công!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    setTimerActive(false);
    setIsAiGradingLoading(true);

    let correctCount = 0;
    let totalScore = 0;
    let totalQCount = 0;
    const totalMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);

    let writingQuestionInfo = null;

    questions.forEach((q) => {
      const sectionType = (q.content?.sectionType || q.type || '').toLowerCase();

      if (sectionType === 'writing_section' && Array.isArray(q.content?.parts)) {
        writingQuestionInfo = {
          title: q.content.title,
          prompt: q.content.parts.map(p => p.part_title).join('\n'),
          sampleAnswer: q.content.parts.map(p => p.questions?.map(cq => cq.sample_answer).join('\n')).join('\n'),
        };
      }

      if (sectionType === 'cloze_test' && Array.isArray(q.content?.tasks)) {
        q.content.tasks.forEach((t, tIdx) => {
          const tQs = t.questions || [];
          tQs.forEach((cQ, qIdx) => {
            totalQCount += 1;
            const key = `${q.id}_t${tIdx}_q${qIdx}`;
            const selected = userAnswers[key];
            const correctOpt = cQ.correct_option || cQ.options?.find(o => o.isCorrect)?.id;
            if (selected === correctOpt && selected !== undefined) {
              correctCount += 1;
              totalScore += 1;
            }
          });
        });
      } else if (['listening_section', 'reading_section', 'writing_section', 'multiple_choice'].includes(sectionType) && Array.isArray(q.content?.parts) && q.content.parts.length > 0) {
        q.content.parts.forEach((pItem, pIdx) => {
          const pQs = pItem.questions || [];
          const isTF = pItem.part_type === 'true_false';
          const isEssay = pItem.part_type === 'short_essay' || pItem.part_type === 'full_essay';

          pQs.forEach((cQ, qIdx) => {
            totalQCount += 1;
            const key = `${q.id}_p${pIdx}_q${qIdx}`;
            const selected = userAnswers[key];

            if (isTF) {
              if (selected === (cQ.correctAnswer || 'T')) {
                correctCount += 1;
                totalScore += 1;
              }
            } else if (isEssay) {
              if (selected && selected.trim() !== '') {
                correctCount += 1;
                totalScore += 1;
              }
            } else {
              const opts = Array.isArray(cQ.options) ? cQ.options : [];
              const correctOptIndex = opts.findIndex((o) => o?.isCorrect);
              if (selected === correctOptIndex && selected !== undefined) {
                correctCount += 1;
                totalScore += 1;
              }
            }
          });
        });
      } else {
        const childs = q.content?.childQuestions;
        if (Array.isArray(childs) && childs.length > 0) {
          childs.forEach((c, cIdx) => {
            totalQCount += 1;
            const key = `${q.id}_c${cIdx}`;
            const selected = userAnswers[key];

            if (sectionType === 'reading_tf') {
              if (selected === c.correctAnswer) {
                correctCount += 1;
                totalScore += 1;
              }
            } else {
              const opts = Array.isArray(c.options) ? c.options : [];
              const correctOptIndex = opts.findIndex((o) => o?.isCorrect);
              if (selected === correctOptIndex && selected !== undefined) {
                correctCount += 1;
                totalScore += 1;
              }
            }
          });
        } else {
          totalQCount += 1;
          const selected = userAnswers[q.id];
          const opts = Array.isArray(q.content?.options) ? q.content.options : [];
          const correctOptIndex = opts.findIndex((o) => o?.isCorrect);
          if (selected === correctOptIndex && selected !== undefined) {
            correctCount += 1;
            totalScore += Number(q.marks) || 1;
          }
        }
      }
    });

    let aiGrading = null;
    const firstImgUrl = Object.values(uploadedStudentImages)[0] || null;
    const studentGotedText = Object.values(userAnswers).filter(v => typeof v === 'string' && isNaN(v)).join('\n');

    if (writingQuestionInfo || firstImgUrl || studentGotedText) {
      try {
        aiGrading = await gradeWritingSubmissionWithAI({
          questionTitle: writingQuestionInfo?.title || 'WRITING SECTION',
          questionPrompt: writingQuestionInfo?.prompt || 'Bài làm tự luận Tiếng Anh',
          sampleAnswer: writingQuestionInfo?.sampleAnswer || '',
          studentText: studentGotedText,
          studentImageUrl: firstImgUrl,
        });
        setAiGradingResult(aiGrading);
      } catch (err) {
        console.error('Error running AI writing grader:', err);
      }
    }
    setIsAiGradingLoading(false);

    let elapsed = secondsElapsed;
    if (isCountdownMode) {
      elapsed = timeLimitSeconds - secondsRemaining;
    }
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeTakenStr = `${mins} phút ${secs} giây`;
    const isPassed = totalScore >= (totalMarks * 0.5);
    const nowIso = new Date().toISOString();

    // TÍNH HUY HIỆU GAMIFICATION BADGES
    const badges = calculateGamificationBadges({
      score: totalScore,
      totalMarks,
      correctCount,
      totalQuestions: totalQCount,
      timeTakenSeconds: elapsed,
      timeLimitSeconds,
      aiWritingScore: aiGrading?.overallScore,
    });
    setEarnedBadges(badges);

    const res = {
      studentName: profile?.full_name || 'Học Viên',
      timeTakenStr,
      correctCount,
      totalQuestions: totalQCount,
      score: totalScore,
      totalMarks,
      isPassed,
      submittedAt: nowIso,
    };

    setResultData(res);

    // THU THẬP TẤT CẢ CÂU LÀM SAI ĐỂ ĐƯA VÀO FLASHCARDS
    const wrongQs = [];
    questions.forEach((q) => {
      const sectionType = (q.content?.sectionType || q.type || '').toLowerCase();
      if (Array.isArray(q.content?.parts)) {
        q.content.parts.forEach((p, pIdx) => {
          (p.questions || []).forEach((cQ, cIdx) => {
            const key = `${q.id}_p${pIdx}_q${cIdx}`;
            const selected = userAnswers[key];
            const correctText = cQ.options?.find(o => o.isCorrect)?.text || cQ.correctAnswer || 'Đáp án đúng';
            const userSelectedText = cQ.options?.[selected]?.text || selected || 'Chưa chọn';

            if (selected !== undefined && cQ.options && selected !== cQ.options.findIndex(o => o.isCorrect)) {
              wrongQs.push({
                question: cQ.question || 'Câu hỏi',
                userAnswer: userSelectedText,
                correctAnswer: correctText,
                explanation: cQ.explanation || p.explanation,
              });
            }
          });
        });
      }
    });
    setWrongQuestionsList(wrongQs);
    setSubmitted(true);

    if (isAutoSubmit) {
      alert('⏱️ Đã THU BÀI THI!\n\nHệ thống đã tự động thu bài và chấm điểm.');
    }

    if (profile?.id && activity?.id) {
      await supabase.from('submissions').insert([
        {
          activity_id: activity.id,
          student_id: profile.id,
          answers_data: { userAnswers, uploadedStudentImages, aiGrading, tabSwitchCount, badges },
          score: totalScore,
          status: 'graded',
        },
      ]);
    }
  };

  const renderPassageWithHighlights = (passageText) => {
    if (!passageText) return null;
    const parts = passageText.split(/('.*?'|".*?")/g);
    return parts.map((part, idx) => {
      if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
        return (
          <span key={idx} className="font-extrabold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded border border-amber-400 mx-0.5 shadow-2xs">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const renderFormattedParagraphs = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n').filter((l) => l.trim() !== '');

    return lines.map((line, idx) => {
      let isHeader = false;
      const highlightKeywords = ['Evidence:', 'Dẫn chứng:', 'Phân tích:', 'Cấu trúc:', 'Đáp án đúng:', 'Loại trừ:', 'Bản dịch:'];
      highlightKeywords.forEach((kw) => {
        if (line.toLowerCase().includes(kw.toLowerCase())) {
          isHeader = true;
        }
      });

      return (
        <p key={idx} className={`leading-relaxed text-slate-700 ${idx > 0 ? 'mt-1' : ''}`}>
          {isHeader ? (
            <span className="font-extrabold text-slate-900 bg-amber-100/70 px-1.5 py-0.5 rounded mr-1">
              {line}
            </span>
          ) : (
            line
          )}
        </p>
      );
    });
  };

  const renderCompactExplanation = (explanationText, correctText, qObj = null, userVal = null) => {
    return (
      <div className="mt-1.5 space-y-1">
        {!explanationText || explanationText.trim() === '' ? (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] flex items-center justify-between text-emerald-950">
            <span className="font-extrabold">➔ Đáp án đúng: {correctText}</span>
            <span className="text-emerald-700 text-[10px]">💡 Nhớ từ vựng & cấu trúc trọng tâm!</span>
          </div>
        ) : (
          <div className="p-2 bg-emerald-50/90 border border-emerald-300 rounded-xl text-[11px] space-y-0.5 text-slate-800">
            <span className="font-extrabold text-emerald-950 block border-b border-emerald-200 pb-0.5">
              ➔ ĐÁP ÁN ĐÚNG: {correctText}
            </span>
            <div className="pt-0.5">
              {renderFormattedParagraphs(explanationText)}
            </div>
          </div>
        )}

        {/* NÚT HOI AI TUTOR CÂU NÀY */}
        <button
          onClick={() => {
            setSelectedQuestionForTutor({
              question: qObj?.question || 'Câu hỏi',
              explanation: explanationText,
              userAnswer: userVal,
              correctAnswer: correctText,
            });
            setAiTutorModalOpen(true);
          }}
          className="w-full py-1.5 bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-900 font-extrabold text-[11px] rounded-xl transition flex items-center justify-center space-x-1.5 shadow-2xs"
        >
          <Bot className="w-3.5 h-3.5 text-purple-700" />
          <span>🤖 Hỏi AI Tutor Giải Thích Chi Tiết Câu Này</span>
        </button>
      </div>
    );
  };

  if (loading) return <LoadingSpinner text="Đang tải bài làm..." />;
  if (scheduledOpenTime && new Date() < new Date(scheduledOpenTime) && !submitted) {
    return (
      <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12 animate-scale-up">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-sky-400 uppercase tracking-wide">
            ⏳ ĐỀ THI HẸN GIỜ MỞ TỰ ĐỘNG
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Đề thi sẽ chính thức mở vào lúc: <strong className="text-amber-400">{new Date(scheduledOpenTime).toLocaleString('vi-VN')}</strong>.
          </p>
        </div>
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-emerald-400">
          Vui lòng đợi Giám Thị hoặc chờ đến đúng giờ hẹn để bắt đầu làm bài!
        </div>
      </div>
    );
  }
  if (passcodeRequired && !isUnlocked && !submitted) {
    return (
      <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12 animate-scale-up">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-amber-400 uppercase tracking-wide">
            🔒 BÀI THI CÓ MÃ KHÓA BẢO MẬT
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Vui lòng nhập Mật Khẩu do Giám Thị cung cấp để bắt đầu làm bài thi.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (enteredPasscode.trim() === passcodeRequired.trim()) {
              setIsUnlocked(true);
            } else {
              alert('❌ Mã khóa không chính xác! Vui lòng hỏi Giám Thị.');
            }
          }}
          className="space-y-3"
        >
          <input
            type="password"
            required
            value={enteredPasscode}
            onChange={(e) => setEnteredPasscode(e.target.value)}
            placeholder="Nhập mã khóa (Ví dụ: 123456)..."
            className="w-full p-3 border border-amber-400/50 rounded-xl text-center text-base font-extrabold tracking-widest bg-slate-950 text-amber-300 focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition"
          >
            Mở Khóa & Vào Làm Bài Thi
          </button>
        </form>
      </div>
    );
  }

  const minsLeft = Math.floor(secondsRemaining / 60);
  const secsLeft = secondsRemaining % 60;
  const minsElapsed = Math.floor(secondsElapsed / 60);
  const secsElapsed = secondsElapsed % 60;
  const isTimeWarning = isCountdownMode && secondsRemaining < 120;

  return (
    <div className="space-y-3">
      {/* MODAL CHATBOT AI TUTOR TRỢ LÝ HỌC TẬP */}
      <AiOmrScannerModal
        isOpen={omrScannerOpen}
        onClose={() => setOmrScannerOpen(false)}
      />

      <AdaptiveLearningModal
        isOpen={adaptiveModalOpen}
        onClose={() => setAdaptiveModalOpen(false)}
        wrongQuestions={wrongQuestionsList}
      />

      <FlashcardReviewModal
        isOpen={flashcardModalOpen}
        onClose={() => setFlashcardModalOpen(false)}
        wrongQuestions={wrongQuestionsList}
      />

      <AiTutorChatModal
        isOpen={aiTutorModalOpen}
        onClose={() => setAiTutorModalOpen(false)}
        questionData={selectedQuestionForTutor}
        userSelectedAnswer={selectedQuestionForTutor?.userAnswer}
        correctAnswerText={selectedQuestionForTutor?.correctAnswer}
      />

      {/* THÔNG BÁO GIÁM THỊ CẢNH BÁO CHUYỂN TAB GIAN LẬN */}
      {showCheatingWarning && !submitted && (
        <div className="p-3 bg-rose-950 text-rose-200 border-2 border-rose-600 rounded-2xl flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center space-x-2 text-xs font-extrabold">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>⚠️ CẢNH BÁO GIÁM THỊ: Bạn vừa rời khỏi màn hình thi ({tabSwitchCount}/{maxTabSwitchesAllowed} lần)! Vượt quá sẽ tự động thu bài.</span>
          </div>
          <button
            onClick={() => setShowCheatingWarning(false)}
            className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg"
          >
            Tôi đã hiểu
          </button>
        </div>
      )}

      {/* THÔNG BÁO TỔNG KẾT BÀI THI SAU KHU NỘP */}
      {submitted ? (
        <div className="p-5 bg-gradient-to-br from-slate-900 to-navy-900 text-white rounded-3xl shadow-xl space-y-5 border border-slate-700 animate-scale-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">KẾT QUẢ BÀI KIỂM TRA</h3>
                <p className="text-[11px] text-slate-300">Học sinh: {resultData.studentName}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {wrongQuestionsList.length > 0 && (
                <>
                  <button
                    onClick={() => setFlashcardModalOpen(true)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>🗂️ Ôn Tập {wrongQuestionsList.length} Câu Sai (Flashcards)</span>
                  </button>

                  <button
                    onClick={() => setAdaptiveModalOpen(true)}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    <Compass className="w-4 h-4 text-sky-200" />
                    <span>🧭 Lộ Trình Ôn Tập Lỗ Hổng Kiến Thức</span>
                  </button>
                </>
              )}
              <button
                onClick={() =>
                  exportStudentPdfReport({
                  studentName: resultData.studentName,
                  activityTitle: activity?.title || 'Bài Thi Quiz Online',
                  score: resultData.score,
                  totalMarks: resultData.totalMarks,
                  correctCount: resultData.correctCount,
                  totalQuestions: resultData.totalQuestions,
                  timeTakenStr: resultData.timeTakenStr,
                  submittedAt: resultData.submittedAt,
                  aiGradingFeedback: aiGradingResult?.detailedFeedback,
                })
              }
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4 text-sky-200" />
              <span>🖨️ Tải Báo Cáo PDF Bài Thi</span>
            </button>

            <button
              onClick={() => exportOmrSheet(activity?.title || 'BÀI THI TRẮC NGHIỆM', 40)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-indigo-200" />
              <span>📄 In Phiếu Tô Trắc Nghiệm OMR</span>
            </button>

            <button
              onClick={() => setOmrScannerOpen(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Camera className="w-4 h-4 text-teal-200" />
              <span>📷 Camera AI Quét Phiếu OMR</span>
            </button>

            <button
              onClick={() => exportQuizToWord(questions, activity?.title || 'BÀI KIỂM TRA TIẾNG ANH')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>🖨️ In Đề Thi Ra Giấy (Word)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Thời Gian Làm</span>
              <span className="text-xs font-extrabold text-white flex items-center justify-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{resultData.timeTakenStr}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Số Câu Đúng</span>
              <span className="text-xs font-extrabold text-emerald-400">
                {resultData.correctCount} / {resultData.totalQuestions} câu
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tổng Điểm Đạt Được</span>
              <span className="text-xs font-extrabold text-amber-400">
                {resultData.score} / {resultData.totalMarks} điểm
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Trạng Thái</span>
              <span
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded inline-block ${
                  resultData.isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {resultData.isPassed ? 'VƯỢT QUA 🎉' : 'CHƯA ĐẠT ⚠️'}
              </span>
            </div>
          </div>

          {/* KHỐI HUY HIỆU GAMIFICATION BADGES KHEN THƯỞNG */}
          {earnedBadges.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 rounded-2xl space-y-2">
              <span className="font-extrabold text-amber-300 uppercase tracking-wide text-xs flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>🏆 DANH HIỆU & HUY HIỆU KHEN THƯỞNG ĐẠT ĐƯỢC:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className={`p-3 rounded-xl bg-gradient-to-r ${badge.bgGradient} text-white shadow-md space-y-0.5 border border-white/20`}>
                    <h5 className="font-extrabold text-xs flex items-center space-x-1">
                      <span>{badge.icon}</span>
                      <span>{badge.title}</span>
                    </h5>
                    <p className="text-[10px] text-white/90 font-medium">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* THANH ĐỒNG HỒ THỜI GIAN LÀM BÀI */
        <div className="bg-slate-900 text-white p-3 rounded-2xl flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Học sinh: {profile?.full_name || 'Học Viên'}</span>
          </div>
          <div
            className={`flex items-center space-x-2 text-xs font-extrabold px-3 py-1 rounded-xl border transition ${
              isTimeWarning ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse' : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {isCountdownMode ? (
              <span>
                ⏱️ Tổng thời gian làm bài ({Math.floor(timeLimitSeconds / 60)} phút): {minsLeft < 10 ? `0${minsLeft}` : minsLeft}:{secsLeft < 10 ? `0${secsLeft}` : secsLeft}
              </span>
            ) : (
              <span>
                ⏱️ Thời gian làm bài: {minsElapsed < 10 ? `0${minsElapsed}` : minsElapsed}:{secsElapsed < 10 ? `0${secsElapsed}` : secsElapsed}
              </span>
            )}
          </div>
        </div>
      )}

      {/* DANH SÁCH CÂU HỎI */}
      <div className="space-y-3">
        {questions.map((q, qIdx) => {
          const sectionType = (q.content?.sectionType || q.type || 'multiple_choice').toLowerCase();
          const isWriting = sectionType === 'writing_section';
          const isReading = sectionType === 'reading_section';
          const isListening = sectionType === 'listening_section';
          const isReadingTF = sectionType === 'reading_tf';
          const isClozeTest = sectionType === 'cloze_test';
          const childQuestions = Array.isArray(q.content?.childQuestions) ? q.content.childQuestions : [];
          const sectionParts = Array.isArray(q.content?.parts) ? q.content.parts : [];

          // NẾU LÀ WRITING SECTION
          if (isWriting && sectionParts.length > 0) {
            return (
              <div key={q.id || qIdx} className="bg-white border-l-4 border-indigo-600 rounded-3xl p-5 shadow-xs border-y border-r border-slate-200 space-y-4">
                <div className="bg-indigo-50/70 rounded-xl p-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-indigo-900 tracking-wide uppercase flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span>{q.content?.title || 'WRITING SECTION'}</span>
                  </h3>
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>

                {sectionParts.map((pItem, pIdx) => {
                  const pQs = Array.isArray(pItem.questions) ? pItem.questions : [];
                  const isPart1MC = pItem.part_type === 'multiple_choice';
                  const isPart2Short = pItem.part_type === 'short_essay';

                  return (
                    <div key={pIdx} className="space-y-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="p-3 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                        {pItem.part_title || `PART ${pIdx + 1}: Instructions`}
                      </div>

                      {pItem.passage && (
                        <div className="p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed font-serif">
                          {pItem.passage}
                        </div>
                      )}

                      <div className="space-y-3 pt-1">
                        {pQs.map((cQ, cIdx) => {
                          const childKey = `${q.id}_p${pIdx}_q${cIdx}`;
                          const selectedVal = userAnswers[childKey] || '';

                          if (isPart1MC) {
                            const cOpts = Array.isArray(cQ.options) ? cQ.options : [];
                            const correctOptIndex = cOpts.findIndex((o) => o?.isCorrect);
                            const isCorrect = submitted && selectedVal === correctOptIndex;
                            const correctText = cOpts.find((o) => o?.isCorrect)?.text || 'Đáp án đúng';

                            return (
                              <div key={cIdx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                                <h4 className="font-extrabold text-xs text-slate-900">{cQ.question}</h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {cOpts.map((opt, oIdx) => {
                                    const isSelected = selectedVal === oIdx;
                                    const isThisCorrect = opt?.isCorrect;
                                    const label = String.fromCharCode(65 + oIdx);

                                    let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                                    if (submitted) {
                                      if (isThisCorrect) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                                      else if (isSelected && !isThisCorrect) btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold line-through';
                                    } else if (isSelected) {
                                      btnStyle = 'bg-indigo-600 text-white font-bold border-transparent shadow-xs';
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={submitted}
                                        onClick={() => handleSelectAnswer(childKey, oIdx)}
                                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 whitespace-normal break-words ${btnStyle}`}
                                      >
                                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-extrabold text-[9px] flex-shrink-0 ${
                                          isSelected ? 'bg-white text-indigo-800' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                          {label}
                                        </span>
                                        <span className="leading-snug">{opt.text}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {submitted && renderCompactExplanation(cQ.explanation || pItem.explanation, correctText, cQ, cOpts[selectedVal]?.text)}
                              </div>
                            );
                          } else if (isPart2Short) {
                            return (
                              <div key={cIdx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                                <h4 className="font-extrabold text-xs text-slate-900 whitespace-pre-line">{cQ.question}</h4>
                                <input
                                  type="text"
                                  disabled={submitted}
                                  value={selectedVal}
                                  onChange={(e) => handleSelectAnswer(childKey, e.target.value)}
                                  placeholder="Gõ câu hoàn chỉnh của bạn tại đây..."
                                  className="w-full p-2.5 border border-indigo-200 rounded-xl text-xs bg-indigo-50/20 font-medium"
                                />
                                {submitted && (
                                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                                    <span className="font-bold text-emerald-950">➔ GỢI Ý ĐÁP ÁN MẪU: {cQ.sample_answer || 'Đáp án mẫu chuẩn'}</span>
                                    {renderFormattedParagraphs(cQ.explanation || pItem.explanation)}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            const studentImgUrl = uploadedStudentImages[childKey];

                            return (
                              <div key={cIdx} className="p-4 bg-white border border-indigo-200 rounded-2xl space-y-3 shadow-xs">
                                <h4 className="font-extrabold text-xs text-slate-900 whitespace-pre-line">{cQ.question}</h4>

                                <div className="space-y-2">
                                  <label className="block text-[11px] font-bold text-indigo-900 uppercase">
                                    ✍️ HỌC SINH LÀM BÀI: DÁN VĂN BẢN HOẶC CHỤP ẢNH TẢI BÀI LÀM LÊN:
                                  </label>
                                  <textarea
                                    rows={6}
                                    disabled={submitted}
                                    value={selectedVal}
                                    onChange={(e) => handleSelectAnswer(childKey, e.target.value)}
                                    placeholder="Học sinh có thể gõ/dán bài văn trực tiếp vào ô này..."
                                    className="w-full p-3 border border-indigo-300 rounded-xl text-xs bg-white font-serif leading-relaxed"
                                  />
                                </div>

                                <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Camera className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-extrabold text-indigo-950">Chụp ảnh / Tải ảnh bài làm từ máy (Tự động nén):</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={submitted}
                                    onChange={(e) => handleStudentImageUpload(e, childKey)}
                                    className="text-xs"
                                  />
                                </div>

                                {studentImgUrl && (
                                  <div className="p-2 bg-slate-100 border rounded-xl text-center">
                                    <span className="text-[10px] font-bold text-slate-600 block mb-1">📷 Ảnh bài làm đã tải lên & nén (&lt; 1MB):</span>
                                    <img src={studentImgUrl} alt="Bài làm học sinh" className="max-h-48 mx-auto rounded-lg shadow-sm border" />
                                  </div>
                                )}

                                {submitted && (
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                                    <span className="font-bold text-emerald-950">💡 GỢI Ý DÀN Ý VÀ TIÊU CHUẨN CHẤM:</span>
                                    <div className="text-slate-800">{renderFormattedParagraphs(cQ.sample_answer || cQ.explanation || pItem.explanation)}</div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // DẠNG SPEAKING TEST (WEB SPEECH API RECOGNITION)
          if (sectionType === 'speaking_test' || q.type === 'speaking_test') {
            const childKey = `${q.id}_speaking`;
            const isRecordingThis = recordingKey === childKey;
            const transcript = speechTranscripts[childKey] || userAnswers[childKey] || '';

            return (
              <div key={q.id || qIdx} className="bg-white border-l-4 border-amber-500 rounded-3xl p-4 shadow-xs border-y border-r border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-extrabold text-xs">
                    {qIdx + 1}
                  </span>
                  <span className="uppercase text-amber-900 tracking-tight text-xs font-extrabold">
                    SPEAKING TEST (LUYỆN PHÁT ÂM VỚI AI)
                  </span>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 leading-relaxed font-serif">
                  {q.content?.question || 'Read the sentence out loud into your microphone.'}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">🎙️ Bài nói ghi âm của bạn:</span>
                    <button
                      disabled={submitted}
                      onClick={() => handleStartSpeechRecognition(childKey)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center space-x-1.5 ${
                        isRecordingThis
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                      }`}
                    >
                      {isRecordingThis ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>{isRecordingThis ? 'Đang thu âm...' : 'Bấm Để Thu Âm Giọng Nói'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    disabled={submitted}
                    value={transcript}
                    onChange={(e) => {
                      setSpeechTranscripts((prev) => ({ ...prev, [childKey]: e.target.value }));
                      handleSelectAnswer(childKey, e.target.value);
                    }}
                    placeholder="Văn bản nhận diện giọng nói sẽ tự động xuất hiện ở đây..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            );
          }

          // DẠNG TRẮC NGHIỆM ĐƠN LẺ KHÁC
          return (
            <div key={q.id || qIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-3xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                    {qIdx + 1}
                  </span>
                  <span className="uppercase text-emerald-900 tracking-tight text-xs font-extrabold">
                    {isListening ? 'LISTENING SECTION' : isReading ? 'READING SECTION' : 'MULTIPLE CHOICE'}
                  </span>
                </div>
              </div>

              {(q.content?.question || q.content?.title) && (
                <div className="p-2.5 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-xl text-purple-950 font-extrabold text-xs leading-relaxed shadow-2xs">
                  {q.content.question || q.content.title}
                </div>
              )}

              <div className="space-y-1.5 pt-0.5">
                {(childQuestions.length > 0
                  ? childQuestions
                  : [
                      {
                        question: q.content?.question || '1. Choose the correct answer A, B, C, or D.',
                        options: q.content?.options || [
                          { text: 'Option A', isCorrect: true },
                          { text: 'Option B', isCorrect: false },
                          { text: 'Option C', isCorrect: false },
                          { text: 'Option D', isCorrect: false },
                        ],
                        explanation: q.content?.explanation,
                      },
                    ]
                ).map((cQ, cIdx) => {
                  const childKey = `${q.id}_c${cIdx}`;
                  const selectedOptIndex = userAnswers[childKey];
                  const cOpts = Array.isArray(cQ.options) ? cQ.options : [];
                  const correctOptIndex = cOpts.findIndex((o) => o?.isCorrect);
                  const isCorrect = submitted && selectedOptIndex === correctOptIndex;
                  const isWrong = submitted && selectedOptIndex !== undefined && selectedOptIndex !== correctOptIndex;
                  const correctText = cOpts.find((o) => o?.isCorrect)?.text || 'Đáp án đúng';

                  const maxOptLen = Math.max(...cOpts.map(o => (typeof o === 'string' ? o : (o.text || o.label || '')).length));

                  let btnFontSize = 'text-xs px-2.5 py-1.5';
                  if (maxOptLen > 30) {
                    btnFontSize = 'text-[10px] px-1.5 py-1 leading-tight';
                  } else if (maxOptLen > 18) {
                    btnFontSize = 'text-[11px] px-2 py-1 leading-snug';
                  }

                  return (
                    <div
                      key={cIdx}
                      className={`p-2.5 bg-white border rounded-xl space-y-1.5 transition ${
                        submitted
                          ? isCorrect
                            ? 'border-emerald-400 bg-emerald-50/20'
                            : 'border-rose-400 bg-rose-50/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-slate-900">
                          {cQ.question}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full items-stretch pt-0.5">
                        {cOpts.map((opt, oIdx) => {
                          const isSelected = selectedOptIndex === oIdx;
                          const isThisCorrect = opt?.isCorrect;
                          const label = String.fromCharCode(65 + oIdx);

                          let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';
                          if (submitted) {
                            if (isThisCorrect) {
                              btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                            } else if (isSelected && !isThisCorrect) {
                              btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold line-through';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-emerald-600 text-white font-bold border-transparent shadow-xs';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={submitted}
                              onClick={() => handleSelectAnswer(childKey, oIdx)}
                              className={`w-full text-left rounded-xl ${btnFontSize} font-semibold border transition flex items-center space-x-1 whitespace-normal break-words ${btnStyle}`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-extrabold text-[9px] flex-shrink-0 ${
                                isSelected ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {label}
                              </span>
                              <span className="leading-snug">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {submitted && renderCompactExplanation(cQ.explanation || q.content?.explanation, correctText, cQ, cOpts[selectedOptIndex]?.text)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={() => handleSubmitQuiz(false)}
          disabled={isAiGradingLoading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
        >
          {isAiGradingLoading ? (
            <span>🤖 AI đang chấm bài tự luận & tổng hợp kết quả...</span>
          ) : (
            <span>Nộp Bài Thi Quiz Ngay</span>
          )}
        </button>
      )}
    </div>
  );
}