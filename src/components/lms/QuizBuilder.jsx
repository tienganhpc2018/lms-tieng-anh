import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles, Wand2, Volume2, Link as LinkIcon, Video, Eye, Sun, Type, Database, Shuffle, Award, Save, Code, Download, Headphones, BookOpen, Search, XCircle, PlayCircle, MessageSquareText, Clock, Tag, FileCode, Layers } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizBuilder({ activityId, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'questions' (Biên tập & Preview) | 'manual_editor' (Soạn thủ công) | 'import' (Import file/JSON)
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

  // Popup Hướng Dẫn ❓ và Mẫu Nhập JSON Hàng Loạt
  const [helpFormatModal, setHelpFormatModal] = useState(null);

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
  const [aiExplaining, setAiExplaining] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // State quản lý danh sách các Part (cả cho Cloze Test, Listening và Reading)
  const [sectionParts, setSectionParts] = useState([]);
  const [activePartTab, setActivePartTab] = useState(0); // Index Part đang xem
  const [showAllParts, setShowAllParts] = useState(true); // Mặc định hiển thị TẤT CẢ các Part cùng lúc cho Thầy xem & sửa!
  const [directJsonText, setDirectJsonText] = useState('');
  const [isJsonDirectMode, setIsJsonDirectMode] = useState(false);

  // State riêng cho Listening, Reading
  const [sectionPassage, setSectionPassage] = useState('');
  const [listeningAudioUrl, setListeningAudioUrl] = useState('');
  const [uploadedAudioFileName, setUploadedAudioFileName] = useState('');
  const [sectionChildQuestions, setSectionChildQuestions] = useState([]);

  // State Trắc nghiệm Multiple Choice
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

  // AI TỰ ĐỘNG TẠO GIẢI THÍCH CHUẨN 4 KHỐI DÀNH CHO HỌC SINH YẾU
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
    setShowAllParts(true); // Hiển thị TẤT CẢ các Part cùng lúc cho Thầy sửa!

    // ĐỒNG BỘ CÁC PART TỪ DB CHO CẢ 3 DẠNG BÀI LỚN
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
    } else if (normType === 'listening_section' || normType === 'reading_section') {
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

    if (format === 'json_cloze_part') {
      filename = 'mau_de_cloze_test_part.json';
      content = JSON.stringify(
        {
          part_title: "PART 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          task_sub: "Read the following blog post about a local community and choose the best option (A, B, C, or D) for each blank.",
          badge_label: "BLOG",
          passage_title: "Our Beautiful Suburb Blog",
          passage: "Hi everyone! Welcome back to my blog. Today, I want to talk about my local community. Two years ago, my family decided to move to this (16) _______ of the city...",
          questions: [
            {
              question_number: "16",
              options: [
                { id: "A", text: "A. suburb" },
                { id: "B", text: "B. suitcase" },
                { id: "C", text: "C. seagull" },
                { id: "D", text: "D. fragrance" }
              ],
              correct_option: "A",
              explanation: "🔍 Phân tích: Chọn từ suburb phù hợp ngữ cảnh sống ở ngoại ô thành phố."
            }
          ],
          explanation: "🔍 Phân tích tổng quan bài Cloze Test Part 1."
        },
        null,
        2
      );
    } else if (format === 'json') {
      filename = 'mau_de_thi_listening_reading_parts.json';
      content = JSON.stringify(
        {
          part_type: "multiple_choice",
          part_title: "PART 1: Listen to Phong talking about Bat Trang pottery village. Choose the correct answer A, B, C, or D.",
          audio_url: "https://example.com/audio_part1.mp3",
          questions: [
            {
              question: "1. What generation of artisan is Phong in Bat Trang pottery village?",
              options: [
                { text: "First", isCorrect: false },
                { text: "Second", isCorrect: false },
                { text: "Third", isCorrect: true },
                { text: "Fourth", isCorrect: false }
              ],
              explanation: "🔍 Phân tích: Phong là nghệ nhân thế hệ thứ 3."
            }
          ],
          explanation: "🔍 Phân tích toàn bài Part 1."
        },
        null,
        2
      );
    } else {
      filename = 'mau_de_thi_txt.txt';
      content = `What is the correct answer to this question?
A. Is it this one?
B. Maybe this answer?
C. Possibly this one?
D. Must be this one!
ANSWER: D`;
    }

    const blob = new Blob([content], { type: format.startsWith('json') ? 'application/json' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // TẠO CÂU HỎI MỚI
  const handleConfirmAddType = () => {
    setIsTypeModalOpen(false);
    setEditingQuestion({ id: 'new', type: selectedType });
    setQuestionTitle('');
    setIsJsonDirectMode(false);
    setShowAllParts(true); // Hiển thị TẤT CẢ các Part cùng lúc!
    setActivePartTab(0);

    const normType = selectedType?.toLowerCase();
    if (normType === 'listening_section') {
      setQuestionTitle('LISTENING SECTION');
      setSectionParts([
        {
          part_type: 'multiple_choice',
          part_title: 'PART 1: Listen to Phong talking about Bat Trang pottery village. Choose the correct answer A, B, C, or D.',
          audioUrl: '',
          audioFileName: '',
          questions: [
            {
              question: '1. What generation of artisan is Phong in Bat Trang pottery village?',
              options: [{ text: 'First', isCorrect: false }, { text: 'Second', isCorrect: false }, { text: 'Third', isCorrect: true }, { text: 'Fourth', isCorrect: false }],
              explanation: '💡 Evidence: Phong is the third generation of artisan in his family.'
            }
          ],
          explanation: '🔍 Phân tích Part 1: Đọc kỹ bài nghe về làng gốm Bát Tràng.'
        },
        {
          part_type: 'true_false',
          part_title: 'PART 2: Listen again and decide whether the statements are True (T) or False (F).',
          audioUrl: '',
          audioFileName: '',
          questions: [
            {
              question: '2. Young people in the community often ask Phong how to keep up with modern trends.',
              correctAnswer: 'T',
              explanation: '💡 Evidence: Young people often ask how to keep up with modern trends.'
            }
          ],
          explanation: '🔍 Phân tích Part 2 (True/False): Nghe và xác định phát biểu Đúng (T) hay Sai (F).'
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
          explanation: '🔍 Phân tích Part 1: Đọc kĩ đoạn văn làng nón lá Chuông.'
        },
        {
          part_type: 'true_false',
          part_title: 'PART 2: Read the second text and decide whether the statements are True (T) or False (F).',
          passage: 'Visitors come to Chuong village to learn how to make conical hats themselves. Fewer young people want to learn the craft because they do not know how to make a living from it...',
          questions: [
            {
              question: '2. Fewer young people want to learn the craft because they do not know how to make a living from it.',
              correctAnswer: 'T',
              explanation: '💡 Evidence: Fewer young people want to learn the craft because they do not know how to make a living from it.'
            }
          ],
          explanation: '🔍 Phân tích Part 2 (True/False): Đọc đoạn văn và chọn Đúng (T) hoặc Sai (F).'
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
          explanation: "🔍 Phân tích Part 1: Chọn từ vựng đục lỗ phù hợp ngữ cảnh blog."
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
          explanation: "🔍 Phân tích Part 2: Điền từ thích hợp vào bức thư mời."
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

  // NẠP JSON RIÊNG CHO PART DANG CHỌN
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

    if (normType === 'cloze_test') {
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

  // XÓA PART DỄ DÀNG
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
        title: questionTitle || (normType === 'reading_tf' ? '3. READING (True/False)' : normType === 'cloze_test' ? 'KNOWLEDGE OF LANGUAGE' : normType === 'reading_section' ? 'READING SECTION' : normType === 'listening_section' ? 'LISTENING SECTION' : 'MULTIPLE CHOICE'),
        question: questionText.trim() || questionTitle || 'Instruction Question',
        explanation: explanation.trim(),
        timeLimit: Number(timeLimitMinutes) || 0,
        categories: selectedCategories,
      };

      if (normType === 'listening_section' || normType === 'reading_section') {
        customContent.parts = sectionParts;
        customContent.audioUrl = listeningAudioUrl;
        customContent.audioFileName = uploadedAudioFileName;
        customContent.passage = sectionPassage;
        customContent.childQuestions = sectionChildQuestions;
      } else if (normType === 'reading_tf') {
        customContent.passage = sectionPassage;
        customContent.childQuestions = sectionChildQuestions;
      } else if (normType === 'cloze_test') {
        // Đồng bộ lưu tasks từ sectionParts cho Cloze test
        customContent.tasks = sectionParts.map(p => ({
          task_title: p.part_title,
          task_sub: p.task_sub,
          badge_label: p.badge_label,
          passage_title: p.passage_title,
          passage_content: p.passage,
          questions: p.questions,
          explanation: p.explanation
        }));
      } else if (normType === 'multiple_choice') {
        customContent.options = mcOptions.filter((o) => o.text.trim() !== '');
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

  const questionTypesList = [
    { type: 'listening_section', label: '1. LISTENING SECTION (Bài Nghe Gộp Multi Parts Trắc Nghiệm & True/False)', desc: 'Soạn và chỉnh sửa trọn bộ tất cả các Part (Part 1, Part 2, Part 3...) của bài Nghe.' },
    { type: 'reading_section', label: '2. READING SECTION (Bài Đọc Hiểu Gộp Multi Parts Trắc Nghiệm & True/False)', desc: 'Soạn và chỉnh sửa trọn bộ tất cả các Part (Part 1, Part 2, Part 3...) của bài Đọc.' },
    { type: 'cloze_test', label: '4. KNOWLEDGE OF LANGUAGE (Cloze Test Gộp Multi Parts Đục Lỗ)', desc: 'Soạn và chỉnh sửa trọn bộ tất cả các Part (Part 1, Part 2...) của bài Đọc Đục Lỗ Cloze test.' },
    { type: 'reading_tf', label: '3. READING (True/False) - Bài Đọc Chọn Đúng (T) / Sai (F)', desc: 'Thiết kế bài đọc chứa đoạn văn bản đọc hiểu và 5 câu phát biểu bên dưới với nút vuông [T] và [F].' },
    { type: 'multiple_choice', label: 'Multiple choice (Trắc nghiệm A, B, C, D)', desc: 'Cho phép chọn 1 hoặc nhiều đáp án đúng (Single/Multiple Choice).' },
  ];

  return (
    <div className="space-y-6">
      {/* 2 TAB CHÍNH QUIZ BUILDER */}
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

            <button
              onClick={() => {
                setSelectedType('multiple_choice');
                setIsTypeModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
            >
              <span>+ Add (Thêm Câu Hỏi Mới)</span>
            </button>
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

      {/* BẢNG MODAL CHỌN DẠNG CÂU HỎI */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Choose a question type to add</h3>
              <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto">
              {questionTypesList.map((t) => (
                <label
                  key={t.type}
                  onClick={() => setSelectedType(t.type)}
                  className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
                    selectedType === t.type
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="q_type"
                    checked={selectedType === t.type}
                    onChange={() => setSelectedType(t.type)}
                  />
                  <span className="text-xs font-semibold">{t.label}</span>
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

      {/* FORM BIÊN TẬP CÂU HỎI - HIỂN THỊ TẤT CẢ CÁC PART TRONG 3 PHẦN DỄ THÊM/BỚT */}
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
              {/* CÀI ĐẶT THỜI GIAN & ĐIỂM SỐ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <div>
                  <label className="block text-xs font-extrabold text-emerald-950 uppercase mb-1">
                    ⏱️ CÀI ĐẶT THỜI GIAN LÀM BÀI
                  </label>
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value={0}>⏱️ Không tính giờ</option>
                    <option value={5}>⚡ 5 phút (Bài kiểm tra nhanh)</option>
                    <option value={15}>📝 15 phút</option>
                    <option value={45}>🏫 45 phút</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    🎯 ĐIỂM SỐ CÂU HỎI (MARKS)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
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
                  placeholder="Ví dụ: KNOWLEDGE OF LANGUAGE / LISTENING SECTION / READING SECTION"
                  className="w-full p-2.5 border border-purple-300 rounded-xl text-xs font-extrabold text-purple-950 bg-white"
                />
              </div>

              {/* KHUNG HIỂN THỊ TẤT CẢ CÁC PART DÀNH CHO CẢ 3 PHẦN LỚN (CLOZE TEST, LISTENING, READING) */}
              {['cloze_test', 'listening_section', 'reading_section'].includes(selectedType?.toLowerCase()) && (
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

                  {/* VÒNG LẶP HIỂN THỊ TẤT CẢ CÁC PART ĐỂ THẦY THÊM/BỚT CÂU HỎI NỔI BẬT */}
                  {sectionParts.map((pItem, pIdx) => {
                    // Nếu đang chế độ xem từng Part riêng thì chỉ hiện Part active
                    if (!showAllParts && activePartTab !== pIdx) return null;

                    const isCloze = selectedType?.toLowerCase() === 'cloze_test';
                    const isListening = selectedType?.toLowerCase() === 'listening_section';
                    const isReading = selectedType?.toLowerCase() === 'reading_section';

                    return (
                      <div key={pIdx} className="p-5 bg-white border border-blue-300 rounded-3xl space-y-4 shadow-sm relative">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="font-extrabold text-sm text-blue-950 uppercase flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                              {pIdx + 1}
                            </span>
                            <span>PART #{pIdx + 1}: {pItem.badge_label || pItem.part_type || 'Section'}</span>
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadSampleFile(isCloze ? 'json_cloze_part' : 'json')}
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

                        {/* NHẬP TIÊU ĐỀ & MÔ TẢ PART */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                              Tiêu đề Part #{pIdx + 1}:
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

                          {isCloze && (
                            <div>
                              <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                                Huy Hiệu Nổi (POSTER, BLOG, EMAIL, ARTICLE...):
                              </label>
                              <input
                                type="text"
                                value={pItem.badge_label || ''}
                                onChange={(e) => {
                                  const newParts = [...sectionParts];
                                  newParts[pIdx].badge_label = e.target.value;
                                  setSectionParts(newParts);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-bold uppercase text-amber-600"
                              />
                            </div>
                          )}

                          {isListening && (
                            <div>
                              <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                                🎵 File Audio MP3 cho Part #{pIdx + 1}:
                              </label>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleAudioFileUpload(e, pIdx)}
                                className="w-full text-xs"
                              />
                            </div>
                          )}
                        </div>

                        {/* ĐOẠN VĂN PASSAGE CHO READING VÀ CLOZE TEST */}
                        {(isReading || isCloze) && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                              Đoạn văn bài đọc (Passage Content):
                            </label>
                            <textarea
                              rows={4}
                              value={pItem.passage || ''}
                              onChange={(e) => {
                                const newParts = [...sectionParts];
                                newParts[pIdx].passage = e.target.value;
                                setSectionParts(newParts);
                              }}
                              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-serif"
                            />
                          </div>
                        )}

                        {/* DANH SÁCH CÂU HỎI TRONG PART NÀY - DỄ THÊM BỚT */}
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
                                if (isCloze) {
                                  qList.push({
                                    question_number: `${16 + qList.length}`,
                                    options: [{ id: 'A', text: 'A. option1' }, { id: 'B', text: 'B. option2' }, { id: 'C', text: 'C. option3' }, { id: 'D', text: 'D. option4' }],
                                    correct_option: 'A'
                                  });
                                } else if (pItem.part_type === 'true_false') {
                                  qList.push({
                                    question: 'Statement text...',
                                    correctAnswer: 'T',
                                    explanation: ''
                                  });
                                } else {
                                  qList.push({
                                    question: `${qList.length + 1}. Question text...`,
                                    options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }, { text: 'Option C', isCorrect: false }, { text: 'Option D', isCorrect: false }],
                                    explanation: ''
                                  });
                                }
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
                            <div key={cIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
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

                              {isCloze ? (
                                /* GIAO DIỆN SỬA CÂU CLOZE TEST 4 ĐÁP ÁN 1 HÀNG */
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-slate-700">Số thứ tự:</span>
                                    <input
                                      type="text"
                                      value={cQ.question_number || (16 + cIdx)}
                                      onChange={(e) => {
                                        const newParts = [...sectionParts];
                                        newParts[pIdx].questions[cIdx].question_number = e.target.value;
                                        setSectionParts(newParts);
                                      }}
                                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    {(cQ.options || []).map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-center space-x-1">
                                        <input
                                          type="radio"
                                          name={`cloze_opt_${pIdx}_${cIdx}`}
                                          checked={cQ.correct_option === (opt.id || String.fromCharCode(65 + oIdx))}
                                          onChange={() => {
                                            const newParts = [...sectionParts];
                                            newParts[pIdx].questions[cIdx].correct_option = opt.id || String.fromCharCode(65 + oIdx);
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
                                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : pItem.part_type === 'true_false' ? (
                                /* GIAO DIỆN SỬA CÂU TRUE / FALSE */
                                <div className="flex justify-between items-center gap-2">
                                  <input
                                    type="text"
                                    value={cQ.question || ''}
                                    onChange={(e) => {
                                      const newParts = [...sectionParts];
                                      newParts[pIdx].questions[cIdx].question = e.target.value;
                                      setSectionParts(newParts);
                                    }}
                                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs"
                                  />
                                  <select
                                    value={cQ.correctAnswer || 'T'}
                                    onChange={(e) => {
                                      const newParts = [...sectionParts];
                                      newParts[pIdx].questions[cIdx].correctAnswer = e.target.value;
                                      setSectionParts(newParts);
                                    }}
                                    className="px-2 py-1 border border-slate-300 rounded text-xs font-bold"
                                  >
                                    <option value="T">True (T)</option>
                                    <option value="F">False (F)</option>
                                  </select>
                                </div>
                              ) : (
                                /* GIAO DIỆN SỬA CÂU TRẮC NGHIỆM THƯỜNG */
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={cQ.question || ''}
                                    onChange={(e) => {
                                      const newParts = [...sectionParts];
                                      newParts[pIdx].questions[cIdx].question = e.target.value;
                                      setSectionParts(newParts);
                                    }}
                                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-bold"
                                  />
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* GIẢI THÍCH CHUẨN 4 KHỐI CHO PART NÀY */}
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
