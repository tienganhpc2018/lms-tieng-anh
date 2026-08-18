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

  // State riêng cho Cloze Test, Listening & Reading Gộp Cả Part 1 + Part 2 theo Tab
  const [clozeTasks, setClozeTasks] = useState([]);
  const [sectionParts, setSectionParts] = useState([]); // Mảng chứa các Part độc lập
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

  // AI TỰ ĐỘNG TẠO GIẢI THÍCH CHUẨN 4 KHỐI DÀNH CHO HỌC SINH YẾU CHO CẢ BÀI HOẶC TỪNG PART
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
    setSelectedType(sectionType.toLowerCase());
    setQuestionTitle(q.content?.title || '');
    setQuestionText(q.content?.question || '');
    setExplanation(q.content?.explanation || '');
    setSectionPassage(q.content?.passage || '');
    setClozeTasks(q.content?.tasks || []);
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

  // NÚT TẢI TỆP MẪU CHUẨN JSON & AIKEN (.JSON & .TXT)
  const handleDownloadSampleFile = (format) => {
    let content = '';
    let filename = '';

    if (format === 'json') {
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
              explanation: "🔍 Phân tích: Câu hỏi kiểm tra thế hệ nghệ nhân...\n💡 Evidence: Phong is the third generation of artisan...\n✕ Loại trừ: First, Second, Fourth sai...\n🇻🇳 Bản dịch: Phong là nghệ nhân thế hệ thứ mấy..."
            }
          ],
          explanation: "🔍 Phân tích toàn bài Part 1:\n💡 Evidence: Bài nghe đề cập đến làng gốm Bát Tràng."
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
              explanation: "🔍 Phân tích: Phát biểu đúng theo bài nghe...\n💡 Evidence: Phong said 'Many young people ask me how to keep up with modern trends'...\n✕ Loại trừ: Lựa chọn F sai...\n🇻🇳 Bản dịch: Giới trẻ thường hỏi Phong cách bắt kịp xu hướng..."
            }
          ],
          explanation: "🔍 Phân tích toàn bài Part 2 True/False."
        },
        null,
        2
      );
    } else if (format === 'aiken') {
      filename = 'mau_de_thi_aiken_gnomio.txt';
      content = `What is the correct answer to this question?
A. Is it this one?
B. Maybe this answer?
C. Possibly this one?
D. Must be this one!
ANSWER: D`;
    } else {
      filename = 'mau_de_thi_gift_gnomio.txt';
      content = `::Matching1:: Match the following adjectives with their definitions.
{
  =vast -> extremely large in area, size, amount, etc.
  =hospitable -> generous to visitors
}`;
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

  // TẠO CÂU HỎI MỚI -> MẶC ĐỊNH MỞ MẪU PART 1 (Multiple Choice) VÀ PART 2 (True/False)
  const handleConfirmAddType = () => {
    setIsTypeModalOpen(false);
    setEditingQuestion({ id: 'new', type: selectedType });
    setQuestionTitle('');
    setIsJsonDirectMode(false);
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
              explanation: '💡 Evidence: Young people often ask how to keep up with modern trends while preserving traditional crafts.'
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
      setQuestionTitle('2 KNOWLEDGE OF LANGUAGE');
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

  // NẠP JSON RIÊNG CHO PART ĐANG CHỌN (PART 1 HOẶC PART 2)
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

  const handleAddOption = () => {
    setMcOptions([...mcOptions, { text: '', isCorrect: false, feedback: '' }]);
  };

  const handleRemoveOption = (index) => {
    if (mcOptions.length <= 2) {
      alert('Câu hỏi trắc nghiệm cần tối thiểu 2 lựa chọn!');
      return;
    }
    setMcOptions(mcOptions.filter((_, i) => i !== index));
  };

  // LƯU CÂU HỎI & CÀI ĐẶT THỜI GIAN
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
        title: questionTitle || (normType === 'reading_tf' ? '3. READING (True/False)' : normType === 'cloze_test' ? '2 KNOWLEDGE OF LANGUAGE' : normType === 'reading_section' ? 'READING SECTION' : normType === 'listening_section' ? 'LISTENING SECTION' : 'MULTIPLE CHOICE'),
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
      } else if (normType === 'true_false') {
        customContent.options = [
          { text: 'True (Đúng)', isCorrect: tfCorrect === 'True' },
          { text: 'False (Sai)', isCorrect: tfCorrect === 'False' },
        ];
      } else if (normType === 'short_answer') {
        customContent.acceptedAnswers = shortAnswers.filter((a) => a.trim() !== '');
      } else if (normType === 'essay') {
        customContent.instruction = essayInstruction;
        customContent.allowFileUpload = true;
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

      // TỰ ĐỘNG NẠP VÀO QUESTION_BANK
      try {
        await supabase.from('question_bank').insert([
          {
            grade,
            unit,
            category,
            type: validDbType,
            question_text: customContent.question || customContent.title,
            options: customContent.options || customContent.childQuestions || customContent.tasks || customContent.parts || [],
            correct_answer: 'Option B',
            explanation: customContent.explanation,
          },
        ]);
      } catch (errBank) {}

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImportedText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?')) return;
    await supabase.from('questions').delete().eq('id', id);
    await fetchQuestions();
  };

  const questionTypesList = [
    { type: 'listening_section', label: '1. LISTENING SECTION (Bài Nghe Gộp Part 1 Trắc Nghiệm & Part 2 True/False)', desc: 'Thiết kế trọn bộ Part 1 (A,B,C,D) và Part 2 (True/False) với khung nạp JSON riêng biệt cho từng Part trong cùng 1 giao diện.' },
    { type: 'reading_section', label: '2. READING SECTION (Bài Đọc Hiểu Gộp Part 1 Trắc Nghiệm & Part 2 True/False)', desc: 'Thiết kế trọn bộ Part 1 (A,B,C,D) và Part 2 (True/False) với đoạn văn passage và khung nạp JSON riêng cho từng Part.' },
    { type: 'cloze_test', label: '4. KNOWLEDGE OF LANGUAGE (Cloze Test Gộp Task 1 & Task 2)', desc: 'Thiết kế trọn bộ 2 Bài Đọc Đục Lỗ (Task 1: BLOG/POSTER 16-20 và Task 2: EMAIL/ARTICLE 21-25) trong cùng 1 khung giao diện soạn thảo độc quyền.' },
    { type: 'reading_tf', label: '3. READING (True/False) - Bài Đọc Chọn Đúng (T) / Sai (F)', desc: 'Thiết kế bài đọc chứa đoạn văn bản đọc hiểu và 5 câu phát biểu bên dưới với nút vuông [T] và [F] đổi màu xanh/đỏ.' },
    { type: 'multiple_choice', label: 'Multiple choice (Trắc nghiệm A, B, C, D)', desc: 'Cho phép chọn 1 hoặc nhiều đáp án đúng (Single/Multiple Choice).' },
    { type: 'true_false', label: 'True/False (Đúng / Sai)', desc: 'Dạng câu hỏi Đúng / Sai đơn giản cho từng ý.' },
    { type: 'matching', label: 'Matching (Nối từ Cột A - Cột B)', desc: 'Nối Cột A với Cột B tương ứng bằng thao tác kéo nối từ.' },
    { type: 'short_answer', label: 'Short answer (Điền từ ngắn)', desc: 'Dạng câu hỏi nhập từ/số chính xác vào ô trống.' },
    { type: 'essay', label: 'Essay (Bài viết tự luận)', desc: 'Cho phép học sinh gõ văn bản bài viết luận hoặc nộp file.' },
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

        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'import' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileUp className="w-4 h-4 text-emerald-600" />
          <span>📥 Import questions from file (Nhập file Aiken / GIFT / JSON)</span>
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
              <p className="text-xs text-slate-500">
                Total marks: {questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0)} điểm
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>+ Add (Thêm Câu Hỏi)</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 font-semibold text-xs text-slate-700">
                  <button
                    onClick={() => handleOpenAddModal('new')}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center space-x-2 font-bold"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>+ a new question (Mở 20 dạng Moodle)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Đang tải câu hỏi..." />
          ) : questions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              Chưa có câu hỏi nào. Bấm nút "+ Add" ở trên để chọn dạng câu hỏi!
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded">
                        Dạng: {q.content?.sectionType || q.type}
                      </span>
                      <span className="text-xs text-slate-400">({q.marks} điểm)</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Xem & Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4
                    onClick={() => handleOpenEditModal(q)}
                    className="font-extrabold text-sm text-slate-900 hover:text-emerald-600 cursor-pointer flex items-center space-x-1.5 transition underline-offset-4 hover:underline"
                  >
                    <span>{q.content?.title || q.content?.question}</span>
                    <Eye className="w-4 h-4 text-emerald-600 inline ml-1 opacity-80" />
                  </h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2 & 3 GIỮ NGUYÊN HOÀN HẢO */}

      {/* BẢNG MODAL 20 DẠNG CÂU HỎI MOODLE */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Choose a question type to add ({questionTypesList.length} Dạng Moodle)</h3>
              <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 max-h-[65vh] overflow-y-auto">
              <div className="space-y-1 border-r border-slate-100 pr-4">
                {questionTypesList.map((t) => (
                  <label
                    key={t.type}
                    onClick={() => setSelectedType(t.type)}
                    className={`p-2.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
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

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 sticky top-0 h-fit">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase">Description & Example</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {questionTypesList.find((t) => t.type === selectedType)?.desc}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setIsTypeModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddType}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Add (Thêm Dạng Này)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM BIÊN TẬP CÂU HỎI VỚI NÚT CHỌN TAB PART 1 (A,B,C,D) VÀ PART 2 (TRUE/FALSE) RÕ RÀNG */}
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
              {/* KHUNG CÀI ĐẶT THỜI GIAN DROPDOWN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <div>
                  <label className="block text-xs font-extrabold text-emerald-950 uppercase mb-1 flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>⏱️ CÀI ĐẶT THỜI GIAN LÀM BÀI (SELECT CHỌN PHÚT)</span>
                  </label>
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={0}>⏱️ Không tính giờ (Đếm tiến bình thường: 00:00 → 00:01)</option>
                    <option value={5}>⚡ 5 phút (Bài kiểm tra nhanh)</option>
                    <option value={15}>📝 15 phút (Bài kiểm tra 15 phút)</option>
                    <option value={45}>🏫 45 phút (Bài kiểm tra 1 tiết / Giữa kỳ)</option>
                    <option value={60}>🎓 60 phút (Thi Học Kỳ)</option>
                    <option value={90}>🏆 90 phút (Thi Thử THPT Quốc Gia / IELTS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    🎯 ĐIỂM SỐ CÂU HỎI (MARKS)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* KHUNG YÊU CẦU ĐỀ BÀI HƯỚNG DẪN TỔNG */}
              <div className="p-4 bg-purple-50/60 border-l-4 border-purple-600 rounded-r-2xl space-y-1.5 shadow-xs">
                <label className="block text-xs font-extrabold text-purple-900 uppercase flex items-center space-x-1.5">
                  <MessageSquareText className="w-4 h-4 text-purple-600" />
                  <span>📝 TIÊU ĐỀ PHẦN BÀI THI TỔNG CHUNG *</span>
                </label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="Ví dụ: LISTENING SECTION"
                  className="w-full p-2.5 border border-purple-300 rounded-xl text-xs font-extrabold text-purple-950 bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* GIAO DIỆN TAB PART 1 (Trắc nghiệm) & PART 2 (True/False) DÀNH RIÊNG CHO LISTENING & READING SECTION */}
              {(selectedType?.toLowerCase() === 'listening_section' || selectedType?.toLowerCase() === 'reading_section') && (
                <div className="space-y-4 pt-1 border border-purple-200 rounded-3xl p-5 bg-purple-50/20">
                  {/* DANH SÁCH CÁC TAB PART */}
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
                        const isEven = newIdx % 2 === 1; // Part 2 là True/False
                        const newPart = {
                          part_type: isEven ? 'true_false' : 'multiple_choice',
                          part_title: isEven
                            ? `PART ${newIdx + 1}: Listen/Read again and decide whether the statements are True (T) or False (F).`
                            : `PART ${newIdx + 1}: Choose the correct answer A, B, C, or D.`,
                          audioUrl: '',
                          audioFileName: '',
                          passage: selectedType?.toLowerCase() === 'reading_section' ? 'Enter passage text...' : '',
                          questions: isEven
                            ? [{ question: 'Statement text...', correctAnswer: 'T', explanation: '' }]
                            : [{ question: 'Question text...', options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }], explanation: '' }],
                          explanation: `🔍 Phân tích giải thích cho Part ${newIdx + 1}`
                        };
                        setSectionParts([...sectionParts, newPart]);
                        setActivePartTab(newIdx);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1 flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ THÊM PART {sectionParts.length + 1} (Dạng True/False)</span>
                    </button>
                  </div>

                  {/* KHUNG NỘI DUNG CỦA PART DANG ĐƯỢC CHỌN (ACTIVEPARTTAB) */}
                  {sectionParts[activePartTab] && (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-bold text-purple-900">LOẠI ĐỀ PART #{activePartTab + 1}:</span>
                          <select
                            value={sectionParts[activePartTab].part_type || 'multiple_choice'}
                            onChange={(e) => {
                              const newParts = [...sectionParts];
                              newParts[activePartTab].part_type = e.target.value;
                              setSectionParts(newParts);
                            }}
                            className="px-3 py-1 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-950 cursor-pointer"
                          >
                            <option value="multiple_choice">📝 Part Trắc Nghiệm (A, B, C, D)</option>
                            <option value="true_false">☑️ Part True / False ([T] và [F])</option>
                          </select>
                        </div>

                        {/* NÚT BẬT Ô NHẬP JSON RIÊNG CHO PART NÀY */}
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadSampleFile(sectionParts[activePartTab].part_type === 'true_false' ? 'json_tf' : 'json')}
                            className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-lg text-[11px] font-bold hover:bg-purple-200"
                          >
                            📥 Tải JSON Mẫu Part Này
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsJsonDirectMode(!isJsonDirectMode)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                          >
                            {isJsonDirectMode ? '✕ Đóng Ô Nhập JSON' : '⚡ Bật Ô Nhập JSON Cho Part Này'}
                          </button>
                        </div>
                      </div>

                      {/* KHUNG DÁN JSON TRỰC TIẾP RIÊNG CHO PART NÀY */}
                      {isJsonDirectMode && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                          <p className="text-xs text-blue-900 font-extrabold">
                            🚀 Dán chuỗi JSON của Part #{activePartTab + 1} ({sectionParts[activePartTab].part_type === 'true_false' ? 'True/False' : 'Trắc nghiệm A,B,C,D'}) vào đây:
                          </p>
                          <textarea
                            rows={7}
                            value={directJsonText}
                            onChange={(e) => setDirectJsonText(e.target.value)}
                            placeholder={sectionParts[activePartTab].part_type === 'true_false' ? `{\n  "part_type": "true_false",\n  "part_title": "PART 2: Listen/Read again...",\n  "questions": [\n    { "question": "Statement...", "correctAnswer": "T", "explanation": "..." }\n  ],\n  "explanation": "..."\n}` : `{\n  "part_type": "multiple_choice",\n  "part_title": "PART 1: Choose answer...",\n  "questions": [\n    { "question": "Question...", "options": [...], "explanation": "..." }\n  ],\n  "explanation": "..."\n}`}
                            className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyPartJson(activePartTab)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                          >
                            ✅ Áp Dụng JSON Cho Part #{activePartTab + 1}
                          </button>
                        </div>
                      )}

                      {/* TIÊU ĐỀ HƯỚNG DẪN PART */}
                      <div>
                        <label className="block text-xs font-bold text-purple-900 uppercase mb-1">
                          Tiêu đề hướng dẫn Part #{activePartTab + 1}:
                        </label>
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

                      {/* AUDIO FILE (LISTENING) CHO PART NÀY */}
                      {selectedType?.toLowerCase() === 'listening_section' && (
                        <div className="p-4 bg-white border border-purple-200 rounded-2xl space-y-2">
                          <label className="block text-xs font-bold text-purple-900">
                            Audio MP3 riêng cho Part #{activePartTab + 1}:
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={sectionParts[activePartTab].audioFileName ? `📁 File: ${sectionParts[activePartTab].audioFileName}` : (sectionParts[activePartTab].audioUrl || '')}
                              onChange={(e) => {
                                const newParts = [...sectionParts];
                                newParts[activePartTab].audioUrl = e.target.value;
                                newParts[activePartTab].audioFileName = '';
                                setSectionParts(newParts);
                              }}
                              placeholder="Dán link audio mp3 hoặc chọn file..."
                              className="w-full px-3 py-1.5 border border-purple-300 rounded-xl text-xs bg-white font-bold"
                            />
                            <label className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center space-x-1 flex-shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Tải MP3 Từ Máy</span>
                              <input type="file" accept="audio/*" onChange={(e) => handleAudioFileUpload(e, activePartTab)} className="hidden" />
                            </label>
                          </div>
                        </div>
                      )}

                      {/* PASSAGE (READING) CHO PART NÀY */}
                      {selectedType?.toLowerCase() === 'reading_section' && (
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-emerald-900 uppercase">
                            Đoạn văn bài đọc (Passage) cho Part #{activePartTab + 1}:
                          </label>
                          <textarea
                            rows={4}
                            value={sectionParts[activePartTab].passage || ''}
                            onChange={(e) => {
                              const newParts = [...sectionParts];
                              newParts[activePartTab].passage = e.target.value;
                              setSectionParts(newParts);
                            }}
                            className="w-full p-2.5 border border-emerald-300 rounded-xl text-xs bg-white font-serif"
                          />
                        </div>
                      )}

                      {/* DANH SÁCH CÂU HỎI CON CỦA PART NÀY */}
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800 uppercase">
                            DANH SÁCH CÂU HỎI CON CỦA PART #{activePartTab + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newParts = [...sectionParts];
                              const qList = newParts[activePartTab].questions || [];
                              const isTF = newParts[activePartTab].part_type === 'true_false';

                              if (isTF) {
                                qList.push({ question: `${qList.length + 1}. Statement text...`, correctAnswer: 'T', explanation: '' });
                              } else {
                                qList.push({
                                  question: `${qList.length + 1}. Question text...`,
                                  options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }, { text: 'Option C', isCorrect: false }, { text: 'Option D', isCorrect: false }],
                                  explanation: ''
                                });
                              }
                              newParts[activePartTab].questions = qList;
                              setSectionParts(newParts);
                            }}
                            className="px-3 py-1 bg-purple-100 text-purple-900 hover:bg-purple-200 rounded-lg text-xs font-bold"
                          >
                            + Thêm Câu Hỏi Con Cho Part #{activePartTab + 1}
                          </button>
                        </div>

                        {(sectionParts[activePartTab].questions || []).map((cQ, cIdx) => (
                          <div key={cIdx} className="p-4 bg-white border border-purple-200 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-purple-900">Câu #{cIdx + 1}</span>
                              {(sectionParts[activePartTab].questions || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newParts = [...sectionParts];
                                    newParts[activePartTab].questions = newParts[activePartTab].questions.filter((_, i) => i !== cIdx);
                                    setSectionParts(newParts);
                                  }}
                                  className="text-rose-600 text-xs font-bold"
                                >
                                  Xóa câu này
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={cQ.question || ''}
                              onChange={(e) => {
                                const newParts = [...sectionParts];
                                newParts[activePartTab].questions[cIdx].question = e.target.value;
                                setSectionParts(newParts);
                              }}
                              placeholder="Nhập nội dung câu hỏi/phát biểu..."
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold"
                            />

                            {/* HIỂN THỊ ĐÁP ÁN NẾU LÀ TRUE/FALSE */}
                            {sectionParts[activePartTab].part_type === 'true_false' ? (
                              <div className="flex items-center space-x-4 pt-1">
                                <span className="text-xs font-bold text-slate-700">Đáp án chuẩn:</span>
                                <label className="flex items-center space-x-1 cursor-pointer text-xs font-bold text-emerald-700">
                                  <input
                                    type="radio"
                                    name={`tf_ans_${activePartTab}_${cIdx}`}
                                    checked={cQ.correctAnswer === 'T'}
                                    onChange={() => {
                                      const newParts = [...sectionParts];
                                      newParts[activePartTab].questions[cIdx].correctAnswer = 'T';
                                      setSectionParts(newParts);
                                    }}
                                  />
                                  <span>True (Đúng) [T]</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer text-xs font-bold text-rose-700">
                                  <input
                                    type="radio"
                                    name={`tf_ans_${activePartTab}_${cIdx}`}
                                    checked={cQ.correctAnswer === 'F'}
                                    onChange={() => {
                                      const newParts = [...sectionParts];
                                      newParts[activePartTab].questions[cIdx].correctAnswer = 'F';
                                      setSectionParts(newParts);
                                    }}
                                  />
                                  <span>False (Sai) [F]</span>
                                </label>
                              </div>
                            ) : (
                              /* HIỂN THỊ 4 ĐÁP ÁN TRẮC NGHIỆM */
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {(cQ.options || []).map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center space-x-1.5">
                                    <input
                                      type="radio"
                                      name={`mc_correct_${activePartTab}_${cIdx}`}
                                      checked={opt.isCorrect}
                                      onChange={() => {
                                        const newParts = [...sectionParts];
                                        newParts[activePartTab].questions[cIdx].options.forEach((o, i) => o.isCorrect = i === oIdx);
                                        setSectionParts(newParts);
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={opt.text || ''}
                                      onChange={(e) => {
                                        const newParts = [...sectionParts];
                                        newParts[activePartTab].questions[cIdx].options[oIdx].text = e.target.value;
                                        setSectionParts(newParts);
                                      }}
                                      placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}...`}
                                      className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Ô GIẢI THÍCH 4 KHỐI DÀNH RIÊNG CHO PART NÀY */}
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 mt-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-extrabold text-emerald-900 uppercase">
                            GIẢI THÍCH ĐÁP ÁN CHUẨN 4 KHỐI RIÊNG CHO PART #{activePartTab + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAiGenerateExplanation(activePartTab)}
                            disabled={aiExplaining}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>{aiExplaining ? 'AI Đang Tạo...' : '🪄 AI Tạo Giải Thích Part Này'}</span>
                          </button>
                        </div>

                        <textarea
                          rows={5}
                          value={sectionParts[activePartTab].explanation || ''}
                          onChange={(e) => {
                            const newParts = [...sectionParts];
                            newParts[activePartTab].explanation = e.target.value;
                            setSectionParts(newParts);
                          }}
                          placeholder={`🔍 Phân tích ngữ pháp/ngữ cảnh:\n...\n\n💡 Giải thích chi tiết (Evidence / Dẫn chứng):\n...\n\n✕ Loại trừ gây nhiễu:\n...\n\n🇻🇳 Bản dịch nghĩa song ngữ:\n...`}
                          className="w-full p-3 border border-emerald-300 rounded-xl text-xs bg-white font-medium leading-relaxed font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FORM CHO CLOZE TEST VÀ MULTIPLE CHOICE GIỮ NGUYÊN HOÀN HẢO */}
              {selectedType?.toLowerCase() === 'cloze_test' && !isJsonDirectMode && (
                <div className="space-y-6 pt-2">
                  {clozeTasks.map((task, tIdx) => (
                    <div key={tIdx} className="p-5 bg-blue-50/40 border border-blue-200 rounded-3xl space-y-4 relative">
                      <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-extrabold rounded-xl">
                          TASK #{tIdx + 1}: {task.badge_label || 'POSTER'}
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={task.passage_content}
                        onChange={(e) => {
                          const newTasks = [...clozeTasks];
                          newTasks[tIdx].passage_content = e.target.value;
                          setClozeTasks(newTasks);
                        }}
                        className="w-full p-2.5 border border-blue-300 rounded-xl text-xs bg-white font-serif"
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedType?.toLowerCase() === 'multiple_choice' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mcOptions.map((opt, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...mcOptions];
                            newOpts[idx].text = e.target.value;
                            setMcOptions(newOpts);
                          }}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm bg-white"
                        />
                      </div>
                    ))}
                  </div>
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
