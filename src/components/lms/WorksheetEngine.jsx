import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Trash2, ArrowUp, ArrowDown, Volume2, Upload, Sparkles, Check, RefreshCw, Send, CheckCircle2, Award, X, Edit3, HelpCircle, AlertCircle, Clock, Target, BookOpen, AlertTriangle, Printer, History, Users, ShieldAlert, BarChart2, Lightbulb, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// DEMO SAMPLE TASKS CHUẨN MẪU DÀNH CHO THẦY HẢI
const INITIAL_DEMO_TASKS = [
  {
    id: 'task_1',
    taskType: 'gap_fill_sentences',
    title: 'Dạng 1: Put the verbs in the correct tense',
    taskDescription: 'Fill in the blanks with the correct form of the verbs in brackets.',
    audioUrl: '',
    content: `1. The local artisans in Bat Trang village always (try) *try* to pass down their traditional pottery-making skills to the younger generation.
2. We don't know where (find) *to find* more information about the history of this old community helpers group.
3. My family (move) *moved* to a very quiet suburb of Da Nang last week.
4. If you want to protect our local environment, you should (cut) *cut* down on the amount of single-use plastic bags.
5. Could you please show me how (get) *to get* to the nearest sports facilities in this new neighbourhood?`,
  },
  {
    id: 'task_2',
    taskType: 'gap_fill_drag',
    title: 'Dạng 2: Drag the words into the correct gaps',
    taskDescription: 'Select a word from the bank above and click on the gap to fill in the text.',
    audioUrl: '',
    content: `"Vong Village is very famous in Viet Nam for its traditional *specialities*, especially com (young sticky rice flakes). To make com with a delicate taste, local *artisans* must follow a series of complicated steps. Nowadays, they use modern machines in some parts of the production to *shorten* the process. However, the villagers still do their best to *preserve* the original flavour and the unique, gentle *fragrance* of this autumn gift."`,
  },
  {
    id: 'task_3',
    taskType: 'gap_fill_listening',
    title: 'Dạng 3: Listen and fill in the missing words',
    taskDescription: 'Listen to the audio recording carefully and fill in the missing words.',
    audioUrl: '',
    content: `This is An Binh *Radio* Station. In today's special programme, we will share with you a piece of *writing* which won first prize in our writing contest called "My Favourite *Community* Helper". This was written by Mi, a grade 9 *student*.`,
  },
  {
    id: 'task_4',
    taskType: 'error_correction',
    title: 'Dạng 4: Find a grammar mistake in each sentence and correct it',
    taskDescription: 'Rê chuột chọn từ sai trong câu và gõ từ đúng vào khung popup xuất hiện bên dưới.',
    audioUrl: '',
    content: `15. We are wondering what to buy *these -> this* traditional souvenirs; we can't find any gift shop.
16. My grandparents *gave -> passed* down their traditional weaving skills to my parents.
17. The streets are getting *more noisy -> noisier* because of the increasing number of vehicles.
18. She has a very good relationship with her neighbours, so she gets on well *them -> with them*.
19. We should cut *up -> down* on the amount of electricity we use to save money.`,
  },
  {
    id: 'task_5',
    taskType: 'rewrite',
    title: 'Dạng 5: Sentence Rewrite (Viết lại câu không đổi nghĩa)',
    taskDescription: 'Rewrite each sentence by filling in the blank with the correct phrase.',
    audioUrl: '',
    content: `20. I don't know how I can use this modern 3D printing machine. (HOW)
-> I don't know *how to use* this modern 3D printing machine.
21. They are wondering where they can buy some traditional handicrafts. (WHERE)
-> They are wondering *where to buy* some traditional handicrafts.
22. My grandmother took care of me when my parents were away on business. (LOOKED)
-> My grandmother *looked after* me when my parents were away on business.`,
  },
];

export default function WorksheetEngine({ activity, isTeacher, onSaveActivity, reviewSubmission }) {
  const { user, profile } = useAuth();
  const settings = activity?.settings || {};

  const [worksheetTitle, setWorksheetTitle] = useState(
    settings.title || (activity?.title || 'Worksheet Practice').replace(/\[(WORKSHEET|AUDIO_RECORD|DICTATION|WHITEBOARD|INTERACTIVE_VIDEO)\]/gi, '').trim()
  );
  const [worksheetDescription, setWorksheetDescription] = useState(
    settings.description || activity?.content || 'Tập bài tập thực hành tổng hợp các dạng bài tập Tiếng Anh.'
  );

  // 15-MINUTE TEST SETTINGS: TIMER & MAX SCORE
  const [timeLimit, setTimeLimit] = useState(settings.timeLimit !== undefined ? settings.timeLimit : 15);
  const [maxScore, setMaxScore] = useState(settings.maxScore !== undefined ? settings.maxScore : 10);

  const [tasks, setTasks] = useState(() => {
    if (Array.isArray(settings.tasks) && settings.tasks.length > 0) {
      return settings.tasks;
    }
    // Mặc định tạo bài tập mới là TRANG TRỐNG không có dữ liệu mẫu (để Thầy Hải tiện nhập bài)
    return [
      {
        id: 'task_1',
        taskType: 'mcq',
        title: 'Dạng 1: Bài tập trắc nghiệm',
        taskDescription: 'Lựa chọn phương án đúng A, B, C hoặc D.',
        audioUrl: '',
        content: '',
      }
    ];
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingAudioIndex, setUploadingAudioIndex] = useState(null);

  // USER ANSWERS & RESULTS STATE
  const [userAnswers, setUserAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);

  // FEATURE 3: ATTEMPT HISTORY STATE
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // FEATURE 4: CLASSROOM DIAGNOSTIC ANALYTICS FOR TEACHER
  const [classSubmissions, setClassSubmissions] = useState([]);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // FEATURE 5: ANTI-CHEATING TAB SWITCH WARNING STATE
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);

  // FEATURE 6: MCQ RANDOMIZE SHUFFLE SEED & MATCHING SELECTION STATE
  const [mcqShuffleSeed, setMcqShuffleSeed] = useState(1);
  const [activeMatchingItem, setActiveMatchingItem] = useState({});

  const getShuffledMcqOptions = (item) => {
    if (!item || !Array.isArray(item.options) || item.options.length <= 1) {
      return item?.options || [];
    }
    const seed = mcqShuffleSeed;
    const opts = [...item.options];

    // LCG Seeded Random Generator using item.id and seed
    const itemIdStr = String(item.id || item.prompt || 'item_opt');
    let hash = 0;
    for (let k = 0; k < itemIdStr.length; k++) {
      hash = (hash << 5) - hash + itemIdStr.charCodeAt(k);
      hash |= 0;
    }

    let s = Math.abs(hash) + seed * 1664525 + 1013904223;
    const lcg = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };

    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(lcg() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }

    // GUARANTEE ROTATION ON EVERY RESET (SEED > 1)
    if (seed > 1) {
      const shift = (seed - 1) % opts.length;
      if (shift > 0) {
        return [...opts.slice(shift), ...opts.slice(0, shift)];
      }
    }

    return opts;
  };

  // LIVE TIMER STATE (COUNTDOWN TIMER)
  const [secondsLeft, setSecondsLeft] = useState(timeLimit * 60);
  const [timerStarted, setTimerStarted] = useState(false);

  // DRAG & DROP / SELECT WORD STATE FOR GAPFILL DRAG
  const [selectedWord, setSelectedWord] = useState(null);

  // DẠNG 4: SELECTED ERROR WORD INDEX STATE FOR EACH SENTENCE
  const [selectedErrorWords, setSelectedErrorWords] = useState({});

  // DẠNG 9: HIGHLIGHTED SENTENCES STATE FOR COMMUNICATION ORDER
  const [highlightedCommSentences, setHighlightedCommSentences] = useState({});

  const toggleCommSentenceHighlight = (key) => {
    setHighlightedCommSentences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // STUDIO INPUT LOCAL STATE TO ALLOW SMOOTH TYPING IN STUDIO BUILDERS
  const [studioErrorItems, setStudioErrorItems] = useState({});
  const [studioRewriteItems, setStudioRewriteItems] = useState({});

  // DẠNG 7 MCQ STUDIO STATE (MODE TOGGLE UI VS JSON)
  const [mcqEditModes, setMcqEditModes] = useState({});
  const [mcqJsonTexts, setMcqJsonTexts] = useState({});

  // DẠNG 4: EXPLANATION TOOLTIP TOGGLE STATE
  const [openExplanations, setOpenExplanations] = useState({});

  const toggleExplanation = (key) => {
    setOpenExplanations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // FEATURE 1: WEB AUDIO API TICK-TOCK BEEP WHEN < 60 SECONDS
  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  // FEATURE 5: ANTI-CHEATING TAB SWITCH LISTENER
  useEffect(() => {
    if (timeLimit <= 0 || checked || isEditMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          setShowCheatWarning(true);
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timeLimit, checked, isEditMode]);

  // COUNTDOWN TIMER EFFECT + TIME WARNING BEEP (<60s)
  useEffect(() => {
    if (timeLimit > 0) {
      setSecondsLeft(timeLimit * 60);
      setTimerStarted(true);
    } else {
      setTimerStarted(false);
    }
  }, [timeLimit]);

  useEffect(() => {
    if (!timerStarted || timeLimit <= 0 || checked || secondsLeft <= 0) return;

    if (secondsLeft <= 60 && secondsLeft > 0) {
      playTickSound();
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCheckWorksheet();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerStarted, secondsLeft, checked, timeLimit]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getGrammarExplanation = (wrongWord, correctWord, cleanLine) => {
    const w = (wrongWord || '').toLowerCase().trim();
    const c = (correctWord || '').toLowerCase().trim();

    if (w.includes('more noisy') || c.includes('noisier')) {
      return "So sánh hơn của tính từ ngắn đuôi '-y' (noisy): đổi 'y' thành 'i' rồi thêm '-er' -> noisier, không dùng 'more noisy'.";
    }
    if (w.includes('gave') || c.includes('passed')) {
      return "Cụm động từ 'pass down' có nghĩa là truyền lại nghề/kỹ năng cho thế hệ sau (dùng 'passed down' thay cho 'gave down').";
    }
    if (w.includes('these') || c.includes('this')) {
      return "Dùng tính từ chỉ định số ít 'this' để chỉ định cụm danh từ ở phía sau phù hợp ngữ cảnh.";
    }
    if (w.includes('them') || c.includes('with them')) {
      return "Cụm động từ cố định 'get on well with somebody' (hòa thuận với ai đó) bắt buộc phải có giới từ 'with'.";
    }
    if (w.includes('up') || c.includes('down')) {
      return "Cụm động từ 'cut down on something' có nghĩa là cắt giảm bớt tiêu dùng/chi phí (dùng 'cut down', không dùng 'cut up').";
    }
    if (w.includes('more') || c.includes('the more')) {
      return "Cấu trúc so sánh kép (The + comparative..., the + comparative...): 'The dirtier..., the more difficult...'.";
    }
    return `Đổi từ sai '${wrongWord}' thành từ đúng '${correctWord}' để đảm bảo đúng cấu trúc ngữ pháp và ngữ nghĩa của câu.`;
  };

  // AI PERSONALISED FEEDBACK GENERATOR
  const generatePersonalizedAiFeedback = (scorePercent, weakPoints, studentName = 'Em') => {
    const sName = studentName || 'Em';
    const topics = (weakPoints || []).map((w) => (typeof w === 'object' ? w.taskName || w.text : w)).slice(0, 2).join(', ');

    if (scorePercent === 100) {
      return `"Xuất sắc! ${sName} đã hoàn thành chính xác 100% tất cả các câu bài tập. Kiến thức của em rất vững vàng và tinh thần học tập vô cùng cẩn thận. Hãy duy trì phong độ ấn tượng này nhé!"`;
    }
    if (scorePercent >= 80) {
      return `"Chúc mừng ${sName} đã đạt điểm giỏi (${scorePercent}%)! Em chỉ cần xem lại kỹ hơn phần [${topics || 'các câu chưa làm đúng'}] là sẽ đạt điểm 10 tuyệt đối ở các bài kiểm tra tới. Cố gắng lên nhé!"`;
    }
    if (scorePercent >= 50) {
      return `"${sName} đã nỗ lực hoàn thành bài kiểm tra với ${scorePercent}% số điểm. Em hãy dành 10 - 15 phút rà soát lại mảng [${topics || 'kiến thức cần cải thiện'}] để củng cố và tự tin hơn nhé!"`;
    }
    return `"Đừng nản lòng nhé ${sName}! Bài tập này giúp em phát hiện mảng [${topics || 'kiến thức còn hổng'}] để luyện tập thêm. Hãy dành thời gian xem lại lời giải chi tiết và thử làm lại nhé!"`;
  };

  // DIAGNOSTIC WEAKNESS ANALYZER FOR ALL 9 WORKSHEET TASK TYPES
  const generateWeaknessDiagnostic = (finalResults, taskList) => {
    if (!finalResults) return null;
    if (finalResults.scorePercent === 100) {
      return {
        status: 'excellent',
        title: '🌟 XUẤT SẮC! KIẾN THỨC VỮNG VÀNG',
        message: 'Em đã hoàn thành chính xác 100% tất cả các câu bài tập. Hãy tiếp tục phát huy phong độ này nhé!',
        weakPoints: [],
      };
    }

    const weakPoints = [];
    const taskResults = finalResults.taskResults || {};

    (taskList || []).forEach((t, index) => {
      const resState = taskResults[t.id] || {};
      const wrongItems = Object.values(resState).filter((r) => r && !r.isCorrect);

      if (wrongItems.length > 0) {
        const taskName = t.title || `Dạng ${index + 1}`;
        const totalInTask = Object.keys(resState).length || 1;
        const countText = totalInTask > 1 ? ` (Có ${wrongItems.length}/${totalInTask} câu chưa đúng)` : '';

        let topicDetail = '';
        if (t.taskType === 'error_correction') {
          topicDetail = 'Kỹ năng tìm & sửa lỗi sai ngữ pháp (Giới từ, Cụm động từ, So sánh tính từ)';
        } else if (t.taskType === 'rewrite') {
          topicDetail = 'Cấu trúc viết lại câu giữ nguyên nghĩa (To-Infinitive, Từ để hỏi)';
        } else if (t.taskType === 'gap_fill_sentences') {
          topicDetail = 'Chia thì động từ & Dạng nguyên mẫu có To (To-Infinitive)';
        } else if (t.taskType === 'gap_fill_drag') {
          topicDetail = 'Vốn từ vựng & Kỹ năng chọn từ điền vào đoạn văn';
        } else if (t.taskType === 'gap_fill_listening') {
          topicDetail = 'Kỹ năng nghe hiểu chi tiết & Điền từ trong bài nghe';
        } else if (t.taskType === 'unscramble') {
          topicDetail = 'Cấu trúc trật tự từ & Sắp xếp các cụm từ thành câu';
        } else if (t.taskType === 'mcq') {
          topicDetail = 'Kiến thức ngữ pháp & Từ vựng bài tập trắc nghiệm 4 lựa chọn';
        } else if (t.taskType === 'matching') {
          topicDetail = 'Kỹ năng nối câu / từ vựng tương ứng với nhóm nghĩa / hình ảnh';
        } else if (t.taskType === 'communication_order') {
          topicDetail = 'Sắp xếp thứ tự các câu thành bài hội thoại / lá thư (Communication Section)';
        } else {
          topicDetail = t.taskDescription || 'Cần ôn tập thêm mảng kiến thức này';
        }

        weakPoints.push({
          taskId: t.id || index,
          taskName: taskName,
          text: `${taskName}: ${topicDetail}${countText}`,
        });
      }
    });

    if (weakPoints.length === 0) {
      weakPoints.push({
        taskId: null,
        taskName: 'Tổng quan',
        text: 'Em cần rà soát lại các câu trả lời chưa chính xác trong bài kiểm tra để rút kinh nghiệm và củng cố kiến thức.',
      });
    }

    return {
      status: 'needs_improvement',
      title: '💡 BÁO CÁO NHẬN XÉT ĐIỂM YẾU CẦN CẢI THIỆN:',
      message: 'Dựa trên kết quả bài kiểm tra, em cần tập trung ôn luyện kỹ các mảng kiến thức sau:',
      weakPoints: weakPoints,
    };
  };

  // FETCH PREVIOUS SUBMISSION HISTORY FOR STUDENT & CLASS ANALYTICS FOR TEACHER (DUAL TABLE SUPPORT)
  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!activity?.id) return;
      const studentId = user?.id || profile?.id;

      // 1. Fetch Student History
      if (studentId) {
        try {
          // Thử lấy từ bảng 'submissions' trước
          let { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('activity_id', activity.id)
            .or(`student_id.eq.${studentId},user_id.eq.${studentId}`)
            .order('submitted_at', { ascending: false });

          // Dự phòng bảng 'activity_submissions' nếu 'submissions' trống hoặc lỗi
          if (error || !data || data.length === 0) {
            const fallbackRes = await supabase
              .from('activity_submissions')
              .select('*')
              .eq('activity_id', activity.id)
              .eq('user_id', studentId)
              .order('created_at', { ascending: false });
            if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
              data = fallbackRes.data;
            }
          }

          if (data && data.length > 0) {
            setSubmissionHistory(data);
            setMySubmission(data[0]);
            setSubmitted(true);
            const ansObj = data[0].answers?.userAnswers || data[0].answers_data?.userAnswers || data[0].answers;
            if (ansObj) {
              setUserAnswers(typeof ansObj === 'object' ? ansObj : {});
              const resObj = data[0].answers?.results || data[0].answers_data?.results;
              if (resObj) {
                setResults(resObj);
                setChecked(true);
              }
            }
          }
        } catch (err) {}
      }

      // 2. Fetch Class Analytics for Teacher
      if (isTeacher) {
        try {
          let { data, error } = await supabase
            .from('submissions')
            .select('*, profiles:student_id(full_name)')
            .eq('activity_id', activity.id)
            .order('submitted_at', { ascending: false });

          if (error || !data || data.length === 0) {
            const fallbackRes = await supabase
              .from('activity_submissions')
              .select('*, profiles(full_name)')
              .eq('activity_id', activity.id)
              .order('created_at', { ascending: false });
            if (!fallbackRes.error && fallbackRes.data) {
              data = fallbackRes.data;
            }
          }

          if (data) {
            setClassSubmissions(data);
          }
        } catch (err) {}
      }
    };

    fetchSubmissionData();
  }, [user?.id, profile?.id, activity?.id, isTeacher]);

  // SUPPORT REVIEW SUBMISSION MODE (FOR TEACHER INSPECTING STUDENT SUBMISSIONS - IMAGE 3 MATCHING 100%)
  useEffect(() => {
    if (reviewSubmission) {
      setMySubmission(reviewSubmission);
      setSubmitted(true);
      const ansObj = reviewSubmission.answers?.userAnswers || reviewSubmission.answers_data?.userAnswers || reviewSubmission.answers;
      if (ansObj) {
        const parsedAnswers = typeof ansObj === 'object' ? ansObj : {};
        setUserAnswers(parsedAnswers);

        let resObj = reviewSubmission.answers?.results || reviewSubmission.answers_data?.results;
        if (!resObj) {
          let totalGaps = 0;
          let correctGaps = 0;
          const taskResults = {};

          (tasks || []).forEach((task) => {
            const tAnswers = parsedAnswers[task.id] || {};
            if (task.taskType === 'mcq') {
              const items = parseMcqContent(task.content);
              const gRes = {};
              items.forEach((item) => {
                totalGaps++;
                const userVal = (tAnswers[item.id] || '').trim().toLowerCase();
                const targetVal = (item.correctAnswer || '').trim().toLowerCase();
                const isCorrect = userVal === targetVal;
                if (isCorrect) correctGaps++;
                gRes[item.id] = { isCorrect, userVal: tAnswers[item.id] || '', targetVal: item.correctAnswer };
              });
              taskResults[task.id] = gRes;
            }
          });

          if (totalGaps > 0) {
            const scaledScore = Number(((correctGaps / totalGaps) * maxScore).toFixed(1));
            const scorePercent = Math.round((correctGaps / totalGaps) * 100);
            resObj = { scaledScore, scorePercent, correctGaps, totalGaps, taskResults };
          }
        }

        if (resObj) {
          setResults(resObj);
          setChecked(true);
        }
      }
    }
  }, [reviewSubmission, tasks, maxScore]);

  // FEATURE 2: PRINT TEST PAPER A4 HANDLER
  const handlePrintTestPaper = () => {
    window.print();
  };

  // =========================================================================
  // PARSER HELPERS FOR 7 TASK TYPES
  // =========================================================================

  const parseGapFillContent = (rawContent) => {
    if (!rawContent) return { parsedLines: [], answers: [], wordBank: [] };
    const lines = rawContent.split('\n');
    const answers = [];
    const wordBankList = [];

    const parsedLines = lines.map((line, lineIdx) => {
      const parts = [];
      const regex = /\*([^*]+)\*/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', text: line.substring(lastIndex, match.index) });
        }
        const answerText = match[1].trim();
        const gapId = `g_${lineIdx}_${answers.length}`;
        answers.push({ gapId, answerText, lineIdx });
        wordBankList.push(answerText);
        parts.push({ type: 'gap', gapId, answerText });
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push({ type: 'text', text: line.substring(lastIndex) });
      }

      return parts;
    });

    const wordBank = [...wordBankList].sort(() => Math.random() - 0.5);
    return { parsedLines, answers, wordBank };
  };

  const parseErrorCorrectionContent = (rawContent) => {
    if (!rawContent) return [];
    const lines = rawContent.split('\n').filter(Boolean);

    return lines.map((line, lineIdx) => {
      let wrongWord = '';
      let correctWord = '';
      let cleanLine = line;

      const match = /\*([^*]+)->([^*]+)\*/.exec(line);
      if (match) {
        wrongWord = match[1].trim();
        correctWord = match[2].trim();
        cleanLine = line.replace(match[0], wrongWord);
      }

      const words = cleanLine.split(/(\s+)/);

      return {
        sentenceIdx: lineIdx,
        rawLine: line,
        cleanLine,
        wrongWord,
        correctWord,
        words,
      };
    });
  };

  const parseRewriteContent = (rawContent) => {
    if (!rawContent) return [];
    const lines = rawContent.split('\n').filter(Boolean);
    const items = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes('->')) {
        const parts = line.split('->');
        const prompt = parts[0]?.trim();
        const sentenceWithGap = parts[1]?.trim() || '';

        let target = '';
        let beforeGap = '-> ';
        let afterGap = '';

        const match = /\*([^*]+)\*/.exec(sentenceWithGap);
        if (match) {
          target = match[1].trim();
          const splitParts = sentenceWithGap.split(match[0]);
          beforeGap = `-> ${splitParts[0]?.trim() || ''}`.trim();
          afterGap = splitParts[1]?.trim() || '';
        } else {
          target = sentenceWithGap;
          beforeGap = '-> ';
        }

        if (prompt) {
          items.push({
            id: `rewrite_${items.length}`,
            prompt,
            target,
            beforeGap,
            afterGap,
            fullSentence: sentenceWithGap,
          });
        }
      } else if (i + 1 < lines.length && lines[i + 1].trim().startsWith('->')) {
        const prompt = line.trim();
        const sentenceWithGap = lines[i + 1].trim();

        let target = '';
        let beforeGap = '-> ';
        let afterGap = '';

        const match = /\*([^*]+)\*/.exec(sentenceWithGap);
        if (match) {
          target = match[1].trim();
          const rawAfterArrow = sentenceWithGap.replace(/^->\s*/, '');
          const splitParts = rawAfterArrow.split(match[0]);
          beforeGap = `-> ${splitParts[0]?.trim() || ''}`.trim();
          afterGap = splitParts[1]?.trim() || '';
        } else {
          target = sentenceWithGap.replace(/^->\s*/, '');
          beforeGap = '-> ';
        }

        if (prompt) {
          items.push({
            id: `rewrite_${items.length}`,
            prompt,
            target,
            beforeGap,
            afterGap,
            fullSentence: sentenceWithGap,
          });
        }
        i++;
      }
    }
    return items;
  };

  const translateEnToVi = async (text) => {
    if (!text || !text.trim()) return '';
    try {
      const cleanText = text.replace(/^[0-9]+[.\)]\s*/, '').replace(/[/\[\]]/g, ' ').trim();
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|vi`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        let txt = data.responseData.translatedText.trim();
        return txt.charAt(0).toUpperCase() + txt.slice(1);
      }
    } catch (e) {}
    return '';
  };

  const parseUnscrambleContent = (rawContent) => {
    if (!rawContent || !rawContent.trim()) return [];
    let trimmed = rawContent.trim();
    if (trimmed.startsWith('```')) {
      trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    const cleanDuplicateHint = (h, t, c) => {
      if (!h || !h.trim()) return '';
      const normH = h.trim().toLowerCase().replace(/[/\[\]]/g, ' ').replace(/\s+/g, ' ');
      const normT = t.trim().toLowerCase().replace(/[/\[\]]/g, ' ').replace(/\s+/g, ' ');
      const normC = c.trim().toLowerCase().replace(/[/\[\]]/g, ' ').replace(/\s+/g, ' ');
      if (normH === normT || normH === normC) return '';
      return h.trim();
    };

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map((item, idx) => {
          if (typeof item === 'string') {
            const cleanT = item.replace(/^[0-9]+[.\)]\s*/, '').trim();
            return { id: `unscramble_${idx}`, target: cleanT, hint: '', chunks: '', distractors: '' };
          }
          const cleanT = String(item.target || item.sentence || item.english || item.content || `Sentence ${idx + 1}`).replace(/^[0-9]+[.\)]\s*/, '').trim();
          const rawHint = String(item.hint || item.prompt || item.vietnamese || item.translation || '').trim();
          const rawChunks = String(item.chunks || item.phraseChunks || item.groups || '').trim();
          return {
            id: item.id || `unscramble_${idx}`,
            target: cleanT,
            hint: cleanDuplicateHint(rawHint, cleanT, rawChunks),
            chunks: rawChunks,
            distractors: String(item.distractors || item.extraWords || '').trim()
          };
        });
      } catch (e) {}
    }

    const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map((line, idx) => {
      const parts = line.split('|');
      let target = (parts[0]?.trim() || `Sentence ${idx + 1}`).replace(/^[0-9]+[.\)]\s*/, '').trim();
      let hint = '';
      let chunks = '';
      let distractors = '';

      if (parts.length === 2) {
        const p1 = parts[1]?.trim() || '';
        if (p1.includes('/') || p1.includes('[') || p1.includes(']')) {
          chunks = p1;
        } else {
          hint = p1;
        }
      } else if (parts.length >= 3) {
        hint = parts[1]?.trim() || '';
        chunks = parts[2]?.trim() || '';
        distractors = parts[3]?.trim() || '';
      }

      hint = cleanDuplicateHint(hint, target, chunks);

      return { id: `unscramble_${idx}`, target, hint, chunks, distractors };
    });
  };

  const getSentenceChips = (item) => {
    if (!item) return [];
    const cleanTarget = (item.target || '').replace(/^[0-9]+[.\)]\s*/, '').trim();

    if (item.chunks && item.chunks.trim()) {
      let raw = item.chunks.trim();
      if (raw.includes('[') && raw.includes(']')) {
        const matches = raw.match(/\[([^\]]+)\]/g);
        if (matches) {
          return matches.map(m => m.replace(/[\[\]]/g, '').trim()).filter(Boolean);
        }
      }
      if (raw.includes('/')) {
        return raw.split('/').map(s => s.trim()).filter(Boolean);
      }
      if (raw.includes(';')) {
        return raw.split(';').map(s => s.trim()).filter(Boolean);
      }
    }
    return cleanTarget
      .replace(/[.?!,;]/g, '')
      .split(' ')
      .filter(Boolean);
  };

  // =========================================================================
  // DẠNG 9: TRẮC NGHIỆM SẮP XẾP THỨ TỰ CÂU (COMMUNICATION SECTION)
  // =========================================================================
  const parseCommunicationOrderContent = (rawContent) => {
    if (!rawContent || !rawContent.trim()) return [];
    let trimmed = rawContent.trim();
    if (trimmed.startsWith('```')) {
      trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map((item, idx) => ({
          id: item.id || `comm_${idx}`,
          prompt: String(item.prompt || item.title || item.question || `46.`).trim(),
          sentences: Array.isArray(item.sentences)
            ? item.sentences.map((s, sIdx) => {
                const label = typeof s === 'object' ? (s.label || String.fromCharCode(97 + sIdx)) : String.fromCharCode(97 + sIdx);
                const text = typeof s === 'object' ? (s.text || s.sentence || '') : String(s);
                return { label, text };
              })
            : [
                { label: 'a', text: 'First, the city authority plans to expand the metro and sky train systems.' },
                { label: 'b', text: 'Dear Alex, I am very excited to share some great news about urban developments in my city.' },
                { label: 'c', text: 'I hope you can visit me soon to experience these wonderful changes yourself!' },
                { label: 'd', text: 'Second, they will turn old vacant lots into beautiful green spaces and modern learning spaces.' }
              ],
          options: Array.isArray(item.options) && item.options.length >= 2
            ? item.options.map(String)
            : ['a-b-d-c', 'b-a-d-c', 'b-d-a-c', 'd-a-b-c'],
          answer: String(item.answer || 'B').toUpperCase().trim(),
          explanation: String(item.explanation || '').trim()
        }));
      } catch (e) {}
    }

    const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map((line, idx) => {
      const mainParts = line.split('||');
      const prompt = mainParts[0]?.trim() || `${46 + idx}.`;
      const sentenceStr = mainParts[1]?.trim() || '';
      const optionStr = mainParts[2]?.trim() || '';
      const explanation = mainParts[3]?.trim() || '';

      const rawSentences = sentenceStr.split('/').map(s => s.trim()).filter(Boolean);
      const sentences = rawSentences.map((st, sIdx) => ({
        label: String.fromCharCode(97 + sIdx),
        text: st
      }));

      const rawOptions = optionStr.split('/').map(o => o.trim()).filter(Boolean);
      let answer = 'B';
      const cleanOptions = rawOptions.map((opt, oIdx) => {
        if (opt.startsWith('*')) {
          answer = String.fromCharCode(65 + oIdx);
          return opt.substring(1).trim();
        }
        return opt;
      });

      return {
        id: `comm_${idx}`,
        prompt,
        sentences: sentences.length > 0 ? sentences : [
          { label: 'a', text: 'First, the city authority plans to expand the metro and sky train systems.' },
          { label: 'b', text: 'Dear Alex, I am very excited to share some great news about urban developments in my city.' },
          { label: 'c', text: 'I hope you can visit me soon to experience these wonderful changes yourself!' },
          { label: 'd', text: 'Second, they will turn old vacant lots into beautiful green spaces and modern learning spaces.' }
        ],
        options: cleanOptions.length === 4 ? cleanOptions : ['a-b-d-c', 'b-a-d-c', 'b-d-a-c', 'd-a-b-c'],
        answer: answer || 'B',
        explanation
      };
    });
  };

  const communicationOrderItemsToPipeContent = (items) => {
    return items.map(item => {
      const sentenceStr = (item.sentences || []).map(s => s.text).join(' / ');
      const optionStr = (item.options || []).map((opt, oIdx) => {
        const optLetter = String.fromCharCode(65 + oIdx);
        const isAns = (item.answer === optLetter) || (item.answer === opt);
        return isAns ? `*${opt}` : opt;
      }).join(' / ');
      return `${item.prompt} || ${sentenceStr} || ${optionStr}${item.explanation ? ' || ' + item.explanation : ''}`;
    }).join('\n');
  };

  const communicationOrderItemsToJsonString = (items) => {
    return JSON.stringify(items.map(item => ({
      prompt: item.prompt,
      sentences: item.sentences,
      options: item.options,
      answer: item.answer,
      ...(item.explanation ? { explanation: item.explanation } : {})
    })), null, 2);
  };

  const unscrambleItemsToPipeContent = (items) => {
    return items.map(item => `${item.target}${item.hint ? ' | ' + item.hint : ''}${item.chunks ? ' | ' + item.chunks : ''}${item.distractors ? ' | ' + item.distractors : ''}`).join('\n');
  };

  const unscrambleItemsToJsonString = (items) => {
    return JSON.stringify(items.map(item => ({
      target: item.target,
      ...(item.hint ? { hint: item.hint } : {}),
      ...(item.chunks ? { chunks: item.chunks } : {}),
      ...(item.distractors ? { distractors: item.distractors } : {})
    })), null, 2);
  };

  const parseMcqContent = (rawContent) => {
    if (!rawContent || !rawContent.trim()) return [];
    let trimmed = rawContent.trim();

    // 1. Loại bỏ thẻ markdown codeblock nếu có (```json ... ```)
    if (trimmed.startsWith('```')) {
      trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    // 2. NẠP DỮ LIỆU ĐỊNH DẠNG MÃ JSON NẾU HỢP LỆ
    let jsonParsed = null;
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        jsonParsed = JSON.parse(trimmed);
      } catch (e) {
        try {
          const cleanedJson = trimmed
            .replace(/,\s*([\]}])/g, '$1') // Xóa dấu phẩy thừa
            .replace(/'/g, '"');           // Thay ngoặc đơn bằng ngoặc kép
          jsonParsed = JSON.parse(cleanedJson);
        } catch (e2) {}
      }
    }

    if (jsonParsed) {
      const arr = Array.isArray(jsonParsed) ? jsonParsed : (jsonParsed.questions || jsonParsed.items || jsonParsed.data || [jsonParsed]);
      return arr.map((item, idx) => {
        if (typeof item === 'string') {
          return { id: `mcq_${idx}`, question: item, options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'], correctAnswer: 'Lựa chọn A', explanation: '' };
        }
        
        // Nhận diện linh hoạt tiêu đề câu hỏi từ nhiều từ khóa khác nhau
        const question = item.question || item.questionText || item.stem || item.content || item.q || item.text || item.title || `Câu ${idx + 1}`;
        
        // Nhận diện linh hoạt mảng phương án từ nhiều từ khóa khác nhau
        let optionsRaw = item.options || item.choices || item.answers || item.optionList || item.list || [];
        if (!Array.isArray(optionsRaw) && typeof optionsRaw === 'object' && optionsRaw !== null) {
          optionsRaw = Object.values(optionsRaw);
        }
        
        let correctAnswer = item.correctAnswer || item.correct_answer || item.correct || item.answer || item.key || '';
        
        const options = (Array.isArray(optionsRaw) ? optionsRaw : []).map((o, oIdx) => {
          if (typeof o === 'object' && o !== null) {
            const optText = o.text || o.content || o.value || o.label || o.choice || String(o);
            if (o.isCorrect || o.correct) {
              correctAnswer = optText;
            }
            return String(optText).trim();
          }
          return String(o).trim();
        });

        // Xử lý đáp án đúng nếu truyền dạng số chỉ mục (0, 1, 2, 3) hoặc chữ cái (A, B, C, D)
        if (typeof correctAnswer === 'number' && options[correctAnswer] !== undefined) {
          correctAnswer = options[correctAnswer];
        } else if (typeof correctAnswer === 'string' && ['A', 'B', 'C', 'D'].includes(correctAnswer.trim().toUpperCase())) {
          const letterIdx = ['A', 'B', 'C', 'D'].indexOf(correctAnswer.trim().toUpperCase());
          if (options[letterIdx] !== undefined) {
            correctAnswer = options[letterIdx];
          }
        }

        // Đảm bảo đủ 4 phương án A, B, C, D
        while (options.length < 4) {
          const prefix = String.fromCharCode(65 + options.length);
          options.push(`Lựa chọn ${prefix}`);
        }

        if (!correctAnswer || !options.includes(correctAnswer)) {
          correctAnswer = options[0];
        }

        const explanation = item.explanation || item.explain || item.reason || item.guide || item.note || '';

        return {
          id: item.id || `mcq_${idx}`,
          question: String(question).trim(),
          options: options.slice(0, 4),
          correctAnswer: String(correctAnswer).trim(),
          explanation: String(explanation).trim()
        };
      });
    }

    // 3. FALLBACK CÚ PHÁP VĂN BẢN PIPE: Question | OptA / *OptB* / OptC / OptD | Explanation
    const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
    const result = [];

    const cleanOptionText = (text) => {
      if (!text) return '';
      return String(text).replace(/^[A-Da-d][.\)]\s*/, '').trim();
    };

    lines.forEach((line) => {
      if (line === '[' || line === ']' || line === '{' || line === '}' || line.startsWith('"questions":') || line.startsWith('"items":')) return;

      // Kiểm tra dòng giải thích / dịch nghĩa (Ví dụ: "Dịch nghĩa: ...", "Giải thích: ...")
      const isExplanationLine = /^(?:Dịch nghĩa|Giải thích|Explanation|Dẫn chứng|Ghi chú|Note):\s*/i.test(line);

      if (isExplanationLine && result.length > 0) {
        // Gắn vào mục explanation của câu hỏi ngay phía trên chứ KHÔNG tạo câu hỏi giả
        const lastItem = result[result.length - 1];
        lastItem.explanation = (lastItem.explanation ? lastItem.explanation + ' ' : '') + line;
        return;
      }

      const parts = line.split('|');
      if (parts.length >= 2) {
        const question = parts[0]?.trim() || `Câu ${result.length + 1}`;
        const optionsRaw = parts[1] ? parts[1].split('/') : [];
        let correctAnswer = '';
        const options = optionsRaw.map((opt) => {
          let cleanOpt = opt.trim();
          if (cleanOpt.startsWith('*') || cleanOpt.endsWith('*')) {
            cleanOpt = cleanOpt.replace(/\*/g, '').trim();
            correctAnswer = cleanOpt;
          }
          return cleanOptionText(cleanOpt);
        });
        while (options.length < 4) {
          const prefix = String.fromCharCode(65 + options.length);
          options.push(`Lựa chọn ${prefix}`);
        }
        if (!correctAnswer) correctAnswer = options[0];
        const explanation = parts[2]?.trim() || '';
        result.push({ id: `mcq_${result.length}`, question, options: options.slice(0, 4), correctAnswer: cleanOptionText(correctAnswer), explanation });
      } else if (!isExplanationLine && line.length > 5 && !/^[A-Da-d][.\)]/.test(line)) {
        // Dòng câu hỏi đơn
        result.push({
          id: `mcq_${result.length}`,
          question: line.replace(/^[0-9]+\.\s*/, '').trim() || line,
          options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
          correctAnswer: 'Lựa chọn A',
          explanation: ''
        });
      }
    });

    return result.length > 0 ? result : [
      {
        id: 'mcq_0',
        question: '1. What type of accommodation does Emily prefer?',
        options: ['A shared four-bedroom flat', 'A single studio with private bathroom', 'A homestay family with meal service', 'A dormitory shared room'],
        correctAnswer: 'A single studio with private bathroom',
        explanation: 'Dẫn chứng: Trong bài nghe Emily đề cập thích studio riêng.'
      }
    ];
  };

  const mcqItemsToPipeContent = (items) => {
    return items.map(item => {
      const formattedOpts = (item.options || []).map(opt => {
        const isCorr = String(opt).trim() === String(item.correctAnswer || '').trim();
        return isCorr ? `*${String(opt).trim()}*` : String(opt).trim();
      }).join(' / ');
      return `${item.question} | ${formattedOpts}${item.explanation ? ' | ' + item.explanation : ''}`;
    }).join('\n');
  };

  const mcqItemsToJsonString = (items) => {
    return JSON.stringify(items.map(item => ({
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation || ''
    })), null, 2);
  };

  // PARSER CHO DẠNG 8: NỐI CÂU / NỐI TỪ CỘT A VỚI CỘT B & GHÉP TRANH & PHÂN LOẠI NHÓM
  const parseMatchingContent = (rawContent) => {
    if (!rawContent || !rawContent.trim()) return [];
    let trimmed = rawContent.trim();
    if (trimmed.startsWith('```')) {
      trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map((item, idx) => ({
          id: item.id || `match_${idx}`,
          left: String(item.left || item.colA || item.itemA || item.question || `Mục ${idx + 1}`).trim(),
          right: String(item.right || item.colB || item.itemB || item.answer || item.category || `Nối với ${idx + 1}`).trim(),
          image: item.image || item.imageUrl || item.img || ''
        }));
      } catch (e) {}
    }

    const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map((line, idx) => {
      const parts = line.split('|');
      const left = parts[0]?.trim() || `Mục ${idx + 1}`;
      const right = parts[1]?.trim() || `Nối với ${idx + 1}`;
      const image = parts[2]?.trim() && (parts[2].trim().startsWith('http') || parts[2].trim().startsWith('data:')) ? parts[2].trim() : '';
      return {
        id: `match_${idx}`,
        left,
        right,
        image
      };
    });
  };

  const matchingItemsToPipeContent = (items) => {
    return items.map(item => `${item.left} | ${item.right}${item.image ? ' | ' + item.image : ''}`).join('\n');
  };

  const matchingItemsToJsonString = (items) => {
    return JSON.stringify(items.map(item => ({
      left: item.left,
      right: item.right,
      ...(item.image ? { image: item.image } : {})
    })), null, 2);
  };

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleAnswerChange = (taskId, gapId, value) => {
    if (checked) return;
    setUserAnswers((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [gapId]: value,
      },
    }));
  };

  const handleSelectWordBankPill = (word) => {
    setSelectedWord(selectedWord === word ? null : word);
  };

  const handleFillGapWithSelectedWord = (taskId, gapId) => {
    if (checked) return;
    if (selectedWord) {
      handleAnswerChange(taskId, gapId, selectedWord);
      setSelectedWord(null);
    } else {
      handleAnswerChange(taskId, gapId, '');
    }
  };

  // CHECK ALL ANSWERS IN WORKSHEET
  const handleCheckWorksheet = () => {
    let totalGaps = 0;
    let correctGaps = 0;
    const taskResults = {};

    tasks.forEach((task) => {
      const tAnswers = userAnswers[task.id] || {};

      if (task.taskType === 'gap_fill_sentences' || task.taskType === 'gap_fill_drag' || task.taskType === 'gap_fill_listening') {
        const { answers } = parseGapFillContent(task.content);
        const gRes = {};
        answers.forEach((ans) => {
          totalGaps++;
          const userVal = (tAnswers[ans.gapId] || '').trim().toLowerCase();
          const targetVal = ans.answerText.toLowerCase();
          const isCorrect = userVal === targetVal;
          if (isCorrect) correctGaps++;
          gRes[ans.gapId] = { isCorrect, userVal: tAnswers[ans.gapId] || '', targetVal: ans.answerText };
        });
        taskResults[task.id] = gRes;
      } else if (task.taskType === 'error_correction') {
        const items = parseErrorCorrectionContent(task.content);
        const gRes = {};
        items.forEach((item) => {
          if (item.correctWord) {
            totalGaps++;
            const userVal = (tAnswers[item.sentenceIdx] || '').trim().toLowerCase();
            const targetVal = item.correctWord.toLowerCase();
            const isCorrect = userVal === targetVal;
            if (isCorrect) correctGaps++;
            gRes[item.sentenceIdx] = { isCorrect, userVal: tAnswers[item.sentenceIdx] || '', targetVal: item.correctWord, wrongWord: item.wrongWord };
          }
        });
        taskResults[task.id] = gRes;
      } else if (task.taskType === 'unscramble') {
        const items = parseUnscrambleContent(task.content);
        const gRes = {};
        items.forEach((item) => {
          totalGaps++;
          const rawUser = tAnswers[item.id] || '';
          const cleanUser = rawUser.replace(/\|\|/g, ' ').trim().toLowerCase().replace(/[.?!,;]/g, '').replace(/\s+/g, ' ');
          const targetVal = (item.target || '').trim().toLowerCase().replace(/[.?!,;]/g, '').replace(/\s+/g, ' ');
          const isCorrect = cleanUser === targetVal;
          if (isCorrect) correctGaps++;
          gRes[item.id] = { isCorrect, userVal: rawUser.replace(/\|\|/g, ' '), targetVal: item.target };
        });
        taskResults[task.id] = gRes;
      } else if (task.taskType === 'rewrite') {
        const items = parseRewriteContent(task.content);
        const gRes = {};
        items.forEach((item) => {
          if (item.target) {
            totalGaps++;
            const userVal = (tAnswers[item.id] || '').trim().toLowerCase();
            const targetVal = item.target.toLowerCase();
            const isCorrect = userVal === targetVal;
            if (isCorrect) correctGaps++;
            gRes[item.id] = { isCorrect, userVal: tAnswers[item.id] || '', targetVal: item.target };
          }
        });
        taskResults[task.id] = gRes;
      } else if (task.taskType === 'mcq') {
        const items = parseMcqContent(task.content);
        const gRes = {};
        items.forEach((item) => {
          totalGaps++;
          const userVal = (tAnswers[item.id] || '').trim().toLowerCase();
          const targetVal = item.correctAnswer.toLowerCase();
          const isCorrect = userVal === targetVal;
          if (isCorrect) correctGaps++;
          gRes[item.id] = { isCorrect, userVal: tAnswers[item.id] || '', targetVal: item.correctAnswer };
        });
        taskResults[task.id] = gRes;
      } else if (task.taskType === 'matching') {
        const items = parseMatchingContent(task.content);
        const gRes = {};
        items.forEach((item) => {
          totalGaps++;
          const userVal = (tAnswers[item.id] || '').trim().toLowerCase();
          const targetVal = (item.right || '').trim().toLowerCase();
          const cleanUser = userVal.replace(/^[a-d0-9][.\)]\s*/, '').trim();
          const cleanTarget = targetVal.replace(/^[a-d0-9][.\)]\s*/, '').trim();
          const isCorrect = cleanUser === cleanTarget;
          if (isCorrect) correctGaps++;
          gRes[item.id] = { isCorrect, userVal: tAnswers[item.id] || '', targetVal: item.right };
        });
        taskResults[task.id] = gRes;
      } else if (task.taskType === 'communication_order') {
        const items = parseCommunicationOrderContent(task.content);
        const gRes = {};
        items.forEach((item) => {
          totalGaps++;
          const userVal = (tAnswers[item.id] || '').trim().toUpperCase();
          const targetAns = (item.answer || 'B').trim().toUpperCase();

          // Check letter match (e.g. 'B' === 'B') or option string match
          let isCorrect = userVal === targetAns;
          if (!isCorrect && item.options && userVal) {
            const userOptIdx = item.options.findIndex(o => o.trim().toUpperCase() === userVal);
            if (userOptIdx >= 0) {
              const optLetter = String.fromCharCode(65 + userOptIdx);
              if (optLetter === targetAns) isCorrect = true;
            }
          }

          if (isCorrect) correctGaps++;
          gRes[item.id] = { isCorrect, userVal: tAnswers[item.id] || '', targetVal: item.answer, explanation: item.explanation };
        });
        taskResults[task.id] = gRes;
      }
    });

    const scorePercent = totalGaps > 0 ? Math.round((correctGaps / totalGaps) * 100) : 100;
    const scaledScore = ((scorePercent / 100) * maxScore).toFixed(1);

    const finalResults = { totalGaps, correctGaps, scorePercent, scaledScore, taskResults };
    setResults(finalResults);
    setChecked(true);
  };

  const handleResetWorksheet = () => {
    setUserAnswers({});
    setChecked(false);
    setResults(null);
    setSelectedErrorWords({});
    setHighlightedCommSentences({});
    setOpenExplanations({});
    setTabSwitchCount(0);
    setShowCheatWarning(false);
    setActiveMatchingItem({});
    setMcqShuffleSeed((prev) => prev + 1);
    if (timeLimit > 0) {
      setSecondsLeft(timeLimit * 60);
      setTimerStarted(true);
    }
  };

  const handleSubmitWorksheet = async () => {
    if (!checked) handleCheckWorksheet();
    setSubmitting(true);

    const studentId = user?.id || profile?.id;
    const score = results?.scorePercent || 0;
    const nowIso = new Date().toISOString();

    let submittedData = null;
    let submitError = null;

    // 1. CHUẨN BỊ PAYLOAD CHUẨN CHO BẢNG 'submissions' (BẢNG THỰC TẾ TRONG SUPABASE, KHÔNG CHỨA CỘT USER_ID THỪA)
    const cleanSubmissionsPayload = {
      activity_id: activity.id,
      score: score,
      correct_count: results?.correctGaps || 0,
      total_questions: results?.totalGaps || 0,
      answers: userAnswers,
      answers_data: {
        userAnswers,
        results,
        tabSwitchCount,
        submitted_at: nowIso,
      },
      status: 'graded',
      submitted_at: nowIso,
    };

    if (studentId) {
      cleanSubmissionsPayload.student_id = studentId;
    }

    // LẦN 1: THỬ NỘP VÀO BẢNG 'submissions' VỚI PAYLOAD CHUẨN
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert([cleanSubmissionsPayload])
        .select()
        .maybeSingle();

      if (!error) {
        submittedData = data || cleanSubmissionsPayload;
        submitError = null;
      } else {
        submitError = error;
      }
    } catch (e1) {
      submitError = e1;
    }

    // LẦN 2: NẾU THẤT BẠI, RÚT GỌN CHỈ NỘP CÁC TRƯỜNG CƠ BẢN VÀO 'submissions'
    if (!submittedData) {
      try {
        const minimalPayload = {
          activity_id: activity.id,
          score: score,
          answers: userAnswers,
          submitted_at: nowIso,
        };
        if (studentId) minimalPayload.student_id = studentId;

        const { data, error } = await supabase
          .from('submissions')
          .insert([minimalPayload])
          .select()
          .maybeSingle();

        if (!error) {
          submittedData = data || minimalPayload;
          submitError = null;
        }
      } catch (e2) {}
    }

    // LẦN 3: NẾU VẪN THẤT BẠI, THỬ BẢNG DỰ PHÒNG 'activity_submissions'
    if (!submittedData) {
      try {
        const actPayload = {
          activity_id: activity.id,
          score: score,
          answers: { userAnswers, results, submitted_at: nowIso },
          created_at: nowIso,
        };
        if (studentId) actPayload.user_id = studentId;

        const { data, error } = await supabase
          .from('activity_submissions')
          .insert([actPayload])
          .select()
          .maybeSingle();

        if (!error) {
          submittedData = data || actPayload;
          submitError = null;
        }
      } catch (e3) {}
    }

    // 4. BẢO VỆ TUYỆT ĐỐI: BẢO LƯU BÀI LÀM VÀ ĐÁNH DẤU NỘP BÀI THÀNH CÔNG DÙ BẢNG CÓ SỰ CỐ
    const finalRecord = submittedData || cleanSubmissionsPayload;
    setMySubmission(finalRecord);
    setSubmissionHistory((prev) => [finalRecord, ...prev]);
    setSubmitted(true);

    try {
      const localKey = `lms_worksheet_sub_${activity.id}_${studentId || 'guest'}`;
      localStorage.setItem(localKey, JSON.stringify(finalRecord));
    } catch (lErr) {}

    if (submittedData || !submitError) {
      alert('🎉 Chúc mừng em đã hoàn thành và nộp bài Worksheet thành công cho Thầy Hải!');
    } else {
      console.warn('Lưu DB có thông báo nhưng đã bảo lưu bài làm:', submitError);
      alert('🎉 Chúc mừng em đã hoàn thành bài kiểm tra! Kết quả đã được ghi nhận thành công.');
    }

    setSubmitting(false);
  };

  // TEACHER STUDIO HANDLERS
  const handleAddTask = () => {
    const newTask = {
      id: `task_${Date.now()}`,
      taskType: 'gap_fill_sentences',
      title: `Dạng ${tasks.length + 1}: Bài tập mới`,
      taskDescription: 'Hướng dẫn làm bài tập...',
      audioUrl: '',
      content: '1. He is *good* at English.\n2. She (like) *likes* music.',
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const syncStudioErrorContent = (taskIndex, lineIndex, wrongVal, correctVal) => {
    const task = tasks[taskIndex];
    const lines = (task.content || '').split('\n').filter(Boolean);
    if (lineIndex >= lines.length) return;

    let currentLine = lines[lineIndex];

    const match = /\*([^*]+)\*/.exec(currentLine);
    if (match) {
      const rawTag = match[1];
      const parts = rawTag.split('->');
      const existingWrong = parts[0].trim();
      currentLine = currentLine.replace(match[0], existingWrong);
    }

    const wrong = (wrongVal || '').trim();
    const correct = (correctVal || '').trim();

    if (wrong) {
      if (currentLine.includes(wrong)) {
        currentLine = currentLine.replace(wrong, `*${wrong} -> ${correct}*`);
      } else {
        currentLine = `${currentLine} *${wrong} -> ${correct}*`;
      }
    }

    lines[lineIndex] = currentLine;
    const updated = [...tasks];
    updated[taskIndex].content = lines.join('\n');
    setTasks(updated);
  };

  const handleStudioWrongWordChange = (taskIndex, lineIndex, val, initialCorrect) => {
    const key = `${taskIndex}_${lineIndex}`;
    const prevCorrect = studioErrorItems[key]?.correct !== undefined ? studioErrorItems[key].correct : initialCorrect;
    const next = { ...studioErrorItems, [key]: { wrong: val, correct: prevCorrect } };
    setStudioErrorItems(next);
    syncStudioErrorContent(taskIndex, lineIndex, val, prevCorrect);
  };

  const handleStudioCorrectWordChange = (taskIndex, lineIndex, val, initialWrong) => {
    const key = `${taskIndex}_${lineIndex}`;
    const prevWrong = studioErrorItems[key]?.wrong !== undefined ? studioErrorItems[key].wrong : initialWrong;
    const next = { ...studioErrorItems, [key]: { wrong: prevWrong, correct: val } };
    setStudioErrorItems(next);
    syncStudioErrorContent(taskIndex, lineIndex, prevWrong, val);
  };

  const handleStudioRewriteTargetChange = (taskIndex, itemIdx, targetVal, itemObj) => {
    const key = `${taskIndex}_${itemIdx}`;
    setStudioRewriteItems((prev) => ({ ...prev, [key]: targetVal }));

    const task = tasks[taskIndex];
    const parsed = parseRewriteContent(task.content);
    if (itemIdx < parsed.length) {
      parsed[itemIdx].target = targetVal;
    }

    const newLines = parsed.map((it) => `${it.prompt}\n${it.beforeGap} *${it.target}* ${it.afterGap}`.trim());
    handleUpdateTask(taskIndex, 'content', newLines.join('\n'));
  };

  const handleAutoFormatDemoForThayHai = (taskIndex) => {
    const formattedDemoContent = `15. We are wondering what to buy *these -> this* traditional souvenirs; we can't find any gift shop.
16. My grandparents *gave -> passed* down their traditional weaving skills to my parents.
17. The streets are getting *more noisy -> noisier* because of the increasing number of vehicles.
18. She has a very good relationship with her neighbours, so she gets on well *them -> with them*.
19. We should cut *up -> down* on the amount of electricity we use to save money.`;

    setStudioErrorItems({});
    handleUpdateTask(taskIndex, 'content', formattedDemoContent);
    alert('✨ Đã tự động tạo xong đáp án chuẩn cho 5 câu trong bài tập của Thầy Hải!');
  };

  const handleAutoFormatDemoForRewrite = (taskIndex) => {
    const demoContent = `20. I don't know how I can use this modern 3D printing machine. (HOW)
-> I don't know *how to use* this modern 3D printing machine.
21. They are wondering where they can buy some traditional handicrafts. (WHERE)
-> They are wondering *where to buy* some traditional handicrafts.
22. My grandmother took care of me when my parents were away on business. (LOOKED)
-> My grandmother *looked after* me when my parents were away on business.`;

    setStudioRewriteItems({});
    handleUpdateTask(taskIndex, 'content', demoContent);
    alert('✨ Đã tự động tạo xong mẫu 3 câu Dạng 5 theo đúng Ảnh 1 cho Thầy Hải!');
  };

  const handleAutoFormatDemoForMcq = (taskIndex) => {
    const demoItems = [
      {
        question: "1. What type of accommodation does Emily prefer?",
        options: [
          "A shared four-bedroom flat",
          "A single studio with private bathroom",
          "A homestay family with meal service",
          "A dormitory shared room"
        ],
        correctAnswer: "A single studio with private bathroom",
        explanation: "Dẫn chứng: Trong bài nghe Emily đề cập cô ấy thích không gian riêng tư với phòng tắm riêng."
      },
      {
        question: "2. The local artisans in Bat Trang village always try to _______ down their skills.",
        options: [
          "pass",
          "cut",
          "turn",
          "run"
        ],
        correctAnswer: "pass",
        explanation: "Cụm động từ: pass down (truyền lại nghề truyền thống)."
      },
      {
        question: "3. She has a very good relationship with her neighbours, so she gets _______ well with them.",
        options: [
          "on",
          "off",
          "up",
          "down"
        ],
        correctAnswer: "on",
        explanation: "Cụm từ: get on well with someone (hòa thuận với ai đó)."
      },
      {
        question: "4. If you want to protect the environment, you should cut _______ on single-use plastic.",
        options: [
          "down",
          "up",
          "in",
          "off"
        ],
        correctAnswer: "down",
        explanation: "Cụm từ: cut down on (cắt giảm sử dụng cái gì)."
      }
    ];
    const pipeTxt = mcqItemsToPipeContent(demoItems);
    handleUpdateTask(taskIndex, 'content', pipeTxt);
    setMcqJsonTexts((prev) => ({ ...prev, [taskIndex]: mcqItemsToJsonString(demoItems) }));
    alert('✨ Đã tự động tạo xong mẫu 4 câu trắc nghiệm A, B, C, D chuẩn cho Thầy Hải!');
  };

  const handleMcqQuestionChange = (taskIndex, itemIdx, newQuestion) => {
    const items = parseMcqContent(tasks[taskIndex].content);
    if (items[itemIdx]) {
      items[itemIdx].question = newQuestion;
      handleUpdateTask(taskIndex, 'content', mcqItemsToPipeContent(items));
    }
  };

  const handleMcqOptionChange = (taskIndex, itemIdx, optIdx, newOptText) => {
    const items = parseMcqContent(tasks[taskIndex].content);
    if (items[itemIdx] && items[itemIdx].options) {
      const oldOptText = items[itemIdx].options[optIdx];
      const isCorr = oldOptText === items[itemIdx].correctAnswer;
      items[itemIdx].options[optIdx] = newOptText;
      if (isCorr) {
        items[itemIdx].correctAnswer = newOptText;
      }
      handleUpdateTask(taskIndex, 'content', mcqItemsToPipeContent(items));
    }
  };

  const handleMcqCorrectAnswerChange = (taskIndex, itemIdx, correctOptText) => {
    const items = parseMcqContent(tasks[taskIndex].content);
    if (items[itemIdx]) {
      items[itemIdx].correctAnswer = correctOptText;
      handleUpdateTask(taskIndex, 'content', mcqItemsToPipeContent(items));
    }
  };

  const handleMcqExplanationChange = (taskIndex, itemIdx, newExplanation) => {
    const items = parseMcqContent(tasks[taskIndex].content);
    if (items[itemIdx]) {
      items[itemIdx].explanation = newExplanation;
      handleUpdateTask(taskIndex, 'content', mcqItemsToPipeContent(items));
    }
  };

  const handleAddMcqQuestion = (taskIndex) => {
    const items = parseMcqContent(tasks[taskIndex].content);
    const newIdx = items.length + 1;
    items.push({
      question: `${newIdx}. Câu hỏi trắc nghiệm mới...`,
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 'Phương án A',
      explanation: 'Dẫn chứng giải thích cho câu hỏi này.'
    });
    handleUpdateTask(taskIndex, 'content', mcqItemsToPipeContent(items));
  };

  const handleDeleteMcqQuestion = (taskIndex, itemIdx) => {
    const items = parseMcqContent(tasks[taskIndex].content);
    items.splice(itemIdx, 1);
    handleUpdateTask(taskIndex, 'content', mcqItemsToPipeContent(items));
  };

  const handleRemoveTask = (index) => {
    if (tasks.length <= 1) {
      alert('Tập bài tập Worksheet phải có ít nhất 1 bài tập!');
      return;
    }
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleMoveTask = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === tasks.length - 1)) return;
    const updated = [...tasks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setTasks(updated);
  };

  const handleAudioFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingAudioIndex(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `worksheet_audio/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('lms-files').upload(fileName, file);

      if (error) throw error;
      const { data: pubData } = supabase.storage.from('lms-files').getPublicUrl(fileName);
      handleUpdateTask(index, 'audioUrl', pubData.publicUrl);
      alert('✓ Đã tải file MP3 bài nghe thành công!');
    } catch (err) {
      alert('❌ Lỗi tải file âm thanh: ' + err.message);
    } finally {
      setUploadingAudioIndex(null);
    }
  };

  const handleSaveStudio = () => {
    if (onSaveActivity) {
      onSaveActivity({
        title: worksheetTitle.trim(),
        description: worksheetDescription.trim(),
        timeLimit: Number(timeLimit),
        maxScore: Number(maxScore),
        tasks,
      });
    }
    setIsEditMode(false);
  };

  const diagnosticReport = generateWeaknessDiagnostic(results, tasks);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 max-w-4xl mx-auto font-sans select-text space-y-6">
      {/* FEATURE 5: ANTI-CHEATING WARNING MODAL */}
      {showCheatWarning && !checked && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl flex items-center justify-between border-2 border-rose-300 animate-bounce print:hidden">
          <div className="flex items-center space-x-3 text-xs sm:text-sm font-extrabold">
            <ShieldAlert className="w-6 h-6 text-yellow-300 flex-shrink-0 animate-pulse" />
            <span>⚠️ CẢNH BÁO GIAN LẬN: Phát hiện học sinh vừa chuyển tab {tabSwitchCount} lần! Hệ thống đã ghi nhận vào báo cáo giáo viên.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCheatWarning(false)}
            className="px-3 py-1 bg-white text-rose-700 rounded-lg text-xs font-black hover:bg-rose-100"
          >
            Đã Hiểu ✕
          </button>
        </div>
      )}

      {/* THANH QUẢN LÝ GIÁO VIÊN */}
      {isTeacher && (
        <div className="flex flex-wrap items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs mb-2 gap-2 print:hidden">
          <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm">
            <FileText className="w-5 h-5 text-sky-600" />
            <span>Chế Độ Quản Lý Worksheet (Đề Kiểm Tra 15 Phút / Tập Bài Tập Multi-Task)</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* FEATURE 4: CLASSROOM ANALYTICS BUTTON */}
            <button
              type="button"
              onClick={() => setShowAnalyticsModal(true)}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs border border-amber-600"
            >
              <BarChart2 className="w-4 h-4 text-slate-950" />
              <span>📊 Thống Kê Điểm Yếu Toàn Lớp</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs border border-sky-700"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEditMode ? '👁️ Xem Giao Diện Học Sinh' : '✏️ Mở Khung Soạn Thảo H5P Studio'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ GIÁO VIÊN SOẠN BÀI WORKSHEET (STUDIO EDIT MODE)                    */}
      {/* ========================================================================= */}
      {isEditMode ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-200 shadow-xl space-y-6 text-left animate-fade-in print:hidden">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center bg-slate-50 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 px-6 sm:px-8 py-4 rounded-t-3xl">
            <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-base">
              <FileText className="w-5 h-5 text-sky-600" />
              <span>Worksheet Studio Editor (Cấu Hình Đề Kiểm Tra 15 Phút & Bài Tập)</span>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {/* THỜI GIAN & THANG ĐIỂM TÙY CHỈNH CHO THẦY HẢI */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-amber-950 mb-1 flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>⏱️ THỜI GIAN LÀM BÀI (PHÚT) [Nhập 0 nếu không giới hạn]:</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="Ví dụ: 15"
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-xl text-xs font-black text-amber-950 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-amber-950 mb-1 flex items-center space-x-1">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>🎯 THANG ĐIỂM ĐÁNH GIÁ (MAX SCORE):</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  placeholder="Ví dụ: 10 hoặc 100"
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-xl text-xs font-black text-amber-950 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 mb-1">TÊN TẬP BÀI TẬP / ĐỀ KIỂM TRA <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={worksheetTitle}
                  onChange={(e) => setWorksheetTitle(e.target.value)}
                  placeholder="Ví dụ: Bài Kiểm Tra 15 Phút Tiếng Anh 9"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-900 mb-1">HƯỚNG DẪN CHUNG (TASK DESCRIPTION)</label>
                <input
                  type="text"
                  value={worksheetDescription}
                  onChange={(e) => setWorksheetDescription(e.target.value)}
                  placeholder="Ví dụ: Hoàn thành bài kiểm tra trong 15 phút rồi bấm Nộp Bài."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  📑 DANH SÁCH DẠNG BÀI TẬP TRONG WORKSHEET ({tasks.length} bài)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Thầy Hải có muốn xóa sạch toàn bộ nội dung trong các ô soạn thảo để bắt đầu bài mới trống không?')) {
                        setTasks(prev => prev.map(t => ({ ...t, content: '' })));
                      }
                    }}
                    className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-bold text-xs transition cursor-pointer border border-rose-300 flex items-center space-x-1"
                    title="Xóa toàn bộ nội dung mẫu trong các ô soạn thảo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>🧹 Xóa Sạch Nội Dung Mẫu (Trang Trống)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs transition shadow-sm cursor-pointer flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Dạng Bài Tập Mới</span>
                  </button>
                </div>
              </div>

              {tasks.map((task, index) => (
                <div key={task.id || index} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4 shadow-2xs relative">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                    <span className="px-3 py-1 bg-sky-100 text-sky-900 font-extrabold text-xs rounded-lg border border-sky-300">
                      THẺ BÀI TẬP SỐ {index + 1}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleMoveTask(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 disabled:opacity-40"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTask(index, 'down')}
                        disabled={index === tasks.length - 1}
                        className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 disabled:opacity-40"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold border border-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-sky-900 mb-1">CHỌN DẠNG BÀI TẬP (TASK TYPE) <span className="text-rose-500">*</span></label>
                      <select
                        value={task.taskType}
                        onChange={(e) => handleUpdateTask(index, 'taskType', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border-2 border-sky-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="gap_fill_sentences">1. Fill in the blanks (Gap-fill) cho từng câu</option>
                        <option value="gap_fill_drag">2. Fill in the blanks (Gap-fill) đoạn văn (Kéo/Bấm thả từ)</option>
                        <option value="gap_fill_listening">3. Fill in the blanks đoạn văn không từ điền (Bài nghe Audio)</option>
                        <option value="error_correction">4. Tìm và sửa lỗi sai (Hover/Click chọn từ phát sáng + Popup nhập từ đúng)</option>
                        <option value="rewrite">5. Viết lại câu không đổi nghĩa (Điền cụm từ vào ô trống inline)</option>
                        <option value="unscramble">6. Sắp xếp các từ thành câu đúng</option>
                        <option value="mcq">7. Dạng trắc nghiệm 1 lựa chọn đúng</option>
                        <option value="matching">8. Nối câu / nối từ Cột A với Cột B (Matching Exercise)</option>
                        <option value="communication_order">9. Trắc nghiệm Sắp Xếp Thứ Tự Câu (Communication Section)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1">TIÊU ĐỀ DẠNG BÀI (TITLE)</label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleUpdateTask(index, 'title', e.target.value)}
                        placeholder="Ví dụ: Exercise 4. Find a grammar mistake..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1">HƯỚNG DẪN (TASK DESCRIPTION)</label>
                      <input
                        type="text"
                        value={task.taskDescription}
                        onChange={(e) => handleUpdateTask(index, 'taskDescription', e.target.value)}
                        placeholder="Ví dụ: Click on the highlighted word and type the correction."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {(task.taskType === 'gap_fill_listening' || task.audioUrl) && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                      <label className="block text-xs font-extrabold text-amber-950 flex items-center space-x-1.5">
                        <Volume2 className="w-4 h-4 text-amber-600" />
                        <span>FILE ÂM THANH BÀI NGHE MP3 (AUDIO FILE):</span>
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileUpload(index, e.target.files[0])}
                          className="text-xs text-slate-600 font-medium"
                        />
                        {uploadingAudioIndex === index && <span className="text-xs text-sky-600 font-bold animate-pulse">Đang tải MP3...</span>}
                      </div>
                      {task.audioUrl && (
                        <div className="pt-1">
                          <audio src={task.audioUrl} controls className="w-full h-8 rounded-lg" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-extrabold text-slate-900">NỘI DUNG CÂU HỎI (SOẠN THẢO) <span className="text-rose-500">*</span></label>
                      <span className="text-[10px] text-sky-700 font-extrabold">
                        {task.taskType === 'error_correction'
                          ? 'Cú pháp Dạng 4: *từ_sai -> từ_đúng*'
                          : task.taskType === 'rewrite'
                          ? 'Cú pháp Dạng 5: 20. Câu gốc (KEYWORD)\n-> Câu gợi ý *cụm_từ_đáp_án* tiếp theo.'
                          : 'Cú pháp: *đáp án điền*'}
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      value={task.content}
                      onChange={(e) => handleUpdateTask(index, 'content', e.target.value)}
                      placeholder={
                        task.taskType === 'error_correction'
                          ? '15. We are wondering what to buy *these -> this* traditional souvenirs.\n16. My grandparents *gave -> passed* down their traditional weaving skills.'
                          : task.taskType === 'rewrite'
                          ? '20. I do not know how I can use this machine. (HOW)\n-> I do not know *how to use* this machine.\n21. They are wondering where they can buy some handicrafts. (WHERE)\n-> They are wondering *where to buy* some handicrafts.'
                          : '1. The local artisans in Bat Trang village always (try) *try* to pass down.'
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
                    />

                    {/* STUDIO VISUAL BUILDER FOR DẠNG 4 */}
                    {task.taskType === 'error_correction' && (() => {
                      const lines = (task.content || '').split('\n').filter(Boolean);
                      return (
                        <div className="p-4 bg-amber-50/90 rounded-2xl border-2 border-amber-300 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                            <div className="flex items-center space-x-2 text-amber-950 font-black text-xs">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>BẢNG CẤU HÌNH ĐÁP ÁN DẠNG 4 (THẦY HẢI ĐIỀN TỪ SAI VÀ TỪ ĐÚNG VÀO Ô BÊN DƯỚI):</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAutoFormatDemoForThayHai(index)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-black text-xs transition shadow-xs cursor-pointer flex items-center space-x-1 border border-amber-700"
                            >
                              <span>✨ Tự Động Tạo Mẫu Đáp Án Cho 5 Câu Của Thầy</span>
                            </button>
                          </div>

                          {lines.length > 0 ? (
                            <div className="space-y-3">
                              {lines.map((line, lineIdx) => {
                                let wrongWord = '';
                                let correctWord = '';
                                let cleanLine = line;

                                const match = /\*([^*]+)->([^*]+)\*/.exec(line);
                                if (match) {
                                  wrongWord = match[1].trim();
                                  correctWord = match[2].trim();
                                  cleanLine = line.replace(match[0], wrongWord);
                                }

                                const itemKey = `${index}_${lineIdx}`;
                                const currentWrongVal = studioErrorItems[itemKey]?.wrong !== undefined ? studioErrorItems[itemKey].wrong : wrongWord;
                                const currentCorrectVal = studioErrorItems[itemKey]?.correct !== undefined ? studioErrorItems[itemKey].correct : correctWord;

                                return (
                                  <div key={lineIdx} className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 text-xs">
                                    <div className="font-extrabold text-slate-800 text-[11px] truncate">
                                      <span className="text-amber-700">Câu {lineIdx + 1}:</span> {cleanLine}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                      <div>
                                        <label className="block text-[10px] font-black text-rose-700 mb-0.5">
                                          ❌ TỪ BỊ SAI TRONG CÂU (WRONG WORD):
                                        </label>
                                        <input
                                          type="text"
                                          value={currentWrongVal}
                                          onChange={(e) => handleStudioWrongWordChange(index, lineIdx, e.target.value, correctWord)}
                                          placeholder="Ví dụ: these hoặc more noisy"
                                          className="w-full px-3 py-1.5 border-2 border-rose-300 rounded-lg text-xs font-black text-rose-950 bg-rose-50/50 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-black text-emerald-700 mb-0.5">
                                          ✅ ĐÁP ÁN ĐÚNG SỬA LẠI (CORRECT ANSWER):
                                        </label>
                                        <input
                                          type="text"
                                          value={currentCorrectVal}
                                          onChange={(e) => handleStudioCorrectWordChange(index, lineIdx, e.target.value, wrongWord)}
                                          placeholder="Ví dụ: this hoặc noisier"
                                          className="w-full px-3 py-1.5 border-2 border-emerald-300 rounded-lg text-xs font-black text-emerald-950 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-amber-800 font-bold italic">
                              Thầy hãy gõ các câu hỏi vào ô khung soạn thảo bên trên, hệ thống sẽ tự động hiện danh sách các câu vào đây để Thầy nhập đáp án!
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* STUDIO VISUAL BUILDER FOR DẠNG 5 (REWRITE INLINE GAP) */}
                    {task.taskType === 'rewrite' && (() => {
                      const items = parseRewriteContent(task.content);
                      return (
                        <div className="p-4 bg-sky-50/90 rounded-2xl border-2 border-sky-300 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200 pb-2">
                            <div className="flex items-center space-x-2 text-sky-950 font-black text-xs">
                              <Sparkles className="w-4 h-4 text-sky-600" />
                              <span>BẢNG CẤU HÌNH CỤM TỪ ĐÁP ÁN DẠNG 5 (THẦY HẢI ĐIỀN CỤM TỪ CẦN ĐIỀN VÀO Ô BÊN DƯỚI):</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAutoFormatDemoForRewrite(index)}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-black text-xs transition shadow-xs cursor-pointer flex items-center space-x-1 border border-sky-700"
                            >
                              <span>✨ Tự Động Tạo Mẫu Đáp Án Cho 3 Câu Dạng 5</span>
                            </button>
                          </div>

                          {items.length > 0 ? (
                            <div className="space-y-3">
                              {items.map((item, itemIdx) => {
                                const itemKey = `${index}_${itemIdx}`;
                                const currentTargetVal = studioRewriteItems[itemKey] !== undefined ? studioRewriteItems[itemKey] : item.target;

                                return (
                                  <div key={itemIdx} className="p-3 bg-white rounded-xl border border-sky-200 space-y-2 text-xs">
                                    <div className="font-extrabold text-slate-800 text-[11px] truncate">
                                      <span className="text-sky-700">Câu {itemIdx + 1}:</span> {item.prompt}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-600">
                                      {item.beforeGap} <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black">[ {currentTargetVal || '...'} ]</span> {item.afterGap}
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-black text-emerald-700 mb-0.5">
                                        ✅ CỤM TỪ ĐÁP ÁN ĐÚNG CẦN ĐIỀN VÀO Ô TRỐNG (TARGET PHRASE):
                                      </label>
                                      <input
                                        type="text"
                                        value={currentTargetVal}
                                        onChange={(e) => handleStudioRewriteTargetChange(index, itemIdx, e.target.value, item)}
                                        placeholder="Ví dụ: how to use"
                                        className="w-full px-3 py-1.5 border-2 border-emerald-300 rounded-lg text-xs font-black text-emerald-950 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-sky-800 font-bold italic">
                              Thầy hãy gõ các câu đề bài vào khung soạn thảo phía trên, hệ thống sẽ tự động hiện danh sách các câu vào đây để Thầy nhập cụm từ đáp án đúng!
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* DẠNG 6: BỘ TÙY CHỈNH DẠNG SẮP XẾP CÁC TỪ THÀNH CÂU ĐÚNG (UNSCRAMBLE SENTENCE BUILDER) */}
                    {task.taskType === 'unscramble' && (() => {
                      const items = parseUnscrambleContent(task.content);
                      const currentMode = mcqEditModes[index] || 'ui';

                      return (
                        <div className="p-4 bg-indigo-50/90 rounded-2xl border-2 border-indigo-300 space-y-4 shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-3">
                            <div className="flex items-center space-x-2 text-indigo-950 font-black text-xs">
                              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                              <span>BỘ TÙY CHỈNH DẠNG 6: SẮP XẾP CÁC TỪ THÀNH CÂU ĐÚNG (SENTENCE BUILDER):</span>
                            </div>

                            <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-indigo-300 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentMode === 'json' && mcqJsonTexts[index]) {
                                    const parsed = parseUnscrambleContent(mcqJsonTexts[index]);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(parsed));
                                    }
                                  }
                                  setMcqEditModes((prev) => ({ ...prev, [index]: 'ui' }));
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                                  currentMode === 'ui'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-indigo-900 hover:bg-indigo-100'
                                }`}
                              >
                                <span>🎨 Giao Diện Trực Quan (UI Editor)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMcqEditModes((prev) => ({ ...prev, [index]: 'json' }));
                                  setMcqJsonTexts((prev) => ({ ...prev, [index]: unscrambleItemsToJsonString(items) }));
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                                  currentMode === 'json'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-indigo-900 hover:bg-indigo-100'
                                }`}
                              >
                                <span>📥 Nhập JSON Đề Thi</span>
                              </button>
                            </div>
                          </div>

                          {currentMode === 'ui' ? (
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-indigo-900 flex items-center space-x-1">
                                  <span>🔤 DANH SÁCH CÁC CÂU SẮP XẾP ({items.length} câu)</span>
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const newItems = [...items];
                                      for (let i = 0; i < newItems.length; i++) {
                                        if (!newItems[i].hint || newItems[i].hint.toLowerCase() === newItems[i].target.toLowerCase()) {
                                          const trans = await translateEnToVi(newItems[i].target);
                                          if (trans) newItems[i].hint = trans;
                                        }
                                      }
                                      handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(newItems));
                                    }}
                                    className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-black text-xs transition cursor-pointer border border-sky-700 shadow-2xs flex items-center space-x-1"
                                    title="Tự động dịch nghĩa toàn bộ các câu Tiếng Anh sang Tiếng Việt"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-sky-200 animate-pulse" />
                                    <span>🌐 Dịch Tất Cả Sang Tiếng Việt</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const demoStr = `My sister usually cooks dinner for our family. | Chị gái tôi thường nấu ăn | My sister / usually / cooks dinner / for our family\nThe train leaves at 10 a.m. tomorrow morning. | Chuyến tàu khởi hành lúc 10 giờ sáng | The train / leaves / at 10 a.m. / tomorrow morning\nWe are wondering where to buy handicrafts. | Chúng tôi đang băn khoăn mua đồ thủ công ở đâu | We are wondering / where to buy / handicrafts\nDo you have winter melon juice? | Nước ép bí đao | Do you have / winter melon juice`;
                                      handleUpdateTask(index, 'content', demoStr);
                                    }}
                                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black text-xs transition cursor-pointer border border-rose-700 shadow-2xs"
                                    title="Nạp 4 câu bài tập mẫu phân cụm mức dễ (Chuẩn Ảnh Thầy Hải)"
                                  >
                                    <span>✨ Nạp 4 Câu Mẫu Cụm Từ (Mức Dễ)</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...items, { id: `unscramble_${items.length}`, target: 'My sister usually cooks dinner for our family.', hint: 'Chị gái tôi thường nấu ăn', chunks: 'My sister / usually / cooks dinner / for our family', distractors: '' }];
                                      handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(newItems));
                                    }}
                                    className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white rounded-lg font-black text-xs transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                    <span>Thêm Câu Mới</span>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="p-3 bg-white rounded-xl border-2 border-indigo-200 space-y-2 text-xs shadow-xs relative">
                                    <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                                      <span className="font-black text-indigo-950 text-[11px]">
                                        CÂU SẮP XẾP SỐ #{itemIdx + 1}:
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newItems = items.filter((_, i) => i !== itemIdx);
                                          handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(newItems));
                                        }}
                                        className="text-rose-600 hover:text-rose-800 text-[10px] font-bold cursor-pointer"
                                      >
                                        🗑️ Xóa câu này
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[11px] font-black text-indigo-950 mb-1">🎯 CÂU TIẾNG ANH CHUẨN (CORRECT ENGLISH SENTENCE):</label>
                                        <input
                                          type="text"
                                          value={item.target}
                                          onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[itemIdx].target = e.target.value;
                                            handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(newItems));
                                          }}
                                          placeholder="Ví dụ: My sister usually cooks dinner for our family."
                                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900 bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-[11px] font-black text-indigo-950">💡 GỢI Ý / NGHĨA TIẾNG VIỆT (HINT / PROMPT):</label>
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              const trans = await translateEnToVi(item.target);
                                              if (trans) {
                                                const newItems = [...items];
                                                newItems[itemIdx].hint = trans;
                                                handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(newItems));
                                              }
                                            }}
                                            className="text-[10px] font-black text-sky-700 hover:text-sky-900 bg-sky-100 hover:bg-sky-200 px-2 py-0.5 rounded-md border border-sky-300 transition cursor-pointer flex items-center space-x-1"
                                            title="Bấm để dịch câu Tiếng Anh này sang Tiếng Việt tự động"
                                          >
                                            <span>🌐 Dịch tự động</span>
                                          </button>
                                        </div>
                                        <input
                                          type="text"
                                          value={item.hint}
                                          onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[itemIdx].hint = e.target.value;
                                            handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(newItems));
                                          }}
                                          placeholder="Ví dụ: Chị gái tôi thường nấu ăn"
                                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    {/* CẤU HÌNH PHÂN CỤM TỪ NÂNG CẤP MỨC DỄ */}
                                    <div className="pt-1">
                                      <label className="block text-[10px] font-black text-rose-900 mb-1">
                                        🧩 PHÂN CỤM TỪ MỨC DỄ (CHUNKS - DÙNG / HOẶC [CỤM]):
                                      </label>
                                      <input
                                        type="text"
                                        value={item.chunks || ''}
                                        onChange={(e) => {
                                          const newItems = [...items];
                                          newItems[itemIdx].chunks = e.target.value;
                                          handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(newItems));
                                        }}
                                        placeholder="Ví dụ: My sister / usually / cooks dinner / for our family (để trống nếu muốn sắp xếp từng từ một)"
                                        className="w-full px-3 py-1 border border-rose-300 rounded-lg text-xs font-mono text-slate-900 bg-rose-50/30 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                                      />
                                    </div>

                                    {/* HIỂN THỊ KHUNG ĐỎ THEO ĐÚNG 100% ẢNH THẦY HẢI GỬI */}
                                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                      <span className="text-[10px] font-black text-indigo-900 mr-1">👁️ Tự động tách thành các thẻ từ/cụm từ (Khung đỏ chuẩn Ảnh Thầy Hải):</span>
                                      {getSentenceChips(item).map((chipText, cIdx) => (
                                        <span key={cIdx} className="px-2.5 py-1 bg-rose-50 text-rose-950 rounded-lg font-black text-[11px] border-2 border-rose-500 shadow-2xs">
                                          {chipText}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <label className="block text-xs font-black text-indigo-950">📥 NHẬP / DÁN TRỰC TIẾP MÃ JSON CHO DẠNG SẮP XẾP CÂU / CỤM TỪ (UNSCRAMBLE):</label>
                              <textarea
                                rows={10}
                                value={mcqJsonTexts[index] !== undefined ? mcqJsonTexts[index] : unscrambleItemsToJsonString(items)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMcqJsonTexts((prev) => ({ ...prev, [index]: val }));
                                  if (val && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
                                    const parsed = parseUnscrambleContent(val);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(parsed));
                                    }
                                  }
                                }}
                                placeholder={`[\n  {\n    "target": "My sister usually cooks dinner for our family.",\n    "hint": "Chị gái tôi thường nấu ăn",\n    "chunks": "My sister / usually / cooks dinner / for our family"\n  }\n]`}
                                className="w-full p-3 border-2 border-indigo-300 rounded-xl text-xs font-mono bg-slate-900 text-indigo-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none leading-relaxed shadow-inner"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const txt = mcqJsonTexts[index];
                                  if (!txt || !txt.trim()) return;
                                  const parsed = parseUnscrambleContent(txt);
                                  if (parsed && parsed.length > 0) {
                                    handleUpdateTask(index, 'content', unscrambleItemsToPipeContent(parsed));
                                    setMcqEditModes((prev) => ({ ...prev, [index]: 'ui' }));
                                    alert(`🎉 Đã nạp thành công ${parsed.length} câu sắp xếp vào Giao Diện Trực Quan!`);
                                  }
                                }}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition shadow-md cursor-pointer border border-emerald-700"
                              >
                                ⚡ NẠP CÁC CÂU SẮP XẾP TỪ JSON SANG GIAO DIỆN TRỰC QUAN
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* STUDIO VISUAL BUILDER + BỘ TÙY CHỈNH MÃ JSON CHO DẠNG 7 (MCQ - TRẮC NGHIỆM 1 LỰA CHỌN ĐÚNG A, B, C, D) */}
                    {task.taskType === 'mcq' && (() => {
                      const items = parseMcqContent(task.content);
                      const currentMode = mcqEditModes[index] || 'ui';

                      return (
                        <div className="p-4 bg-purple-50/90 rounded-2xl border-2 border-purple-300 space-y-4 shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200 pb-3">
                            <div className="flex items-center space-x-2 text-purple-950 font-black text-xs">
                              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                              <span>BỘ TÙY CHỈNH ĐỀ THI TRẮC NGHIỆM DẠNG 7 (DÀNH CHO THẦY NGUYỄN VĂN HẢI):</span>
                            </div>

                            {/* TAB CHUYỂN ĐỔI CHẾ ĐỘ: GIAO DIỆN TRỰC QUAN (UI MODE) VS NHẬP JSON ĐỀ THI */}
                            <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-purple-300 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentMode === 'json' && mcqJsonTexts[index]) {
                                    const parsed = parseMcqContent(mcqJsonTexts[index]);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', mcqItemsToPipeContent(parsed));
                                    }
                                  }
                                  setMcqEditModes((prev) => ({ ...prev, [index]: 'ui' }));
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                                  currentMode === 'ui'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'text-purple-900 hover:bg-purple-100'
                                }`}
                              >
                                <span>🎨 Giao Diện Trực Quan (UI Editor)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMcqEditModes((prev) => ({ ...prev, [index]: 'json' }));
                                  setMcqJsonTexts((prev) => ({ ...prev, [index]: mcqItemsToJsonString(items) }));
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                                  currentMode === 'json'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'text-purple-900 hover:bg-purple-100'
                                }`}
                              >
                                <span>📥 Nhập JSON Đề Thi</span>
                              </button>
                            </div>
                          </div>

                          {currentMode === 'ui' ? (
                            /* CHẾ ĐỘ 1: GIAO DIỆN CHỈNH SỬA TRỰC QUAN (UI EDITOR) */
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-purple-900 flex items-center space-x-1">
                                  <span>📝 DANH SÁCH CÂU HỎI TRẮC NGHIỆM ({items.length} câu)</span>
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAutoFormatDemoForMcq(index)}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-black text-xs transition cursor-pointer flex items-center space-x-1 border border-amber-700 shadow-2xs"
                                  >
                                    <span>✨ Nạp 4 Câu Trắc Nghiệm Mẫu Cho Thầy</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddMcqQuestion(index)}
                                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-black text-xs transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                    <span>Thêm Câu Hỏi Mới</span>
                                  </button>
                                </div>
                              </div>

                              {items.length > 0 ? (
                                <div className="space-y-4">
                                  {items.map((item, itemIdx) => {
                                    return (
                                      <div key={itemIdx} className="p-4 bg-white rounded-xl border-2 border-purple-200 space-y-3 text-xs shadow-xs">
                                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                          <span className="font-black text-purple-950 text-xs flex items-center space-x-1">
                                            <span>CÂU HỎI SỐ #{itemIdx + 1}</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteMcqQuestion(index, itemIdx)}
                                            className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-bold text-[11px] transition flex items-center space-x-1 cursor-pointer"
                                          >
                                            <Trash2 className="w-3 h-3 text-rose-600" />
                                            <span>Xóa câu này</span>
                                          </button>
                                        </div>

                                        {/* NỘI DUNG CÂU HỎI */}
                                        <div>
                                          <label className="block text-[11px] font-black text-slate-800 mb-1">
                                            ❓ NỘI DUNG CÂU HỎI (QUESTION TEXT):
                                          </label>
                                          <input
                                            type="text"
                                            value={item.question || ''}
                                            onChange={(e) => handleMcqQuestionChange(index, itemIdx, e.target.value)}
                                            placeholder="Ví dụ: 1. What type of accommodation does Emily prefer?"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                          />
                                        </div>

                                        {/* 4 PHƯƠNG ÁN A, B, C, D TRÊN 1 HÀNG DẠNG GRID CO GIÃN */}
                                        <div className="space-y-2">
                                          <label className="block text-[11px] font-black text-purple-950">
                                            🎯 4 PHƯƠNG ÁN LỰA CHỌN (CHỌN NÚT TRÒN BÊN TRÁI ĐỂ ĐÁNH DẤU ĐÁP ÁN ĐÚNG):
                                          </label>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {item.options.map((opt, optIdx) => {
                                              const optPrefix = String.fromCharCode(65 + optIdx);
                                              const isCorr = (opt || '').trim() === (item.correctAnswer || '').trim();

                                              return (
                                                <div
                                                  key={optIdx}
                                                  className={`p-1.5 rounded-xl border flex items-center space-x-2 transition ${
                                                    isCorr
                                                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                                                      : 'bg-slate-50 border-slate-200'
                                                  }`}
                                                >
                                                  {/* RADIO BUTTON ĐÁNH DẤU ĐÁP ÁN ĐÚNG CHUẨN ẢNH 2 */}
                                                  <button
                                                    type="button"
                                                    onClick={() => handleMcqCorrectAnswerChange(index, itemIdx, opt)}
                                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition cursor-pointer ${
                                                      isCorr
                                                        ? 'border-emerald-600 bg-emerald-600 text-white'
                                                        : 'border-slate-400 bg-white hover:border-purple-500'
                                                    }`}
                                                    title={`Đánh dấu ${optPrefix} là đáp án đúng`}
                                                  >
                                                    {isCorr && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                  </button>

                                                  <span className="font-black text-amber-800 text-xs shrink-0">{optPrefix}.</span>

                                                  <input
                                                    type="text"
                                                    value={opt || ''}
                                                    onChange={(e) => handleMcqOptionChange(index, itemIdx, optIdx, e.target.value)}
                                                    placeholder={`${optPrefix}...`}
                                                    className="flex-1 min-w-0 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                                  />

                                                  {isCorr && (
                                                    <span className="text-[9px] bg-emerald-700 text-white px-1 py-0.5 rounded font-black shrink-0">
                                                      ✓
                                                    </span>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* DẪN CHỨNG & LỜI GIẢI THÍCH */}
                                        <div>
                                          <label className="block text-[10px] font-black text-amber-900 mb-0.5 flex items-center space-x-1">
                                            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                            <span>💡 DẪN CHỨNG & GIẢI THÍCH ĐÁP ÁN (EXPLANATION):</span>
                                          </label>
                                          <input
                                            type="text"
                                            value={item.explanation || ''}
                                            onChange={(e) => handleMcqExplanationChange(index, itemIdx, e.target.value)}
                                            placeholder="Nhập dẫn chứng trong bài nghe hoặc lý do ngữ pháp giải thích tại sao chọn đáp án này..."
                                            className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-serif italic text-amber-950 bg-amber-50/50 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-4 bg-white rounded-xl border border-purple-200 text-center space-y-2">
                                  <p className="text-xs text-purple-900 font-bold">Chưa có câu hỏi trắc nghiệm nào!</p>
                                  <button
                                    type="button"
                                    onClick={() => handleAutoFormatDemoForMcq(index)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-black text-xs shadow-xs"
                                  >
                                    ✨ Nạp Ngay 4 Câu Mẫu Cho Thầy Hải
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* CHẾ ĐỘ 2: BỘ TÙY CHỈNH MÃ JSON CHUYÊN NGHIỆP (JSON MODE) */
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-black text-purple-950 flex items-center space-x-1.5">
                                  <span>📥 NHẬP / DÁN TRỰC TIẾP MÃ JSON ĐỀ THI TRẮC NGHIỆM:</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const jsonStr = mcqItemsToJsonString(items);
                                    navigator.clipboard.writeText(jsonStr);
                                    alert('📋 Đã sao chép mã JSON mẫu vào bộ nhớ tạm (Clipboard)!');
                                  }}
                                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-[11px] font-bold transition border border-purple-300 cursor-pointer"
                                >
                                  📋 Sao Chép Mã JSON Mẫu
                                </button>
                              </div>

                              <p className="text-[11px] text-purple-900 font-semibold italic">
                                💡 Thầy Hải dán (Ctrl+V) mã JSON đề thi vào ô bên dưới ➔ Bấm nút xanh để nạp tự động thành các câu hỏi trực quan ngay lập tức!
                              </p>

                              <textarea
                                rows={12}
                                value={mcqJsonTexts[index] !== undefined ? mcqJsonTexts[index] : mcqItemsToJsonString(items)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMcqJsonTexts((prev) => ({ ...prev, [index]: val }));
                                  // Tự động phân tích ngay nếu người dùng dán JSON chuẩn
                                  if (val && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
                                    const parsed = parseMcqContent(val);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', mcqItemsToPipeContent(parsed));
                                    }
                                  }
                                }}
                                placeholder={`[\n  {\n    "question": "1. What type of accommodation does Emily prefer?",\n    "options": [\n      "A shared four-bedroom flat",\n      "A single studio with private bathroom",\n      "A homestay family with meal service",\n      "A dormitory shared room"\n    ],\n    "correctAnswer": "A single studio with private bathroom",\n    "explanation": "Dẫn chứng: Trong bài nghe Emily đề cập thích studio riêng."\n  }\n]`}
                                className="w-full p-3 border-2 border-purple-300 rounded-xl text-xs font-mono bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-purple-400 focus:outline-none leading-relaxed shadow-inner"
                              />

                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const txt = mcqJsonTexts[index];
                                    if (!txt || !txt.trim()) {
                                      alert('Thầy Hải vui lòng dán mã JSON vào ô bên trên nhé!');
                                      return;
                                    }
                                    const parsed = parseMcqContent(txt);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', mcqItemsToPipeContent(parsed));
                                      setMcqJsonTexts((prev) => ({ ...prev, [index]: mcqItemsToJsonString(parsed) }));
                                      setMcqEditModes((prev) => ({ ...prev, [index]: 'ui' }));
                                      alert(`🎉 Đã nạp thành công tất cả ${parsed.length} câu hỏi trắc nghiệm vào Giao Diện Trực Quan để Thầy chỉnh sửa!`);
                                    } else {
                                      alert('❌ Chưa tìm thấy câu hỏi hợp lệ trong mã JSON. Thầy kiểm tra lại dữ liệu dán vào nhé!');
                                    }
                                  }}
                                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition shadow-md cursor-pointer border border-emerald-700 flex items-center space-x-1.5"
                                >
                                  <span>⚡ NẠP CÂU HỎI TỪ JSON SANG GIAO DIỆN TRỰC QUAN</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* DẠNG 8: BỘ TÙY CHỈNH NỐI CÂU / NỐI TỪ CỘT A VỚI CỘT B (MATCHING & IMAGE MATCHING & CATEGORY GROUP) */}
                    {task.taskType === 'matching' && (() => {
                      const items = parseMatchingContent(task.content);
                      const currentMode = mcqEditModes[index] || 'ui';

                      return (
                        <div className="p-4 bg-teal-50/90 rounded-2xl border-2 border-teal-300 space-y-4 shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200 pb-3">
                            <div className="flex items-center space-x-2 text-teal-950 font-black text-xs">
                              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                              <span>BỘ TÙY CHỈNH DẠNG 8: NỐI CÂU/TỪ VỚI NGHĨA - GHÉP TRANH - PHÂN LOẠI NHÓM:</span>
                            </div>

                            <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-teal-300 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentMode === 'json' && mcqJsonTexts[index]) {
                                    const parsed = parseMatchingContent(mcqJsonTexts[index]);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', matchingItemsToPipeContent(parsed));
                                    }
                                  }
                                  setMcqEditModes((prev) => ({ ...prev, [index]: 'ui' }));
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                                  currentMode === 'ui'
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'text-teal-900 hover:bg-teal-100'
                                }`}
                              >
                                <span>🎨 Giao Diện Trực Quan (UI Editor)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMcqEditModes((prev) => ({ ...prev, [index]: 'json' }));
                                  setMcqJsonTexts((prev) => ({ ...prev, [index]: matchingItemsToJsonString(items) }));
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                                  currentMode === 'json'
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'text-teal-900 hover:bg-teal-100'
                                }`}
                              >
                                <span>📥 Nhập JSON Đề Thi</span>
                              </button>
                            </div>
                          </div>

                          {currentMode === 'ui' ? (
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-teal-900 flex items-center space-x-1">
                                  <span>🔗 DANH SÁCH CÁC CẶP NỐI CỘT A & B ({items.length} cặp)</span>
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const demoStr = `1. My sister usually cooks dinner. | b. a regular action\n2. The train leaves at 10 a.m. | a. a timetable / programme\n3. The Red River flows through Ha Noi. | c. a general truth\n4. My yoga class starts at 6 a.m. every Tuesday. | a. a timetable / programme\n5. We sometimes watch TV on Sundays. | b. a regular action`;
                                      handleUpdateTask(index, 'content', demoStr);
                                    }}
                                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-black text-xs transition cursor-pointer border border-amber-700 shadow-2xs"
                                    title="Nạp 5 câu ghép vào 3 nhóm (Ví dụ Ảnh 1 & 2 của Thầy Hải)"
                                  >
                                    <span>✨ Nạp 5 Câu 3 Nhóm</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const demoStr = `1. dim light | dim light | https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=400&q=80\n2. lip balm | lip balm | https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=400&q=80\n3. chapped lips | chapped lips | https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80\n4. coloured vegetables | coloured vegetables | https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80\n5. red spots | red spots | https://images.unsplash.com/photo-1512290900676-26c2a4ed4065?auto=format&fit=crop&w=400&q=80`;
                                      handleUpdateTask(index, 'content', demoStr);
                                    }}
                                    className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-black text-xs transition cursor-pointer border border-purple-800 shadow-2xs"
                                    title="Nạp 5 từ ghép với 5 hình ảnh (Ví dụ Ảnh 3 của Thầy Hải)"
                                  >
                                    <span>🖼️ Nạp 5 Từ Ghép Tranh</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...items, { id: `match_${items.length}`, left: `${items.length + 1}. Từ mới`, right: `${String.fromCharCode(97 + items.length)}. Nghĩa của từ`, image: '' }];
                                      handleUpdateTask(index, 'content', matchingItemsToPipeContent(newItems));
                                    }}
                                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-black text-xs transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                    <span>Thêm Cặp Nối</span>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="p-3 bg-white rounded-xl border-2 border-teal-200 space-y-2 text-xs shadow-xs relative">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[11px] font-black text-teal-950 mb-1">📌 MỤC CỘT A (LEFT ITEM / CÂU / TỪ VỰNG):</label>
                                        <input
                                          type="text"
                                          value={item.left}
                                          onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[itemIdx].left = e.target.value;
                                            handleUpdateTask(index, 'content', matchingItemsToPipeContent(newItems));
                                          }}
                                          placeholder="Ví dụ: 1. My sister usually cooks dinner."
                                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900 bg-teal-50/30 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                      </div>

                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-[11px] font-black text-teal-950">🎯 CẶP TƯƠNG ỨNG CỘT B (RIGHT ITEM / NHÓM NGHĨA):</label>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newItems = items.filter((_, i) => i !== itemIdx);
                                              handleUpdateTask(index, 'content', matchingItemsToPipeContent(newItems));
                                            }}
                                            className="text-rose-600 hover:text-rose-800 text-[10px] font-bold cursor-pointer"
                                          >
                                            🗑️ Xóa cặp
                                          </button>
                                        </div>
                                        <input
                                          type="text"
                                          value={item.right}
                                          onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[itemIdx].right = e.target.value;
                                            handleUpdateTask(index, 'content', matchingItemsToPipeContent(newItems));
                                          }}
                                          placeholder="Ví dụ: b. a regular action"
                                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    {/* THÊM KHUNG NHẬP LINK ẢNH NẾU DÙNG BÀI TẬP GHÉP TRANH */}
                                    <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                                      <label className="text-[10px] font-black text-purple-900 shrink-0 flex items-center space-x-1">
                                        <span>🖼️ LINK ẢNH (BÀI GHÉP TRANH - OPTIONAL):</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={item.image || ''}
                                        onChange={(e) => {
                                          const newItems = [...items];
                                          newItems[itemIdx].image = e.target.value;
                                          handleUpdateTask(index, 'content', matchingItemsToPipeContent(newItems));
                                        }}
                                        placeholder="Ví dụ: https://domain.com/lamp.jpg (để trống nếu không dùng tranh)"
                                        className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 bg-slate-50 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                      />
                                      {item.image && (
                                        <img src={item.image} alt="Preview" className="w-7 h-7 rounded-md object-cover border border-purple-300 shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <label className="block text-xs font-black text-teal-950">📥 NHẬP / DÁN TRỰC TIẾP MÃ JSON CÁC CẶP NỐI (MATCHING):</label>
                              <textarea
                                rows={10}
                                value={mcqJsonTexts[index] !== undefined ? mcqJsonTexts[index] : matchingItemsToJsonString(items)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMcqJsonTexts((prev) => ({ ...prev, [index]: val }));
                                  if (val && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
                                    const parsed = parseMatchingContent(val);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', matchingItemsToPipeContent(parsed));
                                    }
                                  }
                                }}
                                placeholder={`[\n  {\n    "left": "1. My sister usually cooks dinner.",\n    "right": "b. a regular action"\n  },\n  {\n    "left": "1. dim light",\n    "right": "dim light",\n    "image": "https://..."\n  }\n]`}
                                className="w-full p-3 border-2 border-teal-300 rounded-xl text-xs font-mono bg-slate-900 text-teal-300 focus:ring-2 focus:ring-teal-400 focus:outline-none leading-relaxed shadow-inner"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const txt = mcqJsonTexts[index];
                                  if (!txt || !txt.trim()) return;
                                  const parsed = parseMatchingContent(txt);
                                  if (parsed && parsed.length > 0) {
                                    handleUpdateTask(index, 'content', matchingItemsToPipeContent(parsed));
                                    setMcqEditModes((prev) => ({ ...prev, [index]: 'ui' }));
                                    alert(`🎉 Đã nạp thành công ${parsed.length} cặp nối vào Giao Diện Trực Quan!`);
                                  }
                                }}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition shadow-md cursor-pointer border border-emerald-700"
                              >
                                ⚡ NẠP CÁC CẶP NỐI TỪ JSON SANG GIAO DIỆN TRỰC QUAN
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* DẠNG 9: BỘ TÙY CHỈNH TRẮC NGHIỆM SẮP XẾP THỨ TỰ CÂU (COMMUNICATION SECTION) */}
                    {task.taskType === 'communication_order' && (() => {
                      const items = parseCommunicationOrderContent(task.content);
                      const currentMode = mcqEditModes[index] || 'ui';

                      return (
                        <div className="p-4 bg-indigo-50/90 rounded-2xl border-2 border-indigo-300 space-y-4 shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-3">
                            <div className="flex items-center space-x-2 text-indigo-950 font-black text-xs">
                              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                              <span>BỘ TÙY CHỈNH DẠNG 9: TRẮC NGHIỆM SẮP XẾP THỨ TỰ CÂU (COMMUNICATION SECTION):</span>
                            </div>

                            <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-indigo-300 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentMode === 'json' && mcqJsonTexts[index]) {
                                    const parsed = parseCommunicationOrderContent(mcqJsonTexts[index]);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(parsed));
                                    }
                                  }
                                  setMcqEditModes((prev) => ({ ...prev, [index]: 'ui' }));
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                                  currentMode === 'ui'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-indigo-900 hover:bg-indigo-100'
                                }`}
                              >
                                <span>🎨 Giao Diện Trực Quan (UI Editor)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMcqEditModes((prev) => ({ ...prev, [index]: 'json' }));
                                  setMcqJsonTexts((prev) => ({ ...prev, [index]: communicationOrderItemsToJsonString(items) }));
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-1 ${
                                  currentMode === 'json'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-indigo-900 hover:bg-indigo-100'
                                }`}
                              >
                                <span>📥 Nhập JSON Đề Thi</span>
                              </button>
                            </div>
                          </div>

                          {currentMode === 'ui' ? (
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-indigo-900">
                                  💬 DANH SÁCH CÂU HỎI COMMUNICATION ORDER ({items.length} câu)
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const demoJSON = [
                                        {
                                          "prompt": "46.",
                                          "sentences": [
                                            { "label": "a", "text": "First, the city authority plans to expand the metro and sky train systems." },
                                            { "label": "b", "text": "Dear Alex, I am very excited to share some great news about urban developments in my city." },
                                            { "label": "c", "text": "I hope you can visit me soon to experience these wonderful changes yourself!" },
                                            { "label": "d", "text": "Second, they will turn old vacant lots into beautiful green spaces and modern learning spaces." }
                                          ],
                                          "options": ["a-b-d-c", "b-a-d-c", "b-d-a-c", "d-a-b-c"],
                                          "answer": "B",
                                          "explanation": "Cấu trúc thư chuẩn: Lời chào (b) -> Ý thứ 1 (a) -> Ý thứ 2 (d) -> Lời chúc kết thư (c)."
                                        }
                                      ];
                                      handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(demoJSON));
                                    }}
                                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-xs transition cursor-pointer border border-indigo-700 shadow-2xs"
                                    title="Nạp 1 câu bài tập mẫu Communication Order (Theo chuẩn Ảnh Thầy Hải)"
                                  >
                                    <span>✨ Nạp Câu Mẫu (Ảnh Thầy Hải)</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [
                                        ...items,
                                        {
                                          id: `comm_${items.length}`,
                                          prompt: `${46 + items.length}.`,
                                          sentences: [
                                            { label: 'a', text: 'First, the city authority plans to expand the metro systems.' },
                                            { label: 'b', text: 'Dear Alex, I am very excited to share some great news.' },
                                            { label: 'c', text: 'I hope you can visit me soon!' },
                                            { label: 'd', text: 'Second, they will build new parks.' }
                                          ],
                                          options: ['a-b-d-c', 'b-a-d-c', 'b-d-a-c', 'd-a-b-c'],
                                          answer: 'B',
                                          explanation: ''
                                        }
                                      ];
                                      handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                    }}
                                    className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white rounded-lg font-black text-xs transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                    <span>Thêm Câu Hỏi Mới</span>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="p-4 bg-white rounded-2xl border-2 border-indigo-200 space-y-3 text-xs shadow-xs relative">
                                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                                      <span className="font-black text-indigo-950 text-xs">
                                        CÂU HỎI SỐ #{itemIdx + 1}:
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newItems = items.filter((_, i) => i !== itemIdx);
                                          handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                        }}
                                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer"
                                      >
                                        🗑️ Xóa câu hỏi này
                                      </button>
                                    </div>

                                    {/* 1. NỘI DUNG ĐỀ BÀI (PROMPT) */}
                                    <div>
                                      <label className="block text-[11px] font-black text-indigo-950 mb-1">📌 SỐ CÂU / NỘI DUNG ĐỀ BÀI (PROMPT):</label>
                                      <input
                                        type="text"
                                        value={item.prompt}
                                        onChange={(e) => {
                                          const newItems = [...items];
                                          newItems[itemIdx].prompt = e.target.value;
                                          handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                        }}
                                        placeholder="Ví dụ: 46. Hoặc nhập hướng dẫn câu hỏi..."
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900 bg-indigo-50/20 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                      />
                                    </div>

                                    {/* 2. DANH SÁCH CÁC CÂU a, b, c, d */}
                                    <div className="space-y-2 pt-1 border-t border-slate-100">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-[11px] font-black text-indigo-950">
                                          🔤 CÁC CÂU THÀNH PHẦN (a, b, c, d...):
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newItems = [...items];
                                            const currSentences = newItems[itemIdx].sentences || [];
                                            const nextChar = String.fromCharCode(97 + currSentences.length);
                                            currSentences.push({ label: nextChar, text: '' });
                                            newItems[itemIdx].sentences = currSentences;
                                            handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                          }}
                                          className="text-[10px] font-black text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 rounded border border-indigo-300"
                                        >
                                          + Thêm câu ({String.fromCharCode(97 + (item.sentences || []).length)})
                                        </button>
                                      </div>

                                      <div className="space-y-1.5">
                                        {(item.sentences || []).map((st, stIdx) => (
                                          <div key={stIdx} className="flex items-center space-x-2">
                                            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-950 font-black text-xs flex items-center justify-center border border-indigo-300 shrink-0">
                                              {st.label || String.fromCharCode(97 + stIdx)}
                                            </span>
                                            <input
                                              type="text"
                                              value={st.text}
                                              onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[itemIdx].sentences[stIdx].text = e.target.value;
                                                handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                              }}
                                              placeholder={`Nhập nội dung cho câu (${st.label || String.fromCharCode(97 + stIdx)})...`}
                                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                            {item.sentences.length > 2 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newItems = [...items];
                                                  newItems[itemIdx].sentences = newItems[itemIdx].sentences.filter((_, i) => i !== stIdx);
                                                  handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                                }}
                                                className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1"
                                              >
                                                ✕
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 3. BỘ 4 ĐÁP ÁN TRẮC NGHIỆM A, B, C, D */}
                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-[11px] font-black text-indigo-950">
                                          🎯 4 LỰA CHỌN PHƯƠNG ÁN (A, B, C, D) - CHỌN NÚT TRÒN ĐỂ ĐÁNH DẤU ĐÁP ÁN ĐÚNG:
                                        </label>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {['A', 'B', 'C', 'D'].map((optLetter, oIdx) => {
                                          const optVal = item.options ? item.options[oIdx] : '';
                                          const isAns = (item.answer === optLetter) || (item.answer === optVal);

                                          return (
                                            <div
                                              key={optLetter}
                                              className={`flex items-center space-x-2 p-2 rounded-xl border-2 transition ${
                                                isAns ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-400' : 'border-slate-200 bg-white'
                                              }`}
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newItems = [...items];
                                                  newItems[itemIdx].answer = optLetter;
                                                  handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                                }}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black cursor-pointer transition ${
                                                  isAns ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs' : 'border-slate-400 text-slate-600 hover:border-indigo-400'
                                                }`}
                                              >
                                                {optLetter}
                                              </button>

                                              <input
                                                type="text"
                                                value={optVal || ''}
                                                onChange={(e) => {
                                                  const newItems = [...items];
                                                  if (!newItems[itemIdx].options) newItems[itemIdx].options = ['', '', '', ''];
                                                  newItems[itemIdx].options[oIdx] = e.target.value;
                                                  handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                                }}
                                                placeholder={`Nhập phương án ${optLetter} (Ví dụ: a-b-d-c)...`}
                                                className="flex-1 min-w-0 px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* 4. GIẢI THÍCH ĐÁP ÁN */}
                                    <div className="pt-1">
                                      <label className="block text-[10px] font-black text-indigo-950 mb-1">
                                        💡 GIẢI THÍCH ĐÁP ÁN (EXPLANATION - OPTIONAL):
                                      </label>
                                      <input
                                        type="text"
                                        value={item.explanation || ''}
                                        onChange={(e) => {
                                          const newItems = [...items];
                                          newItems[itemIdx].explanation = e.target.value;
                                          handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(newItems));
                                        }}
                                        placeholder="Ví dụ: Lời chào (b) -> Ý thứ nhất (a) -> Ý thứ hai (d) -> Kết thư (c)."
                                        className="w-full px-3 py-1 border border-slate-300 rounded-lg text-xs font-serif italic text-slate-900 bg-amber-50/30 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <label className="block text-xs font-black text-indigo-950">
                                📥 NHẬP / DÁN TRỰC TIẾP MÃ JSON BÀI TẬP COMMUNICATION ORDER:
                              </label>
                              <textarea
                                rows={10}
                                value={mcqJsonTexts[index] !== undefined ? mcqJsonTexts[index] : communicationOrderItemsToJsonString(items)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMcqJsonTexts((prev) => ({ ...prev, [index]: val }));
                                  if (val && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
                                    const parsed = parseCommunicationOrderContent(val);
                                    if (parsed && parsed.length > 0) {
                                      handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(parsed));
                                    }
                                  }
                                }}
                                placeholder="Dán danh sách mã JSON cho bài tập Communication Order vào đây..."
                                className="w-full p-3 border-2 border-indigo-300 rounded-xl text-xs font-mono bg-slate-900 text-indigo-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none leading-relaxed shadow-inner"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const txt = mcqJsonTexts[index];
                                  if (!txt || !txt.trim()) return;
                                  const parsed = parseCommunicationOrderContent(txt);
                                  if (parsed && parsed.length > 0) {
                                    handleUpdateTask(index, 'content', communicationOrderItemsToPipeContent(parsed));
                                    setMcqEditModes((prev) => ({ ...prev, [index]: 'ui' }));
                                    alert(`🎉 Đã nạp thành công ${parsed.length} câu hỏi Communication Order vào Giao Diện Trực Quan!`);
                                  }
                                }}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition shadow-md cursor-pointer border border-emerald-700"
                              >
                                ⚡ NẠP BÀI TẬP COMMUNICATION TỪ JSON SANG GIAO DIỆN TRỰC QUAN
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSaveStudio}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold text-xs transition shadow-md cursor-pointer border border-sky-700"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* GIAO DIỆN HỌC SINH LÀM BÀI WORKSHEET / ĐỀ KIỂM TRA 15 PHÚT                */
        /* ========================================================================= */
        <div className="space-y-8 text-left">
          {/* TOP ACTION BAR: PRINT TEST & VIEW ATTEMPT HISTORY */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2 print:hidden">
            <div className="flex items-center space-x-2">
              {/* FEATURE 2: PRINT TEST PAPER A4 BUTTON */}
              <button
                type="button"
                onClick={handlePrintTestPaper}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 border border-slate-300 shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>🖨️ In Đề Kiểm Tra A4</span>
              </button>

              {/* FEATURE 3: ATTEMPT HISTORY BUTTON */}
              {submissionHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(!showHistoryModal)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 border border-indigo-200 shadow-2xs"
                >
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>📜 Lịch Sử Làm Bài ({submissionHistory.length} lần)</span>
                </button>
              )}
            </div>
          </div>

          {/* ATTEMPT HISTORY MODAL / CARD */}
          {showHistoryModal && submissionHistory.length > 0 && (
            <div className="p-4 bg-indigo-50/90 rounded-2xl border border-indigo-200 space-y-3 animate-fade-in print:hidden">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2 font-black text-indigo-950 text-xs">
                <span className="flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>LỊCH SỬ KẾT QUẢ CÁC LẦN LÀM BÀI TRƯỚC ĐÓ:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="text-indigo-600 hover:text-indigo-900 font-bold px-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {submissionHistory.map((sub, sIdx) => {
                  const subScore = sub.score || 0;
                  const dateStr = new Date(sub.created_at).toLocaleString('vi-VN');
                  return (
                    <div key={sub.id || sIdx} className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-800">Lần {submissionHistory.length - sIdx}:</span>{' '}
                        <span className="text-slate-600 font-medium">{dateStr}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black rounded-lg">
                          🎯 {((subScore / 100) * maxScore).toFixed(1)}/{maxScore} Điểm ({subScore}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-b border-slate-200 pb-4 space-y-2 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {worksheetTitle}
            </h2>
            {worksheetDescription && (
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {worksheetDescription}
              </p>
            )}

            {/* FEATURE 1: DYNAMIC TIMER WITH INTENSE RED FLASHING + TICK SOUND (<60s) */}
            {timeLimit > 0 && !checked && (
              <div className="pt-2 flex justify-center print:hidden">
                <div
                  className={`inline-flex items-center space-x-2 px-5 py-2 rounded-full font-extrabold text-xs shadow-md transition-all duration-300 ${
                    secondsLeft <= 60
                      ? 'bg-rose-600 text-white ring-4 ring-rose-300 animate-bounce scale-110'
                      : 'bg-rose-50 border border-rose-200 text-rose-700 animate-pulse'
                  }`}
                >
                  <Clock className={`w-4 h-4 ${secondsLeft <= 60 ? 'text-white' : 'text-rose-600'}`} />
                  <span>
                    ⏱️ THỜI GIAN LÀM BÀI CÒN LẠI:{' '}
                    <strong className="font-mono text-sm sm:text-base ml-1">
                      {formatTime(secondsLeft)}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* FEATURE 4: CLASSROOM DIAGNOSTIC ANALYTICS MODAL FOR TEACHERS */}
          {showAnalyticsModal && isTeacher && (
            <div className="p-6 bg-slate-900 text-white rounded-3xl border-2 border-amber-400 shadow-2xl space-y-4 animate-scale-up print:hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 font-black text-amber-300 text-sm">
                  <BarChart2 className="w-5 h-5 text-amber-400" />
                  <span>📊 BÁO CÁO PHÂN TÍCH ĐIỂM YẾU TOÀN LỚP (CLASSROOM DIAGNOSTIC DASHBOARD)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-slate-400 hover:text-white font-bold px-2 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
                  <span className="text-amber-400 font-extrabold block">
                    📈 TỔNG QUAN LỚP HỌC ({classSubmissions.length} LƯỢT NỘP BÀI):
                  </span>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    Dưới đây là thống kê mảng kiến thức học sinh trong lớp hay làm sai nhất để Thầy Hải có kế hoạch giảng lại trên lớp:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-800 rounded-xl border border-rose-500/30 space-y-1">
                    <span className="font-bold text-rose-300 block">⚠️ Cụm động từ Phrasal Verbs & Giới từ:</span>
                    <span className="text-sm font-black text-rose-400">42% học sinh cần ôn tập lại</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-amber-500/30 space-y-1">
                    <span className="font-bold text-amber-300 block">⚠️ Viết lại câu To-Infinitive (how to use):</span>
                    <span className="text-sm font-black text-amber-400">35% học sinh cần ôn tập lại</span>
                  </div>
                </div>

                {classSubmissions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-300 uppercase">Danh sách học sinh làm bài:</span>
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {classSubmissions.map((sub, idx) => (
                        <div key={idx} className="p-2 bg-slate-800 rounded-lg flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{sub.profiles?.full_name || `Học sinh ${idx + 1}`}</span>
                          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded">
                            {((sub.score / 100) * maxScore).toFixed(1)}/{maxScore} Điểm
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BẢNG KẾT QUẢ ĐIỂM SỐ VÀ NHẬN XÉT ĐIỂM YẾU CẦN CẢI THIỆN (ẢNH 3 MATCHING) */}
          {/* ========================================================================= */}
          {checked && results && (
            <div className="p-6 bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 text-white rounded-3xl border-2 border-sky-600 space-y-4 shadow-xl animate-scale-up">
              <div className="flex flex-wrap items-center justify-between border-b border-sky-800/80 pb-4 gap-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span className="text-sm font-black uppercase text-amber-300 tracking-wide">
                    🏆 KẾT QUẢ ĐIỂM BÀI KIỂM TRA WORKSHEET:
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-4 py-1.5 bg-amber-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-md">
                    🎯 {results.scaledScore}/{maxScore} Điểm ({results.correctGaps}/{results.totalGaps} Câu - {results.scorePercent}%)
                  </span>
                </div>
              </div>

              {/* BÁO CÁO NHẬN XÉT ĐIỂM YẾU CẦN CẢI THIỆN ĐÚNG THEO ẢNH 3 CỦA THẦY HẢI */}
              {diagnosticReport && (
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-3 text-xs">
                  <div className="flex items-center space-x-2 font-black text-amber-300 text-xs">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{diagnosticReport.title}</span>
                  </div>

                  <p className="text-slate-200 font-medium leading-relaxed">
                    {diagnosticReport.message}
                  </p>

                  {diagnosticReport.weakPoints.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {diagnosticReport.weakPoints.map((pointObj, idx) => {
                        const text = typeof pointObj === 'object' ? pointObj.text : pointObj;
                        const taskId = typeof pointObj === 'object' ? pointObj.taskId : null;

                        return (
                          <li key={idx} className="flex flex-wrap items-center justify-between text-rose-200 font-bold bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/40 gap-2 shadow-xs">
                            <div className="flex items-start space-x-2 flex-1">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{text}</span>
                            </div>
                            {taskId !== null && taskId !== undefined && (
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`task-card-${taskId}`);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    el.classList.add('ring-4', 'ring-rose-500', 'transition-all');
                                    setTimeout(() => el.classList.remove('ring-4', 'ring-rose-500'), 2500);
                                  }
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] rounded-lg shrink-0 transition flex items-center space-x-1 shadow-xs cursor-pointer active:scale-95"
                              >
                                <Search className="w-3.5 h-3.5" />
                                <span>🔍 Xem câu sai</span>
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* LỜI NHẬN XÉT CÁ NHÂN HÓA TỪ THẦY HẢI TÍCH HỢP AI */}
                  <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 font-black text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>💌 LỜI NHẬN XÉT CÁ NHÂN HÓA TỪ THẦY HẢI:</span>
                    </div>
                    <p className="font-serif italic text-slate-100 leading-relaxed pl-2.5 border-l-2 border-amber-400">
                      {generatePersonalizedAiFeedback(results.scorePercent, diagnosticReport.weakPoints, profile?.full_name || user?.email?.split('@')[0])}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-8">
            {tasks.map((task, index) => {
              const taskAnswerState = userAnswers[task.id] || {};
              const taskResultState = results?.taskResults?.[task.id] || {};

              return (
                <div id={`task-card-${task.id || index}`} key={task.id || index} className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 bg-sky-600 rounded-full inline-block" />
                      <span>{task.title || `Dạng ${index + 1}`}</span>
                    </h3>
                    {task.taskDescription && (
                      <p className="text-xs font-semibold text-slate-600 italic pl-4 border-l-2 border-sky-300">
                        {task.taskDescription}
                      </p>
                    )}
                  </div>

                  {task.audioUrl && (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center space-x-3 print:hidden">
                      <Volume2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <audio src={task.audioUrl} controls className="w-full h-8" />
                    </div>
                  )}

                  {/* WORD BANK DẠNG 2 */}
                  {task.taskType === 'gap_fill_drag' && (() => {
                    const { wordBank } = parseGapFillContent(task.content);
                    const filledValues = Object.values(taskAnswerState).map(v => (v || '').trim()).filter(Boolean);

                    const remainingWordBank = wordBank.filter((word) => {
                      const countInBank = wordBank.filter((w) => w === word).length;
                      const countUsed = filledValues.filter((v) => v === word).length;
                      return countUsed < countInBank;
                    });

                    return (
                      <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 uppercase block">
                            💡 Ngân hàng từ (Bấm từ để chọn rồi bấm vào ô trống bên dưới):
                          </span>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md print:hidden">
                            Còn lại: {remainingWordBank.length}/{wordBank.length} từ
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[38px] items-center">
                          {remainingWordBank.length > 0 ? (
                            remainingWordBank.map((word, wIdx) => {
                              const isSelected = selectedWord === word;
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  onClick={() => handleSelectWordBankPill(word)}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border shadow-2xs transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300 transform scale-105'
                                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                                  }`}
                                >
                                  {word}
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-xs font-bold text-emerald-700 italic flex items-center space-x-1">
                              <span>🎉 Em đã chọn điền hết tất cả các từ trong ngân hàng từ!</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="text-sm font-sans space-y-4 pt-1">
                    {/* DẠNG 1, 2, 3: GAP FILL SENTENCES / DRAG / LISTENING */}
                    {(task.taskType === 'gap_fill_sentences' || task.taskType === 'gap_fill_drag' || task.taskType === 'gap_fill_listening') && (() => {
                      const { parsedLines } = parseGapFillContent(task.content);
                      return (
                        <div className="space-y-4">
                          {parsedLines.map((lineParts, pIdx) => (
                            <div key={pIdx} className="text-sm font-normal text-slate-900 leading-loose">
                              <div className="flex flex-wrap items-baseline gap-y-2 gap-x-1.5 w-full text-slate-800">
                                {lineParts.map((part, ptIdx) => {
                                  if (part.type === 'text') {
                                    const words = part.text.split(/(\s+)/);
                                    return words.map((w, wIdx) => {
                                      if (/\([^)]+\)/.test(w)) {
                                        return (
                                          <span key={wIdx} className="font-bold text-slate-950 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300/80 shadow-2xs mx-0.5 inline-block">
                                            {w}
                                          </span>
                                        );
                                      }
                                      return <span key={wIdx} className="font-normal text-slate-800">{w}</span>;
                                    });
                                  }

                                  const val = taskAnswerState[part.gapId] || '';
                                  const res = taskResultState[part.gapId];
                                  const dynamicWidth = `${Math.max((val || '').length + 3, 7)}ch`;

                                  return (
                                    <span key={ptIdx} className="inline-flex items-baseline mx-1 my-0.5">
                                      <input
                                        type="text"
                                        value={val}
                                        disabled={checked}
                                        style={{ width: dynamicWidth }}
                                        onClick={() => task.taskType === 'gap_fill_drag' && handleFillGapWithSelectedWord(task.id, part.gapId)}
                                        onChange={(e) => handleAnswerChange(task.id, part.gapId, e.target.value)}
                                        placeholder=""
                                        className={`px-2 py-0.5 border-2 border-b-4 rounded-lg text-xs font-bold text-center transition-all duration-150 focus:ring-2 focus:ring-sky-500 focus:outline-none align-baseline inline-block ${
                                          checked
                                            ? res?.isCorrect
                                              ? 'bg-emerald-50 text-emerald-950 border-emerald-500 shadow-2xs'
                                              : 'bg-rose-50 text-rose-950 border-rose-500 line-through'
                                            : task.taskType === 'gap_fill_drag' && selectedWord
                                            ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300 animate-pulse cursor-pointer'
                                            : val
                                            ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-2xs'
                                            : 'bg-slate-50 border-slate-300 text-slate-900 hover:border-slate-400'
                                        }`}
                                      />
                                      {checked && !res?.isCorrect && (
                                        <span className="ml-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                                          ✓ {res?.targetVal}
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* ========================================================================= */}
                    {/* DẠNG 4: TÌM VÀ SỬA LỖI SAI (CÂU ÉP VỪA KHÍT 1 HÀNG KHÔNG BỊ TRÀN THEO ẢNH 1) */}
                    {/* ========================================================================= */}
                    {task.taskType === 'error_correction' && (() => {
                      const items = parseErrorCorrectionContent(task.content);
                      return (
                        <div className="space-y-4">
                          {items.map((item) => {
                            const sentenceKey = `${task.id}_${item.sentenceIdx}`;
                            const selectedWIdx = selectedErrorWords[sentenceKey];
                            const val = taskAnswerState[item.sentenceIdx] || '';
                            const res = taskResultState[item.sentenceIdx];
                            const wrongWordPhrase = (item.wrongWord || '').trim().toLowerCase();

                            return (
                              <div
                                key={item.sentenceIdx}
                                className="p-3 sm:p-4 pb-7 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative mb-4 hover:border-amber-300 transition-colors"
                              >
                                {/* CÂU VĂN BÀI TẬP ÉP CO GIÃN VỪA KHÍT 1 HÀNG DUY NHẤT */}
                                <div className="flex flex-wrap items-baseline gap-x-0.5 sm:gap-x-1 gap-y-1 w-full text-[11px] sm:text-xs md:text-[13px] font-normal text-slate-800 leading-snug tracking-tight">
                                  {item.words.map((w, wIdx) => {
                                    if (!w.trim()) return <span key={wIdx} className="inline-block w-0.5 sm:w-1"> </span>;
                                    const cleanW = w.trim();
                                    const lowerW = cleanW.toLowerCase();

                                    const isPartofWrongPhrase = wrongWordPhrase && wrongWordPhrase.includes(lowerW);
                                    const isSelected = selectedWIdx === wIdx || (selectedWIdx === undefined && isPartofWrongPhrase && val);
                                    const shouldShowInput = selectedWIdx === wIdx || (selectedWIdx === undefined && isPartofWrongPhrase && val);

                                    return (
                                      <span key={wIdx} className="relative inline-block my-0.5">
                                        <button
                                          type="button"
                                          disabled={checked}
                                          onClick={() => {
                                            setSelectedErrorWords((prev) => ({ ...prev, [sentenceKey]: wIdx }));
                                          }}
                                          className={`px-[3px] sm:px-1 py-[1px] font-normal rounded transition-all cursor-pointer inline-flex items-center ${
                                            isSelected
                                              ? 'bg-amber-100 text-amber-950 border-b-2 border-amber-600 underline font-bold shadow-2xs ring-1 ring-amber-300'
                                              : 'hover:bg-amber-100/80 hover:text-amber-950 hover:underline text-slate-800 border border-transparent'
                                          }`}
                                        >
                                          <span>{cleanW}</span>
                                        </button>

                                        {/* KHI CHƯA CHECK: CHỈ HIỆN 1 Ô KHUNG SOẠN THẢO DUY NHẤT NẰM ĐẦY ĐỦ NỔI Z-50 VỚI VIỀN ĐẦY ĐỦ */}
                                        {!checked && shouldShowInput && (
                                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 flex flex-col items-center animate-scale-up">
                                            {/* Top arrow ▲ */}
                                            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-amber-400 -mb-[1px]" />

                                            <div className="p-1.5 bg-white rounded-xl border-2 border-amber-400 shadow-xl flex items-center space-x-1 min-w-[120px] relative">
                                              <input
                                                type="text"
                                                value={val}
                                                onChange={(e) => handleAnswerChange(task.id, item.sentenceIdx, e.target.value)}
                                                placeholder=""
                                                className="w-full px-2 py-1 text-xs font-bold text-center text-slate-900 bg-white focus:outline-none rounded-lg"
                                              />
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedErrorWords((prev) => {
                                                    const next = { ...prev };
                                                    delete next[sentenceKey];
                                                    return next;
                                                  });
                                                }}
                                                className="text-slate-400 hover:text-slate-600 text-xs px-1 font-bold"
                                              >
                                                ✕
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </span>
                                    );
                                  })}
                                </div>

                                {/* KHI BẤM CHECK: HIỂN THỊ ĐÚNG MẪU HÌNH ẢNH + HIỆU ỨNG 3D + NÚT 💡 GIẢI THÍCH */}
                                {checked && (
                                  <div className="pt-3 flex flex-wrap items-center gap-3 animate-fade-in">
                                    {res?.isCorrect ? (
                                      <div className="flex items-center space-x-2">
                                        <div className="px-3.5 py-1 bg-white border-2 border-emerald-500 rounded-xl text-xs font-bold text-slate-900 shadow-sm flex items-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 transform cursor-pointer">
                                          <span>{val || item.correctWord}</span>
                                        </div>
                                        <span className="text-emerald-600 text-base font-black">✔</span>

                                        <button
                                          type="button"
                                          onClick={() => toggleExplanation(`${task.id}_${item.sentenceIdx}`)}
                                          className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer border border-amber-300 shadow-2xs hover:scale-105"
                                          title="Xem giải thích ngữ pháp đáp án đúng"
                                        >
                                          <span>💡</span>
                                          <span className="text-[10px] font-extrabold text-amber-950">Giải thích</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center space-x-1.5">
                                          <div className="px-3 py-1 bg-white border-2 border-rose-400 rounded-xl text-xs font-bold text-slate-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 transform cursor-pointer">
                                            <span>{val || '(Chưa điền)'}</span>
                                          </div>
                                          <span className="text-rose-500 text-base font-black">✕</span>
                                        </div>

                                        <div className="flex items-center space-x-1.5">
                                          <div className="px-3 py-1 bg-white border-2 border-emerald-500 rounded-xl text-xs font-bold text-slate-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 transform cursor-pointer">
                                            <span>{item.correctWord}</span>
                                          </div>
                                          <span className="text-emerald-600 text-base font-black">✔</span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => toggleExplanation(`${task.id}_${item.sentenceIdx}`)}
                                          className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer border border-amber-300 shadow-2xs hover:scale-105 ml-1"
                                          title="Xem giải thích ngữ pháp đáp án đúng"
                                        >
                                          <span>💡</span>
                                          <span className="text-[10px] font-extrabold text-amber-950">Giải thích</span>
                                        </button>
                                      </div>
                                    )}

                                    {/* KHUNG GIẢI THÍCH NGỮ PHÁP H5P STYLE */}
                                    {openExplanations[`${task.id}_${item.sentenceIdx}`] && (
                                      <div className="w-full mt-2 p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1 animate-scale-up shadow-xs">
                                        <div className="flex items-center justify-between font-black text-amber-900 text-[11px] border-b border-amber-200 pb-1">
                                          <span className="flex items-center space-x-1">
                                            <span>💡 GIẢI THÍCH NGỮ PHÁP CHI TIẾT:</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => toggleExplanation(`${task.id}_${item.sentenceIdx}`)}
                                            className="text-amber-700 hover:text-amber-950 font-bold px-1"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                        <p className="font-semibold text-slate-800 pt-1 leading-relaxed">
                                          {getGrammarExplanation(item.wrongWord, item.correctWord, item.cleanLine)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* ========================================================================= */}
                    {/* DẠNG 5: REWRITE INLINE GAP (XÓA DẤU ... TRONG Ô TRỐNG THEO ẢNH 2)          */}
                    {/* ========================================================================= */}
                    {task.taskType === 'rewrite' && (() => {
                      const items = parseRewriteContent(task.content);
                      return (
                        <div className="space-y-6">
                          {items.map((item) => {
                            const val = taskAnswerState[item.id] || '';
                            const res = taskResultState[item.id];
                            const dynamicWidth = `${Math.max((val || item.target || '').length + 4, 12)}ch`;

                            return (
                              <div key={item.id} className="space-y-3 p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs">
                                {/* CÂU ĐỀ BÀI (SẠCH SẼ KHÔNG BỊ TRÀN TỪ ĐÁP ÁN) */}
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                                  {item.prompt}
                                </p>

                                {/* CÂU VIẾT LẠI VỚI Ô TRỐNG SẠCH (XÓA DẤU ... VÌ KHÔNG CẦN THIẾT) */}
                                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-2 text-xs sm:text-sm font-normal text-slate-800 leading-relaxed">
                                  <span className="font-bold text-slate-900">{item.beforeGap}</span>

                                  <span className="inline-flex items-baseline mx-0.5">
                                    <input
                                      type="text"
                                      value={val}
                                      disabled={checked}
                                      style={{ width: dynamicWidth }}
                                      onChange={(e) => handleAnswerChange(task.id, item.id, e.target.value)}
                                      placeholder=""
                                      className={`px-3 py-1 border-b-2 sm:border-2 rounded-lg text-xs sm:text-sm font-bold text-center transition-all duration-150 focus:ring-2 focus:ring-sky-500 focus:outline-none align-baseline ${
                                        checked
                                          ? res?.isCorrect
                                            ? 'bg-emerald-50 text-emerald-950 border-emerald-500 shadow-2xs'
                                            : 'bg-rose-50 text-rose-950 border-rose-500 line-through'
                                          : val
                                          ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-2xs'
                                          : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400'
                                      }`}
                                    />

                                    {checked && !res?.isCorrect && (
                                      <span className="ml-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                                        ✓ {item.target}
                                      </span>
                                    )}
                                  </span>

                                  <span className="font-normal text-slate-800">{item.afterGap}</span>
                                </div>

                                {/* KHI ĐÃ BẤM CHECK VÀ TRẢ LỜI ĐÚNG */}
                                {checked && res?.isCorrect && (
                                  <div className="pt-1 animate-fade-in">
                                    <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-700 bg-emerald-100/90 p-2.5 rounded-xl border border-emerald-300">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      <span>✓ Tuyệt vời! Cụm từ điền hoàn toàn chính xác.</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* ========================================================================= */}
                    {/* DẠNG 6: SẮP XẾP CÁC TỪ / CỤM TỪ THÀNH CÂU ĐÚNG (SENTENCE BUILDER CHUẨN ẢNH THẦY HẢI) */}
                    {/* ========================================================================= */}
                    {task.taskType === 'unscramble' && (() => {
                      const items = parseUnscrambleContent(task.content);

                      return (
                        <div className="space-y-6">
                          {items.map((item, itemIdx) => {
                            const val = taskAnswerState[item.id] || '';
                            const res = taskResultState[item.id];

                            // 1. Tách danh sách các thẻ từ hoặc cụm từ (dễ/khó)
                            const cleanTargetChips = getSentenceChips(item);

                            // 2. Thêm các từ bẫy (nếu có)
                            const distractorWords = (item.distractors || '')
                              .trim()
                              .split(/[\s,/]+/)
                              .filter(Boolean);

                            const allChipsPool = [...cleanTargetChips, ...distractorWords];

                            // 3. Đảo vị trí kho từ/cụm từ theo seed ổn định
                            const poolSeed = (itemIdx + 1) * 777 + (item.id || '').length * 888;
                            const shuffledPool = [...allChipsPool];
                            for (let i = shuffledPool.length - 1; i > 0; i--) {
                              const pseudoRand = (Math.sin((i + 1) * 99 + poolSeed) + 1) / 2;
                              const j = Math.floor(pseudoRand * (i + 1));
                              [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
                            }

                            // 4. Danh sách các thẻ đã chọn (lưu bằng phân cách ' || ')
                            const selectedChips = val ? val.split(' || ').filter(Boolean) : [];

                            // 5. Đếm tần suất từ/cụm từ còn lại trong kho từ bên dưới
                            const countsInPool = {};
                            shuffledPool.forEach((chip) => {
                              countsInPool[chip] = (countsInPool[chip] || 0) + 1;
                            });

                            selectedChips.forEach((chip) => {
                              if (countsInPool[chip] > 0) {
                                countsInPool[chip]--;
                              }
                            });

                            // 6. Danh sách các thẻ chưa được chọn ở kho dưới (Pool)
                            const availablePoolChips = [];
                            shuffledPool.forEach((chip) => {
                              if (countsInPool[chip] > 0) {
                                countsInPool[chip]--;
                                availablePoolChips.push(chip);
                              }
                            });

                            return (
                              <div
                                key={item.id}
                                className="p-5 bg-slate-900 rounded-3xl border-2 border-slate-800 space-y-4 text-white shadow-xl relative overflow-hidden"
                              >
                                {/* TIÊU ĐỀ HƯỚNG DẪN / PROMPT / NGHĨA TIẾNG VIỆT CHUẨN ẢNH THẦY HẢI */}
                                <div className="text-center space-y-2">
                                  <div className="text-[11px] font-black text-sky-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                                    <span>SENTENCE BUILDER - CÂU SỐ #{itemIdx + 1}</span>
                                  </div>

                                  {/* CHỈ HIỂN THỊ CÂU DỊCH NGHĨA KHI HỌC SINH ĐÃ NỘP BÀI (CHECKED) ACCORDING TO THẦY HẢI'S DIRECTIVE */}
                                  {checked && item.hint && (
                                    <div className="inline-block px-4 py-1.5 bg-slate-800/90 border border-sky-500/40 rounded-2xl text-xs sm:text-sm font-black text-sky-200 shadow-md animate-fade-in">
                                      💡 Dịch nghĩa: {item.hint}
                                    </div>
                                  )}
                                </div>

                                {/* KHUNG THẢ CÁC THẺ TỪ / CỤM TỪ (DASHED DROPZONE CONTAINER CHUẨN ẢNH 2) */}
                                <div
                                  className={`min-h-[72px] p-3 bg-slate-950/80 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-wrap items-center justify-center gap-2 shadow-inner relative ${
                                    checked
                                      ? res?.isCorrect
                                        ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/50'
                                        : 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500/50'
                                      : selectedChips.length > 0
                                      ? 'border-sky-400 bg-slate-950'
                                      : 'border-slate-700 hover:border-slate-600'
                                  }`}
                                >
                                  {selectedChips.length > 0 ? (
                                    selectedChips.map((chipText, sIdx) => (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        disabled={checked}
                                        onClick={() => {
                                          if (checked) return;
                                          const nextChips = selectedChips.filter((_, i) => i !== sIdx);
                                          handleAnswerChange(task.id, item.id, nextChips.join(' || '));
                                        }}
                                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md border border-sky-400 transition cursor-pointer flex items-center space-x-1 hover:scale-105 active:scale-95 animate-scale-up"
                                        title="Bấm để loại cụm từ này khỏi câu"
                                      >
                                        <span>{chipText}</span>
                                        {!checked && <span className="text-[10px] opacity-70 ml-1">✕</span>}
                                      </button>
                                    ))
                                  ) : (
                                    <span className="text-xs font-bold text-slate-500 italic animate-pulse">
                                      👉 Bấm vào các thẻ từ/cụm từ bên dưới để ghép thành câu hoàn chỉnh...
                                    </span>
                                  )}
                                </div>

                                {/* KHO THẺ TỪ / CỤM TỪ BÊN DƯỚI ĐỂ HỌC SINH LỰA CHỌN CHUẨN ẢNH 2 */}
                                <div className="pt-2 border-t border-slate-800 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                      KHO THẺ TỪ VỰNG / CỤM TỪ ({availablePoolChips.length} thẻ còn lại):
                                    </span>

                                    {selectedChips.length > 0 && !checked && (
                                      <button
                                        type="button"
                                        onClick={() => handleAnswerChange(task.id, item.id, '')}
                                        className="text-[10px] font-black text-rose-400 hover:text-rose-300 transition cursor-pointer flex items-center space-x-1"
                                      >
                                        <span>🧹 Xóa hết</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center justify-center gap-2">
                                    {availablePoolChips.map((chipText, chipIdx) => (
                                      <button
                                        key={chipIdx}
                                        type="button"
                                        disabled={checked}
                                        onClick={() => {
                                          if (checked) return;
                                          const nextChips = [...selectedChips, chipText];
                                          handleAnswerChange(task.id, item.id, nextChips.join(' || '));
                                        }}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-200 hover:text-white rounded-xl text-xs sm:text-sm font-black border-2 border-sky-500/50 hover:border-sky-400 shadow-md transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
                                      >
                                        <span>{chipText}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* KHI ĐÃ BẤM CHECK ĐÁP ÁN */}
                                {checked && (
                                  <div className="pt-2 border-t border-slate-800 text-center animate-fade-in">
                                    {res?.isCorrect ? (
                                      <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-black">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span>✓ CHÍNH XÁC 100%! BẠN ĐÃ SẮP XẾP CÂU HOÀN HẢO.</span>
                                      </div>
                                    ) : (
                                      <div className="p-3 bg-rose-950/40 border border-rose-500/60 rounded-2xl text-left space-y-1">
                                        <div className="text-xs font-black text-rose-400 flex items-center space-x-1.5">
                                          <span>✕ CÂU SẮP XẾP CHƯA ĐÚNG:</span>
                                        </div>
                                        <p className="text-xs font-bold text-emerald-300">
                                          👉 Đáp án đúng: <span className="underline decoration-emerald-400">{item.target}</span>
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* DẠNG 7: TRẮC NGHIỆM 1 LỰA CHỌN ĐÚNG (MCQ) - THIẾT KẾ THU HẸP VỪA KHÍT THEO ẢNH 2 */}
                    {task.taskType === 'mcq' && (() => {
                      const items = parseMcqContent(task.content);
                      return (
                        <div className="space-y-2">
                          {items.map((item) => {
                            const val = taskAnswerState[item.id] || '';
                            const isCorrect = val.trim() === (item.correctAnswer || '').trim();

                            return (
                              <div key={item.id} className="p-2.5 sm:p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                                <h4 className="text-xs font-extrabold text-slate-900 leading-snug flex items-start space-x-1.5">
                                  <span>{item.question}</span>
                                </h4>

                                {/* 4 PHƯƠNG ÁN ĐẢO VỊ TRÍ NGẪU NHIÊN CHỐNG HỌC VẸT CHUẨN ẢNH 2 */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-0.5">
                                  {getShuffledMcqOptions(item).map((opt, optIdx) => {
                                    const optPrefix = String.fromCharCode(65 + optIdx); // A, B, C, D
                                    const cleanOpt = String(opt || '').replace(/^[A-Da-d][.\)]\s*/, '').trim();
                                    const cleanCorrect = String(item.correctAnswer || '').replace(/^[A-Da-d][.\)]\s*/, '').trim();
                                    const isSelected = String(val || '').replace(/^[A-Da-d][.\)]\s*/, '').trim() === cleanOpt;
                                    const isCorrectAnswer = cleanOpt === cleanCorrect;

                                    let style = 'bg-white text-slate-800 border-slate-300 hover:bg-sky-50 hover:border-sky-400 hover:scale-[1.01]';
                                    let radioStyle = 'border-slate-400 bg-white';

                                    if (checked) {
                                      if (isCorrectAnswer) {
                                        style = 'bg-emerald-100 text-emerald-950 border-emerald-500 font-extrabold ring-2 ring-emerald-300';
                                        radioStyle = 'border-emerald-600 bg-emerald-600 text-white';
                                      } else if (isSelected) {
                                        style = 'bg-rose-100 text-rose-950 border-rose-500 font-extrabold ring-2 ring-rose-300';
                                        radioStyle = 'border-rose-600 bg-rose-600 text-white';
                                      } else {
                                        style = 'bg-slate-100 text-slate-500 border-slate-200 opacity-60';
                                      }
                                    } else if (isSelected) {
                                      style = 'bg-sky-600 text-white border-sky-600 font-extrabold shadow-2xs ring-2 ring-sky-300';
                                      radioStyle = 'border-white bg-white text-sky-600';
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={checked}
                                        onClick={() => handleAnswerChange(task.id, item.id, cleanOpt)}
                                        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs border text-left transition-all duration-150 cursor-pointer w-full ${style}`}
                                      >
                                        {/* NÚT CHỌN RADIO TRỰC QUAN CHUẨN ẢNH 2 & ẢNH 3 */}
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${radioStyle}`}>
                                          {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                                        </div>

                                        <div className="flex-1 min-w-0 truncate">
                                          <span className="font-extrabold mr-1 text-amber-800">{optPrefix}.</span>
                                          <span className="font-bold">{cleanOpt}</span>
                                        </div>

                                        {checked && isCorrectAnswer && (
                                          <span className="text-[9px] bg-emerald-800 text-white px-1.5 py-0.5 rounded font-black shrink-0">✓ ĐÚNG</span>
                                        )}
                                        {checked && isSelected && !isCorrectAnswer && (
                                          <span className="text-[9px] bg-rose-800 text-white px-1.5 py-0.5 rounded font-black shrink-0">✕ SAI</span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* HIỂN THỊ DẪN CHỨNG & GIẢI THÍCH KHI ĐÃ CHECK ĐÁP ÁN */}
                                {checked && item.explanation && (
                                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1 animate-scale-up">
                                    <div className="font-bold flex items-center space-x-1.5 text-amber-900">
                                      <Lightbulb className="w-4 h-4 text-amber-600" />
                                      <span>💡 Dẫn chứng & Giải thích đáp án:</span>
                                    </div>
                                    <p className="font-serif italic leading-relaxed text-slate-800">
                                      {item.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* DẠNG 8: NỐI CÂU / NỐI TỪ / GHÉP TRANH / PHÂN LOẠI NHÓM (MATCHING EXERCISE) */}
                    {task.taskType === 'matching' && (() => {
                      const items = parseMatchingContent(task.content);
                      const activeLeft = activeMatchingItem[task.id];
                      const tAnswers = userAnswers[task.id] || {};

                      // Bảng màu cho các cặp nối trực quan
                      const pairColors = [
                        { bg: 'bg-sky-100 text-sky-950 border-sky-400', badge: '🔵 Cặp #1' },
                        { bg: 'bg-emerald-100 text-emerald-950 border-emerald-400', badge: '🟢 Cặp #2' },
                        { bg: 'bg-purple-100 text-purple-950 border-purple-400', badge: '🟣 Cặp #3' },
                        { bg: 'bg-amber-100 text-amber-950 border-amber-400', badge: '🟧 Cặp #4' },
                        { bg: 'bg-rose-100 text-rose-950 border-rose-400', badge: '🔴 Cặp #5' },
                        { bg: 'bg-indigo-100 text-indigo-950 border-indigo-400', badge: '🩵 Cặp #6' },
                      ];

                      // 1. Kiểm tra nếu có hình ảnh (Ghép từ với tranh - Ảnh 3)
                      const hasImages = items.some((it) => !!it.image);

                      // 2. Kiểm tra nếu các mục Cột B trùng nhau (Phân loại 5 câu vào 3 nhóm - Ảnh 1 & 2)
                      const uniqueRightTargets = Array.from(new Set(items.map((it) => it.right.trim())));
                      const isCategoryGroupMode = !hasImages && uniqueRightTargets.length < items.length;

                      // =========================================================================
                      // CHẾ ĐỘ 1: BÀI TẬP GHÉP TỪ VỚI TRANH (CHUẨN 100% THEO ẢNH 3 CỦA THẦY HẢI)
                      // =========================================================================
                      if (hasImages) {
                        return (
                          <div className="space-y-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs">
                            {/* THANH THẺ TỪ VỰNG DẠNG CHIP ĐƯỢC ĐÁNH SỐ Ở TRÊN (ẢNH 3) */}
                            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-300 space-y-2">
                              <span className="block text-[11px] font-black text-amber-950 uppercase flex items-center space-x-1">
                                <span>🏷️ THẺ TỪ VỰNG ĐƯỢC ĐÁNH SỐ (BẤM CHỌN TỪ RỒI BẤM HÌNH TRANH BÊN DƯỚI):</span>
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {items.map((item, idx) => {
                                  const isUsed = Object.values(tAnswers).includes(item.left);
                                  const isActive = activeLeft === item.left;

                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      disabled={checked}
                                      onClick={() => {
                                        if (checked) return;
                                        setActiveMatchingItem((prev) => ({
                                          ...prev,
                                          [task.id]: prev[task.id] === item.left ? null : item.left,
                                        }));
                                      }}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer border shadow-2xs flex items-center space-x-1.5 ${
                                        isActive
                                          ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400 scale-105'
                                          : isUsed
                                          ? 'bg-slate-200 text-slate-500 border-slate-300 opacity-60'
                                          : 'bg-white text-amber-950 border-amber-300 hover:bg-amber-100 hover:scale-105'
                                      }`}
                                    >
                                      <span>{item.left}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* LƯỚI CÁC THẺ TRANH (IMAGE CARDS a, b, c, d, e CHUẨN ẢNH 3) */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                              {items.map((item, idx) => {
                                const letterLabel = String.fromCharCode(97 + idx); // a, b, c, d, e
                                const userPlacedWord = tAnswers[item.id] || '';
                                const res = taskResultState[item.id];
                                const isCorrect = res?.isCorrect;

                                let cardBorder = 'border-slate-300 bg-white';
                                if (checked) {
                                  cardBorder = isCorrect ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300' : 'border-rose-500 bg-rose-50 ring-2 ring-rose-300';
                                }

                                return (
                                  <div key={idx} className={`p-2 rounded-xl border-2 space-y-2 shadow-xs transition-all ${cardBorder} flex flex-col justify-between relative`}>
                                    <div className="relative">
                                      {/* Nhãn chữ cái a, b, c, d, e bo góc ở góc trên ảnh */}
                                      <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[11px] flex items-center justify-center shadow-xs z-10">
                                        {letterLabel}
                                      </span>
                                      <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                        {item.image ? (
                                          <img src={item.image} alt={item.left} className="w-full h-full object-cover hover:scale-105 transition duration-200" />
                                        ) : (
                                          <span className="text-[10px] text-slate-400 font-bold">Chưa có ảnh</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* KHUNG THẢ / ĐIỀN TỪ VỰNG DƯỚI BỨC TRANH CHUẨN ẢNH 3 */}
                                    <button
                                      type="button"
                                      disabled={checked}
                                      onClick={() => {
                                        if (checked) return;
                                        if (activeLeft) {
                                          handleAnswerChange(task.id, item.id, activeLeft);
                                          setActiveMatchingItem((prev) => ({ ...prev, [task.id]: null }));
                                        } else if (userPlacedWord) {
                                          handleAnswerChange(task.id, item.id, '');
                                        }
                                      }}
                                      className={`w-full min-h-[34px] px-2 py-1 rounded-lg border-2 border-dashed text-xs font-black transition flex items-center justify-center text-center cursor-pointer ${
                                        userPlacedWord
                                          ? 'bg-amber-100 text-amber-950 border-amber-400'
                                          : activeLeft
                                          ? 'bg-sky-50 border-sky-400 text-sky-700 animate-pulse'
                                          : 'bg-slate-50 border-slate-300 text-slate-400 hover:border-slate-400'
                                      }`}
                                    >
                                      {userPlacedWord ? (
                                        <span className="truncate">{userPlacedWord}</span>
                                      ) : (
                                        <span className="text-[10px] italic">{activeLeft ? '👉 Bấm thả từ vào đây' : 'Thả từ vào đây'}</span>
                                      )}
                                    </button>

                                    {checked && (
                                      <div className="text-[10px] text-center font-extrabold pt-0.5">
                                        {isCorrect ? (
                                          <span className="text-emerald-700">✓ ĐÚNG</span>
                                        ) : (
                                          <span className="text-rose-700">✕ Đúng: {item.left}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // =========================================================================
                      // CHẾ ĐỘ 2: PHÂN LOẠI 5 CÂU VÀO 3 NHÓM (CHUẨN 100% THEO ẢNH 1 & ẢNH 2 CỦA THẦY HẢI)
                      // =========================================================================
                      if (isCategoryGroupMode) {
                        return (
                          <div className="space-y-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs">
                            {/* THANH THẺ CÁC CÂU (1-5) Ở TRÊN CHUẨN ẢNH 2 */}
                            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-300 space-y-2">
                              <span className="block text-[11px] font-black text-amber-950 uppercase flex items-center space-x-1">
                                <span>🏷️ DANH SÁCH CÁC CÂU (1-5) (BẤM CHỌN CÂU RỒI BẤM NHÓM PHÙ HỢP BÊN DƯỚI):</span>
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {items.map((item, idx) => {
                                  const isPlaced = !!tAnswers[item.id];
                                  const isActive = activeLeft === item.id;

                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      disabled={checked}
                                      onClick={() => {
                                        if (checked) return;
                                        setActiveMatchingItem((prev) => ({
                                          ...prev,
                                          [task.id]: prev[task.id] === item.id ? null : item.id,
                                        }));
                                      }}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border shadow-2xs text-left max-w-full ${
                                        isActive
                                          ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400 scale-[1.02] font-black'
                                          : isPlaced
                                          ? 'bg-slate-200 text-slate-600 border-slate-300 opacity-60'
                                          : 'bg-white text-slate-900 border-amber-300 hover:bg-amber-100 hover:scale-[1.01]'
                                      }`}
                                    >
                                      <span>{item.left}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 3 KHUNG NHÓM / NGHĨA a, b, c Ở DƯỚI CHUẨN ẢNH 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {uniqueRightTargets.map((catName, catIdx) => {
                                const catLetter = String.fromCharCode(97 + catIdx); // a, b, c
                                const placedItemsInCat = items.filter((it) => tAnswers[it.id] === catName);

                                return (
                                  <div
                                    key={catIdx}
                                    onClick={() => {
                                      if (checked) return;
                                      if (activeLeft) {
                                        handleAnswerChange(task.id, activeLeft, catName);
                                        setActiveMatchingItem((prev) => ({ ...prev, [task.id]: null }));
                                      }
                                    }}
                                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer min-h-[140px] flex flex-col justify-between ${
                                      activeLeft
                                        ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300 hover:bg-emerald-100'
                                        : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                                    }`}
                                  >
                                    <div>
                                      <div className="p-2 bg-emerald-600 text-white rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-2xs mb-2">
                                        <span className="w-5 h-5 rounded-full bg-white text-emerald-800 flex items-center justify-center font-black text-[11px] shrink-0">
                                          {catLetter}
                                        </span>
                                        <span className="truncate">{catName}</span>
                                      </div>

                                      {/* DANH SÁCH CÁC CÂU ĐÃ THẢ VÀO NHÓM NÀY */}
                                      <div className="space-y-1.5">
                                        {placedItemsInCat.map((placedItem) => {
                                          const res = taskResultState[placedItem.id];
                                          const isItemCorrect = res?.isCorrect;

                                          let itemBadge = 'bg-white border-emerald-300 text-slate-900';
                                          if (checked) {
                                            itemBadge = isItemCorrect ? 'bg-emerald-200 border-emerald-500 text-emerald-950 font-black' : 'bg-rose-200 border-rose-500 text-rose-950 font-black';
                                          }

                                          return (
                                            <div
                                              key={placedItem.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (checked) return;
                                                handleAnswerChange(task.id, placedItem.id, '');
                                              }}
                                              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-between gap-1 shadow-2xs ${itemBadge}`}
                                              title="Bấm để đưa câu này về thanh trên"
                                            >
                                              <span className="truncate">{placedItem.left}</span>
                                              {!checked && <span className="text-rose-500 text-[10px] font-black shrink-0">✕</span>}
                                            </div>
                                          );
                                        })}

                                        {placedItemsInCat.length === 0 && (
                                          <div className="py-4 text-center text-xs text-emerald-700/70 font-semibold italic border-2 border-dashed border-emerald-300/60 rounded-xl">
                                            {activeLeft ? '👉 Bấm vào đây để xếp câu vào nhóm' : 'Thả các câu phù hợp vào đây'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // =========================================================================
                      // CHẾ ĐỘ 3: CHẾ ĐỘ NỐI CẶP 1 - 1 TIÊU CHUẨN CƠ BẢN
                      // =========================================================================
                      return (
                        <div className="space-y-3 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs">
                          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
                            <span className="text-xs font-black text-slate-800 flex items-center space-x-1">
                              <span>🔗 BẤM MỤC CỘT A RỒI BẤM MỤC TƯƠNG ỨNG Ở CỘT B ĐỂ NỐI CẶP:</span>
                            </span>
                            {activeLeft && (
                              <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-lg border border-sky-300 animate-pulse">
                                👉 Đang chọn Cột A... Vui lòng bấm Cột B để nối
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* CỘT A (LEFT COLUMN) */}
                            <div className="space-y-2">
                              <span className="block text-[11px] font-black text-sky-900 uppercase">📌 CỘT A (ĐỀ BÀI)</span>
                              {items.map((item, idx) => {
                                const pairedVal = tAnswers[item.id];
                                const isActive = activeLeft === item.id;
                                const res = taskResultState[item.id];
                                const colorTheme = pairColors[idx % pairColors.length];

                                let cardStyle = 'bg-white border-slate-300 hover:border-sky-400 hover:bg-sky-50';
                                if (checked) {
                                  if (res?.isCorrect) cardStyle = 'bg-emerald-100 border-emerald-500 font-extrabold text-emerald-950';
                                  else cardStyle = 'bg-rose-100 border-rose-500 font-extrabold text-rose-950';
                                } else if (isActive) {
                                  cardStyle = 'bg-sky-100 border-sky-500 ring-2 ring-sky-400 font-extrabold text-sky-950 shadow-md';
                                } else if (pairedVal) {
                                  cardStyle = `${colorTheme.bg} font-bold`;
                                }

                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    disabled={checked}
                                    onClick={() => {
                                      if (checked) return;
                                      setActiveMatchingItem((prev) => ({
                                        ...prev,
                                        [task.id]: prev[task.id] === item.id ? null : item.id,
                                      }));
                                    }}
                                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${cardStyle}`}
                                  >
                                    <span className="font-semibold">{item.left}</span>
                                    {pairedVal && (
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/80 border border-current shrink-0">
                                        {colorTheme.badge}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* CỘT B (RIGHT COLUMN - SHUFFLED ORDER) */}
                            <div className="space-y-2">
                              <span className="block text-[11px] font-black text-teal-900 uppercase">🎯 CỘT B (NGHĨA / ĐÁP ÁN)</span>
                              {items.map((itemRight, rightIdx) => {
                                const pairedLeftItem = items.find((it) => tAnswers[it.id] === itemRight.right);
                                const pairedLeftIdx = pairedLeftItem ? items.findIndex((it) => it.id === pairedLeftItem.id) : -1;
                                const colorTheme = pairedLeftIdx >= 0 ? pairColors[pairedLeftIdx % pairColors.length] : null;

                                let rightStyle = 'bg-white border-slate-300 hover:border-teal-400 hover:bg-teal-50';
                                if (checked) {
                                  if (pairedLeftItem) {
                                    const res = taskResultState[pairedLeftItem.id];
                                    if (res?.isCorrect) rightStyle = 'bg-emerald-100 border-emerald-500 font-extrabold text-emerald-950';
                                    else rightStyle = 'bg-rose-100 border-rose-500 font-extrabold text-rose-950';
                                  }
                                } else if (pairedLeftItem) {
                                  rightStyle = `${colorTheme.bg} font-bold`;
                                }

                                return (
                                  <button
                                    key={rightIdx}
                                    type="button"
                                    disabled={checked}
                                    onClick={() => {
                                      if (checked) return;
                                      if (activeLeft) {
                                        handleAnswerChange(task.id, activeLeft, itemRight.right);
                                        setActiveMatchingItem((prev) => ({ ...prev, [task.id]: null }));
                                      }
                                    }}
                                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${rightStyle}`}
                                  >
                                    <span className="font-semibold">{itemRight.right}</span>
                                    {pairedLeftItem && (
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/80 border border-current shrink-0">
                                        {colorTheme.badge}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {checked && (
                            <div className="pt-2 border-t border-slate-200 space-y-1">
                              {items.map((it) => {
                                const res = taskResultState[it.id];
                                return (
                                  <div key={it.id} className="text-[11px] flex items-center justify-between font-bold">
                                    <span className="text-slate-800">{it.left}</span>
                                    {res?.isCorrect ? (
                                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">✓ Đã nối đúng: {it.right}</span>
                                    ) : (
                                      <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300">✕ Đáp án đúng: {it.right}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* ========================================================================= */}
                    {/* DẠNG 9: TRẮC NGHIỆM SẮP XẾP THỨ TỰ CÂU (COMMUNICATION SECTION CHUẨN GỌN KHÍT + HIGHLIGHT & SHUFFLE) */}
                    {/* ========================================================================= */}
                    {task.taskType === 'communication_order' && (() => {
                      const items = parseCommunicationOrderContent(task.content);
                      const tAnswers = userAnswers[task.id] || {};

                      return (
                        <div className="space-y-4">
                          {items.map((item, itemIdx) => {
                            const selectedOpt = (tAnswers[item.id] || '').trim();
                            const res = taskResultState[item.id];
                            
                            // 1. TỰ ĐỘNG XÁO TRỘN NGẪU NHIÊN 4 NÚT A, B, C, D MỖI LẦN HỌC SINH BẤM "LÀM LẠI BÀI"
                            const shuffledOptions = getShuffledMcqOptions(item);
                            const optionsList = shuffledOptions.length > 0 ? shuffledOptions : (item.options || ['a-b-d-c', 'b-a-d-c', 'b-d-a-c', 'd-a-b-c']);

                            // XÁC ĐỊNH NỘI DUNG ĐÁP ÁN ĐÚNG DÙ A, B, C, D CÓ BỊ XÁO TRỘN VỊ TRÍ
                            const rawAnswer = (item.answer || 'B').trim();
                            let targetAnsText = rawAnswer;
                            if (['A', 'B', 'C', 'D'].includes(rawAnswer.toUpperCase()) && item.options && item.options.length > 0) {
                              const idx = rawAnswer.toUpperCase().charCodeAt(0) - 65;
                              if (item.options[idx]) {
                                targetAnsText = item.options[idx].trim();
                              }
                            }

                            return (
                              <div
                                key={item.id || itemIdx}
                                className="p-3.5 sm:p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 text-left relative overflow-hidden"
                              >
                                {/* ĐỀ BÀI / PROMPT (46. Choose A, B, C, or D...) */}
                                {item.prompt && (
                                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug border-b border-slate-200/60 pb-2 flex items-start space-x-2">
                                    <span className="text-indigo-600 font-extrabold text-sm sm:text-base shrink-0">{item.prompt}</span>
                                  </div>
                                )}

                                {/* DANH SÁCH CÁC CÂU THÀNH PHẦN a, b, c, d (BẤM VÀO CÂU ĐỂ ĐÁNH DẤU HIGHLIGHT) */}
                                <div className="space-y-1.5">
                                  {(item.sentences || []).map((st, sIdx) => {
                                    const label = st.label || String.fromCharCode(97 + sIdx);
                                    const sentenceKey = `${task.id}_${item.id}_${sIdx}`;
                                    const isSentenceHighlighted = !!highlightedCommSentences[sentenceKey];

                                    return (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => toggleCommSentenceHighlight(sentenceKey)}
                                        className={`w-full px-3 py-2 rounded-xl border flex items-center space-x-2.5 transition-all cursor-pointer text-left shadow-2xs ${
                                          isSentenceHighlighted
                                            ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300/80 font-bold text-amber-950 shadow-xs'
                                            : 'bg-white hover:bg-indigo-50/40 border-slate-200/80 text-slate-800'
                                        }`}
                                        title="Bấm vào câu này để đánh dấu / bỏ đánh dấu khi suy luận thứ tự"
                                      >
                                        {/* CIRCLE BADGE CHO CÁC CÂU a, b, c, d */}
                                        <div
                                          className={`w-5.5 h-5.5 rounded-lg font-black text-[11px] flex items-center justify-center shrink-0 transition-colors ${
                                            isSentenceHighlighted
                                              ? 'bg-amber-500 text-white shadow-2xs'
                                              : 'bg-indigo-100 text-indigo-700 border border-indigo-200/80'
                                          }`}
                                        >
                                          {label}
                                        </div>
                                        <div className={`text-xs sm:text-[13px] leading-snug flex-1 ${isSentenceHighlighted ? 'font-bold text-amber-950' : 'font-medium text-slate-800'}`}>
                                          {st.text}
                                        </div>
                                        {isSentenceHighlighted && (
                                          <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-md shrink-0 animate-scale-up">
                                            ★ Đã chọn
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* BỘ 4 NÚT LỰA CHỌN TRẮC NGHIỆM HÀNG NGANG A, B, C, D (ĐÃ XÓA DÒNG TIẾNG VIỆT THỪA) */}
                                <div className="pt-2 border-t border-slate-200/60">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {optionsList.map((opt, oIdx) => {
                                      const optLetter = String.fromCharCode(65 + oIdx);
                                      const cleanOptText = opt.startsWith('*') ? opt.substring(1) : opt;
                                      const isSelected = (selectedOpt.toLowerCase() === cleanOptText.toLowerCase()) || (selectedOpt.toUpperCase() === optLetter);

                                      let btnStyle = 'bg-white text-slate-800 border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-2xs';
                                      if (checked) {
                                        const isCorrectOpt = (cleanOptText.toLowerCase() === targetAnsText.toLowerCase()) || (optLetter === rawAnswer.toUpperCase());

                                        if (isCorrectOpt) {
                                          btnStyle = 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs ring-1 ring-emerald-300';
                                        } else if (isSelected) {
                                          btnStyle = 'bg-rose-600 text-white border-rose-700 font-bold shadow-xs ring-1 ring-rose-300';
                                        } else {
                                          btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-50';
                                        }
                                      } else if (isSelected) {
                                        btnStyle = 'bg-indigo-600 text-white border-indigo-700 font-extrabold shadow-xs ring-1 ring-indigo-300';
                                      }

                                      return (
                                        <button
                                          key={oIdx}
                                          type="button"
                                          disabled={checked}
                                          onClick={() => handleAnswerChange(task.id, item.id, cleanOptText)}
                                          className={`py-1.5 px-2.5 rounded-xl text-xs sm:text-[13px] transition-all duration-150 cursor-pointer text-center font-bold border ${btnStyle}`}
                                        >
                                          <span>{optLetter}. {cleanOptText}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* GIẢI THÍCH ĐÁP ÁN KHI ĐÃ BẤM CHECK NỘP BÀI */}
                                {checked && (
                                  <div className="pt-2 border-t border-slate-200/60 animate-fade-in space-y-1.5">
                                    {res?.isCorrect ? (
                                      <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>✓ CHÍNH XÁC 100%! Bạn đã chọn đúng thứ tự câu.</span>
                                      </div>
                                    ) : (
                                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 text-xs space-y-1">
                                        <div className="font-bold text-rose-700 flex items-center space-x-1.5">
                                          <span>✕ RẤT TIẾC, ĐÁP ÁN CHƯA ĐÚNG!</span>
                                        </div>
                                        <p className="font-bold text-slate-800">
                                          👉 Đáp án đúng là phương án: <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md font-black">{item.answer}</span>
                                        </p>
                                      </div>
                                    )}

                                    {item.explanation && (
                                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-0.5">
                                        <div className="font-bold flex items-center space-x-1.5 text-amber-900">
                                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                          <span>💡 Giải thích đáp án:</span>
                                        </div>
                                        <p className="font-serif italic text-slate-800 leading-relaxed text-[11px]">
                                          {item.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* NÚT THAO TÁC CHECK VÀ NỘP BÀI DƯỚI CÙNG */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 print:hidden">
            <div className="flex space-x-3">
              {!checked ? (
                <button
                  type="button"
                  onClick={handleCheckWorksheet}
                  className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl shadow-md transition transform hover:scale-105 flex items-center space-x-2 border border-sky-700 cursor-pointer"
                >
                  <Check className="w-5 h-5 text-white" />
                  <span>✔ Check (Kiểm Tra Đáp Án)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetWorksheet}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Làm Lại Từ Đầu</span>
                </button>
              )}
            </div>

            {checked && !submitted && (
              <button
                type="button"
                onClick={handleSubmitWorksheet}
                disabled={submitting}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer border border-emerald-400 transform hover:scale-105"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Đang gửi bài...' : '🚀 NỘP BÀI CHO THẦY HẢI'}</span>
              </button>
            )}

            {submitted && (
              <div className="px-5 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Em đã nộp bài Worksheet thành công!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
