import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Send,
  Edit3,
  BarChart2,
  Share2,
  Clock,
  Award,
  CheckCircle2,
  Volume2,
  HelpCircle,
  Copy,
  Download,
  Database,
  Sparkles,
  BookOpen,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  RotateCcw,
  Headphones,
  Check,
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { SEED_EXAMS, assignExamToClass } from '../examStorage';

export default function ExamAuthoringTab({
  exams = [],
  onPreviewExam,
  onAssignExam,
  onViewProgress,
  onExamCreated
}) {
  const [activeMenu, setActiveMenu] = useState('created'); // 'created' | 'editor' | 'bank' | 'export'
  const [selectedExamForExport, setSelectedExamForExport] = useState(exams[0] || SEED_EXAMS[0]);
  const [copiedNotification, setCopiedNotification] = useState('');

  // Tab điều hướng 5 phần trong Editor (theo đúng Ảnh 1)
  const [currentSection, setCurrentSection] = useState('section1'); // 'all' | 'section1' | 'section2' | 'section3' | 'section4'
  const [listeningSubTab, setListeningSubTab] = useState('part2'); // 'part1' | 'part2' | 'part3' | 'both_2_3'

  // Trạng thái đề thi đang soạn thảo (đầy đủ 41 câu chuẩn theo Ảnh 1 & 2)
  const [examData, setExamData] = useState(() => {
    return {
      title: 'ĐỀ KIỂM TRA ĐỊNH KỲ TIẾNG ANH 8 GLOBAL SUCCESS (HỌC KÌ I)',
      code: 'ENG8-GK1-01',
      durationMinutes: 45,
      totalPoints: 10,
      assignedClass: '8A1, 8A2',
      deadline: '2026-10-30 23:59',

      // SECTION 1: LISTENING (14 câu • 3.5đ)
      listening: {
        // Part 1: Gap Fill (Câu 1 - 4 • 1.0đ)
        part1: {
          topic: "Phong's Country House",
          instruction: 'Part I. Listen to the passage and fill in each blank with ONE suitable word or number. (1.0 mark)',
          audioName: 'Part1_Phongs_Village_GapFill.mp3',
          audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=english-listening-test-sample.mp3',
          points: 1.0,
          questions: [
            { id: 'q1', num: 1, prompt: 'Linh lives with her parents in a country house in a small ________.', answer: 'village', points: 0.25 },
            { id: 'q2', num: 2, prompt: 'In front of her house, there is a beautiful flower ________.', answer: 'garden', points: 0.25 },
            { id: 'q3', num: 3, prompt: 'Her bedroom is on the ________ floor.', answer: 'second', points: 0.25 },
            { id: 'q4', num: 4, prompt: 'Every morning, Linh wakes up at ________ o\'clock.', answer: 'six', points: 0.25 }
          ]
        },

        // Part 2: Multiple Choice (Câu 5 - 10 • 1.5đ)
        part2: {
          topic: 'Conversation between Nick and Elena',
          instruction: 'Listen to a conversation between Nick, who lives in the city, and his cousin Elena, who lives in the countryside.',
          audioName: 'Part2_NickAndElena_Conversation.mp3',
          audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=short-uk-dialogue.mp3',
          points: 1.5,
          questions: [
            {
              id: 'q5',
              num: 5,
              partLabel: 'Part 2 - Câu 1',
              prompt: 'Nick thinks that life in the countryside is more ________ than in the city.',
              options: ['A. boring', 'B. exciting and fast', 'C. peaceful and relaxing', 'D. expensive'],
              correct: 'C',
              explanation: 'Trong bài nghe, Nick khẳng định cuộc sống làng quê yên bình và thư thái hơn.'
            },
            {
              id: 'q6',
              num: 6,
              partLabel: 'Part 2 - Câu 2',
              prompt: 'What did Elena do yesterday afternoon with her village friends?',
              options: ['A. Went shopping at a mall', 'B. Flew kites on the open meadow', 'C. Played online video games', 'D. Watched movies at the cinema'],
              correct: 'B',
              explanation: 'Elena cùng bạn đi thả diều trên đồng cỏ rộng.'
            },
            {
              id: 'q7',
              num: 7,
              partLabel: 'Part 2 - Câu 3',
              prompt: 'How do local villagers usually travel between the villages?',
              options: ['A. By taxi or metro', 'B. By train', 'C. By bicycle or walking', 'D. By airplane'],
              correct: 'C',
              explanation: 'Người dân thường đi bộ hoặc đạp xe trên những con đường làng quanh co.'
            },
            {
              id: 'q8',
              num: 8,
              partLabel: 'Part 2 - Câu 4',
              prompt: 'When does the harvest festival take place in the countryside?',
              options: ['A. In early spring', 'B. In late autumn', 'C. In the middle of winter', 'D. Every weekend'],
              correct: 'B',
              explanation: 'Lễ hội mùa gặt diễn ra vào cuối thu khi lúa chín vàng.'
            },
            {
              id: 'q9',
              num: 9,
              partLabel: 'Part 2 - Câu 5',
              prompt: 'What does Nick dislike most when visiting the rural area?',
              options: ['A. The fresh air', 'B. The friendly people', 'C. There are too many mosquitoes at night', 'D. The delicious local food'],
              correct: 'C',
              explanation: 'Nick than phiền về muỗi vào buổi tối.'
            },
            {
              id: 'q10',
              num: 10,
              partLabel: 'Part 2 - Câu 6',
              prompt: 'What is Elena’s dream for her future career?',
              options: ['A. Moving to a bustling city to work in banking', 'B. Becoming an agricultural scientist to help farmers', 'C. Opening a souvenir shop', 'D. Staying at home all day'],
              correct: 'B',
              explanation: 'Elena mong ước trở thành kỹ sư nông nghiệp để giúp đỡ bà con nông dân.'
            }
          ]
        },

        // Part 3: True / False (Câu 11 - 14 • 1.0đ)
        part3: {
          topic: 'Part 3: True / False Statements',
          instruction: 'Part 3: Listen to the audio recording about community life and traditions. Decide whether the statements are True or False.',
          audioName: 'Part3_CommunityLife_TrueFalse.mp3',
          audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_morning.ogg',
          points: 1.0,
          questions: [
            {
              id: 'q11',
              num: 11,
              statement: 'Phong usually spends his Sunday mornings volunteering at the local community library.',
              correct: 'TRUE',
              explanation: 'Phong thường xuyên đến thư viện cộng đồng giúp đỡ xếp sách vào sáng Chủ Nhật.'
            },
            {
              id: 'q12',
              num: 12,
              statement: 'Dream Secondary School is located in Da Nang.',
              correct: 'FALSE',
              explanation: 'Trường THCS Dream nằm ở ngoại thành Hà Nội, không phải Đà Nẵng.'
            },
            {
              id: 'q13',
              num: 13,
              statement: 'Students in the village wear green uniforms every day of the week.',
              correct: 'FALSE',
              explanation: 'Học sinh chỉ mặc đồng phục vào thứ Hai và thứ Sáu.'
            },
            {
              id: 'q14',
              num: 14,
              statement: 'After school, Hoa and her classmates usually help elderly neighbours clean their gardens.',
              correct: 'TRUE',
              explanation: 'Các em học sinh thường xuyên giúp đỡ các cụ già neo đơn quét dọn sân vườn.'
            }
          ]
        }
      },

      // SECTION 2: LANGUAGE (10 câu • 2.5đ, Câu 15 - 24)
      language: {
        instruction: 'Choose the best option A, B, C or D to complete each question or passage.',
        points: 2.5,
        questions: [
          { id: 'q15', num: 15, prompt: 'Choose the word whose underlined part is pronounced differently: leisure / ensure / measure / pleasure', options: ['A. leisure', 'B. ensure', 'C. measure', 'D. pleasure'], correct: 'B', explanation: 'Phần gạch chân "s" ở "ensure" phát âm là /ʃ/, các từ còn lại là /ʒ/.' },
          { id: 'q16', num: 16, prompt: 'Choose the word with different stress pattern: balance / cattle / prefer / pasture', options: ['A. balance', 'B. cattle', 'C. prefer', 'D. pasture'], correct: 'C', explanation: '"prefer" có trọng âm 2, các từ còn lại trọng âm 1.' },
          { id: 'q17', num: 17, prompt: 'First, maintain a well-balanced diet to (17) ________ your immune system.', options: ['A. boost', 'B. boosting', 'C. boosted', 'D. booster'], correct: 'A', explanation: 'Sau to là động từ nguyên mẫu (to boost).' },
          { id: 'q18', num: 18, prompt: 'Teens should take regular exercise instead of spending hours (18) ________ games online.', options: ['A. to play', 'B. played', 'C. playing', 'D. play'], correct: 'C', explanation: 'Cấu trúc: spend time doing sth (playing).' },
          { id: 'q19', num: 19, prompt: 'Talk to your parents or the school (19) ________ whenever you feel stressed.', options: ['A. counsellor', 'B. artisan', 'C. firefighter', 'D. driver'], correct: 'A', explanation: 'school counsellor: chuyên viên tư vấn học đường.' },
          { id: 'q20', num: 20, prompt: 'Get at least 8 hours of sleep so you can concentrate (20) ________ your lessons next morning.', options: ['A. at', 'B. in', 'C. on', 'D. for'], correct: 'C', explanation: 'concentrate on: tập trung vào.' },
          { id: 'q21', num: 21, prompt: 'All grade 8 students must assemble at the school gate at 6:30 AM (21) ________.', options: ['A. sharp', 'B. sharply', 'C. sharpen', 'D. sharpness'], correct: 'A', explanation: '6:30 AM sharp: đúng 6 giờ 30.' },
          { id: 'q22', num: 22, prompt: 'Villagers produce high-quality (22) ________ crafts like conical hats and pottery.', options: ['A. handmade', 'B. electronic', 'C. digital', 'D. plastic'], correct: 'A', explanation: 'handmade crafts: hàng thủ công làm bằng tay.' },
          { id: 'q23', num: 23, prompt: 'Nam is very keen (23) ________ playing traditional Vietnamese folk games.', options: ['A. on', 'B. in', 'C. at', 'D. with'], correct: 'A', explanation: 'keen on: yêu thích.' },
          { id: 'q24', num: 24, prompt: 'People in rural villages live (24) ________ to nature than city dwellers.', options: ['A. close', 'B. closer', 'C. more closely', 'D. closest'], correct: 'B', explanation: 'live closer to nature: sống gần gũi với thiên nhiên hơn.' }
        ]
      },

      // SECTION 3: READING (10 câu • 2.5đ, Câu 25 - 34)
      reading: {
        part1: {
          title: 'Part 1: Life in Duong Lam Ancient Village (Cloze Test)',
          passage: 'Duong Lam Ancient Village is located in Son Tay Town, about 44 km from Hanoi centre. It is the first ancient village in Vietnam recognised as a national historical and cultural relic. What makes Duong Lam special is its preserved laterite houses that are over 300 years old. Villagers maintain a peaceful and slow-paced lifestyle.',
          questions: [
            { id: 'q25', num: 25, prompt: 'Duong Lam is located about 44 kilometres from central Hanoi.', options: ['True', 'False'], correct: 'True' },
            { id: 'q26', num: 26, prompt: 'The historic houses here are constructed with laterite bricks.', options: ['True', 'False'], correct: 'True' },
            { id: 'q27', num: 27, prompt: 'The lifestyle in Duong Lam is extremely noisy and hurried.', options: ['True', 'False'], correct: 'False' },
            { id: 'q28', num: 28, prompt: 'Villagers usually ride bicycles or walk to school.', options: ['True', 'False'], correct: 'True' },
            { id: 'q29', num: 29, prompt: 'Visiting Duong Lam offers tourists an authentic glimpse into northern rural culture.', options: ['True', 'False'], correct: 'True' }
          ]
        },
        part2: {
          title: 'Part 2: Teen Leisure Time and Balanced Life (Comprehension)',
          passage: 'In recent years, the way teenagers spend their spare time has changed dramatically. A decade ago, young people engaged more in outdoor games like football or cycling. Today, a large number of teens prefer staying indoors, scrolling through social media feeds, or playing online games. Excessive screen time leads to physical fatigue and poor concentration. Health experts suggest teenagers should balance their leisure time: spend at least 45 minutes daily on physical activities and engage in hands-on hobbies like cooking, drawing, or DIY crafts.',
          questions: [
            { id: 'q30', num: 30, prompt: 'What is the passage mainly about?', options: ['A. History of online video games', 'B. Changes in teen leisure activities and tips for a balanced life', 'C. How to shop on smartphones', 'D. Sleeping habits of children'], correct: 'B' },
            { id: 'q31', num: 31, prompt: 'Ten years ago, teenagers used to spend more time ________.', options: ['A. playing outdoor sports and games', 'B. watching TV all day', 'C. texting on smartphones', 'D. sitting alone in their rooms'], correct: 'A' },
            { id: 'q32', num: 32, prompt: 'What can excessive screen time cause for teenagers?', options: ['A. Better eyesight', 'B. Physical fatigue and poor concentration', 'C. Greater speed in running', 'D. Perfect exam results'], correct: 'B' },
            { id: 'q33', num: 33, prompt: 'What do health experts recommend teens do every day?', options: ['A. Spend 45 minutes on physical activity', 'B. Play video games for 4 hours', 'C. Never talk to friends', 'D. Skip morning meals'], correct: 'A' },
            { id: 'q34', num: 34, prompt: 'The phrase "engage in" in the passage is closest in meaning to ________.', options: ['A. give up', 'B. look down on', 'C. take part in', 'D. turn off'], correct: 'C' }
          ]
        }
      },

      // SECTION 4: WRITING (7 câu • 2.0đ, Câu 35 - 41)
      writing: {
        task1: {
          instruction: 'Task 1: Sắp xếp các từ gợi ý thành câu hoàn chỉnh',
          questions: [
            { id: 'q35', num: 35, cues: 'Life / in / countryside / be / more / peaceful / than / in / big / cities / .', correct: 'Life in the countryside is more peaceful than in big cities.' },
            { id: 'q36', num: 36, cues: 'Teenagers / should / balance / their / time / between / study / and / physical / exercises / .', correct: 'Teenagers should balance their time between study and physical exercises.' },
            { id: 'q37', num: 37, cues: 'Mai / spend / two / hours / make / origami / models / every / Sunday / afternoon / .', correct: 'Mai spends two hours making origami models every Sunday afternoon.' }
          ]
        },
        task2: {
          instruction: 'Task 2: Viết lại câu sao cho nghĩa không đổi',
          questions: [
            { id: 'q38', num: 38, prompt: 'Mai loves creating handmade gifts for her best friends. (keen)', startWith: 'Mai is', correct: 'Mai is keen on creating handmade gifts for her best friends.' },
            { id: 'q39', num: 39, prompt: 'He started learning to play the guitar two years ago.', startWith: 'He has', correct: 'He has learned to play the guitar for two years.' },
            { id: 'q40', num: 40, prompt: 'No one in our class runs as fast as Minh.', startWith: 'Minh is', correct: 'Minh is the fastest runner in our class.' }
          ]
        },
        paragraph: {
          num: 41,
          topic: 'Write a paragraph (80 - 100 words) about your favourite leisure activity or life in your neighbourhood.',
          guidance: 'Mention: 1. What the activity/neighbourhood is; 2. Who you do it with / How often; 3. Why you love it and its benefits.',
          sampleEssay: 'My favourite leisure activity is cycling around my neighbourhood with my best friends every Saturday afternoon. Our neighbourhood is quiet, green, and full of shade from tall trees. Cycling not only allows me to enjoy the fresh breeze, but it also keeps me healthy and energetic after long hours of studying. Moreover, chatting and laughing with friends helps me reduce school stress and feel refreshed for the new week.'
        }
      }
    };
  });

  const fileInputRefPart1 = useRef(null);
  const fileInputRefPart2 = useRef(null);
  const fileInputRefPart3 = useRef(null);

  const handleCopyText = (text, msg) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(msg || 'Đã sao chép vào bộ nhớ tạm!');
    setTimeout(() => setCopiedNotification(''), 3000);
  };

  // Tải file âm thanh từ máy tính
  const handleUploadAudio = (partKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        [partKey]: {
          ...prev.listening[partKey],
          audioName: file.name,
          audioUrl: fileUrl
        }
      }
    }));
    handleCopyText('', `Đã tải âm thanh "${file.name}" cho ${partKey.toUpperCase()} thành công!`);
  };

  // Khôi phục đề nghe mẫu
  const handleResetListening = () => {
    if (window.confirm('Khôi phục phần Nghe (Listening) về cấu hình chuẩn ban đầu?')) {
      setExamData((prev) => ({
        ...prev,
        listening: JSON.parse(JSON.stringify(SEED_EXAMS[0].sections.listening))
      }));
    }
  };

  // Thêm câu hỏi vào Part 2 (Multiple Choice)
  const handleAddQuestionPart2 = () => {
    const p2Questions = examData.listening.part2.questions;
    const nextNum = p2Questions.length > 0 ? p2Questions[p2Questions.length - 1].num + 1 : 5;
    const newQ = {
      id: `q_p2_${Date.now()}`,
      num: nextNum,
      partLabel: `Part 2 - Câu ${p2Questions.length + 1}`,
      prompt: 'Nick and Elena agree that teenagers should spend more time ________.',
      options: ['A. reading books and doing outdoor sports', 'B. playing computer games', 'C. staying awake late', 'D. drinking soft drinks'],
      correct: 'A',
      explanation: 'Cả hai bạn đều đồng ý nên đọc sách và rèn luyện thể thao ngoài trời.'
    };

    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        part2: {
          ...prev.listening.part2,
          questions: [...prev.listening.part2.questions, newQ]
        }
      }
    }));
  };

  // Xóa câu hỏi Part 2
  const handleDeleteQuestionPart2 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        part2: {
          ...prev.listening.part2,
          questions: prev.listening.part2.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // Thêm câu hỏi vào Part 3 (True / False)
  const handleAddQuestionPart3 = () => {
    const p3Questions = examData.listening.part3.questions;
    const nextNum = p3Questions.length > 0 ? p3Questions[p3Questions.length - 1].num + 1 : 11;
    const newQ = {
      id: `q_p3_${Date.now()}`,
      num: nextNum,
      statement: 'Local authorities are planning to build a new playground for children in Duong Lam.',
      correct: 'TRUE',
      explanation: 'Chính quyền địa phương đang có kế hoạch xây dựng sân chơi mới cho trẻ em.'
    };

    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        part3: {
          ...prev.listening.part3,
          questions: [...prev.listening.part3.questions, newQ]
        }
      }
    }));
  };

  // Xóa câu hỏi Part 3
  const handleDeleteQuestionPart3 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        part3: {
          ...prev.listening.part3,
          questions: prev.listening.part3.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // Lưu toàn bộ đề thi vào kho đề
  const handleSaveExam = () => {
    const formattedExam = {
      id: `exam-${Date.now()}`,
      title: examData.title,
      code: examData.code,
      durationMinutes: examData.durationMinutes,
      totalPoints: examData.totalPoints,
      assignedClass: examData.assignedClass,
      deadline: examData.deadline,
      status: 'draft',
      createdAt: new Date().toISOString(),
      listening: examData.listening,
      language: examData.language,
      reading: examData.reading,
      writing: examData.writing,
      sections: {
        listening: examData.listening,
        languageFocus: examData.language,
        reading: examData.reading,
        communication: { questions: [] },
        writing: examData.writing
      }
    };

    if (onExamCreated) {
      onExamCreated(formattedExam);
    }
    handleCopyText('', 'Đã lưu cấu hình đề thi thành công vào Kho đề!');
    setActiveMenu('created');
  };

  // Đếm tổng số câu hỏi
  const totalListeningCount =
    (examData.listening.part1?.questions?.length || 0) +
    (examData.listening.part2?.questions?.length || 0) +
    (examData.listening.part3?.questions?.length || 0);

  const totalLanguageCount = examData.language.questions?.length || 0;
  const totalReadingCount =
    (examData.reading.part1?.questions?.length || 0) +
    (examData.reading.part2?.questions?.length || 0);
  const totalWritingCount =
    (examData.writing.task1?.questions?.length || 0) +
    (examData.writing.task2?.questions?.length || 0) +
    (examData.writing.paragraph ? 1 : 0);
  const grandTotal = totalListeningCount + totalLanguageCount + totalReadingCount + totalWritingCount;

  return (
    <div className="space-y-6">
      {/* 4 Menus Navigation Bar */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5 sm:gap-2">
        {[
          { id: 'created', label: 'A. Đề đã tạo (Quản lý đề thi)', icon: '📋' },
          { id: 'editor', label: 'B. Soạn đề (5 phần ma trận)', icon: '✏️' },
          { id: 'bank', label: 'C. Ngân hàng câu hỏi (4 mức độ)', icon: '🗄️' },
          { id: 'export', label: 'D. Xuất LMS / Antigravity', icon: '🚀' }
        ].map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-2 ${
              activeMenu === menu.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-transparent text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{menu.icon}</span>
            <span>{menu.label}</span>
          </button>
        ))}
      </div>

      {copiedNotification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* ========================================================
          MENU A: ĐỀ ĐÃ TẠO (Exam List & Management)
      ======================================================== */}
      {activeMenu === 'created' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">Danh sách các Đề Thi đã tạo</h3>
              <p className="text-xs text-slate-500">
                Quản lý trạng thái mở cho học sinh làm bài, xem trước đề, theo dõi tiến độ nộp bài
              </p>
            </div>
            <button
              onClick={() => setActiveMenu('editor')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đề thi mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => {
              const isPublished = exam.status === 'published';
              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-300 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {exam.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center space-x-1 border ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{isPublished ? 'Đang mở cho lớp' : 'Bản nháp (Chưa mở)'}</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 mb-3">
                      {exam.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Lớp nhận đề:</span>
                        <span className="font-extrabold text-slate-800">{exam.assignedClass || 'Chưa giao'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Thời lượng & Thang điểm:</span>
                        <span className="font-extrabold text-slate-800">
                          {exam.durationMinutes} phút • {exam.totalPoints || 10}đ
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Hạn nộp bài:</span>
                        <span className="font-semibold text-emerald-800">{exam.deadline || 'Chưa đặt hạn'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onPreviewExam(exam)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center space-x-1 border border-emerald-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem lại đề</span>
                    </button>

                    <button
                      onClick={() => onAssignExam(exam)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Giao cho lớp</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveMenu('editor');
                        setExamData((prev) => ({
                          ...prev,
                          title: exam.title,
                          code: exam.code
                        }));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa đề</span>
                    </button>

                    <button
                      onClick={() => onViewProgress(exam)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center space-x-1 border border-indigo-200"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Tiến độ</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedExamForExport(exam);
                        setActiveMenu('export');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1 ml-auto"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>LMS</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MENU B: SOẠN ĐỀ (Editor 5 Phần Ma Trận - CHUẨN THEO ẢNH 1 & 2)
      ======================================================== */}
      {activeMenu === 'editor' && (
        <div className="space-y-5">
          {/* Top Bar lưu & thông tin đề */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Trình soạn đề 5 phần chuẩn ma trận</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{examData.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã đề: <b>{examData.code}</b> • Thời lượng: {examData.durationMinutes} phút • Thang điểm: 10đ
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveMenu('created')}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveExam}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Lưu vào kho đề</span>
              </button>
            </div>
          </div>

          {/* THANH ĐIỀU HƯỚNG TỪNG PHẦN (THEO ĐÚNG ẢNH 1 CỦA THẦY) */}
          <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setCurrentSection('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                currentSection === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tất cả 5 phần ({grandTotal} câu)
            </button>

            <button
              onClick={() => setCurrentSection('section1')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border-2 ${
                currentSection === 'section1'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>SECTION 1: LISTENING ({totalListeningCount})</span>
            </button>

            <button
              onClick={() => setCurrentSection('section2')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                currentSection === 'section2'
                  ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
              }`}
            >
              <span>SECTION 2: LANGUAGE ({totalLanguageCount})</span>
            </button>

            <button
              onClick={() => setCurrentSection('section3')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                currentSection === 'section3'
                  ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100'
              }`}
            >
              <span>SECTION 3: READING ({totalReadingCount})</span>
            </button>

            <button
              onClick={() => setCurrentSection('section4')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                currentSection === 'section4'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>SECTION 4: WRITING ({totalWritingCount})</span>
            </button>
          </div>

          {/* =================================================================
              SECTION 1: LISTENING (CHI TIẾT ĐẦY ĐỦ CỦA ẢNH 1 & ẢNH 2)
          ================================================================== */}
          {(currentSection === 'section1' || currentSection === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
              {/* Header Section 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold shrink-0">
                    🎧
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        SECTION 1
                      </span>
                      <h3 className="text-base font-black text-slate-900">Section 1: Listening</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Listen to separate audio recordings: Part 1 (Phong's Village), Part 2 (Nick & Elena), and Part 3 (Community Life).
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs self-start sm:self-auto">
                  3.5 điểm ({totalListeningCount} câu)
                </div>
              </div>

              {/* Sub-tabs của Listening: Part 1, Part 2, Part 3 */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  onClick={() => setListeningSubTab('part1')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                    listeningSubTab === 'part1'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Part 1: Gap Fill ({examData.listening.part1.questions.length} câu • 1.0đ)
                </button>

                <button
                  onClick={() => setListeningSubTab('part2')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                    listeningSubTab === 'part2' || listeningSubTab === 'both_2_3'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Part 2: Multiple Choice ({examData.listening.part2.questions.length} câu • 1.5đ)
                </button>

                <button
                  onClick={() => setListeningSubTab('part3')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                    listeningSubTab === 'part3' || listeningSubTab === 'both_2_3'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Part 3: True / False ({examData.listening.part3.questions.length} câu • 1.0đ)
                </button>

                <button
                  onClick={() => setListeningSubTab('both_2_3')}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center space-x-1 border border-teal-200 ml-auto"
                >
                  <span>👁️ Xem song song Part 2 & Part 3</span>
                </button>

                <button
                  onClick={handleResetListening}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold transition flex items-center space-x-1"
                  title="Khôi phục đề nghe mặc định"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục đề nghe</span>
                </button>
              </div>

              {/* Thông báo quy tắc đánh số thứ tự trong đề 40 câu chuẩn (The exact note from Image 1) */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <b className="font-extrabold text-indigo-900 block mb-0.5">
                    Quy tắc đánh số thứ tự trong đề thi chuẩn 40 câu:
                  </b>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Đề thi chính thức 40 câu được đánh số liên tục toàn đề (từ 1 đến 40). Trong phần Nghe (Listening): <b>Part 1 gồm 4 câu (Câu 1 - 4)</b> và tiếp nối là <b>Part 2 gồm 6 câu (Câu 5 - 10)</b>, tiếp nối là <b>Part 3 (Câu 11 - 14)</b>. Vì vậy câu đầu tiên của Part 2 mang số 5 (tương ứng câu số 1 của Part 2).
                  </p>
                </div>
              </div>

              {/* =================== NỘI DUNG CÁC PART LISTENING =================== */}

              {/* PART 1: GAP FILL (Hiện khi chọn Part 1) */}
              {listeningSubTab === 'part1' && (
                <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <span className="font-black text-emerald-900 text-sm">
                      PART 1 (Câu 1 - Câu 4): Gap Fill Điền từ (Ảnh 2)
                    </span>
                    <span className="text-xs font-bold text-emerald-700">4 câu • 1.0 điểm</span>
                  </div>

                  {/* Audio Manager Part 1 */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        File audio Part 1:
                      </span>
                      <span className="font-mono text-slate-700">{examData.listening.part1.audioName}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRefPart1}
                        onChange={(e) => handleUploadAudio('part1', e)}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefPart1.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center space-x-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải file MP3</span>
                      </button>
                    </div>
                  </div>

                  <audio controls className="w-full h-8" src={examData.listening.part1.audioUrl} />

                  {/* Danh sách câu hỏi Part 1 */}
                  <div className="space-y-2.5">
                    {examData.listening.part1.questions.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">Câu {q.num} (Part 1 - Điền từ):</span>
                          <span className="text-slate-400 font-semibold">0.25đ</span>
                        </div>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              listening: {
                                ...prev.listening,
                                part1: {
                                  ...prev.listening.part1,
                                  questions: prev.listening.part1.questions.map((item) =>
                                    item.id === q.id ? { ...item, prompt: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-emerald-700">Từ cần điền (Đáp án):</span>
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part1: {
                                    ...prev.listening.part1,
                                    questions: prev.listening.part1.questions.map((item) =>
                                      item.id === q.id ? { ...item, answer: val } : item
                                    )
                                  }
                                }
                              }));
                            }}
                            className="px-2 py-1 rounded border border-slate-300 font-bold text-emerald-800 w-44"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GRID HIỂN THỊ SONG SONG PART 2 & PART 3 (NHƯ ẢNH 1) */}
              {(listeningSubTab === 'part2' || listeningSubTab === 'part3' || listeningSubTab === 'both_2_3') && (
                <div className={`grid grid-cols-1 ${listeningSubTab === 'both_2_3' ? 'lg:grid-cols-2' : ''} gap-5`}>
                  {/* ===================== PART 2: CONVERSATION (ẢNH 1 TRÁI) ===================== */}
                  {(listeningSubTab === 'part2' || listeningSubTab === 'both_2_3') && (
                    <div className="border border-emerald-300 rounded-2xl p-4 bg-emerald-50/20 space-y-4">
                      {/* Header Part 2 */}
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white">
                              PART 2
                            </span>
                            <span className="text-[11px] font-bold text-emerald-800">Câu 5 - Câu 10</span>
                          </div>
                          <h4 className="font-black text-slate-900 text-sm mt-0.5">
                            Part 2: Conversation Nick & Elena (Multiple Choice)
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-emerald-700">
                            {examData.listening.part2.questions.length} câu • 1.5đ
                          </span>
                          <button
                            onClick={handleAddQuestionPart2}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Thêm câu Part 2</span>
                          </button>
                        </div>
                      </div>

                      {/* Inputs Tên chủ đề & Lời chỉ dẫn */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Tên chủ đề Part 2:</label>
                          <input
                            type="text"
                            value={examData.listening.part2.topic}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part2: { ...prev.listening.part2, topic: val }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Yêu cầu đề bài (Part 2 Instruction):</label>
                          <input
                            type="text"
                            value={examData.listening.part2.instruction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part2: { ...prev.listening.part2, instruction: val }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      {/* Audio Bar Part 2 (Theo đúng Ảnh 1) */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold">
                              🔊
                            </span>
                            <span className="font-bold text-slate-800">File nghe Part 2:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              ✓ Đã sẵn sàng
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {examData.listening.part2.audioName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <input
                              type="file"
                              ref={fileInputRefPart2}
                              onChange={(e) => handleUploadAudio('part2', e)}
                              accept="audio/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRefPart2.current?.click()}
                              className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center space-x-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Tải audio Part 2</span>
                            </button>
                            <button
                              onClick={() =>
                                setExamData((prev) => ({
                                  ...prev,
                                  listening: {
                                    ...prev.listening,
                                    part2: {
                                      ...prev.listening.part2,
                                      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=short-uk-dialogue.mp3',
                                      audioName: 'NickAndElena_Cambridge_Sample.mp3'
                                    }
                                  }
                                }))
                              }
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                            >
                              Audio mẫu
                            </button>
                          </div>
                        </div>

                        <audio controls className="w-full h-8" src={examData.listening.part2.audioUrl} />
                      </div>

                      {/* Danh sách các câu hỏi Part 2 */}
                      <div className="space-y-3">
                        {examData.listening.part2.questions.map((q, idx) => (
                          <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                Câu {q.num} (Part 2 - Câu {idx + 1}){' '}
                                <span className="text-[10px] uppercase font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  [PART 2: MULTIPLE CHOICE]
                                </span>
                              </span>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleDeleteQuestionPart2(q.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Xóa câu hỏi này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Prompt */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Yêu cầu câu hỏi (Prompt):
                              </label>
                              <input
                                type="text"
                                value={q.prompt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExamData((prev) => ({
                                    ...prev,
                                    listening: {
                                      ...prev.listening,
                                      part2: {
                                        ...prev.listening.part2,
                                        questions: prev.listening.part2.questions.map((item) =>
                                          item.id === q.id ? { ...item, prompt: val } : item
                                        )
                                      }
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                              />
                            </div>

                            {/* Options A, B, C, D */}
                            <div className="space-y-1.5 pt-1">
                              <div className="text-[11px] font-bold text-slate-600">
                                Các phương án A, B, C, D (Nhấp nút tròn để chọn đáp án đúng):
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const letter = String.fromCharCode(65 + oIdx);
                                  const isCorrect = q.correct === letter;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded-lg border flex items-center space-x-2 ${
                                        isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`radio_${q.id}`}
                                        checked={isCorrect}
                                        onChange={() => {
                                          setExamData((prev) => ({
                                            ...prev,
                                            listening: {
                                              ...prev.listening,
                                              part2: {
                                                ...prev.listening.part2,
                                                questions: prev.listening.part2.questions.map((item) =>
                                                  item.id === q.id ? { ...item, correct: letter } : item
                                                )
                                              }
                                            }
                                          }));
                                        }}
                                        className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <span className="font-bold text-slate-700">{letter}.</span>
                                      <input
                                        type="text"
                                        value={opt.replace(/^[A-D]\.\s*/, '')}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setExamData((prev) => ({
                                            ...prev,
                                            listening: {
                                              ...prev.listening,
                                              part2: {
                                                ...prev.listening.part2,
                                                questions: prev.listening.part2.questions.map((item) => {
                                                  if (item.id === q.id) {
                                                    const nextOpts = [...item.options];
                                                    nextOpts[oIdx] = `${letter}. ${val}`;
                                                    return { ...item, options: nextOpts };
                                                  }
                                                  return item;
                                                })
                                              }
                                            }
                                          }));
                                        }}
                                        className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-hidden"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ===================== PART 3: TRUE / FALSE (ẢNH 1 PHẢI) ===================== */}
                  {(listeningSubTab === 'part3' || listeningSubTab === 'both_2_3') && (
                    <div className="border border-purple-300 rounded-2xl p-4 bg-purple-50/20 space-y-4">
                      {/* Header Part 3 */}
                      <div className="flex items-center justify-between border-b border-purple-200 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-600 text-white">
                              PART 3
                            </span>
                            <span className="text-[11px] font-bold text-purple-800">Câu 11 - Câu 14</span>
                          </div>
                          <h4 className="font-black text-slate-900 text-sm mt-0.5">
                            Part 3: True / False Statements (Đúng / Sai)
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-purple-700">
                            {examData.listening.part3.questions.length} câu • 1.0đ
                          </span>
                          <button
                            onClick={handleAddQuestionPart3}
                            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Thêm câu Đúng/Sai</span>
                          </button>
                        </div>
                      </div>

                      {/* Inputs Tên chủ đề & Lời chỉ dẫn */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Tiêu đề bài nghe Part 3:</label>
                          <input
                            type="text"
                            value={examData.listening.part3.topic}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part3: { ...prev.listening.part3, topic: val }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Lời chỉ dẫn bài thi (Instruction):</label>
                          <input
                            type="text"
                            value={examData.listening.part3.instruction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part3: { ...prev.listening.part3, instruction: val }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      {/* Audio Bar Part 3 (Theo đúng Ảnh 1) */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold">
                              🔊
                            </span>
                            <span className="font-bold text-slate-800">File âm thanh Part 3:</span>
                            <span className="font-mono text-purple-700 font-bold text-[11px]">
                              {examData.listening.part3.audioName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <input
                              type="file"
                              ref={fileInputRefPart3}
                              onChange={(e) => handleUploadAudio('part3', e)}
                              accept="audio/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRefPart3.current?.click()}
                              className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center space-x-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Tải file MP3</span>
                            </button>
                          </div>
                        </div>

                        <audio controls className="w-full h-8" src={examData.listening.part3.audioUrl} />
                      </div>

                      {/* Danh sách câu hỏi Part 3 True / False */}
                      <div className="space-y-3">
                        {examData.listening.part3.questions.map((q, idx) => (
                          <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {q.num}. Nhận định nghe Đúng / Sai (True or False)
                              </span>
                              <button
                                onClick={() => handleDeleteQuestionPart3(q.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Xóa nhận định này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Nhận định kiểm tra (Statement):
                              </label>
                              <input
                                type="text"
                                value={q.statement}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExamData((prev) => ({
                                    ...prev,
                                    listening: {
                                      ...prev.listening,
                                      part3: {
                                        ...prev.listening.part3,
                                        questions: prev.listening.part3.questions.map((item) =>
                                          item.id === q.id ? { ...item, statement: val } : item
                                        )
                                      }
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                              />
                            </div>

                            {/* Radio True / False */}
                            <div>
                              <span className="block text-[11px] font-bold text-slate-600 mb-1.5">
                                Đáp án đúng (Nhấn chọn TRUE hoặc FALSE):
                              </span>
                              <div className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExamData((prev) => ({
                                      ...prev,
                                      listening: {
                                        ...prev.listening,
                                        part3: {
                                          ...prev.listening.part3,
                                          questions: prev.listening.part3.questions.map((item) =>
                                            item.id === q.id ? { ...item, correct: 'TRUE' } : item
                                          )
                                        }
                                      }
                                    }));
                                  }}
                                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border-2 ${
                                    q.correct === 'TRUE'
                                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>◉</span>
                                  <span>TRUE (Đúng)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setExamData((prev) => ({
                                      ...prev,
                                      listening: {
                                        ...prev.listening,
                                        part3: {
                                          ...prev.listening.part3,
                                          questions: prev.listening.part3.questions.map((item) =>
                                            item.id === q.id ? { ...item, correct: 'FALSE' } : item
                                          )
                                        }
                                      }
                                    }));
                                  }}
                                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border-2 ${
                                    q.correct === 'FALSE'
                                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>○</span>
                                  <span>FALSE (Sai)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SECTION 2: LANGUAGE (CÂU 15 - 24)
          ================================================================== */}
          {(currentSection === 'section2' || currentSection === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    SECTION 2
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">Section 2: Language Focus</h3>
                  <p className="text-xs text-slate-500">Ngữ âm gạch chân, trọng âm 2 âm tiết, từ vựng và ngữ pháp (Câu 15 - Câu 24)</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs">
                  {totalLanguageCount} câu • 2.5 điểm
                </span>
              </div>

              <div className="space-y-3">
                {examData.language.questions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-800">Câu {q.num}: {q.prompt}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isCorrect = q.correct === letter;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border text-[11px] font-semibold ${
                              isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 3: READING (CÂU 25 - 34)
          ================================================================== */}
          {(currentSection === 'section3' || currentSection === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                    SECTION 3
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">Section 3: Reading</h3>
                  <p className="text-xs text-slate-500">2 bài đọc: Làng cổ Đường Lâm (Câu 25-29) và Thời gian giải trí của tuổi Teen (Câu 30-34)</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-cyan-50 text-cyan-800 font-bold text-xs">
                  {totalReadingCount} câu • 2.5 điểm
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-extrabold text-slate-800">{examData.reading.part1.title}</h4>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 italic text-slate-700 leading-relaxed">
                    {examData.reading.part1.passage}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-extrabold text-slate-800">{examData.reading.part2.title}</h4>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                    {examData.reading.part2.passage}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 4: WRITING (CÂU 35 - 41)
          ================================================================== */}
          {(currentSection === 'section4' || currentSection === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    SECTION 4
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">Section 4: Writing</h3>
                  <p className="text-xs text-slate-500">Sắp xếp câu, viết lại câu không đổi nghĩa và đoạn văn 80-100 từ (Câu 35 - Câu 41)</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-800 font-bold text-xs">
                  {totalWritingCount} câu • 2.0 điểm
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {examData.writing.task1.questions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-rose-700 mr-2">Câu {q.num}:</span>
                    <span className="font-medium text-slate-800">{q.cues}</span>
                    <div className="mt-1 text-emerald-700 font-bold">➔ {q.correct}</div>
                  </div>
                ))}

                {examData.writing.task2.questions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-rose-700 mr-2">Câu {q.num}:</span>
                    <span className="font-medium text-slate-800">{q.prompt}</span>
                    <div className="mt-1 text-emerald-700 font-bold">➔ {q.correct}</div>
                  </div>
                ))}

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-rose-700 mr-2">Câu {examData.writing.paragraph.num}:</span>
                  <span className="font-bold text-slate-900">{examData.writing.paragraph.topic}</span>
                  <p className="mt-1 text-slate-600 italic">{examData.writing.paragraph.guidance}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MENU C: NGÂN HÀNG CÂU HỎI (Question Bank)
      ======================================================== */}
      {activeMenu === 'bank' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Ngân hàng câu hỏi Tiếng Anh 8</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">Kho Câu Hỏi Chuẩn 4 Mức Độ Nhận Thức</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Tổng: 450+ câu hỏi</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { level: 'Nhận biết', count: '140 câu', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              { level: 'Thông hiểu', count: '160 câu', color: 'bg-blue-50 text-blue-800 border-blue-200' },
              { level: 'Vận dụng', count: '100 câu', color: 'bg-amber-50 text-amber-800 border-amber-200' },
              { level: 'Vận dụng cao', count: '50 câu', color: 'bg-rose-50 text-rose-800 border-rose-200' }
            ].map((lvl, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-center ${lvl.color}`}>
                <div className="font-extrabold text-xs">{lvl.level}</div>
                <div className="text-[11px] font-bold mt-0.5">{lvl.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MENU D: XUẤT LMS / ANTIGRAVITY (Export)
      ======================================================== */}
      {activeMenu === 'export' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase">Xuất dữ liệu & Liên thông</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Xuất Đề Thi Ra Nền Tảng LMS & AI Antigravity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleCopyText(JSON.stringify(selectedExamForExport, null, 2), 'Đã sao chép cấu trúc JSON của đề thi!')}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 text-left transition"
            >
              <div className="font-black text-sm text-slate-800 flex items-center space-x-1.5">
                <Copy className="w-4 h-4 text-emerald-600" />
                <span>Sao chép JSON Chuẩn</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tương thích API Backend và đồng bộ LocalStorage <code>tienganh8_assigned_homework_v1</code>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
