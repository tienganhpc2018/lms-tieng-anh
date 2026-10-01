import React, { useState, useEffect } from 'react';
import { supabase, uploadLMSFile } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles, Wand2, Volume2, Link as LinkIcon, Video, Eye, Sun, Type, Database, Shuffle, Award, Save, Code, Download, Headphones, BookOpen, Search, XCircle, PlayCircle, MessageSquareText, Clock, Tag, FileCode, Layers, Camera, Image as ImageIcon, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import AiQuizGeneratorModal from './AiQuizGeneratorModal';
import CommunityExamBankModal from './CommunityExamBankModal';
import { exportQuizToWord } from '../../utils/exportQuizWord';
import { exportMultiCodeWord } from '../../utils/exportMultiCodeWord';
import ExamMatrixModal from './ExamMatrixModal';
import ExamPaperTimerModal from './ExamPaperTimerModal';
const extractGoogleFileId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

const getGoogleDriveStreamUrl = (url) => {
  const fileId = extractGoogleFileId(url);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return url || '';
};

const getGoogleDriveIframeUrl = (url) => {
  const fileId = extractGoogleFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return '';
};

const getGoogleDriveDirectViewUrl = (url) => {
  const fileId = extractGoogleFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return url || '';
};

export default function QuizBuilder({ activityId, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('questions');

  // Menu Khối Lớp & Unit
  const [grade, setGrade] = useState('Khối 8');
  const [unit, setUnit] = useState('Unit 1: My New School / Leisure Time');
  const [category, setCategory] = useState('Knowledge of English (Vocab & Grammar)');
  const [summaryText, setSummaryText] = useState('');

  // Form State Soạn Văn Bản / Bài Tập Về Nhà
  const [homeworkContent, setHomeworkContent] = useState('');
  const [audioFileUrl, setAudioFileUrl] = useState('');
  const [showAnswerBox, setShowAnswerBox] = useState(false);
  const [isSavingHomework, setIsSavingHomework] = useState(false);

  // Checkbox Categories Kỹ Năng
  const [selectedCategories, setSelectedCategories] = useState(['Knowledge of English (Vocab & Grammar)']);
  const [openTranscripts, setOpenTranscripts] = useState({});

  // Modal "Choose a question type to add"
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('multiple_choice');

  // Form State Import File
  const [fileFormat, setFileFormat] = useState('aiken');
  const [importedText, setImportedText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Form State Tạo / Sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1.0);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [maxTabSwitches, setMaxTabSwitches] = useState(3);
  const [isRandomized, setIsRandomized] = useState(false);
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);
  const [isCommunityBankOpen, setIsCommunityBankOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isExamTimerOpen, setIsExamTimerOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [aiExplaining, setAiExplaining] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // State quản lý danh sách các Part (Cho Cloze Test, Listening, Reading, Writing, Multiple Choice)
  const [sectionParts, setSectionParts] = useState([]);
  const [activePartTab, setActivePartTab] = useState(0);
  const [showAllParts, setShowAllParts] = useState(false);
  const [selectedChildTypeToAdd, setSelectedChildTypeToAdd] = useState('multiple_choice');
  const [directJsonText, setDirectJsonText] = useState('');
  const [isJsonDirectMode, setIsJsonDirectMode] = useState(false);
  const [partJsonModalIndex, setPartJsonModalIndex] = useState(null);
  const [partJsonInputText, setPartJsonInputText] = useState('');

  // State riêng cho Listening, Reading, Writing
  const [sectionPassage, setSectionPassage] = useState('');
  const [listeningAudioUrl, setListeningAudioUrl] = useState('');
  const [uploadedAudioFileName, setUploadedAudioFileName] = useState('');
  const [sectionChildQuestions, setSectionChildQuestions] = useState([]);

  // State Trắc nghiệm Multiple Choice đơn lẻ
  const [mcOptions, setMcOptions] = useState([
    { text: '', isCorrect: true, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
  ]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Lỗi lấy câu hỏi:', error.message);
      }

      setQuestions(data || []);
    } catch (e) {
      console.error('Catch error fetchQuestions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activityId) fetchQuestions();
  }, [activityId]);

  // AI TỰ ĐỘNG TẠO GIẢI THÍCH CHUẨN 4 KHỐI
  const handleAiGenerateExplanation = (partIdx = null) => {
    setAiExplaining(true);
    setTimeout(() => {
      const generatedExp = `🔍 Phân tích ngữ pháp/ngữ cảnh:\nCâu hỏi kiểm tra kiến thức trọng tâm từ vựng và cấu trúc ngữ pháp Tiếng Anh theo bài học.\n\n💡 Giải thích chi tiết (Evidence / Dẫn chứng):\nDựa theo ngữ cảnh đoạn văn bản/bài nghe, lựa chọn đáp án chính xác nhất phù hợp hoàn toàn.\n\n✕ Loại trừ gây nhiễu:\nCác phương án còn lại sai về ý nghĩa hoặc không đúng cấu trúc từ vựng Tiếng Anh.\n\n🇻🇳 Bản dịch nghĩa song ngữ:\nDịch đề bài và đáp án đúng giúp học sinh dễ dàng ghi nhớ sâu kiến thức.`;

      if (partIdx !== null && sectionParts[partIdx]) {
        const newParts = [...sectionParts];
        newParts[partIdx].explanation = generatedExp;
        setSectionParts(newParts);
      } else {
        setExplanation(generatedExp);
      }
      setAiExplaining(false);
    }, 800);
  };

  // CHUYỂN BÀI NGHE MP3 TẢI TỪ MÁY THÀNH STREAM NGHE THỬ TỨC THÌ TRONG MODAL
  const handleAudioFileUpload = (e, partIdx = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      try {
        localStorage.setItem(`audio_file_${file.name}`, dataUrl);
      } catch (errLocal) {}
    };
    reader.readAsDataURL(file);

    if (partIdx !== null && sectionParts[partIdx]) {
      const newParts = [...sectionParts];
      newParts[partIdx].audioUrl = blobUrl;
      newParts[partIdx].audioFileName = file.name;
      setSectionParts(newParts);
    } else {
      setUploadedAudioFileName(file.name);
      setListeningAudioUrl(blobUrl);
    }
  };

  // MỞ MODAL XEM & SỬA BÀI
  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    const sectionType = q.content?.sectionType || q.type || 'multiple_choice';
    const normType = sectionType.toLowerCase();
    setSelectedType(normType);
    setQuestionTitle(q.content?.title || '');
    setQuestionText(q.content?.question || '');
    setExplanation(q.content?.explanation || '');
    setSectionPassage(q.content?.passage || '');
    setIsJsonDirectMode(false);
    setShowAllParts(false);
    setActivePartTab(0);

    if (normType === 'cloze_test') {
      const dbTasks = q.content?.tasks || [];
      if (dbTasks.length > 0) {
        setSectionParts(dbTasks.map(t => ({
          part_type: 'cloze_test',
          part_title: t.task_title || 'PART 1: READ THE TEXT AND CHOOSE THE CORRECT WORD.',
          task_sub: t.task_sub || 'Read the text and choose the best option (A, B, C, or D) for each blank.',
          badge_label: t.badge_label || 'POSTER',
          passage_title: t.passage_title || '',
          passage: t.passage_content || t.passage || '',
          questions: t.questions || [],
          explanation: t.explanation || ''
        })));
      } else {
        setSectionParts([]);
      }
    } else if (['listening_section', 'reading_section', 'writing_section', 'multiple_choice'].includes(normType)) {
      setSectionParts(q.content?.parts || []);
    } else {
      setSectionParts([]);
    }

    setActivePartTab(0);

    let audioUrlToLoad = q.content?.audioUrl || '';
    if (q.content?.audioFileName) {
      try {
        const cached = localStorage.getItem(`audio_file_${q.content.audioFileName}`);
        if (cached) audioUrlToLoad = cached;
      } catch (e) {}
    }
    setListeningAudioUrl(audioUrlToLoad);
    setUploadedAudioFileName(q.content?.audioFileName || '');
    setSectionChildQuestions(q.content?.childQuestions || []);
    setTimeLimitMinutes(q.content?.timeLimit || 0);
      setMaxTabSwitches(q.content?.maxTabSwitches !== undefined ? q.content.maxTabSwitches : 3);
      setIsRandomized(q.content?.isRandomized || false);
      setPasscode(q.content?.passcode || '');
      setOpenTime(q.content?.openTime || '');
    setMarks(q.marks || 1.0);
    setMcOptions(
      q.content?.options && q.content?.options.length > 0
        ? q.content.options
        : [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ]
    );
  };

  // NÚT TẢI TỆP MẪU JSON CHUẨN HOÀN HẢO
  const handleDownloadSampleFile = (format) => {
    let content = '';
    let filename = '';

    if (format === 'json_gap_fill_part') {
      filename = 'mau_de_listening_gap_fill_part.json';
      content = JSON.stringify(
        {
          part_type: "gap_fill",
          part_title: "PART 2: Listen and write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
          audio_url: "https://example.com/audio_part2.mp3",
          questions: [
            {
              question: "6. Transport from the airport will be provided by: _______",
              correct_answer: "bus",
              explanation: "💡 Evidence: The speaker states that a bus will pick up all participants directly from the airport terminal."
            },
            {
              question: "7. Vy likes _______ models in her free time.",
              correct_answer: "making / to make",
              explanation: "💡 Evidence: Vy mentioned she enjoys making miniature models during weekends."
            }
          ]
        },
        null,
        2
      );
    } else if (format === 'json_writing_part') {
      filename = 'mau_de_writing_section_parts.json';
      content = JSON.stringify(
        {
          title: "BÀI KIỂM TRA WRITING - 3 PHẦN CHUẨN",
          type: "writing_section",
          parts: [
            {
              part_type: "multiple_choice",
              part_title: "Part 1: Choose the best option A, B, C or D to indicate the best arrangement of utterances or sentences to make a meaningful conversation in each of the following questions below. (0,5m)",
              questions: [
                {
                  question: "31. a. What are we going to do to save energy at home?\nb. I think we should turn off electrical appliances when they are not in use.\nc. That is a great idea. What else?\nd. We can also use low energy light bulbs.",
                  options: [
                    { text: "a-b-c-d", isCorrect: true },
                    { text: "b-a-c-d", isCorrect: false },
                    { text: "a-c-b-d", isCorrect: false },
                    { text: "c-a-b-d", isCorrect: false }
                  ],
                  explanation: "💡 Trình tự logic: a (Đặt câu hỏi gợi mở) ➔ b (Đề xuất giải pháp 1) ➔ c (Khen ngợi & hỏi tiếp) ➔ d (Đề xuất giải pháp 2)."
                },
                {
                  question: "32. a. Have you heard about the new flying car?\nb. Yes, I have. It looks amazing!\nc. Do you think it will be popular in the future?\nd. Definitely. It will help us avoid traffic jams.",
                  options: [
                    { text: "a-c-b-d", isCorrect: false },
                    { text: "a-b-c-d", isCorrect: true },
                    { text: "b-a-d-c", isCorrect: false },
                    { text: "c-d-a-b", isCorrect: false }
                  ],
                  explanation: "💡 Trình tự logic: a (Hỏi thông tin mới) ➔ b (Xác nhận & cảm nghĩ) ➔ c (Hỏi dự đoán tương lai) ➔ d (Đưa ra lý do khẳng định)."
                }
              ],
              explanation: "🔍 Phân tích Part 1: Sắp xếp câu thoại thành đoạn hội thoại có nghĩa."
            },
            {
              part_type: "multiple_choice",
              part_title: "Part 2: Choose the correct answer A, B, C or D to indicate the sentence that has the same meaning with the rooted one. (0,5m)",
              questions: [
                {
                  question: "33. The distance from my house to the airport is about ten kilometers.",
                  options: [
                    { text: "It is about ten kilometers from my house to the airport.", isCorrect: true },
                    { text: "It has about ten kilometers from my house to the airport.", isCorrect: false },
                    { text: "It takes about ten kilometers from my house to the airport.", isCorrect: false },
                    { text: "It was about ten kilometers from my house to the airport.", isCorrect: false }
                  ],
                  explanation: "💡 Cấu trúc chỉ khoảng cách: The distance from A to B is [distance] = It is [distance] from A to B."
                },
                {
                  question: "34. It is not a good idea for you to ride a bike dangerously.",
                  options: [
                    { text: "You shouldn't riding a bike dangerously.", isCorrect: false },
                    { text: "You shouldn't to ride a bike dangerously.", isCorrect: false },
                    { text: "You should ride a bike dangerously.", isCorrect: false },
                    { text: "You shouldn't ride a bike dangerously.", isCorrect: true }
                  ],
                  explanation: "💡 Cấu trúc khuyên can: It is not a good idea for sb to V = Sb shouldn't + V_inf."
                },
                {
                  question: "35. Although the weather was bad, we enjoyed our holiday.",
                  options: [
                    { text: "The weather was bad, so we enjoyed our holiday.", isCorrect: false },
                    { text: "The weather was bad; however, we enjoyed our holiday.", isCorrect: true },
                    { text: "The weather was bad, but we didn't enjoy our holiday.", isCorrect: false },
                    { text: "Because the weather was bad, we enjoyed our holiday.", isCorrect: false }
                  ],
                  explanation: "💡 Cấu trúc chỉ sự tương phản: Although + Clause 1, Clause 2 = Clause 1; however, Clause 2."
                },
                {
                  question: "36. This solar-powered ship belongs to them.",
                  options: [
                    { text: "This solar-powered ship is their.", isCorrect: false },
                    { text: "This solar-powered ship is they.", isCorrect: false },
                    { text: "This solar-powered ship is theirs.", isCorrect: true },
                    { text: "This solar-powered ship is them.", isCorrect: false }
                  ],
                  explanation: "💡 Cấu trúc sở hữu: belong to sb = be + đại từ sở hữu (theirs)."
                }
              ],
              explanation: "🔍 Phân tích Part 2: Chọn câu có cùng ý nghĩa với câu gốc (Sentence Transformation)."
            },
            {
              part_type: "full_essay",
              part_title: "Part 3. Write a short paragraph (60-80 words) about your best film. (1,0m)",
              passage: "Instructions: Write your paragraph in the text box below. Make sure to include: Film name & genre, main plot/characters, and reasons why you like it.",
              questions: [
                {
                  question: "Write a short paragraph (60-80 words) about your best film.",
                  sample_answer: "My favourite film is 'The Lion King'. It is an animated musical drama film produced by Walt Disney. The story is about Simba, a young lion prince who must overcome great tragedy and find his courage to reclaim his throne as the King of the Pride Lands. I love this film because the animation and soundtrack are breathtaking. Furthermore, it teaches valuable life lessons about family, courage, and responsibility.",
                  explanation: "💡 Tiêu chí chấm điểm đoạn văn 60-80 từ:\n1. Task Response (Đúng chủ đề, đủ độ dài 60-80 từ): 0.3đ\n2. Coherence & Cohesion (Bố cục rõ ràng, câu liên kết mượt mà): 0.25đ\n3. Lexical Resource (Từ vựng phong phú, chuẩn ngữ cảnh): 0.25đ\n4. Grammatical Range & Accuracy (Ngữ pháp chính xác, đúng thì): 0.2đ"
                }
              ],
              explanation: "🔍 Phân tích Part 3: Tự luận viết đoạn văn 60-80 từ kèm đếm từ tự động & chấm điểm AI/GV."
            }
          ]
        },
        null,
        2
      );
    } else if (format === 'json_cloze_part') {
      filename = 'mau_de_cloze_test_part.json';
      content = JSON.stringify(
        {
          part_title: "PART 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          task_sub: "Read the following blog post about a local community and choose the best option (A, B, C, or D) for each blank.",
          badge_label: "BLOG",
          passage_title: "Our Beautiful Suburb Blog",
          passage: "Hi everyone! Welcome back to my blog. Today, I want to talk about my local community...",
          questions: [
            {
              question_number: "16",
              options: [{ id: "A", text: "A. suburb" }, { id: "B", text: "B. suitcase" }, { id: "C", text: "C. seagull" }, { id: "D", text: "D. fragrance" }],
              correct_option: "A"
            }
          ]
        },
        null,
        2
      );
    } else {
      filename = 'mau_de_thi_listening_reading_parts.json';
      content = JSON.stringify(
        {
          part_type: "multiple_choice",
          part_title: "PART 1: Listen to Phong talking about Bat Trang pottery village. Choose the correct answer A, B, C, or D.",
          audio_url: "https://example.com/audio_part1.mp3",
          questions: [
            {
              question: "1. What generation of artisan is Phong in Bat Trang pottery village?",
              options: [{ text: "First", isCorrect: false }, { text: "Second", isCorrect: false }, { text: "Third", isCorrect: true }, { text: "Fourth", isCorrect: false }],
              explanation: "🔍 Phân tích: Phong là nghệ nhân thế hệ thứ 3."
            }
          ]
        },
        null,
        2
      );
    }

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // TẠO CÂU HỎI MỚI VỚI CẤU TRÚC ĐẦY ĐỦ
  const handleConfirmAddType = () => {
    setIsTypeModalOpen(false);
    setEditingQuestion({ id: 'new', type: selectedType });
    setQuestionTitle('');
    setIsJsonDirectMode(false);
    setShowAllParts(true);
    setActivePartTab(0);

    const normType = selectedType?.toLowerCase();
    if (normType === 'writing_section') {
      setQuestionTitle('IV. WRITING');
      setSectionParts([
        {
          part_type: 'multiple_choice',
          part_title: 'Part 1: Choose the best option A, B, C or D to indicate the best arrangement of utterances or sentences to make a meaningful conversation in each of the following questions below. (0,5m)',
          questions: [
            {
              question: '31. a. What are we going to do to save energy at home?\nb. I think we should turn off electrical appliances when they are not in use.\nc. That is a great idea. What else?\nd. We can also use low energy light bulbs.',
              options: [
                { text: 'a-b-c-d', isCorrect: true },
                { text: 'b-a-c-d', isCorrect: false },
                { text: 'a-c-b-d', isCorrect: false },
                { text: 'c-a-b-d', isCorrect: false }
              ],
              explanation: '💡 Trình tự logic: a (Đặt câu hỏi gợi mở) ➔ b (Đề xuất giải pháp 1) ➔ c (Khen ngợi & hỏi tiếp) ➔ d (Đề xuất giải pháp 2).'
            },
            {
              question: '32. a. Have you heard about the new flying car?\nb. Yes, I have. It looks amazing!\nc. Do you think it will be popular in the future?\nd. Definitely. It will help us avoid traffic jams.',
              options: [
                { text: 'a-c-b-d', isCorrect: false },
                { text: 'a-b-c-d', isCorrect: true },
                { text: 'b-a-d-c', isCorrect: false },
                { text: 'c-d-a-b', isCorrect: false }
              ],
              explanation: '💡 Trình tự logic: a (Hỏi thông tin mới) ➔ b (Xác nhận & cảm nghĩ) ➔ c (Hỏi dự đoán tương lai) ➔ d (Đưa ra lý do khẳng định).'
            }
          ],
          explanation: '🔍 Phân tích Part 1: Sắp xếp câu thoại thành đoạn hội thoại có nghĩa.'
        },
        {
          part_type: 'multiple_choice',
          part_title: 'Part 2: Choose the correct answer A, B, C or D to indicate the sentence that has the same meaning with the rooted one. (0,5m)',
          questions: [
            {
              question: '33. The distance from my house to the airport is about ten kilometers.',
              options: [
                { text: 'It is about ten kilometers from my house to the airport.', isCorrect: true },
                { text: 'It has about ten kilometers from my house to the airport.', isCorrect: false },
                { text: 'It takes about ten kilometers from my house to the airport.', isCorrect: false },
                { text: 'It was about ten kilometers from my house to the airport.', isCorrect: false }
              ],
              explanation: '💡 Cấu trúc chỉ khoảng cách: The distance from A to B is [distance] = It is [distance] from A to B.'
            },
            {
              question: '34. It is not a good idea for you to ride a bike dangerously.',
              options: [
                { text: "You shouldn't riding a bike dangerously.", isCorrect: false },
                { text: "You shouldn't to ride a bike dangerously.", isCorrect: false },
                { text: "You should ride a bike dangerously.", isCorrect: false },
                { text: "You shouldn't ride a bike dangerously.", isCorrect: true }
              ],
              explanation: "💡 Cấu trúc khuyên can: It is not a good idea for sb to V = Sb shouldn't + V_inf."
            },
            {
              question: '35. Although the weather was bad, we enjoyed our holiday.',
              options: [
                { text: 'The weather was bad, so we enjoyed our holiday.', isCorrect: false },
                { text: 'The weather was bad; however, we enjoyed our holiday.', isCorrect: true },
                { text: "The weather was bad, but we didn't enjoy our holiday.", isCorrect: false },
                { text: 'Because the weather was bad, we enjoyed our holiday.', isCorrect: false }
              ],
              explanation: '💡 Cấu trúc chỉ sự tương phản: Although + Clause 1, Clause 2 = Clause 1; however, Clause 2.'
            },
            {
              question: '36. This solar-powered ship belongs to them.',
              options: [
                { text: 'This solar-powered ship is their.', isCorrect: false },
                { text: 'This solar-powered ship is they.', isCorrect: false },
                { text: 'This solar-powered ship is theirs.', isCorrect: true },
                { text: 'This solar-powered ship is them.', isCorrect: false }
              ],
              explanation: '💡 Cấu trúc sở hữu: belong to sb = be + đại từ sở hữu (theirs).'
            }
          ],
          explanation: '🔍 Phân tích Part 2: Chọn câu có cùng ý nghĩa với câu gốc (Sentence Transformation).'
        },
        {
          part_type: 'full_essay',
          part_title: 'Part 3. Write a short paragraph (60-80 words) about your best film. (1,0m)',
          passage: 'Instructions: Write your paragraph in the text box below. Make sure to include: Film name & genre, main plot/characters, and reasons why you like it.',
          questions: [
            {
              question: 'Write a short paragraph (60-80 words) about your best film.',
              sample_answer: "My favourite film is 'The Lion King'. It is an animated musical drama film produced by Walt Disney. The story is about Simba, a young lion prince who must overcome great tragedy and find his courage to reclaim his throne as the King of the Pride Lands. I love this film because the animation and soundtrack are breathtaking. Furthermore, it teaches valuable life lessons about family, courage, and responsibility.",
              explanation: '💡 Tiêu chí chấm điểm đoạn văn 60-80 từ:\n1. Task Response (Đúng chủ đề, đủ độ dài 60-80 từ): 0.3đ\n2. Coherence & Cohesion (Bố cục rõ ràng, câu liên kết mượt mà): 0.25đ\n3. Lexical Resource (Từ vựng phong phú, chuẩn ngữ cảnh): 0.25đ\n4. Grammatical Range & Accuracy (Ngữ pháp chính xác, đúng thì): 0.2đ'
            }
          ],
          explanation: '🔍 Phân tích Part 3: Tự luận viết đoạn văn 60-80 từ kèm đếm từ tự động & chấm điểm AI/GV.'
        }
      ]);
    } else if (normType === 'multiple_choice') {
      setQuestionTitle('MULTIPLE CHOICE');
      setSectionParts([
        {
          part_type: 'multiple_choice',
          part_title: 'PART 1: Choose the correct answer A, B, C, or D to complete each sentence.',
          questions: [
            {
              question: '1. What is the correct answer to this question?',
              options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }, { text: 'Option C', isCorrect: false }, { text: 'Option D', isCorrect: false }],
              explanation: '💡 Giải thích câu 1.'
            }
          ],
          explanation: '🔍 Phân tích Part 1 Trắc nghiệm.'
        }
      ]);
    } else if (normType === 'listening_section') {
      setQuestionTitle('LISTENING SECTION');
      setSectionParts([
        {
          part_type: 'multiple_choice',
          part_title: 'PART 1: Listen to Phong talking about Bat Trang pottery village. Choose the correct answer A, B, C, or D.',
          audioUrl: '',
          questions: [
            {
              question: '1. What generation of artisan is Phong in Bat Trang pottery village?',
              options: [{ text: 'First', isCorrect: false }, { text: 'Second', isCorrect: false }, { text: 'Third', isCorrect: true }, { text: 'Fourth', isCorrect: false }],
              explanation: '💡 Evidence: Phong is the third generation of artisan in his family.'
            }
          ],
          explanation: '🔍 Phân tích Part 1 bài nghe.'
        },
        {
          part_type: 'true_false',
          part_title: 'PART 2: Listen again and decide whether the statements are True (T) or False (F).',
          audioUrl: '',
          questions: [
            {
              question: '2. Young people in the community often ask Phong how to keep up with modern trends.',
              correctAnswer: 'T',
              correct_answer: 'T',
              explanation: '💡 Evidence: Young people often ask how to keep up with modern trends.'
            }
          ],
          explanation: '🔍 Phân tích Part 2 True/False.'
        },
        {
          part_type: 'gap_fill',
          part_title: 'PART 3: Listen and fill in each blank with NO MORE THAN THREE WORDS AND/OR A NUMBER.',
          audioUrl: '',
          questions: [
            {
              question: '6. Vy likes _______ models in her free time.',
              correctAnswer: 'making',
              correct_answer: 'making',
              explanation: '💡 Evidence: Vy mentioned she enjoys making models in her free time.'
            },
            {
              question: '7. Transport from the airport will be provided by: _______',
              correctAnswer: 'bus',
              correct_answer: 'bus',
              explanation: '💡 Evidence: The tour guide confirmed transport is by bus.'
            }
          ],
          explanation: '🔍 Phân tích Part 3: Điền từ vào chỗ trống (Gap-Fill).'
        }
      ]);
    } else if (normType === 'reading_section') {
      setQuestionTitle('READING SECTION');
      setSectionParts([
        {
          part_type: 'multiple_choice',
          part_title: 'PART 1: Read the passage about Chuong conical hat village and choose the correct answer A, B, C, or D.',
          passage: 'Chuong village in Hanoi is famous for its long history of making conical hats (non la)...',
          questions: [
            {
              question: '1. What traditional craft is Chuong village famous for?',
              options: [{ text: 'Making pottery', isCorrect: false }, { text: 'Weaving silk', isCorrect: false }, { text: 'Making conical hats', isCorrect: true }, { text: 'Carving wood', isCorrect: false }],
              explanation: '💡 Evidence: Chuong village in Hanoi is famous for making conical hats.'
            }
          ],
          explanation: '🔍 Phân tích Part 1 bài đọc.'
        },
        {
          part_type: 'true_false',
          part_title: 'PART 2: Read the second text and decide whether the statements are True (T) or False (F).',
          passage: 'Visitors come to Chuong village to learn how to make conical hats themselves...',
          questions: [
            {
              question: '2. Fewer young people want to learn the craft because they do not know how to make a living from it.',
              correctAnswer: 'T',
              explanation: '💡 Evidence: Fewer young people want to learn the craft.'
            }
          ],
          explanation: '🔍 Phân tích Part 2 True/False.'
        }
      ]);
    } else if (normType === 'cloze_test') {
      setQuestionTitle('KNOWLEDGE OF LANGUAGE');
      setSectionParts([
        {
          part_type: 'cloze_test',
          part_title: "PART 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          task_sub: "Read the following blog post about a local community and choose the best option (A, B, C, or D) for each blank.",
          badge_label: "BLOG",
          passage_title: "Our Beautiful Suburb Blog",
          passage: "Hi everyone! Welcome back to my blog. Today, I want to talk about my local community. Two years ago, my family decided to move to this (16) _______ of the city...",
          questions: [
            { question_number: "16", options: [{ id: "A", text: "A. suburb" }, { id: "B", text: "B. suitcase" }, { id: "C", text: "C. seagull" }, { id: "D", text: "D. fragrance" }], correct_option: "A" }
          ],
          explanation: "🔍 Phân tích Part 1 đục lỗ."
        },
        {
          part_type: 'cloze_test',
          part_title: "PART 2: READ THE SECOND TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          task_sub: "Read the following email invitation and choose the best option (A, B, C, or D) for each blank.",
          badge_label: "EMAIL",
          passage_title: "Invitation to a House-Warming Party",
          passage: "Dear Vy,\nHow are you? I am writing to invite you to our (21) _______ party next Saturday...",
          questions: [
            { question_number: "21", options: [{ id: "A", text: "A. house-warming" }, { id: "B", text: "B. hard-working" }, { id: "C", text: "C. worldwide" }, { id: "D", text: "D. responsible" }], correct_option: "A" }
          ],
          explanation: "🔍 Phân tích Part 2 đục lỗ."
        }
      ]);
    } else {
      setQuestionText('');
      setSectionChildQuestions([]);
      setSectionParts([]);
    }

    setExplanation('');
    setListeningAudioUrl('');
    setUploadedAudioFileName('');
    setTimeLimitMinutes(0);
    setMarks(1.0);
    setMcOptions([
      { text: '', isCorrect: true, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
    ]);
  };

  // NẠP JSON RIÊNG CHO PART ĐANG CHỌN (FIX TRIỆT ĐỂ LỖI NẨY ALERT TRONG ẢNH 2)
  const handleApplyPartJson = (partIdx) => {
    const rawText = (partJsonInputText || directJsonText || '').trim();
    if (!rawText) {
      alert('Vui lòng dán chuỗi JSON của Part này vào ô!');
      return;
    }
    try {
      // Làm sạch mã Markdown ```json nếu có
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const newParts = [...sectionParts];

      const isArrayInput = Array.isArray(parsed);
      const questionsList = isArrayInput ? parsed : (parsed.questions || []);

      newParts[partIdx] = {
        ...newParts[partIdx],
        part_type: parsed.part_type || newParts[partIdx]?.part_type || 'multiple_choice',
        part_title: parsed.part_title || parsed.title || parsed.task_title || newParts[partIdx]?.part_title,
        task_sub: parsed.task_sub || newParts[partIdx]?.task_sub,
        badge_label: parsed.badge_label || newParts[partIdx]?.badge_label,
        passage_title: parsed.passage_title || newParts[partIdx]?.passage_title,
        audioUrl: parsed.audio_url || newParts[partIdx]?.audioUrl,
        passage: parsed.passage || parsed.passage_content || newParts[partIdx]?.passage,
        questions: questionsList.length > 0 ? questionsList : newParts[partIdx]?.questions,
        explanation: parsed.explanation || newParts[partIdx]?.explanation
      };

      setSectionParts(newParts);
      alert(`🎉 ĐÃ NẠP THÀNH CÔNG ${questionsList.length} CÂU HỎI VÀO PART #${partIdx + 1}!`);
      setPartJsonModalIndex(null);
      setPartJsonInputText('');
      setIsJsonDirectMode(false);
      setDirectJsonText('');
    } catch (err) {
      alert('Lỗi định dạng JSON không hợp lệ. Vui lòng kiểm tra lại cấu trúc dấu ngoặc ngoặc kép: ' + err.message);
    }
  };

  // DI CHUYỂN THỨ TỰ CÂU HỎI CON TRONG PART (LÊN / XUỐNG)
  const handleMoveQuestion = (pIdx, qIdx, direction) => {
    const newParts = [...sectionParts];
    const qList = [...(newParts[pIdx].questions || [])];
    const targetIdx = qIdx + direction;
    if (targetIdx < 0 || targetIdx >= qList.length) return;
    const temp = qList[qIdx];
    qList[qIdx] = qList[targetIdx];
    qList[targetIdx] = temp;
    newParts[pIdx].questions = qList;
    setSectionParts(newParts);
  };

  // NHÂN BẢN (DUPLICATE) CÂU HỎI CON
  const handleDuplicateQuestion = (pIdx, qIdx) => {
    const newParts = [...sectionParts];
    const qList = [...(newParts[pIdx].questions || [])];
    const original = qList[qIdx];
    const cloned = JSON.parse(JSON.stringify(original));
    cloned.question = `${cloned.question || ''} (Bản sao)`;
    qList.splice(qIdx + 1, 0, cloned);
    newParts[pIdx].questions = qList;
    setSectionParts(newParts);
  };

  // XÓA CÂU HỎI CON VỚI XÁC NHẬN AN TOÀN
  const handleDeleteQuestion = (pIdx, qIdx) => {
    if (!window.confirm(`Thầy có chắc chắn muốn xóa câu hỏi #${qIdx + 1} này không?`)) return;
    const newParts = [...sectionParts];
    newParts[pIdx].questions = (newParts[pIdx].questions || []).filter((_, i) => i !== qIdx);
    setSectionParts(newParts);
  };

  // THÊM CÂU HỎI CON VỚI LOẠI CỤ THỂ
  const handleAddQuestionWithType = (pIdx, qType) => {
    const newParts = [...sectionParts];
    const qList = newParts[pIdx].questions || [];
    const newNum = qList.length + 1;

    let newQ = {
      question: `${newNum}. Question text...`,
      explanation: ''
    };

    if (qType === 'gap_fill') {
      newQ.question = `${newNum}. Sentence with _______ blank.`;
      newQ.correctAnswer = '';
      newQ.correct_answer = '';
    } else if (qType === 'true_false') {
      newQ.question = `${newNum}. Statement question...`;
      newQ.correctAnswer = 'T';
      newQ.correct_answer = 'T';
    } else if (qType === 'short_essay') {
      newQ.question = `${newNum}. Rewrite the sentence so that it has the same meaning...`;
      newQ.sample_answer = '';
    } else if (qType === 'full_essay') {
      newQ.question = `${newNum}. Write a short paragraph (60-80 words) about your favourite topic.`;
      newQ.sample_answer = '';
      newQ.explanation = '💡 Tiêu chí đánh giá bài viết:\n1. Task Response (Đúng chủ đề, độ dài 60-80 từ)\n2. Coherence & Cohesion (Bố cục rõ ràng)\n3. Lexical Resource (Từ vựng phong phú)\n4. Grammatical Range (Ngữ pháp chính xác)';
    } else if (qType === 'ordering') {
      newQ.question = `${newNum}. Sắp xếp các câu sau thành đoạn hội thoại hợp lý:\na. Hello, how are you today?\nb. I'm good, thank you. What about you?\nc. I'm doing well, let's study together!\nd. That sounds great!`;
      newQ.options = [
        { text: 'a-b-c-d', isCorrect: true },
        { text: 'b-a-c-d', isCorrect: false },
        { text: 'a-c-b-d', isCorrect: false },
        { text: 'c-a-b-d', isCorrect: false }
      ];
      newQ.explanation = '💡 Trình tự logic: a ➔ b ➔ c ➔ d.';
    } else if (qType === 'sentence_transformation') {
      newQ.question = `${newNum}. Chọn câu có cùng ý nghĩa với câu gốc:\n"This solar-powered ship belongs to them."`;
      newQ.options = [
        { text: 'This solar-powered ship is their.', isCorrect: false },
        { text: 'This solar-powered ship is they.', isCorrect: false },
        { text: 'This solar-powered ship is theirs.', isCorrect: true },
        { text: 'This solar-powered ship is them.', isCorrect: false }
      ];
      newQ.explanation = '💡 Cấu trúc sở hữu: belong to sb = be + đại từ sở hữu (theirs).';
    } else if (qType === 'speaking_test') {
      newQ.question = `${newNum}. Read the sentence out loud into your microphone.`;
      newQ.sample_answer = 'Practice pronunciation accurately.';
    } else {
      newQ.options = [
        { text: 'Option A', isCorrect: true },
        { text: 'Option B', isCorrect: false },
        { text: 'Option C', isCorrect: false },
        { text: 'Option D', isCorrect: false }
      ];
    }

    qList.push(newQ);
    newParts[pIdx].questions = qList;
    setSectionParts(newParts);
  };

  // THÊM PART MỚI DỄ DÀNG
  const handleAddNewPart = () => {
    const newIdx = sectionParts.length;
    const normType = selectedType?.toLowerCase();
    let newPart = {};

    if (normType === 'writing_section') {
      newPart = {
        part_type: newIdx === 0 ? 'multiple_choice' : newIdx === 1 ? 'short_essay' : 'full_essay',
        part_title: `PART ${newIdx + 1}: ${newIdx === 0 ? 'Multiple Choice' : newIdx === 1 ? 'Sentence Rewriting' : 'Essay Writing'}`,
        passage: newIdx === 2 ? 'Instructions for essay writing...' : '',
        questions: [
          {
            question: `${newIdx + 1}. Question text...`,
            options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }],
            explanation: ''
          }
        ],
        explanation: `🔍 Phân tích giải thích cho Part ${newIdx + 1}`
      };
    } else if (normType === 'cloze_test') {
      newPart = {
        part_type: 'cloze_test',
        part_title: `PART ${newIdx + 1}: READ THE TEXT AND CHOOSE THE CORRECT WORD.`,
        task_sub: `Read the following text and choose the best option (A, B, C, or D) for each blank.`,
        badge_label: newIdx === 1 ? 'EMAIL' : 'ARTICLE',
        passage_title: `Title for Part ${newIdx + 1}`,
        passage: `Enter reading passage with blanks (21) _______...`,
        questions: [
          {
            question_number: `${21 + (newIdx * 5)}`,
            options: [{ id: "A", text: "A. option1" }, { id: "B", text: "B. option2" }, { id: "C", text: "C. option3" }, { id: "D", text: "D. option4" }],
            correct_option: "A"
          }
        ],
        explanation: `🔍 Phân tích giải thích cho Part ${newIdx + 1}`
      };
    } else {
      const isEven = newIdx % 2 === 1;
      newPart = {
        part_type: isEven ? 'true_false' : 'multiple_choice',
        part_title: isEven
          ? `PART ${newIdx + 1}: Listen/Read again and decide whether the statements are True (T) or False (F).`
          : `PART ${newIdx + 1}: Choose the correct answer A, B, C, or D.`,
        audioUrl: '',
        passage: normType === 'reading_section' ? 'Enter passage text...' : '',
        questions: isEven
          ? [{ question: 'Statement text...', correctAnswer: 'T', explanation: '' }]
          : [{ question: 'Question text...', options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }], explanation: '' }],
        explanation: `🔍 Phân tích giải thích cho Part ${newIdx + 1}`
      };
    }

    setSectionParts([...sectionParts, newPart]);
    setActivePartTab(newIdx);
  };

  // XÓA PART
  const handleDeletePart = (partIdx) => {
    if (sectionParts.length <= 1) {
      alert('Đề thi cần có ít nhất 1 Part!');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa PART #${partIdx + 1}?`)) return;
    const newParts = sectionParts.filter((_, i) => i !== partIdx);
    setSectionParts(newParts);
    if (activePartTab >= newParts.length) {
      setActivePartTab(newParts.length - 1);
    }
  };

  // LƯU CÂU HỎI VÀO DATABASE SUPABASE
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setIsSavingQuestion(true);

    try {
      const normType = selectedType?.toLowerCase() || 'multiple_choice';

      let validDbType = 'multiple_choice';
      if (['true_false', 'short_answer', 'essay', 'matching'].includes(normType)) {
        validDbType = normType;
      }

      let customContent = {
        sectionType: selectedType,
        title: questionTitle || (normType === 'reading_tf' ? '3. READING (True/False)' : normType === 'cloze_test' ? 'KNOWLEDGE OF LANGUAGE' : normType === 'writing_section' ? 'WRITING SECTION' : normType === 'reading_section' ? 'READING SECTION' : normType === 'listening_section' ? 'LISTENING SECTION' : 'MULTIPLE CHOICE'),
        question: questionText.trim() || questionTitle || 'Instruction Question',
        explanation: explanation.trim(),
        timeLimit: Number(timeLimitMinutes) || 0,
        maxTabSwitches: Number(maxTabSwitches) || 3,
        isRandomized: isRandomized,
        passcode: passcode.trim(),
        openTime: openTime,
        categories: selectedCategories,
      };

      if (['listening_section', 'reading_section', 'writing_section', 'multiple_choice'].includes(normType)) {
        // CHUẨN HÓA LƯU VĨNH VIỄN FILE AUDIO ONLINE VÀ LINK GOOGLE DRIVE CDN CHO TẤT CẢ CÁC PART (PART 1, PART 2, PART 3...)
        const partsToSave = await Promise.all(
          sectionParts.map(async (p) => {
            let realAudio = (p.audio_url || p.audioUrl || p.audio_data || p.audio || p.temp_link_input || '').trim();

            if (p.rawAudioFile || (realAudio && realAudio.startsWith('blob:'))) {
              try {
                const fileToUpload = p.rawAudioFile;
                if (fileToUpload) {
                  const fileExt = fileToUpload.name.split('.').pop();
                  const fileName = `audios/listening_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                  
                  let targetBucket = 'media';
                  let { data: stData, error: stErr } = await supabase.storage
                    .from(targetBucket)
                    .upload(fileName, fileToUpload, { cacheControl: '3600', upsert: true });

                  if (stErr) {
                    targetBucket = 'lms-files';
                    const res = await supabase.storage
                      .from(targetBucket)
                      .upload(fileName, fileToUpload, { cacheControl: '3600', upsert: true });
                    stData = res.data;
                  }

                  if (stData) {
                    const { data: pubData } = supabase.storage
                      .from(targetBucket)
                      .getPublicUrl(fileName);
                    if (pubData?.publicUrl) {
                      realAudio = pubData.publicUrl;
                    }
                  }
                }
              } catch (upErr) {
                console.error('Error auto-uploading raw audio file on save:', upErr);
              }
            }

            const streamAudio = getGoogleDriveStreamUrl(realAudio);

            return {
              ...p,
              audioUrl: streamAudio,
              audio_data: streamAudio,
              audio_url: streamAudio,
              audio: streamAudio,
            };
          })
        );

        customContent.parts = partsToSave;
        const firstAudio = partsToSave.find(pt => pt.audio_url || pt.audioUrl)?.audio_url || listeningAudioUrl || '';
        customContent.audioUrl = firstAudio;
        customContent.audio_url = firstAudio;
        customContent.audio_data = firstAudio;
        customContent.audioFileName = uploadedAudioFileName;
        customContent.passage = sectionPassage;
        customContent.childQuestions = sectionChildQuestions;
      } else if (normType === 'reading_tf') {
        customContent.passage = sectionPassage;
        customContent.childQuestions = sectionChildQuestions;
      } else if (normType === 'cloze_test') {
        customContent.tasks = sectionParts.map(p => ({
          task_title: p.part_title,
          task_sub: p.task_sub,
          badge_label: p.badge_label,
          passage_title: p.passage_title,
          passage_content: p.passage,
          questions: p.questions,
          explanation: p.explanation
        }));
      }

      const payload = {
        activity_id: activityId,
        type: validDbType,
        marks: Number(marks),
        content: customContent,
      };

      let saveErr = null;

      if (editingQuestion?.id === 'new') {
        const { error } = await supabase.from('questions').insert([payload]);
        saveErr = error;
      } else {
        const { error } = await supabase.from('questions').update(payload).eq('id', editingQuestion.id);
        saveErr = error;
      }

      if (saveErr) {
        alert('Lỗi lưu câu hỏi: ' + saveErr.message);
        setIsSavingQuestion(false);
        return;
      }

      // DUAL-BINDING DỰ PHÒNG CHỐNG RỚT TRƯỜNG API: CẬP NHẬT AUDIO_URL SANG CẢ BẢNG ACTIVITIES
      try {
        const firstPartAudio = getGoogleDriveStreamUrl(sectionParts[0]?.audio_url || sectionParts[0]?.audioUrl || sectionParts[0]?.audio_data || listeningAudioUrl || '');
        if (firstPartAudio && activityId) {
          await supabase.from('activities').update({
            audio_url: firstPartAudio,
            audio_data: firstPartAudio,
          }).eq('id', activityId);
        }
      } catch (actErr) {
        console.warn('Cập nhật audio_url sang activities bỏ qua:', actErr);
      }

      alert('🎉 ĐÃ LƯU BÀI THI THÀNH CÔNG THẦY NHÉ!\n\nĐề thi của Thầy đã được lưu vào bài học và TỰ ĐỘNG NẠP VÀO NGÂN HÀNG ĐỀ CHUNG!');

      setEditingQuestion(null);
      await fetchQuestions();
      if (onSaved) onSaved();
    } catch (err) {
      alert('Lỗi không xác định: ' + err.message);
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // DANH SÁCH ĐẦY ĐỦ 20 DẠNG CÂU HỎI TRONG LMS THÀNH PHẦN MOODLE/STANDARDS
  const questionTypesList = [
    { type: 'listening_section', label: '1. LISTENING SECTION (Bài Nghe Gộp Multi Parts Trắc Nghiệm & True/False)', desc: 'Soạn trọn bộ tất cả các Part (Part 1, Part 2, Part 3...) của bài Nghe.' },
    { type: 'reading_section', label: '2. READING SECTION (Bài Đọc Hiểu Gộp Multi Parts Trắc Nghiệm & True/False)', desc: 'Soạn trọn bộ tất cả các Part (Part 1, Part 2, Part 3...) của bài Đọc.' },
    { type: 'cloze_test', label: '4. KNOWLEDGE OF LANGUAGE (Cloze Test Gộp Multi Parts Đục Lỗ)', desc: 'Soạn trọn bộ tất cả các Part (Part 1, Part 2...) của bài Đọc Đục Lỗ Cloze test.' },
    { type: 'reading_tf', label: '3. READING (True/False) - Bài Đọc Chọn Đúng (T) / Sai (F)', desc: 'Bài đọc chứa đoạn văn bản đọc hiểu và 5 câu phát biểu bên dưới với nút vuông [T] và [F].' },
    { type: 'writing_section', label: '5. WRITING SECTION (Bài Viết Gộp Part 1 Trắc Nghiệm, Part 2 Tự Luận Ngắn, Part 3 Bài Luận/Tải Ảnh)', desc: 'Gồm 3 phần: Part 1 Trắc nghiệm A,B,C,D, Part 2 Tự luận ngắn, Part 3 Bài luận dài cho phép dán văn bản hoặc tải ảnh bài làm.' },
    { type: 'multiple_choice', label: '6. Multiple Choice (Trắc nghiệm A, B, C, D Multi-Parts + JSON)', desc: 'Trắc nghiệm A, B, C, D gộp Multi Parts với nạp JSON riêng từng Part.' },
    { type: 'true_false', label: '7. True / False (Đúng hoặc Sai đơn lẻ)', desc: 'Câu hỏi phát biểu chọn Đúng hoặc Sai đơn lẻ.' },
    { type: 'short_answer', label: '8. Short Answer (Điền từ / Câu trả lời ngắn)', desc: 'Học sinh gõ từ/cụm từ trả lời ngắn.' },
    { type: 'essay', label: '9. Essay (Bài viết tự luận đơn)', desc: 'Ô nhập văn bản tự luận cho bài viết ngắn.' },
    { type: 'matching', label: '10. Matching (Nối từ / Nối vế câu)', desc: 'Nối các vế ở Cột A với Cột B.' },
    { type: 'fill_in_blanks', label: '11. Fill in the Blanks (Điền vào chỗ trống)', desc: 'Điền từ còn thiếu vào ô trống.' },
    { type: 'ordering', label: '12. Ordering / Sentence Building (Sắp xếp từ thành câu)', desc: 'Sắp xếp các từ bị xáo trộn thành câu hoàn chỉnh.' },
    { type: 'drag_drop', label: '13. Drag and Drop Words (Kéo thả từ vào vị trí)', desc: 'Kéo các thẻ từ thả vào ô thích hợp.' },
    { type: 'audio_record', label: '14. Audio Recording (Thu âm phát âm bài nói)', desc: 'Học sinh bấm nút Thu Âm trực tiếp bài nói.' },
    { type: 'video_response', label: '15. Video Response (Tải video bài nói)', desc: 'Tải video hoặc quay video trực tiếp.' },
    { type: 'pronunciation', label: '16. Pronunciation Test (Kiểm tra phát âm AI)', desc: 'AI chấm điểm phát âm từ/câu.' },
    { type: 'grammar_drill', label: '17. Grammar Drill (Luyện tập ngữ pháp)', desc: 'Bài tập luyện chia động từ và ngữ pháp.' },
    { type: 'vocab_flashcard', label: '18. Vocabulary Flashcard (Học từ vựng Flashcard)', desc: 'Thẻ từ vựng thông minh lật 2 mặt.' },
    { type: 'speaking_test', label: '19. Speaking Test (Bài thi nói tổng hợp)', desc: 'Thi nói tổng hợp theo chủ đề.' },
    { type: 'interactive_hotspot', label: '20. Interactive Hotspot (Tương tác hình ảnh)', desc: 'Nhấp chọn điểm nóng tương tác trên hình ảnh.' }
  ];

  return (
    <div className="space-y-6">
      {/* 2 TAB CHÍNH */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex-shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'questions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-emerald-600" />
          <span>Editing & Preview Quiz (Biên Tập & Xem Trước - {questions.length} câu)</span>
        </button>

        <button
          onClick={() => setActiveTab('manual_editor')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'manual_editor' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>📝 Soạn Đề Thủ Công (Word / Audio / Đáp Án Ẩn)</span>
        </button>
      </div>

      {/* TAB 1: DANH SÁCH & BIÊN TẬP CÂU HỎI */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Questions ({questions.length} câu hỏi trong bài)
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsExamTimerOpen(true)}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>⏱️ Đồng Hồ Giám Thị Tivi</span>
              </button>

              <button
                onClick={() => exportOmrSheet(questionTitle || 'BÀI THI TRẮC NGHIỆM', 40)}
                className="px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>📄 In Phiếu Tô OMR</span>
              </button>

              <button
                onClick={() => setIsMatrixModalOpen(true)}
                className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>📊 Ma Trận Đề (TOS)</span>
              </button>

              <button
                onClick={() => exportMultiCodeWord(questions, questionTitle || 'BÀI KIỂM TRA TIẾNG ANH')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>🖨️ Xuất 4 Mã Đề (101-104)</span>
              </button>

              <button
                onClick={() => exportQuizToWord(questions, questionTitle || 'BÀI KIỂM TRA TIẾNG ANH')}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>🖨️ In Đề 1 Mã (Word)</span>
              </button>

              <button
                onClick={() => setIsCommunityBankOpen(true)}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>🌐 Kho Đề Thi Cộng Đồng</span>
              </button>

              {/* CHỨC NĂNG 3: NHẬP ĐỀ THI NHANH TỪ FILE MICROSOFT WORD (.DOCX) */}
              <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>📄 Nhập Đề Từ File Word (.docx)</span>
                <input
                  type="file"
                  accept=".docx,.doc,.txt"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      alert(`🎉 ĐÃ ĐỌC THÀNH CÔNG FILE WORD "${file.name}"!\n\nHệ thống AI đã tự động phân tích đoạn văn bài đọc và trích xuất trọn bộ câu hỏi trắc nghiệm A, B, C, D nạp vào đề thi!`);
                      setIsAiGenModalOpen(true);
                    }
                  }}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setIsAiGenModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center space-x-1"
              >
                <span>⚡ TẠO ĐỀ THI TỰ ĐỘNG BẰNG AI</span>
              </button>

              <button
                onClick={() => {
                  setSelectedType('multiple_choice');
                  setIsTypeModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>+ Add (Thêm Thủ Công)</span>
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Đang tải câu hỏi bài thi..." />
          ) : questions.length === 0 ? (
            <div className="p-10 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-black text-2xl">
                📝
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Bài Thi Này Chưa Có Câu Hỏi Nào</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto">
                  Thầy có thể bấm nút tạo đề tự động bằng AI hoặc thêm thủ công từng Part (Part 1 Trắc nghiệm, Part 2 Bài đọc, Part 3 Viết luận)...
                </p>
              </div>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => setIsAiGenModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ TẠO ĐỀ TỰ ĐỘNG BẰNG AI</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedType('multiple_choice');
                    setIsTypeModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ SOẠN CÂU HỎI THỦ CÔNG</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const partsList = q.content?.parts || [];

                return (
                  <div key={q.id} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                          {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {q.content?.title || q.content?.question || 'Đề thi trắc nghiệm'}
                        </h4>
                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 uppercase">
                          📝 ĐỀ THI THỬ
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md transition flex items-center space-x-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>📝 SỬA BÀI THI NÀY</span>
                      </button>
                    </div>

                    {/* HIỂN THỊ CHI TIẾT NỘI DUNG CÁC PART VÀ CÂU HỎI TRONG BÀI THI (ẢNH 3) */}
                    <div className="space-y-4 text-xs font-sans">
                      {partsList.length > 0 ? (
                        partsList.map((p, pI) => (
                          <div key={pI} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                            <h5 className="font-extrabold text-xs text-sky-900 flex items-center space-x-1.5">
                              <span>{p.part_title || `PART #${pI + 1}`}</span>
                            </h5>

                              {/* PHÁT BÀI NGHE AUDIO MP3: Y HỆT TRÌNH PHÁT TÔ ĐỎ NGẮN 1/2 + BADGE ĐẾM LẦN NGHE + LỜI BÀI NGHE GV */}
                              {(() => {
                                const pAudio = p.audio_data || p.audio_url || p.audioUrl || p.audio || p.temp_link_input || q.content?.audio_data || q.content?.audio_url || q.content?.audioUrl || q.audio_url;
                                if (!pAudio) return null;

                                const maxPlays = p.max_plays || 2;
                                const transcriptText = p.transcript || p.audio_transcript || (p.passage && q.type === 'listening_section' ? p.passage : '');
                                const isOpenTranscript = openTranscripts[`outer_${q.id}_${pI}`];

                                return (
                                  <div className="my-3 space-y-2 max-w-md">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs flex items-center space-x-1">
                                        <span>🎧 Lần nghe tối đa:</span>
                                        <strong className="font-mono">{maxPlays} lần</strong>
                                      </span>

                                      {transcriptText && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenTranscripts((prev) => ({ ...prev, [`outer_${q.id}_${pI}`]: !prev[`outer_${q.id}_${pI}`] }));
                                          }}
                                          className="px-2.5 py-0.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-lg text-[10px] font-extrabold transition flex items-center space-x-1 border border-indigo-300 shadow-2xs cursor-pointer ml-auto"
                                          title="Xem lời bài nghe (Chỉ Giáo viên mới thấy)"
                                        >
                                          <span>📝 Lời bài nghe (GV)</span>
                                        </button>
                                      )}
                                    </div>

                                    <audio
                                      controls
                                      controlsList="nodownload noplaybackrate"
                                      preload="auto"
                                      src={getGoogleDriveStreamUrl(pAudio)}
                                      className="w-full h-10 outline-none rounded-full"
                                    />

                                    {isOpenTranscript && (
                                      <div className="p-3 bg-indigo-50/90 border border-indigo-300 rounded-xl text-xs text-indigo-950 space-y-1 animate-scale-up shadow-sm">
                                        <div className="flex items-center justify-between border-b border-indigo-200 pb-1 font-black text-[11px] text-indigo-900">
                                          <span>📝 LỜI BÀI NGHE (TRANSCRIPT) - CHỈ DÀNH CHO GIÁO VIÊN:</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenTranscripts((prev) => ({ ...prev, [`outer_${q.id}_${pI}`]: false }));
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900 font-bold px-1"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                        <p className="font-serif leading-relaxed text-slate-800 pt-1 whitespace-pre-line">
                                          {transcriptText}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                            {/* VĂN BẢN BÀI ĐỌC PASSAGE NẾU CÓ */}
                            {p.passage && (
                              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-slate-800 font-serif leading-relaxed italic">
                                📖 <strong>Bài đọc:</strong> {p.passage}
                              </div>
                            )}

                            {/* DANH SÁCH CÂU HỎI TRẮC NGHIỆM TRONG PART */}
                            <div className="space-y-2.5 pt-1">
                              {(p.questions || []).map((cQ, cI) => (
                                <div key={cI} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                                  <p className="font-extrabold text-slate-900">{cQ.question}</p>
                                  {cQ.options && cQ.options.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                                      {cQ.options.map((opt, oI) => (
                                        <span
                                          key={oI}
                                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                                            opt.isCorrect
                                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                                              : 'bg-slate-50 border-slate-200 text-slate-700'
                                          }`}
                                        >
                                          {opt.text} {opt.isCorrect && '✓'}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {cQ.explanation && (
                                    <p className="text-[11px] text-amber-800 font-medium pt-1 italic">
                                      💡 {cQ.explanation}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-600 font-semibold italic p-2">{q.content?.question}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BẢNG MODAL CHỌN ĐẦY ĐỦ 20 DẠNG CÂU HỎI */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Choose a question type to add (Danh sách 20 dạng bài chuẩn)</h3>
              <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-2 max-h-[65vh] overflow-y-auto">
              {questionTypesList.map((t) => (
                <label
                  key={t.type}
                  onClick={() => setSelectedType(t.type)}
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition ${
                    selectedType === t.type
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="q_type"
                    checked={selectedType === t.type}
                    onChange={() => setSelectedType(t.type)}
                  />
                  <div>
                    <span className="text-xs font-extrabold block text-slate-900">{t.label}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{t.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-4 bg-slate-100 flex justify-end space-x-3">
              <button
                onClick={handleConfirmAddType}
                className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Add (Thêm Dạng Này)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM BIÊN TẬP CÂU HỎI - KHÔNG CHE NAVBAR MENU NGANG TRÊN CÙNG (ẢNH 2) */}
      {editingQuestion && (
        <div className="fixed inset-0 z-40 pt-16 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 my-6 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base uppercase">
                SOẠN THẢO / CHỈNH SỬA ĐỀ THI: {selectedType?.toUpperCase()}
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* CÀI ĐẶT THỜI GIAN & ĐIỂM SỐ & GIAN LẬN & TRỘN ĐỀ */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-xs">
                <div>
                  <label className="block font-extrabold text-emerald-950 uppercase mb-1">
                    ⏱️ CÀI ĐẶT THỜI GIAN
                  </label>
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value={0}>⏱️ Không tính giờ</option>
                    <option value={5}>⚡ 5 phút</option>
                    <option value={15}>📝 15 phút</option>
                    <option value={45}>🏫 45 phút</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-rose-950 uppercase mb-1">
                    🛡️ GIỚI HẠN RỜI TAB
                  </label>
                  <select
                    value={maxTabSwitches}
                    onChange={(e) => setMaxTabSwitches(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-rose-300 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value={1}>🚫 Tối đa 1 lần (Nghiêm ngặt)</option>
                    <option value={3}>⚠️ Tối đa 3 lần (Tiêu chuẩn)</option>
                    <option value={5}>💬 Tối đa 5 lần</option>
                    <option value={99}>Tùy chọn không khóa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-purple-950 uppercase mb-1">
                    🔀 TRỘN ĐỀ NGẪU NHIÊN
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRandomized(!isRandomized)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold border transition flex items-center justify-center space-x-1 ${
                      isRandomized ? 'bg-purple-600 text-white border-transparent' : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    <span>{isRandomized ? '🔀 Đã bật trộn ngẫu nhiên' : 'Tắt trộn đề'}</span>
                  </button>
                </div>

                <div>
                  <label className="block font-extrabold text-sky-950 uppercase mb-1">
                    ⏰ HẸN GIỜ MỞ ĐỀ THI
                  </label>
                  <input
                    type="datetime-local"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3 py-2 border border-sky-300 rounded-xl text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-amber-900 uppercase mb-1">
                    🔒 MẬT KHẨU MÃ KHÓA
                  </label>
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Mã khóa (VD: 123456)"
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-800 uppercase mb-1">
                    🎯 ĐIỂM SỐ CÂU HỎI
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* TIÊU ĐỀ PHẦN BÀI THI TỔNG CHUNG */}
              <div className="p-4 bg-purple-50/60 border-l-4 border-purple-600 rounded-r-2xl space-y-1.5 shadow-xs">
                <label className="block text-xs font-extrabold text-purple-900 uppercase">
                  📝 TIÊU ĐỀ PHẦN BÀI THI TỔNG CHUNG *
                </label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="Ví dụ: KNOWLEDGE OF LANGUAGE / WRITING SECTION / LISTENING SECTION"
                  className="w-full p-2.5 border border-purple-300 rounded-xl text-xs font-extrabold text-purple-950 bg-white"
                />
              </div>

              {/* KHUNG HIỂN THỊ TẤT CẢ CÁC PART CHO MULTIPLE CHOICE, WRITING, CLOZE TEST, LISTENING, READING */}
              {['cloze_test', 'listening_section', 'reading_section', 'writing_section', 'multiple_choice'].includes(selectedType?.toLowerCase()) && (
                <div className="space-y-4 border border-blue-200 rounded-3xl p-5 bg-blue-50/20">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-3 overflow-x-auto gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-blue-950 uppercase flex items-center space-x-1">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>CÁC PART ({sectionParts.length} Part):</span>
                      </span>

                      {sectionParts.map((p, pIdx) => {
                        const qCount = (p.questions || []).length;
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              setActivePartTab(pIdx);
                              setShowAllParts(false);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 cursor-pointer ${
                              !showAllParts && activePartTab === pIdx
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                                : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            <span>PART #{pIdx + 1}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                              !showAllParts && activePartTab === pIdx ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {qCount} câu
                            </span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setShowAllParts(!showAllParts)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center space-x-1 cursor-pointer ${
                          showAllParts ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{showAllParts ? '📑 Chế độ từng Part' : '👁️ Xem tất cả Part'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNewPart}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center space-x-1 flex-shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ THÊM PART {sectionParts.length + 1}</span>
                    </button>
                  </div>

                  {sectionParts.map((pItem, pIdx) => {
                    if (!showAllParts && activePartTab !== pIdx) return null;

                    const isWriting = selectedType?.toLowerCase() === 'writing_section';
                    const isCloze = selectedType?.toLowerCase() === 'cloze_test';

                    return (
                      <div key={pIdx} className="p-5 bg-white border border-blue-300 rounded-3xl space-y-4 shadow-sm relative">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="font-extrabold text-sm text-blue-950 uppercase flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                              {pIdx + 1}
                            </span>
                            <span>PART #{pIdx + 1}: {
                              pItem.part_type === 'gap_fill' ? 'Điền Từ Chỗ Trống (Gap-Fill)' :
                              pItem.part_type === 'true_false' ? 'True / False (Đúng/Sai)' :
                              pItem.part_type === 'ordering' ? 'Sắp Xếp Hội Thoại / Câu' :
                              pItem.part_type === 'sentence_transformation' ? 'Chọn Câu Đồng Nghĩa' :
                              pItem.part_type === 'short_essay' ? 'Tự Luận Ngắn' :
                              pItem.part_type === 'full_essay' ? 'Bài Luận Dài / Đoạn Văn' :
                              pItem.part_type === 'cloze_test' ? 'Cloze Test Đục Lỗ' :
                              pItem.part_type === 'reading_section' ? 'Bài Đọc Hiểu 2 Cột' :
                              pItem.part_type === 'listening_section' ? 'Bài Nghe Audio MP3' :
                              pItem.part_type === 'speaking_test' ? 'Speaking Test (Phát Âm AI)' :
                              'Trắc Nghiệm A,B,C,D'
                            }</span>
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPartJsonModalIndex(pIdx);
                                setPartJsonInputText('');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
                            >
                              <FileCode className="w-3.5 h-3.5" />
                              <span>📥 Nhập / Dán JSON</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadSampleFile(
                                pItem.part_type === 'gap_fill' ? 'json_gap_fill_part' :
                                isWriting ? 'json_writing_part' :
                                isCloze ? 'json_cloze_part' : 'json'
                              )}
                              className="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-lg text-[11px] font-bold hover:bg-blue-100 cursor-pointer"
                            >
                              📥 Tải JSON Mẫu
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePart(pIdx)}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa Part #{pIdx + 1}</span>
                            </button>
                          </div>
                        </div>

                        {/* LOẠI ĐỀ PART VÀ TIÊU ĐỀ YÊU CẦU ĐỀ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                              Loại Dạng Đề Part #{pIdx + 1}:
                            </label>
                            <select
                              value={pItem.part_type || 'multiple_choice'}
                              onChange={(e) => {
                                const newParts = [...sectionParts];
                                const newType = e.target.value;
                                newParts[pIdx].part_type = newType;
                                if (newType === 'gap_fill') {
                                  (newParts[pIdx].questions || []).forEach(cq => {
                                    if (!cq.correctAnswer && !cq.correct_answer) {
                                      const correctOpt = cq.options?.find(o => o.isCorrect);
                                      if (correctOpt) {
                                        cq.correctAnswer = correctOpt.text;
                                        cq.correct_answer = correctOpt.text;
                                      }
                                    }
                                  });
                                }
                                setSectionParts(newParts);
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-bold text-slate-800"
                            >
                              <option value="multiple_choice">🎯 1. Trắc Nghiệm 4 lựa chọn (Multiple Choice A, B, C, D)</option>
                              <option value="true_false">⚖️ 2. True / False (Đúng hoặc Sai - T/F)</option>
                              <option value="gap_fill">✏️ 3. Điền từ vào chỗ trống (Gap-Fill / Inline Blank)</option>
                              <option value="ordering">🔄 4. Sắp xếp đoạn hội thoại / Sắp xếp câu (Conversation Ordering)</option>
                              <option value="sentence_transformation">✍️ 5. Chọn câu đồng nghĩa / Viết lại câu (Sentence Transformation)</option>
                              <option value="short_essay">📝 6. Tự luận ngắn (Short Answer / Rewriting)</option>
                              <option value="full_essay">📄 7. Viết đoạn văn 60-80 từ / Bài luận (Paragraph Writing & Live Counter)</option>
                              <option value="cloze_test">🗂️ 8. Cloze Test (Đọc hiểu đục lỗ)</option>
                              <option value="reading_section">📖 9. Reading Comprehension (Đọc hiểu 2 cột)</option>
                              <option value="listening_section">🎧 10. Listening Section (Bài nghe Audio MP3)</option>
                              <option value="speaking_test">🎙️ 11. Speaking Test (Luyện phát âm AI qua Microphone)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                              Tiêu đề Hướng Dẫn Yêu Cầu Đề Part #{pIdx + 1}:
                            </label>
                            <input
                              type="text"
                              value={pItem.part_title || ''}
                              onChange={(e) => {
                                const newParts = [...sectionParts];
                                newParts[pIdx].part_title = e.target.value;
                                setSectionParts(newParts);
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                            />
                          </div>
                        </div>

                        {/* KHUNG TẢI FILE ÂM THANH TRỰC TIẾP TỪ MÁY TÍNH CHUẨN ĐÚNG 100% THEO ẢNH 1 CỦA THẦY HẢI */}
                        {selectedType?.toLowerCase().includes('listening') || pItem.part_type === 'listening_section' ? (
                          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-3 text-slate-900 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <label className="text-xs font-black text-amber-950 flex items-center space-x-2">
                                <Volume2 className="w-4 h-4 text-amber-600" />
                                <span>🔊 FILE ÂM THANH BÀI NGHE MP3 CHO PART #{pIdx + 1} (AUDIO FILE):</span>
                              </label>

                              {(pItem.audio_url || pItem.audioUrl) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newParts = [...sectionParts];
                                    delete newParts[pIdx].audio_url;
                                    delete newParts[pIdx].audioUrl;
                                    delete newParts[pIdx].audioFileName;
                                    delete newParts[pIdx].temp_link_input;
                                    setSectionParts(newParts);
                                  }}
                                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-lg border border-rose-300 transition cursor-pointer self-start sm:self-auto"
                                >
                                  🗑️ Xóa file audio
                                </button>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                              <input
                                type="file"
                                accept="audio/*,.mp3,.wav,.m4a"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  // 1. NGAY LẬP TỨC TẠO BLOB LOCAL URL ĐỂ HIỂN THỊ THANH AUDIO NGHE THỬ NGAY MÀ KHÔNG CẦN CHỜ MẠNG!
                                  const localBlobUrl = URL.createObjectURL(file);
                                  const updatedPartsInitial = [...sectionParts];
                                  updatedPartsInitial[pIdx].audio_url = localBlobUrl;
                                  updatedPartsInitial[pIdx].audioUrl = localBlobUrl;
                                  updatedPartsInitial[pIdx].audioFileName = file.name;
                                  updatedPartsInitial[pIdx].rawAudioFile = file;
                                  setSectionParts([...updatedPartsInitial]);

                                  try {
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `audios/listening_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                                    let targetBucket = 'media';
                                    let { data: stData, error: stErr } = await supabase.storage
                                      .from(targetBucket)
                                      .upload(fileName, file, { cacheControl: '3600', upsert: true });

                                    if (stErr) {
                                      targetBucket = 'lms-files';
                                      const res = await supabase.storage
                                        .from(targetBucket)
                                        .upload(fileName, file, { cacheControl: '3600', upsert: true });
                                      stData = res.data;
                                      stErr = res.error;
                                    }

                                    if (stData) {
                                      const { data: pubData } = supabase.storage
                                        .from(targetBucket)
                                        .getPublicUrl(fileName);

                                      if (pubData?.publicUrl) {
                                        const onlineUrl = pubData.publicUrl;
                                        const updatedParts = [...sectionParts];
                                        updatedParts[pIdx].audio_url = onlineUrl;
                                        updatedParts[pIdx].audioUrl = onlineUrl;
                                        updatedParts[pIdx].audioFileName = file.name;
                                        setSectionParts([...updatedParts]);
                                      }
                                    }
                                  } catch (ex) {
                                    console.error('Storage upload exception:', ex);
                                  }
                                }}
                                className="text-xs text-slate-700 font-bold bg-white p-2 rounded-xl border border-amber-300 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                              />

                              {pItem.audioFileName && (
                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 truncate max-w-xs">
                                  ✓ {pItem.audioFileName}
                                </span>
                              )}
                            </div>

                            {/* BỘ TRÌNH PHÁT AUDIO PLAYER HTML5 Y HỆT ẢNH TÔ ĐỎ NGẮN 1/2 */}
                            {(pItem.audio_url || pItem.audioUrl) && (
                              <div className="pt-1 max-w-md">
                                <audio
                                  src={getGoogleDriveStreamUrl(pItem.audio_url || pItem.audioUrl)}
                                  controls
                                  className="w-full h-10 outline-none rounded-full"
                                />
                              </div>
                            )}

                            {/* KHUNG NHẬP LỜI BÀI NGHE (TRANSCRIPT) CHỈ BẬT CHO GIÁO VIÊN */}
                            <div className="pt-2 border-t border-amber-200/80 space-y-1">
                              <label className="block text-[11px] font-black text-indigo-950 flex items-center space-x-1">
                                <span>📝 LỜI BÀI NGHE / TRANSCRIPT (CHỈ HIỂN THỊ DÀNH CHO GIÁO VIÊN):</span>
                              </label>
                              <textarea
                                rows={3}
                                value={pItem.transcript || pItem.audio_transcript || ''}
                                onChange={(e) => {
                                  const newParts = [...sectionParts];
                                  newParts[pIdx].transcript = e.target.value;
                                  newParts[pIdx].audio_transcript = e.target.value;
                                  setSectionParts(newParts);
                                }}
                                placeholder="Dán lời thoại/bản ghi âm Tiếng Anh của bài nghe tại đây (Học sinh sẽ KHÔNG nhìn thấy)..."
                                className="w-full p-2.5 border border-indigo-200 rounded-xl text-xs font-serif bg-white text-slate-900 leading-relaxed shadow-inner"
                              />
                            </div>
                          </div>
                        ) : ['reading_section', 'cloze_test', 'reading_tf'].includes(selectedType?.toLowerCase()) || pItem.part_type === 'reading_section' || pItem.part_type === 'cloze_test' || Boolean(pItem.passage) ? (
                          /* 2. CHỈ CÓ READING VÀ KNOWLEDGE OF LANGUAGE (CLOZE TEST) MỚI CÓ KHUNG ĐOẠN VĂN CHUNG */
                          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="text-[11px] font-extrabold text-sky-950 uppercase flex items-center space-x-1">
                                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                                <span>📖 NỘI DUNG BÀI ĐỌC HIỂU (READING PASSAGE) CHO PART #{pIdx + 1}:</span>
                              </label>

                              {/* CÔNG CỤ AI SINH ẢNH MINH HỌA & UPLOAD ẢNH BÀI ĐỌC */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const snippet = (pItem.passage || pItem.part_title || 'English reading comprehension educational story').slice(0, 160);
                                    const cleanPrompt = encodeURIComponent(`educational textbook illustration, high quality, clean background, vivid: ${snippet}`);
                                    const genUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=450&nologo=true`;
                                    
                                    const newParts = [...sectionParts];
                                    newParts[pIdx].image_url = genUrl;
                                    newParts[pIdx].imageUrl = genUrl;
                                    setSectionParts(newParts);
                                    alert('🪄 AI đã tự động sinh ảnh minh họa chất lượng cao cho bài đọc!');
                                  }}
                                  className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-[10px] font-black flex items-center space-x-1 shadow-xs cursor-pointer"
                                  title="AI tự động phân tích đoạn văn và vẽ tranh minh họa sinh động"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>🪄 AI Tạo Ảnh Minh Họa</span>
                                </button>

                                <label className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition shadow-2xs">
                                  <Camera className="w-3 h-3 text-sky-600" />
                                  <span>Tải ảnh từ máy</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const localBlobUrl = URL.createObjectURL(file);
                                        const newParts = [...sectionParts];
                                        newParts[pIdx].image_url = localBlobUrl;
                                        newParts[pIdx].imageUrl = localBlobUrl;
                                        setSectionParts([...newParts]);

                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `images/reading_${Date.now()}.${fileExt}`;
                                        let targetBucket = 'media';
                                        let { data: stData, error: stErr } = await supabase.storage
                                          .from(targetBucket)
                                          .upload(fileName, file, { upsert: true });

                                        if (stErr) {
                                          targetBucket = 'lms-files';
                                          const res = await supabase.storage.from(targetBucket).upload(fileName, file, { upsert: true });
                                          stData = res.data;
                                        }

                                        if (stData) {
                                          const { data: pubData } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
                                          if (pubData?.publicUrl) {
                                            const updatedParts = [...sectionParts];
                                            updatedParts[pIdx].image_url = pubData.publicUrl;
                                            updatedParts[pIdx].imageUrl = pubData.publicUrl;
                                            setSectionParts([...updatedParts]);
                                          }
                                        }
                                      } catch (err) {
                                        console.error('Lỗi tải ảnh:', err);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>

                                {(pItem.image_url || pItem.imageUrl) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newParts = [...sectionParts];
                                      delete newParts[pIdx].image_url;
                                      delete newParts[pIdx].imageUrl;
                                      setSectionParts(newParts);
                                    }}
                                    className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-300 cursor-pointer"
                                  >
                                    ✕ Xóa ảnh
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* XEM TRƯỚC HÌNH ẢNH MINH HỌA BÀI ĐỌC */}
                            {(pItem.image_url || pItem.imageUrl) && (
                              <div className="relative rounded-xl overflow-hidden border border-sky-300 max-w-sm max-h-48 group">
                                <img
                                  src={pItem.image_url || pItem.imageUrl}
                                  alt="Passage Illustration"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                                  🖼️ Ảnh minh họa bài đọc
                                </span>
                              </div>
                            )}

                            <textarea
                              rows={4}
                              value={pItem.passage || ''}
                              onChange={(e) => {
                                const newParts = [...sectionParts];
                                newParts[pIdx].passage = e.target.value;
                                setSectionParts(newParts);
                              }}
                              placeholder="Dán đoạn văn bài đọc hiểu tại đây (Ví dụ: Chuong village is located in Thanh Oai district...)..."
                              className="w-full p-2.5 border border-sky-300 rounded-xl text-xs font-serif bg-white text-slate-900 leading-relaxed shadow-inner"
                            />
                          </div>
                        ) : null}

                        {/* DANH SÁCH CÂU HỎI TRONG PART */}
                        <div className="space-y-3 border-t border-slate-100 pt-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100/90 p-3 rounded-2xl border border-slate-200">
                            <span className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5">
                              <span>📋 DANH SÁCH CÂU HỎI TRONG PART #{pIdx + 1} ({ (pItem.questions || []).length } câu):</span>
                            </span>

                            {/* MENU SỔ XUỐNG TỔNG HỢP TẤT CẢ CÁC DẠNG CÂU HỎI & NÚT THÊM */}
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-300 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-600">Kiểu câu hỏi:</span>
                                <select
                                  value={selectedChildTypeToAdd}
                                  onChange={(e) => setSelectedChildTypeToAdd(e.target.value)}
                                  className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer pr-1"
                                >
                                  <option value="multiple_choice">🎯 Trắc nghiệm 4 lựa chọn (A, B, C, D)</option>
                                  <option value="true_false">⚖️ True / False (Đúng hoặc Sai - T/F)</option>
                                  <option value="gap_fill">✏️ Điền từ vào chỗ trống (Gap-Fill / Inline Blank)</option>
                                  <option value="ordering">🔄 Sắp xếp đoạn hội thoại (Conversation Ordering)</option>
                                  <option value="sentence_transformation">✍️ Chọn câu đồng nghĩa (Sentence Transformation)</option>
                                  <option value="short_essay">📝 Tự luận ngắn (Short Answer / Viết lại câu)</option>
                                  <option value="full_essay">📄 Viết đoạn văn (Paragraph Writing 60-80 từ)</option>
                                  <option value="speaking_test">🎙️ Luyện phát âm AI (Speaking Test)</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddQuestionWithType(pIdx, selectedChildTypeToAdd)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Thêm Câu Hỏi Này</span>
                              </button>
                            </div>
                          </div>

                          {(pItem.questions || []).map((cQ, cIdx) => {
                            const isGap = pItem.part_type === 'gap_fill' || cQ.type === 'gap_fill' || (pItem.part_type === 'cloze_test' && (!cQ.options || cQ.options.length === 0));
                            const isEssay = pItem.part_type === 'short_essay' || pItem.part_type === 'full_essay' || cQ.type === 'short_essay' || cQ.type === 'full_essay';
                            const isTF = pItem.part_type === 'true_false' || cQ.type === 'true_false';
                            const isMC = !isGap && !isEssay && !isTF;
                            const blankRegex = /(_{2,}|\[blank\]|\[chỗ trống\]|\[___+\]|\[\.\.\.+\]|\(\.\.\.+\)|\.\.\.+)/i;
                            const hasBlank = isGap && blankRegex.test(cQ.question || '');

                            return (
                              <div key={cIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-indigo-300 transition">
                                {/* THANH HEADER ĐIỀU KHIỂN CÂU HỎI CON: SỬA, XÓA, NHÂN BẢN, DI CHUYỂN */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                                      {cIdx + 1}
                                    </span>
                                    <span className="text-xs font-black text-slate-800">
                                      Câu hỏi #{cIdx + 1}
                                    </span>

                                    {/* BADGE LOẠI CÂU HỎI CON */}
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                      isGap
                                        ? 'bg-teal-100 text-teal-900 border-teal-300'
                                        : isEssay
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : isTF
                                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    }`}>
                                      {isGap ? '✏️ Điền từ (Gap-Fill)' : isEssay ? '✍️ Đoạn văn (Essay)' : isTF ? '⚖️ True/False' : '🎯 Trắc nghiệm A,B,C,D'}
                                    </span>
                                  </div>

                                  {/* CÁC NÚT ĐIỀU KHIỂN THAO TÁC CÂU HỎI */}
                                  <div className="flex items-center space-x-1.5 ml-auto">
                                    {isGap && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newParts = [...sectionParts];
                                          const curQ = newParts[pIdx].questions[cIdx].question || '';
                                          newParts[pIdx].questions[cIdx].question = curQ ? `${curQ} _______` : `${cIdx + 1}. Sentence with _______ blank.`;
                                          setSectionParts(newParts);
                                        }}
                                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition shadow-2xs"
                                        title="Bấm để chèn nhanh ký tự chỗ trống _______ vào câu hỏi"
                                      >
                                        <span>✏️ + Chèn chỗ trống _______</span>
                                      </button>
                                    )}

                                    {/* NÚT DI CHUYỂN LÊN */}
                                    <button
                                      type="button"
                                      disabled={cIdx === 0}
                                      onClick={() => handleMoveQuestion(pIdx, cIdx, -1)}
                                      className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700 rounded-lg border border-slate-300 transition shadow-2xs"
                                      title="Di chuyển câu hỏi lên trên"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>

                                    {/* NÚT DI CHUYỂN XUỐNG */}
                                    <button
                                      type="button"
                                      disabled={cIdx === (pItem.questions || []).length - 1}
                                      onClick={() => handleMoveQuestion(pIdx, cIdx, 1)}
                                      className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700 rounded-lg border border-slate-300 transition shadow-2xs"
                                      title="Di chuyển câu hỏi xuống dưới"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>

                                    {/* NÚT NHÂN BẢN */}
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateQuestion(pIdx, cIdx)}
                                      className="p-1.5 bg-white hover:bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 transition shadow-2xs flex items-center space-x-1"
                                      title="Nhân bản (Copy) câu hỏi này"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>

                                    {/* NÚT XÓA CÂU HỎI CON */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuestion(pIdx, cIdx)}
                                      className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-300 transition shadow-2xs flex items-center space-x-1"
                                      title="Xóa câu hỏi con này"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[11px] font-bold text-slate-700">
                                    Nội dung câu hỏi / Câu văn đề bài:
                                  </label>
                                  <textarea
                                    rows={cQ.question?.includes('\n') ? 4 : 2}
                                    value={cQ.question || ''}
                                    onChange={(e) => {
                                      const newParts = [...sectionParts];
                                      newParts[pIdx].questions[cIdx].question = e.target.value;
                                      setSectionParts(newParts);
                                    }}
                                    placeholder="Nhập câu hỏi (Ví dụ: 31. a. What are we going to do...\nb. I think we should...)..."
                                    className="w-full px-3 py-2 border border-slate-300 focus:border-indigo-500 rounded-xl text-xs font-bold bg-white leading-relaxed shadow-inner outline-none font-sans"
                                  />
                                </div>

                                {/* LIVE PREVIEW INLINE BLANK TRỰC TIẾP DÀNH CHO GIÁO VIÊN */}
                                {hasBlank && (
                                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1">
                                    <span className="text-[10px] font-extrabold text-indigo-900 uppercase flex items-center space-x-1">
                                      <span>👁️ Xem trước giao diện điền từ Inline (lọt lòng trong câu) của học sinh:</span>
                                    </span>
                                    <div className="font-serif text-xs text-slate-800 leading-loose bg-white p-2 rounded-lg border border-indigo-100">
                                      {(() => {
                                        const qText = cQ.question || '';
                                        const m = qText.match(blankRegex);
                                        if (!m) return qText;
                                        const idx = qText.indexOf(m[0]);
                                        const b4 = qText.slice(0, idx);
                                        const aft = qText.slice(idx + m[0].length);
                                        return (
                                          <span>
                                            <span>{b4}</span>
                                            <span className="inline-block mx-1.5 px-3 py-0.5 text-center text-xs font-bold text-indigo-700 bg-indigo-50 border-2 border-indigo-400 border-dashed rounded-lg min-w-[100px]">
                                              {cQ.correctAnswer || cQ.correct_answer || '...điền từ...'}
                                            </span>
                                            <span>{aft}</span>
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                )}

                              {/* BỘ SOẠN ĐÁP ÁN CHUẨN XÁC THEO TỪNG LOẠI DẠNG ĐỀ PART */}
                              {(() => {
                                const pType = pItem.part_type || 'multiple_choice';

                                // 1. DẠNG ĐIỀN TỪ (GAP-FILL / CLOZE KHÔNG CÓ OPTIONS)
                                if (isGap) {
                                  return (
                                    <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-2">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <label className="block text-[11px] font-black text-emerald-950 uppercase flex items-center space-x-1.5">
                                          <span>🎯 ĐÁP ÁN ĐÚNG CẦN ĐIỀN (CORRECT ANSWER) CHO CÂU #{cIdx + 1}:</span>
                                        </label>
                                        <span className="text-[10px] text-emerald-700 italic font-medium">
                                          (Nhiều đáp án cùng đúng: phân tách bằng dấu / ví dụ: making / to make)
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="text"
                                          value={cQ.correctAnswer || cQ.correct_answer || ''}
                                          onChange={(e) => {
                                            const newParts = [...sectionParts];
                                            const val = e.target.value;
                                            newParts[pIdx].questions[cIdx].correctAnswer = val;
                                            newParts[pIdx].questions[cIdx].correct_answer = val;
                                            setSectionParts(newParts);
                                          }}
                                          placeholder="Ví dụ: making (hoặc: making / to make)..."
                                          className="w-full px-3 py-2 border-2 border-emerald-400 focus:border-emerald-600 rounded-xl text-xs font-bold text-emerald-950 bg-white shadow-inner outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newParts = [...sectionParts];
                                            newParts[pIdx].questions[cIdx].options = [
                                              { text: '', isCorrect: true },
                                              { text: '', isCorrect: false },
                                              { text: '', isCorrect: false },
                                              { text: '', isCorrect: false },
                                            ];
                                            delete newParts[pIdx].questions[cIdx].correctAnswer;
                                            delete newParts[pIdx].questions[cIdx].correct_answer;
                                            setSectionParts(newParts);
                                          }}
                                          className="shrink-0 px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 rounded-xl text-[10px] font-bold"
                                          title="Chuyển câu này sang dạng 4 lựa chọn A, B, C, D"
                                        >
                                          + Đổi sang A,B,C,D
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }

                                // 2. DẠNG TRUE / FALSE (ĐÚNG HOẶC SAI)
                                if (isTF) {
                                  const curAns = (cQ.correctAnswer || cQ.correct_answer || 'T').toUpperCase();
                                  return (
                                    <div className="p-3 bg-blue-50/80 border border-blue-300 rounded-xl space-y-1.5">
                                      <label className="block text-[11px] font-black text-blue-950 uppercase">
                                        🎯 ĐÁP ÁN ĐÚNG CHO CÂU #{cIdx + 1} (TRUE / FALSE):
                                      </label>
                                      <div className="flex items-center space-x-3">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newParts = [...sectionParts];
                                            newParts[pIdx].questions[cIdx].correctAnswer = 'T';
                                            newParts[pIdx].questions[cIdx].correct_answer = 'T';
                                            setSectionParts(newParts);
                                          }}
                                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold border transition flex items-center space-x-1.5 cursor-pointer ${
                                            curAns === 'T' || curAns === 'TRUE'
                                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span>✓ TRUE (T - Đúng)</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newParts = [...sectionParts];
                                            newParts[pIdx].questions[cIdx].correctAnswer = 'F';
                                            newParts[pIdx].questions[cIdx].correct_answer = 'F';
                                            setSectionParts(newParts);
                                          }}
                                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold border transition flex items-center space-x-1.5 cursor-pointer ${
                                            curAns === 'F' || curAns === 'FALSE'
                                              ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span>✕ FALSE (F - Sai)</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }

                                // 3. DẠNG TỰ LUẬN NGẮN / BÀI LUẬN / ĐOẠN VĂN
                                if (isEssay) {
                                  return (
                                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5">
                                      <span className="text-[11px] font-extrabold text-purple-900 block">
                                        💡 Gợi ý dàn ý / Bài văn mẫu (Sample Paragraph & Outline):
                                      </span>
                                      <textarea
                                        rows={3}
                                        value={cQ.sample_answer || ''}
                                        onChange={(e) => {
                                          const newParts = [...sectionParts];
                                          newParts[pIdx].questions[cIdx].sample_answer = e.target.value;
                                          setSectionParts(newParts);
                                        }}
                                        placeholder="Nhập dàn ý gợi ý hoặc bài văn mẫu để học sinh tham khảo sau khi nộp bài..."
                                        className="w-full p-2.5 border border-purple-300 rounded-xl text-xs bg-white text-slate-900 leading-relaxed shadow-inner"
                                      />
                                    </div>
                                  );
                                }

                                // 4. DẠNG TRẮC NGHIỆM A, B, C, D (HOẶC SẮP XẾP / CÂU ĐỒNG NGHĨA)
                                const currentOptions = Array.isArray(cQ.options) && cQ.options.length > 0
                                  ? cQ.options
                                  : [
                                      { text: '', isCorrect: true },
                                      { text: '', isCorrect: false },
                                      { text: '', isCorrect: false },
                                      { text: '', isCorrect: false }
                                    ];

                                return (
                                  <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-700">
                                      Các phương án lựa chọn A, B, C, D (Tích chọn nút tròn để xác định đáp án đúng):
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 w-full">
                                      {currentOptions.map((opt, oIdx) => (
                                        <div key={oIdx} className={`flex items-center space-x-2 border rounded-xl px-3 py-2 text-xs transition ${
                                          opt.isCorrect ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-slate-200'
                                        }`}>
                                          <input
                                            type="radio"
                                            name={`mc_opt_${pIdx}_${cIdx}`}
                                            checked={opt.isCorrect}
                                            onChange={() => {
                                              const newParts = [...sectionParts];
                                              if (!newParts[pIdx].questions[cIdx].options) {
                                                newParts[pIdx].questions[cIdx].options = [...currentOptions];
                                              }
                                              newParts[pIdx].questions[cIdx].options.forEach((o, i) => {
                                                o.isCorrect = i === oIdx;
                                              });
                                              setSectionParts(newParts);
                                            }}
                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                          />
                                          <span className="font-black text-amber-800 text-xs shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                                          <input
                                            type="text"
                                            value={opt.text || ''}
                                            onChange={(e) => {
                                              const newParts = [...sectionParts];
                                              if (!newParts[pIdx].questions[cIdx].options) {
                                                newParts[pIdx].questions[cIdx].options = [...currentOptions];
                                              }
                                              newParts[pIdx].questions[cIdx].options[oIdx].text = e.target.value;
                                              setSectionParts(newParts);
                                            }}
                                            placeholder={`Phương án ${String.fromCharCode(65 + oIdx)}...`}
                                            className="w-full px-2 py-0.5 border-b border-transparent focus:border-emerald-500 text-xs bg-transparent font-medium outline-none"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex items-center space-x-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newParts = [...sectionParts];
                                          delete newParts[pIdx].questions[cIdx].options;
                                          newParts[pIdx].questions[cIdx].correctAnswer = '';
                                          newParts[pIdx].questions[cIdx].correct_answer = '';
                                          setSectionParts(newParts);
                                        }}
                                        className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-semibold"
                                      >
                                        Chuyển câu này sang dạng điền từ trực tiếp (Gap-Fill)
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Ô NHẬP LỜI GIẢI THÍCH CHI TIẾT DÀNH RIÊNG CHO TỪNG CÂU HỎI CON 🎯 CHUẨN 100% THEO YÊU CẦU THẦY HẢI */}
                              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1 mt-2">
                                <span className="text-[11px] font-extrabold text-emerald-950 block flex items-center space-x-1">
                                  <span>💡 Lời giải thích & Dẫn chứng ngữ pháp cho riêng Câu #{cIdx + 1}:</span>
                                </span>
                                <textarea
                                  rows={2}
                                  value={cQ.explanation || ''}
                                  onChange={(e) => {
                                    const newParts = [...sectionParts];
                                    newParts[pIdx].questions[cIdx].explanation = e.target.value;
                                    setSectionParts(newParts);
                                  }}
                                  placeholder="Nhập phân tích từ vựng, cấu trúc ngữ pháp hoặc lý do chọn đáp án đúng cho riêng câu hỏi này..."
                                  className="w-full p-2 border border-emerald-300 rounded-lg text-xs bg-white font-medium text-slate-800 shadow-inner"
                                />
                              </div>
                            </div>
                          );
                        })}
                        </div>

                        {/* GIẢI THÍCH CHUẨN 4 KHỐI */}
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="block text-[11px] font-extrabold text-emerald-900 uppercase">
                              GIẢI THÍCH CHUẨN 4 KHỐI DÀNH CHO PART #{pIdx + 1}:
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAiGenerateExplanation(pIdx)}
                              disabled={aiExplaining}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold"
                            >
                              🪄 AI Tạo Giải Thích Part Này
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={pItem.explanation || ''}
                            onChange={(e) => {
                              const newParts = [...sectionParts];
                              newParts[pIdx].explanation = e.target.value;
                              setSectionParts(newParts);
                            }}
                            className="w-full p-2 border border-emerald-300 rounded text-xs font-mono bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isSavingQuestion ? 'Đang Lưu Bài Thi...' : 'Save changes (Lưu Bài Tập & Đưa Vào Ngân Hàng Đề)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      {/* MODAL DÁN MÃ JSON CHO PART */}
      {partJsonModalIndex !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <span>NHẬP / DÁN MÃ JSON CHO PART #{partJsonModalIndex + 1}</span>
              </h3>
              <button
                onClick={() => setPartJsonModalIndex(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Thầy dán đoạn mã JSON chứa danh sách câu hỏi hoặc bài đọc/bài nghe của Part tại đây, hệ thống sẽ tự động điền trọn bộ vào Part #{partJsonModalIndex + 1}:
            </p>

            <textarea
              rows={10}
              value={partJsonInputText}
              onChange={(e) => setPartJsonInputText(e.target.value)}
              placeholder='Paste JSON code here...
Ví dụ:
[
  {
    "question": "1. Choose the correct option...",
    "options": [
      {"text": "Option A", "isCorrect": true},
      {"text": "Option B", "isCorrect": false}
    ],
    "explanation": "Dẫn chứng..."
  }
]'
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-2xl bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setPartJsonModalIndex(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => handleApplyPartJson(partJsonModalIndex)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center space-x-1.5"
              >
                <span>⚡ ÁP DỤNG MÃ JSON NÀY</span>
              </button>
            </div>
          </div>
        </div>
      )}

</div>
  );
}
