import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles, Wand2, Volume2, Link as LinkIcon, Video, Eye, Sun, Type, Database, Shuffle, Award, Save, Code, Download, Headphones, BookOpen, Search, XCircle, PlayCircle, MessageSquareText, Clock, Tag, FileCode, Layers, Camera, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import AiQuizGeneratorModal from './AiQuizGeneratorModal';
import CommunityExamBankModal from './CommunityExamBankModal';
import { exportQuizToWord } from '../../utils/exportQuizWord';

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
  const [aiExplaining, setAiExplaining] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // State quản lý danh sách các Part (Cho Cloze Test, Listening, Reading, Writing, Multiple Choice)
  const [sectionParts, setSectionParts] = useState([]);
  const [activePartTab, setActivePartTab] = useState(0);
  const [showAllParts, setShowAllParts] = useState(true);
  const [directJsonText, setDirectJsonText] = useState('');
  const [isJsonDirectMode, setIsJsonDirectMode] = useState(false);

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
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });

    setQuestions(data || []);
    setLoading(false);
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
    setShowAllParts(true);

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

    if (format === 'json_writing_part') {
      filename = 'mau_de_writing_section_parts.json';
      content = JSON.stringify(
        {
          part_title: "PART 1: Rewrite each sentence so that it has a similar meaning to the first one.",
          questions: [
            {
              question: "1. Rewrite: 'I have never seen such a beautiful ceramic vase before.'",
              options: [
                { text: "This is the most beautiful ceramic vase I have ever seen.", isCorrect: true },
                { text: "This ceramic vase is as beautiful as I seen.", isCorrect: false }
              ],
              explanation: "🔍 Phân tích cấu trúc so sánh nhất: This is the first time / This is the most..."
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
      setQuestionTitle('WRITING SECTION');
      setSectionParts([
        {
          part_type: 'multiple_choice',
          part_title: 'PART 1: Choose the sentence (A, B, C or D) that is closest in meaning to the given sentence.',
          questions: [
            {
              question: '1. It takes Phong two hours to make a pottery bowl.',
              options: [
                { text: 'Phong spends two hours making a pottery bowl.', isCorrect: true },
                { text: 'Phong spent two hours to make a pottery bowl.', isCorrect: false },
                { text: 'Phong take two hours making a pottery bowl.', isCorrect: false },
                { text: 'Phong spending two hours to make a pottery bowl.', isCorrect: false }
              ],
              explanation: '💡 Cấu trúc: It takes sb + time + to V = Sb spends + time + V-ing.'
            }
          ],
          explanation: '🔍 Phân tích Part 1: Kiểm tra cấu trúc viết lại câu trắc nghiệm.'
        },
        {
          part_type: 'short_essay',
          part_title: 'PART 2: Rewrite each sentence below so that it has a similar meaning to the first sentence.',
          questions: [
            {
              question: '2. She started learning to make conical hats 3 years ago. (has)\n➔ She __________________________________________________.',
              sample_answer: 'She has learned to make conical hats for 3 years.',
              explanation: '💡 Chuyển từ Quá khứ đơn sang Hiện tại hoàn thành với FOR + khoảng thời gian.'
            }
          ],
          explanation: '🔍 Phân tích Part 2: Tự luận ngắn viết lại câu.'
        },
        {
          part_type: 'full_essay',
          part_title: 'PART 3: Write a paragraph (100 - 120 words) about a community helper or your favourite traditional craft village.',
          passage: 'Instructions: You can type your paragraph directly into the text box below or take a photo of your handwritten paper and upload it.',
          questions: [
            {
              question: 'Write a paragraph (100 - 120 words) about a traditional craft village in your area.',
              sample_answer: 'Dàn ý gợi ý:\n1. Name of the craft village\n2. Where it is located\n3. What products they make\n4. Why people like visiting it...',
              explanation: '💡 Tiêu chuẩn chấm bài luận: Từ vựng (2đ), Ngữ pháp (2đ), Bố cục (1đ).'
            }
          ],
          explanation: '🔍 Phân tích Part 3: Bài viết tự luận dài kèm dán văn bản hoặc tải ảnh bài làm.'
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
          questions: [
            {
              question: '2. Young people in the community often ask Phong how to keep up with modern trends.',
              correctAnswer: 'T',
              explanation: '💡 Evidence: Young people often ask how to keep up with modern trends.'
            }
          ],
          explanation: '🔍 Phân tích Part 2 True/False.'
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

  // NẠP JSON RIÊNG CHO PART ĐANG CHỌN
  const handleApplyPartJson = (partIdx) => {
    if (!directJsonText.trim()) {
      alert('Vui lòng dán chuỗi JSON của Part này vào ô!');
      return;
    }
    try {
      const parsed = JSON.parse(directJsonText);
      const newParts = [...sectionParts];

      newParts[partIdx] = {
        ...newParts[partIdx],
        part_type: parsed.part_type || newParts[partIdx].part_type || 'multiple_choice',
        part_title: parsed.part_title || parsed.title || parsed.task_title || newParts[partIdx].part_title,
        task_sub: parsed.task_sub || newParts[partIdx].task_sub,
        badge_label: parsed.badge_label || newParts[partIdx].badge_label,
        passage_title: parsed.passage_title || newParts[partIdx].passage_title,
        audioUrl: parsed.audio_url || newParts[partIdx].audioUrl,
        passage: parsed.passage || parsed.passage_content || newParts[partIdx].passage,
        questions: parsed.questions || newParts[partIdx].questions,
        explanation: parsed.explanation || newParts[partIdx].explanation
      };

      setSectionParts(newParts);
      alert(`🎉 ĐÃ NẠP JSON THÀNH CÔNG CHO PART #${partIdx + 1}!`);
      setIsJsonDirectMode(false);
      setDirectJsonText('');
    } catch (err) {
      alert('Lỗi định dạng JSON không hợp lệ: ' + err.message);
    }
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
        categories: selectedCategories,
      };

      if (['listening_section', 'reading_section', 'writing_section', 'multiple_choice'].includes(normType)) {
        customContent.parts = sectionParts;
        customContent.audioUrl = listeningAudioUrl;
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
                onClick={() => exportQuizToWord(questions, questionTitle || 'BÀI KÍỂM TRA TIẾNG ANH')}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>🖨️ In Đề Ra Giấy (Word)</span>
              </button>

              <button
                onClick={() => setIsCommunityBankOpen(true)}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>🌐 Kho Đề Thi Cộng Đồng</span>
              </button>

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
            <LoadingSpinner text="Đang tải câu hỏi..." />
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">{idx + 1}. {q.content?.title || q.content?.question}</span>
                  </div>
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl border border-emerald-600 text-xs font-bold shadow-xs transition"
                  >
                    📝 SỬA BÀI THI NÀY
                  </button>
                </div>
              ))}
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

      {/* FORM BIÊN TẬP CÂU HỎI - HỖ TRỢ TẤT CẢ CÁC PART VÀ DẠNG WRITING SECTION */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
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
                      <span className="text-xs font-extrabold text-blue-950 uppercase flex items-center space-x-1">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>DANH SÁCH PART ({sectionParts.length} Part):</span>
                      </span>

                      {sectionParts.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setActivePartTab(pIdx);
                            setShowAllParts(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 ${
                            !showAllParts && activePartTab === pIdx
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <span>PART #{pIdx + 1}</span>
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setShowAllParts(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center space-x-1 ${
                          showAllParts ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-amber-800 border border-amber-300'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>👁️ HIỆN TẤT CẢ CÁC PART CÙNG LÚC</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNewPart}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1 flex-shrink-0"
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
                            <span>PART #{pIdx + 1}: {pItem.part_type === 'short_essay' ? 'Tự Luận Ngắn' : pItem.part_type === 'full_essay' ? 'Bài Luận Dài / Tải Ảnh' : 'Trắc Nghiệm A,B,C,D'}</span>
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadSampleFile(isWriting ? 'json_writing_part' : isCloze ? 'json_cloze_part' : 'json')}
                              className="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-lg text-[11px] font-bold hover:bg-blue-100"
                            >
                              📥 Tải JSON Mẫu
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePart(pIdx)}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-bold flex items-center space-x-1"
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
                                newParts[pIdx].part_type = e.target.value;
                                setSectionParts(newParts);
                              }}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                            >
                              <option value="multiple_choice">Trắc Nghiệm A, B, C, D</option>
                              <option value="true_false">True / False (Đúng/Sai)</option>
                              <option value="short_essay">Part 2: Tự Luận Ngắn (Viết lại câu)</option>
                              <option value="full_essay">Part 3: Bài Luận Dài (Dán Văn Bản / Tải Ảnh Bài Làm)</option>
                              <option value="cloze_test">Cloze Test Đục Lỗ</option>
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
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                            />
                          </div>
                        </div>

                        {/* DANH SÁCH CÂU HỎI TRONG PART */}
                        <div className="space-y-3 border-t border-slate-100 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-blue-900 uppercase">
                              CÂU HỎI TRONG PART #{pIdx + 1} ({ (pItem.questions || []).length } câu):
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newParts = [...sectionParts];
                                const qList = newParts[pIdx].questions || [];
                                qList.push({
                                  question: `${qList.length + 1}. Question text...`,
                                  options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }, { text: 'Option C', isCorrect: false }, { text: 'Option D', isCorrect: false }],
                                  explanation: ''
                                });
                                newParts[pIdx].questions = qList;
                                setSectionParts(newParts);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Thêm Câu Hỏi Cho Part #{pIdx + 1}</span>
                            </button>
                          </div>

                          {(pItem.questions || []).map((cQ, cIdx) => (
                            <div key={cIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-800">Câu hỏi #{cIdx + 1}</span>
                                {(pItem.questions || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newParts = [...sectionParts];
                                      newParts[pIdx].questions = newParts[pIdx].questions.filter((_, i) => i !== cIdx);
                                      setSectionParts(newParts);
                                    }}
                                    className="text-rose-600 text-xs font-bold hover:underline"
                                  >
                                    ✕ Xóa câu này
                                  </button>
                                )}
                              </div>

                              <input
                                type="text"
                                value={cQ.question || ''}
                                onChange={(e) => {
                                  const newParts = [...sectionParts];
                                  newParts[pIdx].questions[cIdx].question = e.target.value;
                                  setSectionParts(newParts);
                                }}
                                placeholder="Nhập câu hỏi hoặc yêu cầu bài viết..."
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                              />

                              {pItem.part_type === 'short_essay' || pItem.part_type === 'full_essay' ? (
                                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                                  <span className="text-[11px] font-bold text-purple-900 block">💡 Gợi ý câu trả lời / Đáp án mẫu (Sample Answer):</span>
                                  <textarea
                                    rows={2}
                                    value={cQ.sample_answer || ''}
                                    onChange={(e) => {
                                      const newParts = [...sectionParts];
                                      newParts[pIdx].questions[cIdx].sample_answer = e.target.value;
                                      setSectionParts(newParts);
                                    }}
                                    className="w-full p-2 border border-purple-300 rounded text-xs bg-white"
                                  />
                                </div>
                              ) : (
                                /* 4 LỰA CHỌN A, B, C, D CHO TRẮC NGHIỆM */
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {(cQ.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center space-x-1.5">
                                      <input
                                        type="radio"
                                        name={`mc_opt_${pIdx}_${cIdx}`}
                                        checked={opt.isCorrect}
                                        onChange={() => {
                                          const newParts = [...sectionParts];
                                          newParts[pIdx].questions[cIdx].options.forEach((o, i) => {
                                            o.isCorrect = i === oIdx;
                                          });
                                          setSectionParts(newParts);
                                        }}
                                      />
                                      <input
                                        type="text"
                                        value={opt.text || ''}
                                        onChange={(e) => {
                                          const newParts = [...sectionParts];
                                          newParts[pIdx].questions[cIdx].options[oIdx].text = e.target.value;
                                          setSectionParts(newParts);
                                        }}
                                        placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}...`}
                                        className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
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
    </div>
  );
}
