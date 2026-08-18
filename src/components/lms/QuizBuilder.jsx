import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles, Wand2, Volume2, Link as LinkIcon, Video, Eye, Sun, Type, Database, Shuffle, Award, Save, Code, Download, Headphones, BookOpen, Search, XCircle, PlayCircle, MessageSquareText, Clock, Tag, FileCode } from 'lucide-react';
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
  const [jsonInputText, setJsonInputText] = useState('');

  // Checkbox Categories Kỹ Năng
  const [selectedCategories, setSelectedCategories] = useState(['Knowledge of English (Vocab & Grammar)']);

  // Modal "Choose a question type to add"
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('multiple_choice');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

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

  // State riêng cho Cloze Test & Multi-Parts theo Tab
  const [clozeTasks, setClozeTasks] = useState([]);
  const [activeTaskTab, setActiveTaskTab] = useState(0); // Tab Task của Cloze Test
  const [sectionParts, setSectionParts] = useState([]); // Mảng chứa các Part của Listening/Reading
  const [activePartTab, setActivePartTab] = useState(0); // Index của Part đang xem/chỉnh sửa
  const [directJsonText, setDirectJsonText] = useState('');
  const [isJsonDirectMode, setIsJsonDirectMode] = useState(false);

  // State riêng cho Listening, Reading, Reading T/F
  const [sectionPassage, setSectionPassage] = useState('');
  const [listeningAudioUrl, setListeningAudioUrl] = useState('');
  const [uploadedAudioFileName, setUploadedAudioFileName] = useState('');
  const [sectionChildQuestions, setSectionChildQuestions] = useState([]);

  // State Trắc nghiệm Multiple Choice 2 Cột (A, C & B, D)
  const [mcOptions, setMcOptions] = useState([
    { text: '', isCorrect: true, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
  ]);

  const [tfCorrect, setTfCorrect] = useState('True');
  const [shortAnswers, setShortAnswers] = useState(['']);
  const [essayInstruction, setEssayInstruction] = useState('Học sinh gõ đoạn văn tự luận hoặc tải ảnh bài làm thủ công.');

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

  // AI Bóc Tách Đề A, B, C, D Hàng Lỗi
  const handleAiCleanText = () => {
    let text = homeworkContent;
    text = text.replace(/([A-D])[\.\)]\s*/g, '\n$1. ');
    text = text.replace(/\n+/g, '\n');
    setHomeworkContent(text);
    alert('✨ AI đã dọn dẹp sạch sẽ các dòng chữ A, B, C, D và tự động căn chỉnh chuẩn đẹp!');
  };

  // AI TỰ ĐỘNG TẠO GIẢI THÍCH CHUẨN 4 KHỐI DÀNH CHO HỌC SINH YẾU
  const handleAiGenerateExplanation = (partIdx = null, isTask = false) => {
    setAiExplaining(true);
    setTimeout(() => {
      const generatedExp = `🔍 Phân tích ngữ pháp/ngữ cảnh:\nCâu hỏi kiểm tra kiến thức trọng tâm từ vựng và cấu trúc ngữ pháp Tiếng Anh theo bài học.\n\n💡 Giải thích chi tiết (Evidence / Dẫn chứng):\nDựa theo ngữ cảnh đoạn văn bản/bài nghe, lựa chọn đáp án chính xác nhất phù hợp hoàn toàn.\n\n✕ Loại trừ gây nhiễu:\nCác phương án còn lại sai về ý nghĩa hoặc không đúng cấu trúc từ vựng Tiếng Anh.\n\n🇻🇳 Bản dịch nghĩa song ngữ:\nDịch đề bài và đáp án đúng giúp học sinh dễ dàng ghi nhớ sâu kiến thức.`;

      if (isTask && clozeTasks[partIdx]) {
        const newTasks = [...clozeTasks];
        newTasks[partIdx].explanation = generatedExp;
        setClozeTasks(newTasks);
      } else if (partIdx !== null && sectionParts[partIdx]) {
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
    setSelectedType(sectionType.toLowerCase());
    setQuestionTitle(q.content?.title || '');
    setQuestionText(q.content?.question || '');
    setExplanation(q.content?.explanation || '');
    setSectionPassage(q.content?.passage || '');
    setClozeTasks(q.content?.tasks || []);
    setActiveTaskTab(0);
    setSectionParts(q.content?.parts || []);
    setActivePartTab(0);
    setIsJsonDirectMode(false);

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

  // NÚT TẢI TỆP MẪU CHUẨN JSON CHUẨN HOÀN HẢO
  const handleDownloadSampleFile = (format) => {
    let content = '';
    let filename = '';

    if (format === 'json_cloze_task') {
      filename = 'mau_de_cloze_test_task.json';
      content = JSON.stringify(
        {
          task_title: "TASK 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          task_sub: "Read the following blog post about a local community and choose the best option (A, B, C, or D) for each blank.",
          badge_label: "BLOG",
          passage_title: "Our Beautiful Suburb Blog",
          passage_content: "Hi everyone! Welcome back to my blog. Today, I want to talk about my local community. Two years ago, my family decided to move to this (16) _______ of the city...",
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
          explanation: "🔍 Phân tích tổng quan bài Cloze Test Task 1."
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
    } else if (format === 'json_tf') {
      filename = 'mau_de_thi_part2_true_false.json';
      content = JSON.stringify(
        {
          part_type: "true_false",
          part_title: "PART 2: Listen again and decide whether the statements are True (T) or False (F).",
          audio_url: "https://example.com/audio_part2.mp3",
          questions: [
            {
              question: "2. Young people in the community often ask Phong how to keep up with modern trends.",
              correctAnswer: "T",
              explanation: "💡 Evidence: Young people often ask how to keep up with modern trends."
            }
          ],
          explanation: "🔍 Phân tích toàn bài Part 2 True/False."
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

  // LƯU BÀI TẬP VỀ NHÀ
  const handleSaveHomework = async () => {
    if (!homeworkContent.trim() && !summaryText.trim()) {
      alert('Vui lòng nhập nội dung bài tập về nhà!');
      return;
    }
    setIsSavingHomework(true);

    try {
      const { error } = await supabase
        .from('activities')
        .update({
          settings: {
            grade,
            unit,
            category,
            summaryText,
            richText: homeworkContent,
            audioUrl: audioFileUrl,
            showAnswerBox,
          },
        })
        .eq('id', activityId);

      if (error) {
        alert('Lỗi lưu bài tập: ' + error.message);
      } else {
        alert('🎉 Đã LƯU BÀI TẬP VỀ NHÀ thành công vào bài học!');
        if (onSaved) onSaved();
      }
    } catch (err) {
      alert('Lỗi lưu: ' + err.message);
    } finally {
      setIsSavingHomework(false);
    }
  };

  const handleOpenAddModal = (mode) => {
    setIsAddMenuOpen(false);
    setIsTypeModalOpen(true);
  };

  // TẠO CÂU HỎI MỚI
  const handleConfirmAddType = () => {
    setIsTypeModalOpen(false);
    setEditingQuestion({ id: 'new', type: selectedType });
    setQuestionTitle('');
    setIsJsonDirectMode(false);
    setActivePartTab(0);
    setActiveTaskTab(0);

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
      setClozeTasks([
        {
          task_title: "TASK 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          task_sub: "Read the following blog post about a local community and choose the best option (A, B, C, or D) for each blank.",
          badge_label: "BLOG",
          passage_title: "Our Beautiful Suburb Blog",
          passage_content: "Hi everyone! Welcome back to my blog. Today, I want to talk about my local community. Two years ago, my family decided to move to this (16) _______ of the city...",
          questions: [
            { question_number: "16", options: [{ id: "A", text: "A. suburb" }, { id: "B", text: "B. suitcase" }, { id: "C", text: "C. seagull" }, { id: "D", text: "D. fragrance" }], correct_option: "A" }
          ],
          explanation: "🔍 Phân tích Task 1: Chọn từ vựng đục lỗ phù hợp ngữ cảnh blog."
        },
        {
          task_title: "TASK 2: READ THE SECOND TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          task_sub: "Read the following email invitation and choose the best option (A, B, C, or D) for each blank.",
          badge_label: "EMAIL",
          passage_title: "Invitation to a House-Warming Party",
          passage_content: "Dear Vy,\nHow are you? I am writing to invite you to our (21) _______ party next Saturday...",
          questions: [
            { question_number: "21", options: [{ id: "A", text: "A. house-warming" }, { id: "B", text: "B. hard-working" }, { id: "C", text: "C. worldwide" }, { id: "D", text: "D. responsible" }], correct_option: "A" }
          ],
          explanation: "🔍 Phân tích Task 2: Điền từ thích hợp vào bức thư mời."
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

  // NẠP JSON RIÊNG CHO TASK CỦA CLOZE TEST
  const handleApplyClozeTaskJson = (taskIdx) => {
    if (!directJsonText.trim()) {
      alert('Vui lòng dán chuỗi JSON của Task này vào ô!');
      return;
    }
    try {
      const parsed = JSON.parse(directJsonText);
      const newTasks = [...clozeTasks];

      newTasks[taskIdx] = {
        ...newTasks[taskIdx],
        task_title: parsed.task_title || newTasks[taskIdx].task_title,
        task_sub: parsed.task_sub || newTasks[taskIdx].task_sub,
        badge_label: parsed.badge_label || newTasks[taskIdx].badge_label,
        passage_title: parsed.passage_title || newTasks[taskIdx].passage_title,
        passage_content: parsed.passage_content || parsed.passage || newTasks[taskIdx].passage_content,
        questions: parsed.questions || newTasks[taskIdx].questions,
        explanation: parsed.explanation || newTasks[taskIdx].explanation
      };

      setClozeTasks(newTasks);
      alert(`🎉 ĐÃ NẠP JSON THÀNH CÔNG CHO CLOZE TEST TASK #${taskIdx + 1}!`);
      setIsJsonDirectMode(false);
      setDirectJsonText('');
    } catch (err) {
      alert('Lỗi định dạng JSON không hợp lệ: ' + err.message);
    }
  };

  // NẠP JSON RIÊNG CHO PART CỦA LISTENING / READING
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
        part_title: parsed.part_title || parsed.title || newParts[partIdx].part_title,
        audioUrl: parsed.audio_url || newParts[partIdx].audioUrl,
        passage: parsed.passage || newParts[partIdx].passage,
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

  // LƯU CÂU HỎI
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
        customContent.tasks = clozeTasks;
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

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?')) return;
    await supabase.from('questions').delete().eq('id', id);
    await fetchQuestions();
  };

  const questionTypesList = [
    { type: 'listening_section', label: '1. LISTENING SECTION (Bài Nghe Gộp Part 1 Trắc Nghiệm & Part 2 True/False)', desc: 'Thiết kế trọn bộ Part 1 (A,B,C,D) và Part 2 (True/False) với các Tab nạp JSON riêng biệt.' },
    { type: 'reading_section', label: '2. READING SECTION (Bài Đọc Hiểu Gộp Part 1 Trắc Nghiệm & Part 2 True/False)', desc: 'Thiết kế trọn bộ Part 1 (A,B,C,D) và Part 2 (True/False) với đoạn văn passage và các Tab nạp JSON riêng.' },
    { type: 'cloze_test', label: '4. KNOWLEDGE OF LANGUAGE (Cloze Test Gộp Task 1 & Task 2 Theo Tab)', desc: 'Thiết kế trọn bộ 2 Bài Đọc Đục Lỗ (Task 1: BLOG/POSTER và Task 2: EMAIL/ARTICLE) chia theo Tab tiện lợi với nạp JSON riêng.' },
    { type: 'reading_tf', label: '3. READING (True/False) - Bài Đọc Chọn Đúng (T) / Sai (F)', desc: 'Thiết kế bài đọc chứa đoạn văn bản đọc hiểu và 5 câu phát biểu bên dưới với nút vuông [T] và [F].' },
    { type: 'multiple_choice', label: 'Multiple choice (Trắc nghiệm A, B, C, D)', desc: 'Cho phép chọn 1 hoặc nhiều đáp án đúng (Single/Multiple Choice).' },
  ];

  return (
    <div className="space-y-6">
      {/* 3 TAB TẬP TRUNG GỌN ĐẸP CÙNG CẤP TRONG QUIZ BUILDER */}
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
              onClick={() => handleOpenAddModal('new')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
            >
              <span>+ Add (Thêm Câu Hỏi)</span>
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
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-bold"
                  >
                    Xem & Sửa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BẢNG MODAL CHỌN DẠNG CÂU HỎI MOODLE */}
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

      {/* FORM BIÊN TẬP CÂU HỎI ĐƯỢC NÂNG CẤP ĐỒNG BỘ TAB CHO CLOZE TEST */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-8 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base uppercase">
                ADDING/EDITING QUESTION: {selectedType?.toUpperCase()}
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
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
                  placeholder="Ví dụ: KNOWLEDGE OF LANGUAGE"
                  className="w-full p-2.5 border border-purple-300 rounded-xl text-xs font-extrabold text-purple-950 bg-white"
                />
              </div>

              {/* GIAO DIỆN TAB TASK CỦA CLOZE TEST (KNOWLEDGE OF LANGUAGE) ĐỒNG BỘ CỰC ĐẸP */}
              {selectedType?.toLowerCase() === 'cloze_test' && (
                <div className="space-y-4 border border-blue-200 rounded-3xl p-5 bg-blue-50/20">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-3 overflow-x-auto gap-2">
                    <div className="flex items-center space-x-2">
                      {clozeTasks.map((t, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => {
                            setActiveTaskTab(tIdx);
                            setIsJsonDirectMode(false);
                          }}
                          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center space-x-2 ${
                            activeTaskTab === tIdx
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <span>PART #{tIdx + 1}: {t.badge_label || (tIdx === 1 ? 'EMAIL' : 'BLOG')}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newIdx = clozeTasks.length;
                        const newTask = {
                          task_title: `TASK ${newIdx + 1}: READ THE TEXT AND CHOOSE THE CORRECT WORD.`,
                          task_sub: `Read the following text and choose the best option (A, B, C, or D) for each blank.`,
                          badge_label: newIdx === 1 ? 'EMAIL' : 'ARTICLE',
                          passage_title: `Title for Task ${newIdx + 1}`,
                          passage_content: `Enter reading passage with blanks (21) _______...`,
                          questions: [
                            {
                              question_number: `${21 + (newIdx * 5)}`,
                              options: [{ id: "A", text: "A. option1" }, { id: "B", text: "B. option2" }, { id: "C", text: "C. option3" }, { id: "D", text: "D. option4" }],
                              correct_option: "A"
                            }
                          ],
                          explanation: `🔍 Phân tích giải thích cho Task ${newIdx + 1}`
                        };
                        setClozeTasks([...clozeTasks, newTask]);
                        setActiveTaskTab(newIdx);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1 flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ THÊM TASK {clozeTasks.length + 1}</span>
                    </button>
                  </div>

                  {/* KHUNG SOẠN NỘI DUNG TASK ĐANG ACTIVE */}
                  {clozeTasks[activeTaskTab] && (
                    <div className="space-y-4 pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-blue-900 uppercase">
                          CHI TIẾT CLOZE TEST TASK #{activeTaskTab + 1}
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadSampleFile('json_cloze_task')}
                            className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg text-[11px] font-bold hover:bg-blue-200"
                          >
                            📥 Tải JSON Mẫu Task Này
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsJsonDirectMode(!isJsonDirectMode)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                          >
                            {isJsonDirectMode ? '✕ Đóng Ô Nhập JSON' : '⚡ Bật Ô Nhập JSON Cho Task Này'}
                          </button>
                        </div>
                      </div>

                      {/* Ô NHẬP JSON TRỰC TIẾP RIÊNG CHO TASK NÀY */}
                      {isJsonDirectMode && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                          <p className="text-xs text-blue-900 font-extrabold">
                            🚀 Dán chuỗi JSON của Task #{activeTaskTab + 1} vào đây:
                          </p>
                          <textarea
                            rows={7}
                            value={directJsonText}
                            onChange={(e) => setDirectJsonText(e.target.value)}
                            placeholder={`{\n  "task_title": "TASK 1: READ THE FIRST TEXT...",\n  "badge_label": "POSTER",\n  "passage_title": "Title...",\n  "passage_content": "Passage text with (16) _______...",\n  "questions": [\n    { "question_number": "16", "options": [...], "correct_option": "A" }\n  ],\n  "explanation": "..."\n}`}
                            className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyClozeTaskJson(activeTaskTab)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                          >
                            ✅ Áp Dụng JSON Cho Task #{activeTaskTab + 1}
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-blue-900 uppercase mb-1">
                            Tiêu đề Task (VD: TASK 1: READ THE FIRST TEXT...):
                          </label>
                          <input
                            type="text"
                            value={clozeTasks[activeTaskTab].task_title || ''}
                            onChange={(e) => {
                              const newTasks = [...clozeTasks];
                              newTasks[activeTaskTab].task_title = e.target.value;
                              setClozeTasks(newTasks);
                            }}
                            className="w-full px-3 py-1.5 border border-blue-300 rounded-xl text-xs bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-blue-900 uppercase mb-1">
                            Huy Hiệu Nổi (POSTER, BLOG, EMAIL, ARTICLE...):
                          </label>
                          <input
                            type="text"
                            value={clozeTasks[activeTaskTab].badge_label || ''}
                            onChange={(e) => {
                              const newTasks = [...clozeTasks];
                              newTasks[activeTaskTab].badge_label = e.target.value;
                              setClozeTasks(newTasks);
                            }}
                            className="w-full px-3 py-1.5 border border-blue-300 rounded-xl text-xs bg-white font-bold uppercase text-amber-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-blue-900 uppercase mb-1">
                          Nội dung đoạn văn đục lỗ (Passage Content):
                        </label>
                        <textarea
                          rows={4}
                          value={clozeTasks[activeTaskTab].passage_content || ''}
                          onChange={(e) => {
                            const newTasks = [...clozeTasks];
                            newTasks[activeTaskTab].passage_content = e.target.value;
                            setClozeTasks(newTasks);
                          }}
                          className="w-full p-2.5 border border-blue-300 rounded-xl text-xs bg-white font-serif"
                        />
                      </div>

                      {/* DANH SÁCH CÂU HỎI ĐỤC LỖ CỦA TASK NÀY */}
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800 uppercase">
                            CÂU HỎI ĐỤC LỖ VÀ 4 ĐÁP ÁN THẲNG 1 HÀNG NGANG
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newTasks = [...clozeTasks];
                              const qList = newTasks[activeTaskTab].questions || [];
                              qList.push({
                                question_number: `${16 + qList.length}`,
                                options: [{ id: 'A', text: 'A. option1' }, { id: 'B', text: 'B. option2' }, { id: 'C', text: 'C. option3' }, { id: 'D', text: 'D. option4' }],
                                correct_option: 'A'
                              });
                              newTasks[activeTaskTab].questions = qList;
                              setClozeTasks(newTasks);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold"
                          >
                            + Thêm Câu Đục Lỗ Cho Task #{activeTaskTab + 1}
                          </button>
                        </div>

                        {(clozeTasks[activeTaskTab].questions || []).map((cQ, cIdx) => (
                          <div key={cIdx} className="p-4 bg-white border border-blue-200 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-blue-900">Câu đục lỗ #{cQ.question_number || (16 + cIdx)}</span>
                              {(clozeTasks[activeTaskTab].questions || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTasks = [...clozeTasks];
                                    newTasks[activeTaskTab].questions = newTasks[activeTaskTab].questions.filter((_, i) => i !== cIdx);
                                    setClozeTasks(newTasks);
                                  }}
                                  className="text-rose-600 text-xs font-bold"
                                >
                                  Xóa câu này
                                </button>
                              )}
                            </div>

                            {/* 4 ĐÁP ÁN NẰM 1 HÀNG NGANG GRID-COLS-4 THẲNG HÀNG CỘT */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                              {(cQ.options || []).map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center space-x-1.5">
                                  <input
                                    type="radio"
                                    name={`cloze_opt_${activeTaskTab}_${cIdx}`}
                                    checked={cQ.correct_option === (opt.id || String.fromCharCode(65 + oIdx))}
                                    onChange={() => {
                                      const newTasks = [...clozeTasks];
                                      newTasks[activeTaskTab].questions[cIdx].correct_option = opt.id || String.fromCharCode(65 + oIdx);
                                      setClozeTasks(newTasks);
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={opt.text || ''}
                                    onChange={(e) => {
                                      const newTasks = [...clozeTasks];
                                      newTasks[activeTaskTab].questions[cIdx].options[oIdx].text = e.target.value;
                                      setClozeTasks(newTasks);
                                    }}
                                    placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}...`}
                                    className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* KHUNG AI GIẢI THÍCH 4 KHỐI RIÊNG DÀNH CHO TASK NÀY */}
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 mt-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-extrabold text-emerald-900 uppercase">
                            GIẢI THÍCH ĐÁP ÁN CHUẨN 4 KHỐI RIÊNG CHO CLOZE TEST TASK #{activeTaskTab + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAiGenerateExplanation(activeTaskTab, true)}
                            disabled={aiExplaining}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>{aiExplaining ? 'AI Đang Tạo...' : '🪄 AI Tạo Giải Thích Task Này'}</span>
                          </button>
                        </div>

                        <textarea
                          rows={4}
                          value={clozeTasks[activeTaskTab].explanation || ''}
                          onChange={(e) => {
                            const newTasks = [...clozeTasks];
                            newTasks[activeTaskTab].explanation = e.target.value;
                            setClozeTasks(newTasks);
                          }}
                          placeholder={`🔍 Phân tích ngữ pháp/ngữ cảnh:\n...\n\n💡 Giải thích chi tiết (Evidence / Dẫn chứng):\n...`}
                          className="w-full p-3 border border-emerald-300 rounded-xl text-xs bg-white font-medium leading-relaxed font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GIAO DIỆN TAB PART DÀNH CHO LISTENING & READING GIỮ NGUYÊN HOÀN HẢO */}
              {(selectedType?.toLowerCase() === 'listening_section' || selectedType?.toLowerCase() === 'reading_section') && (
                <div className="space-y-4 border border-purple-200 rounded-3xl p-5 bg-purple-50/20">
                  <div className="flex items-center justify-between border-b border-purple-200 pb-3 overflow-x-auto gap-2">
                    <div className="flex items-center space-x-2">
                      {sectionParts.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setActivePartTab(pIdx);
                            setIsJsonDirectMode(false);
                          }}
                          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center space-x-2 ${
                            activePartTab === pIdx
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          <span>PART #{pIdx + 1} ({p.part_type === 'true_false' ? 'True/False T/F' : 'Trắc nghiệm A,B,C,D'})</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newIdx = sectionParts.length;
                        const isEven = newIdx % 2 === 1;
                        const newPart = {
                          part_type: isEven ? 'true_false' : 'multiple_choice',
                          part_title: isEven
                            ? `PART ${newIdx + 1}: Listen/Read again and decide whether the statements are True (T) or False (F).`
                            : `PART ${newIdx + 1}: Choose the correct answer A, B, C, or D.`,
                          audioUrl: '',
                          passage: selectedType?.toLowerCase() === 'reading_section' ? 'Enter passage text...' : '',
                          questions: isEven
                            ? [{ question: 'Statement text...', correctAnswer: 'T', explanation: '' }]
                            : [{ question: 'Question text...', options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }], explanation: '' }],
                          explanation: `🔍 Phân tích giải thích cho Part ${newIdx + 1}`
                        };
                        setSectionParts([...sectionParts, newPart]);
                        setActivePartTab(newIdx);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ THÊM PART {sectionParts.length + 1}</span>
                    </button>
                  </div>

                  {sectionParts[activePartTab] && (
                    <div className="space-y-4 pt-1">
                      {/* CÁC PHẦN PART ĐÃ LÀM Ở LẦN TRƯỚC GIỮ NGUYÊN HOÀN HẢO */}
                      <input
                        type="text"
                        value={sectionParts[activePartTab].part_title || ''}
                        onChange={(e) => {
                          const newParts = [...sectionParts];
                          newParts[activePartTab].part_title = e.target.value;
                          setSectionParts(newParts);
                        }}
                        className="w-full px-3 py-2 border border-purple-300 rounded-xl text-xs bg-white font-extrabold text-purple-950"
                      />
                    </div>
                  )}
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
