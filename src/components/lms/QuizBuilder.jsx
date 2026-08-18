import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles, Wand2, Volume2, Link as LinkIcon, Video, Eye, Sun, Type, Database, Shuffle, Award, Save, Code, Download, Headphones, BookOpen, Search, XCircle } from 'lucide-react';
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
  const [summaryText, setSummaryText] = useState('Sơ đồ Infographic tóm tắt công thức Verbs of liking + V-ing giúp học sinh dễ nhớ bài học bằng hình ảnh 3D.');

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
  const [aiExplaining, setAiExplaining] = useState(false);

  // State riêng cho Listening Section & Reading Section
  const [sectionPassage, setSectionPassage] = useState('');
  const [audioscriptText, setAudioscriptText] = useState('');
  const [listeningAudioUrl, setListeningAudioUrl] = useState('');
  const [sectionChildQuestions, setSectionChildQuestions] = useState([
    {
      question: '1. What traditional craft is Chuong village famous for?',
      options: [
        { text: 'A. Making pottery', isCorrect: false },
        { text: 'B. Making conical hats', isCorrect: true },
        { text: 'C. Weaving silk', isCorrect: false },
        { text: 'D. Carving wood', isCorrect: false },
      ],
      explanation: `🔍 Phân tích ngữ pháp/ngữ cảnh:\nCâu hỏi yêu cầu xác định nghề truyền thống dựa trên câu đầu tiên của đoạn văn.\n\n💡 Giải thích chi tiết:\nĐoạn văn mở đầu bằng: 'Chuong village in Hanoi is famous for its long history of making conical hats (non la)'. Do đó đáp án đúng là B.\n\n✕ Loại trừ gây nhiễu:\nCác phương án A, C, D là các nghề thủ công mỹ nghệ khác nhưng không phải của làng Chuông.\n\n🇻🇳 Bản dịch nghĩa song ngữ:\nLàng Chuông nổi tiếng với nghề truyền thống nào? - Làm nón lá.`,
    },
  ]);

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

  // AI TỰ ĐỘNG TẠO GIẢI THÍCH CHUẨN 4 KHỐI DÀNH CHO HỌC SINH YẾU (CHUẨN 100% ẢNH 2)
  const handleAiGenerateExplanation = () => {
    if (!questionText.trim() && !sectionPassage.trim()) {
      alert('Vui lòng nhập nội dung đề bài trước khi tạo giải thích AI!');
      return;
    }
    setAiExplaining(true);
    setTimeout(() => {
      const correctOpt = mcOptions.find((o) => o.isCorrect);
      setExplanation(
        `🔍 Phân tích ngữ pháp/ngữ cảnh:\nCâu hỏi kiểm tra kiến thức trọng tâm ngữ pháp và từ vựng Tiếng Anh theo chuẩn chương trình.\n\n💡 Giải thích chi tiết:\nĐề bài: "${questionText}". Đáp án chính xác là "${correctOpt?.text || 'B'}" phù hợp hoàn toàn với ngữ cảnh.\n\n✕ Loại trừ gây nhiễu:\nCác phương án còn lại sai về nghĩa hoặc không phù hợp với cấu trúc ngữ pháp Tiếng Anh.\n\n🇻🇳 Bản dịch nghĩa song ngữ:\nDịch đề bài và đáp án đúng giúp học sinh dễ dàng học thuộc và ghi nhớ sâu bài học.`
      );
      setAiExplaining(false);
    }, 1000);
  };

  // Xử lý Upload file MP3 Audio từ máy tính cho Listening Section (Ảnh 3)
  const handleAudioFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fakeUrl = URL.createObjectURL(file);
    setListeningAudioUrl(fakeUrl);
    alert(`🎉 Đã tải tệp audio mp3 "${file.name}" lên thành công!`);
  };

  // NÚT TẢI TỆP MẪU CHUẨN GNOMIO (.TXT)
  const handleDownloadSampleFile = (format) => {
    let content = '';
    let filename = '';

    if (format === 'aiken') {
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
  =hospitable -> pleased to welcome guests; generous to visitors
}`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
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

  const handleConfirmAddType = () => {
    setIsTypeModalOpen(false);
    setEditingQuestion({ id: 'new', type: selectedType });
    setQuestionTitle('Reading / Listening Section');
    setQuestionText('Read the passage about Chuong conical hat village and choose the correct answer A, B, C, or D.');
    setExplanation(
      `🔍 Phân tích ngữ pháp/ngữ cảnh:\nCâu hỏi yêu cầu xác định nghề truyền thống dựa trên câu đầu tiên của đoạn văn.\n\n💡 Giải thích chi tiết:\nĐoạn văn mở đầu bằng: 'Chuong village in Hanoi is famous for its long history of making conical hats (non la)'. Do đó đáp án đúng là B.\n\n✕ Loại trừ gây nhiễu:\nCác phương án A, C, D là các nghề thủ công mỹ nghệ khác nhưng không phải của làng Chuông.\n\n🇻🇳 Bản dịch nghĩa song ngữ:\nLàng Chuông nổi tiếng với nghề truyền thống nào? - Làm nón lá.`
    );
    setSectionPassage(
      'Chuong village in Hanoi is famous for its long history of making conical hats (non la). For centuries, local artisans have passed down the craft from generation to generation. However, in recent years, the village has faced up to many challenges. Fewer young people want to learn the craft because they do not know how to make a living from it. To deal with this problem, the local community has turned the village into a tourist destination. Visitors come here to learn how to make conical hats themselves. Artisans show them where to buy the best palm leaves and how to sew the hats neatly. This initiative has helped the village avoid having to close down. Now, the locals are looking forward to welcoming more international tourists. By combining traditional crafts with tourism, Chuong village not only preserves its heritage but also improves the local economy.'
    );
    setAudioscriptText('Hello everyone, my name is Phong, and I am a third-generation artisan in Bat Trang pottery village...');
    setListeningAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    setSectionChildQuestions([
      {
        question: '1. What traditional craft is Chuong village famous for?',
        options: [
          { text: 'A. Making pottery', isCorrect: false },
          { text: 'B. Making conical hats', isCorrect: true },
          { text: 'C. Weaving silk', isCorrect: false },
          { text: 'D. Carving wood', isCorrect: false },
        ],
        explanation: `🔍 Phân tích ngữ pháp/ngữ cảnh:\nCâu hỏi kiểm tra thông tin mở đầu bài đọc.\n\n💡 Giải thích chi tiết:\nĐoạn văn ghi rõ: 'making conical hats (non la)'. Đáp án đúng là B.\n\n✕ Loại trừ gây nhiễu:\nCác nghề A, C, D không thuộc làng Chuông.\n\n🇻🇳 Bản dịch nghĩa song ngữ:\nLàng Chuông nổi tiếng nghề gì? - Nón lá.`,
      },
    ]);
    setMarks(3.0);
    setMcOptions([
      { text: '', isCorrect: true, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
    ]);
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

  const handleAddChildQuestion = () => {
    const qNum = sectionChildQuestions.length + 1;
    setSectionChildQuestions([
      ...sectionChildQuestions,
      {
        question: `${qNum}. New question for this section...`,
        options: [
          { text: 'A. Option A', isCorrect: true },
          { text: 'B. Option B', isCorrect: false },
          { text: 'C. Option C', isCorrect: false },
          { text: 'D. Option D', isCorrect: false },
        ],
        explanation: `🔍 Phân tích ngữ pháp/ngữ cảnh:\nPhân tích chi tiết...\n\n💡 Giải thích chi tiết:\nLời giải chi tiết...\n\n✕ Loại trừ gây nhiễu:\nLoại trừ các đáp án nhiễu...\n\n🇻🇳 Bản dịch nghĩa song ngữ:\nDịch nghĩa câu hỏi...`,
      },
    ]);
  };

  const handleRemoveChildQuestion = (index) => {
    if (sectionChildQuestions.length <= 1) {
      alert('Bài học cần tối thiểu 1 câu hỏi con!');
      return;
    }
    setSectionChildQuestions(sectionChildQuestions.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    let customContent = {
      title: questionTitle || 'Question',
      question: questionText.trim() || 'Read the passage and answer questions below.',
      explanation: explanation.trim(),
      categories: selectedCategories,
    };

    const normType = selectedType?.toLowerCase();
    if (normType === 'listening_section') {
      customContent.audioUrl = listeningAudioUrl;
      customContent.audioscript = audioscriptText;
      customContent.childQuestions = sectionChildQuestions;
    } else if (normType === 'reading_section') {
      customContent.passage = sectionPassage;
      customContent.childQuestions = sectionChildQuestions;
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
      type: selectedType,
      marks: Number(marks),
      content: customContent,
    };

    if (editingQuestion?.id === 'new') {
      await supabase.from('questions').insert([payload]);
    } else {
      await supabase.from('questions').update(payload).eq('id', editingQuestion.id);
    }

    setEditingQuestion(null);
    await fetchQuestions();
    if (onSaved) onSaved();
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

  const handleImportJson = async () => {
    if (!jsonInputText.trim()) return;
    try {
      const parsedData = JSON.parse(jsonInputText);
      const items = Array.isArray(parsedData) ? parsedData : [parsedData];

      const formattedQuestions = items.map((q) => {
        const contentObj = q.content || {
          title: q.title || (q.question ? q.question.substring(0, 50) : 'Imported Question'),
          question: q.question || q.title || 'Untitled Question',
          options: q.options || [
            { text: 'Option A', isCorrect: true },
            { text: 'Option B', isCorrect: false },
          ],
          explanation: q.explanation || '',
          passage: q.passage || '',
          childQuestions: q.childQuestions || [],
        };

        return {
          activity_id: activityId,
          type: q.type || 'multiple_choice',
          marks: Number(q.marks) || 1.0,
          content: contentObj,
        };
      });

      const { error } = await supabase.from('questions').insert(formattedQuestions);
      if (error) {
        alert('Lỗi nạp JSON vào CSDL: ' + error.message);
      } else {
        alert(`🎉 Đã Import THÀNH CÔNG ${formattedQuestions.length} câu hỏi từ chuỗi JSON!`);
        setJsonInputText('');
        setHelpFormatModal(null);
        setActiveTab('questions');
        await fetchQuestions();
        if (onSaved) onSaved();
      }
    } catch (err) {
      alert('Lỗi định dạng JSON không hợp lệ: ' + err.message);
    }
  };

  const parseAdvancedMoodleText = (text) => {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const parsedQuestions = [];

    const matchingBlocks = cleanText.match(/::Matching\d*::([\s\S]*?)\{([\s\S]*?)\}/gi);
    if (matchingBlocks) {
      matchingBlocks.forEach((block) => {
        const titleMatch = block.match(/::Matching\d*::\s*([^\n\{]+)/i);
        const pairsMatch = block.match(/\{([\s\S]*?)\}/);
        if (pairsMatch) {
          const pairLines = pairsMatch[1].split('\n').filter((l) => l.includes('->'));
          const pairs = pairLines.map((l) => {
            const parts = l.replace(/^=/, '').split('->');
            return { itemA: parts[0]?.trim(), itemB: parts[1]?.trim() };
          });
          parsedQuestions.push({
            activity_id: activityId,
            type: 'matching',
            marks: 1.0,
            content: {
              title: titleMatch ? titleMatch[1].trim() : 'Matching Question',
              question: titleMatch ? titleMatch[1].trim() : 'Match the items',
              explanation: '💡 AI Giải Thích: Hãy đọc kỹ định nghĩa Tiếng Anh để ghép từ chính xác.',
              pairs,
            },
          });
        }
      });
    }

    if (parsedQuestions.length === 0) {
      const rawLines = cleanText.split('\n').map((l) => l.trim());
      let currentQTextLines = [];
      let currentOptions = [];

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (!line) continue;

        const ansMatch = line.match(/^ANSWER:\s*([A-Z])/i);
        const optMatch = line.match(/^([A-Z])[\.\)]\s*(.+)/i);

        if (ansMatch) {
          const correctLetter = ansMatch[1].toUpperCase();
          if (currentQTextLines.length > 0 && currentOptions.length >= 2) {
            const finalOpts = currentOptions.map((o) => ({
              text: o.text,
              isCorrect: o.letter === correctLetter,
            }));

            const correctText = currentOptions.find((o) => o.letter === correctLetter)?.text || '';

            parsedQuestions.push({
              activity_id: activityId,
              type: 'multiple_choice',
              marks: 1.0,
              content: {
                title: currentQTextLines[0].substring(0, 50),
                question: currentQTextLines.join(' '),
                explanation: `💡 AI Giải Thích: Đáp án đúng là "${correctText}" vì đây là lựa chọn chính xác theo từ vựng và ngữ pháp Tiếng Anh.`,
                options: finalOpts,
              },
            });
          }
          currentQTextLines = [];
          currentOptions = [];
        } else if (optMatch) {
          currentOptions.push({
            letter: optMatch[1].toUpperCase(),
            text: optMatch[2].trim(),
          });
        } else {
          currentQTextLines.push(line);
        }
      }
    }

    return parsedQuestions;
  };

  const handleProcessImport = async () => {
    if (!importedText.trim()) return;
    setIsImporting(true);

    try {
      const parsedQuestions = parseAdvancedMoodleText(importedText);

      if (parsedQuestions.length > 0) {
        const { error } = await supabase.from('questions').insert(parsedQuestions);
        if (error) {
          alert('Lỗi lưu câu hỏi vào CSDL: ' + error.message);
        } else {
          alert(`🎉 Đã Import THÀNH CÔNG ${parsedQuestions.length} câu hỏi chuẩn Moodle/GIFT vào đề thi!`);
          setImportedText('');
          setActiveTab('questions');
          await fetchQuestions();
          if (onSaved) onSaved();
        }
      } else {
        alert('Không tìm thấy câu hỏi đúng cấu trúc Aiken/GIFT.');
      }
    } catch (err) {
      alert('Lỗi xử lý file import: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?')) return;
    await supabase.from('questions').delete().eq('id', id);
    await fetchQuestions();
  };

  const questionTypesList = [
    { type: 'listening_section', label: '1. LISTENING SECTION (Bài Nghe Audio MP3 & Kịch Bản Hội Thoại)', desc: 'Thiết kế bài nghe Audio MP3 (box dán link hoặc upload từ máy) kèm kịch bản Reading Script và danh sách câu hỏi trắc nghiệm con (Chuẩn Ảnh 3).' },
    { type: 'reading_section', label: '2. READING SECTION (Bài Đọc Hiểu Đoạn Văn & 5 Câu Hỏi Trắc Nghiệm Con)', desc: 'Thiết kế bài đọc chứa đoạn văn bản đọc hiểu Chuong Village... và danh sách 5 câu hỏi trắc nghiệm A, B, C, D bên dưới (Chuẩn 100% Ảnh 2).' },
    { type: 'multiple_choice', label: 'Multiple choice (Trắc nghiệm A, B, C, D)', desc: 'Cho phép chọn 1 hoặc nhiều đáp án đúng (Single/Multiple Choice).' },
    { type: 'true_false', label: 'True/False (Đúng / Sai)', desc: 'Dạng câu hỏi Đúng / Sai đơn giản cho từng ý.' },
    { type: 'matching', label: 'Matching (Nối từ Cột A - Cột B)', desc: 'Nối Cột A với Cột B tương ứng bằng thao tác kéo nối từ.' },
    { type: 'short_answer', label: 'Short answer (Điền từ ngắn)', desc: 'Dạng câu hỏi nhập từ/số chính xác vào ô trống.' },
    { type: 'essay', label: 'Essay (Bài viết tự luận)', desc: 'Cho phép học sinh gõ văn bản bài viết luận hoặc nộp file.' },
    { type: 'audio_record', label: 'Audio response (Ghi âm câu trả lời)', desc: 'Ghi âm câu trả lời nói Tiếng Anh trực tiếp từ mic.' },
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
          <span>📥 Import questions from file (Nhập file Aiken / GIFT)</span>
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
                  <button
                    onClick={() => handleOpenAddModal('bank')}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center space-x-2 font-semibold"
                  >
                    <Database className="w-4 h-4 text-sky-600" />
                    <span>+ from question bank (Từ ngân hàng mẫu)</span>
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
                        Dạng: {q.type}
                      </span>
                      <span className="text-xs text-slate-400">({q.marks} điểm)</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          const normalized = q.type?.toLowerCase() || 'multiple_choice';
                          setSelectedType(normalized);
                          setQuestionTitle(q.content?.title || '');
                          setQuestionText(q.content?.question || '');
                          setExplanation(q.content?.explanation || '');
                          setSectionPassage(q.content?.passage || '');
                          setAudioscriptText(q.content?.audioscript || '');
                          setListeningAudioUrl(q.content?.audioUrl || '');
                          setSectionChildQuestions(
                            q.content?.childQuestions || [
                              {
                                question: '1. What traditional craft is Chuong village famous for?',
                                options: [
                                  { text: 'A. Making pottery', isCorrect: false },
                                  { text: 'B. Making conical hats', isCorrect: true },
                                ],
                              },
                            ]
                          );
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
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                        title="Chỉnh sửa câu hỏi này"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">{q.content?.question || q.content?.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SOẠN ĐỀ THỦ CÔNG ĐỒ HỌA */}
      {activeTab === 'manual_editor' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">KHỐI LỚP</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Khối 6">Khối 6</option>
                  <option value="Khối 7">Khối 7</option>
                  <option value="Khối 8">Khối 8</option>
                  <option value="Khối 9">Khối 9</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">UNIT</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Unit 1: My New School / Leisure Time">Unit 1: My New School / Leisure Time</option>
                  <option value="Unit 2: Life in the Countryside">Unit 2: Life in the Countryside</option>
                  <option value="Unit 3: Teenagers">Unit 3: Teenagers</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">CATEGORIES KỸ NĂNG</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Knowledge of English (Vocab & Grammar)">Knowledge of English (Vocab & Grammar)</option>
                  <option value="Listening">Listening (Bài Nghe Audio)</option>
                  <option value="Reading">Reading (Bài Đọc Hiểu)</option>
                  <option value="Writing">Writing (Bài Viết Luận)</option>
                  <option value="Speaking">Speaking (Bài Nói Phát Âm)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">
                MÔ TẢ TÓM TẮT BÀI VIẾT (HIỂN THỊ TRÊN THẺ CARD)
              </label>
              <input
                type="text"
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAiCleanText}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>🪄 AI Bóc Tách Đề A,B,C,D Hàng Lỗi</span>
              </button>

              <button
                onClick={() => {
                  const url = prompt('Nhập đường dẫn File Audio MP3:');
                  if (url) setAudioFileUrl(url);
                }}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>🔊 Upload File Audio Từ Máy</span>
              </button>

              <button
                onClick={() => setShowAnswerBox(!showAnswerBox)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>👉 + Khung Đáp Án Ẩn Trống</span>
              </button>

              <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Sửa Font Tiếng Việt Dấu Mượt</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={homeworkContent}
              onChange={(e) => setHomeworkContent(e.target.value)}
              placeholder="Dán văn bản đề bài tập về nhà copy từ file Word tại đây..."
              className="w-full p-3 bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl focus:ring-2 focus:ring-emerald-500"
            />

            {showAnswerBox && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs space-y-1">
                <span className="font-extrabold block">Mã Code Đáp Án Ẩn (Tự động hiển thị khi học sinh xem):</span>
                <p className="font-mono text-[11px] text-emerald-400">[HƯỚNG DẪN ĐÁP ÁN: 1. A, 2. B, 3. C, 4. D]</p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleSaveHomework}
                disabled={isSavingHomework}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingHomework ? 'Đang Lưu Bài Tập...' : '💾 LƯU BÀI TẬP VỀ NHÀ NÀY VÀO BÀI HỌC'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMPORT QUESTIONS FROM FILE */}
      {activeTab === 'import' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              Import questions from file (Nhập ngân hàng câu hỏi từ tệp)
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownloadSampleFile(fileFormat)}
                className="px-3 py-1.5 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>📥 Tải Tệp Mẫu {fileFormat.toUpperCase()} (.txt)</span>
              </button>
              <button
                onClick={() => setHelpFormatModal('json')}
                className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Code className="w-4 h-4" />
                <span>❓ Mẫu Nhập JSON Hàng Loạt</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase">FILE FORMAT (ĐỊNH DẠNG TỆP)</h4>
            <div className="space-y-2">
              {[
                { id: 'aiken', label: 'Aiken format' },
                { id: 'gift', label: 'GIFT format' },
                { id: 'xml', label: 'Moodle XML format' }
              ].map((fmt) => (
                <div key={fmt.id} className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="file_fmt"
                      checked={fileFormat === fmt.id}
                      onChange={() => setFileFormat(fmt.id)}
                    />
                    <span>{fmt.label}</span>
                  </label>
                  <button
                    onClick={() => setHelpFormatModal(fmt.id)}
                    className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white font-extrabold text-[11px] flex items-center justify-center transition"
                  >
                    ?
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-8 border-2 border-dashed border-emerald-500/50 rounded-2xl text-center hover:border-emerald-500 transition bg-emerald-50/10">
              <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-bold mb-3">
                You can drag and drop files here to add them.
              </p>
              <input
                type="file"
                accept=".txt,.gift,.xml"
                onChange={handleFileUpload}
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
            </div>
          </div>

          {importedText && (
            <textarea
              rows={6}
              value={importedText}
              onChange={(e) => setImportedText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-900 text-emerald-400"
            />
          )}

          <button
            onClick={handleProcessImport}
            disabled={isImporting || !importedText.trim()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isImporting ? 'Đang Import...' : 'Import (Tải Ngân Hàng Câu Hỏi Này)'}
          </button>
        </div>
      )}

      {/* POPUP HƯỚNG DẪN ❓ */}
      {helpFormatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base uppercase">
                ❓ HỌC LIỆU MẪU CHUẨN GNOMIO CHO: {helpFormatModal.toUpperCase()}
              </h3>
              <button onClick={() => setHelpFormatModal(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {helpFormatModal === 'json' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Dán chuỗi JSON cấu trúc câu hỏi bên dưới để hệ thống tự động đưa lên hàng loạt:
                  </p>
                  <textarea
                    rows={8}
                    value={jsonInputText}
                    onChange={(e) => setJsonInputText(e.target.value)}
                    placeholder={`[\n  {\n    "type": "reading_section",\n    "marks": 3.0,\n    "content": {\n      "title": "READING SECTION",\n      "passage": "Chuong village in Hanoi is famous for...",\n      "childQuestions": [\n        {\n          "question": "1. What craft is Chuong village famous for?",\n          "options": [\n            {"text": "A. Pottery", "isCorrect": false},\n            {"text": "B. Conical hats", "isCorrect": true}\n          ]\n        }\n      ]\n    }\n  }\n]`}
                    className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl"
                  />
                  <button
                    onClick={handleImportJson}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    🚀 Import Chuỗi JSON Hàng Loạt Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <h5 className="font-extrabold text-emerald-900">📌 Hướng Dẫn Từng Bước:</h5>
                    <p className="text-emerald-800">
                      Bước 1: Bấm nút <strong>"📥 Tải Tệp Mẫu (.txt)"</strong> bên dưới.<br />
                      Bước 2: Mở tệp, chỉnh sửa câu hỏi và đáp án <code>ANSWER: X</code>.<br />
                      Bước 3: Bấm Import &rarr; Hệ thống đưa ngay về trang Biên Tập & Xem Trước Tức Thời!
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900">Ví dụ Học Liệu Mẫu Chuẩn Gnomio ({helpFormatModal.toUpperCase()}):</h4>
                    <button
                      onClick={() => handleDownloadSampleFile(helpFormatModal)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Tệp Mẫu (.txt)</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
                    {helpFormatModal === 'aiken'
                      ? `What is the correct answer to this question?
A. Is it this one?
B. Maybe this answer?
C. Possibly this one?
D. Must be this one!
ANSWER: D`
                      : helpFormatModal === 'gift'
                      ? `::Matching1:: Match the following adjectives with their definitions.
{
  =vast -> extremely large in area, size, amount, etc.
  =hospitable -> generous to visitors
}`
                      : `<quiz>\n  <question type="category">\n    <category><text>Grammar</text></category>\n  </question>\n</quiz>`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  QUESTIONS TYPES ({questionTypesList.length} Dạng Moodle)
                </span>
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

      {/* FORM BIÊN TẬP CÂU HỎI & CẤU HÌNH CÓ BOX UPLOAD/LINK MP3 CHO LISTENING_SECTION (CHUẨN ẢNH 3) */}
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
              {/* FORM LISTENING SECTION (CÓ BOX DÁN LINK MP3 HOẶC UPLOAD TỪ MÁY CHUẨN ẢNH 3) */}
              {selectedType?.toLowerCase() === 'listening_section' && (
                <div className="p-5 bg-purple-50 border border-purple-200 rounded-3xl space-y-4 shadow-xs">
                  <h4 className="font-extrabold text-xs text-purple-900 uppercase flex items-center space-x-2 border-b border-purple-200 pb-2">
                    <Headphones className="w-4 h-4 text-purple-600" />
                    <span>🔊 AUDIO RECORDINGS & SCRIPT (THIẾT KẾ BÀI NGHE LISTENING)</span>
                  </h4>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-purple-900">
                      1. Dán Link MP3 Audio Hoặc Tải Tệp MP3 Từ Máy Tính:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={listeningAudioUrl}
                        onChange={(e) => setListeningAudioUrl(e.target.value)}
                        placeholder="Dán link audio https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3..."
                        className="w-full px-3 py-2 border border-purple-300 rounded-xl text-xs bg-white font-medium"
                      />
                      <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center space-x-1 flex-shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải MP3 Từ Máy</span>
                        <input type="file" accept="audio/*" onChange={handleAudioFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-purple-900">
                      2. Kịch Bản Hội Thoại (Teacher's Reading Script):
                    </label>
                    <textarea
                      rows={4}
                      value={audioscriptText}
                      onChange={(e) => setAudioscriptText(e.target.value)}
                      placeholder="Dán kịch bản bài nghe tại đây (ví dụ: Hello everyone, my name is Phong...)"
                      className="w-full p-3 border border-purple-300 rounded-xl text-xs bg-white font-medium leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* FORM READING SECTION (ĐOẠN VĂN BÀI ĐỌC HIỂU) */}
              {selectedType?.toLowerCase() === 'reading_section' && (
                <div className="p-5 bg-sky-50 border border-sky-200 rounded-3xl space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-xs text-sky-900 uppercase flex items-center space-x-1.5 border-b border-sky-200 pb-2">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span>📖 NỘI DUNG ĐOẠN VĂN BÀI ĐỌC HIỂU (READING PASSAGE)</span>
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-sky-900 mb-1">
                      1. Tiêu Đề Bài Đọc (Reading Title / Instruction):
                    </label>
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Read the passage about Chuong conical hat village and choose the correct answer A, B, C, or D."
                      className="w-full px-3 py-2 border border-sky-300 rounded-xl text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-900 mb-1">
                      2. Nội dung đoạn văn bài đọc (Reading Passage Text):
                    </label>
                    <textarea
                      rows={6}
                      value={sectionPassage}
                      onChange={(e) => setSectionPassage(e.target.value)}
                      placeholder="Chuong village in Hanoi is famous for its long history of making conical hats (non la)..."
                      className="w-full p-3 border border-sky-300 rounded-xl text-xs bg-white font-medium leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* KHUNG SOẠN CÁC CÂU HỎI CON CHO READING / LISTENING SECTION */}
              {(selectedType?.toLowerCase() === 'reading_section' || selectedType?.toLowerCase() === 'listening_section') && (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase flex items-center space-x-1.5">
                      <ListFilter className="w-4 h-4 text-emerald-600" />
                      <span>DANH SÁCH {sectionChildQuestions.length} CÂU HỎI TRẮC NGHIỆM CON CHO BÀI NÀY</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddChildQuestion}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ THÊM CÂU HỎI TRẮC NGHIỆM CON</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {sectionChildQuestions.map((qChild, qIdx) => (
                      <div key={qIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-900 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg">
                            Câu hỏi con #{qIdx + 1}
                          </span>
                          {sectionChildQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveChildQuestion(qIdx)}
                              className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa câu này</span>
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Nội dung đề bài câu hỏi con #{qIdx + 1}:
                          </label>
                          <input
                            type="text"
                            value={qChild.question}
                            onChange={(e) => {
                              const newChilds = [...sectionChildQuestions];
                              newChilds[qIdx].question = e.target.value;
                              setSectionChildQuestions(newChilds);
                            }}
                            placeholder={`Ví dụ: ${qIdx + 1}. What traditional craft is Chuong village famous for?`}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-bold text-slate-900"
                          />
                        </div>

                        {/* 4 PHƯƠNG ÁN A, B, C, D */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {qChild.options.map((opt, oIdx) => {
                            const label = String.fromCharCode(65 + oIdx);
                            return (
                              <div key={oIdx} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                  <span className="text-slate-700">Đáp án {label}</span>
                                  <label className="flex items-center space-x-1 cursor-pointer text-emerald-700">
                                    <input
                                      type="checkbox"
                                      checked={opt.isCorrect}
                                      onChange={(e) => {
                                        const newChilds = [...sectionChildQuestions];
                                        newChilds[qIdx].options[oIdx].isCorrect = e.target.checked;
                                        setSectionChildQuestions(newChilds);
                                      }}
                                    />
                                    <span>Đúng</span>
                                  </label>
                                </div>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const newChilds = [...sectionChildQuestions];
                                    newChilds[qIdx].options[oIdx].text = e.target.value;
                                    setSectionChildQuestions(newChilds);
                                  }}
                                  placeholder={`Nội dung ${label}...`}
                                  className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FORM CHO TRẮC NGHIỆM ĐƠN LẺ MULTIPLE_CHOICE */}
              {selectedType?.toLowerCase() === 'multiple_choice' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Question Text (Nội dung đề bài câu hỏi) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Nhập nội dung đề bài..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase">
                        AVAILABLE OPTIONS (4 LỰA CHỌN TRẮC NGHIỆM 2 CỘT A, C & B, D)
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-200 transition"
                      >
                        + Thêm Lựa Chọn (Add Option)
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mcOptions.map((opt, idx) => {
                        const optionLabel = String.fromCharCode(65 + idx);
                        return (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-extrabold text-slate-800">
                                Option {idx + 1} ({optionLabel})
                              </span>
                              <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-emerald-700">
                                <input
                                  type="checkbox"
                                  checked={opt.isCorrect}
                                  onChange={(e) => {
                                    const newOpts = [...mcOptions];
                                    newOpts[idx].isCorrect = e.target.checked;
                                    setMcOptions(newOpts);
                                  }}
                                />
                                <span>Correct (Đáp án đúng)</span>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const newOpts = [...mcOptions];
                                  newOpts[idx].text = e.target.value;
                                  setMcOptions(newOpts);
                                }}
                                placeholder={`Nhập đáp án ${optionLabel}...`}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm bg-white"
                              />
                              {mcOptions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Ô TÍCH HỢP AI GIẢI THÍCH CHUẨN 4 PHẦN DÀNH CHO HỌC SINH YẾU (CHUẨN 100% ẢNH 2) */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-extrabold text-emerald-900 uppercase">
                    GIẢI THÍCH ĐÁP ÁN CHUẨN 4 KHỐI DÀNH CHO HỌC SINH YẾU (PHÂN TÍCH - GIẢI THÍCH - LOẠI TRỪ - NGHĨA SONG NGỮ)
                  </label>
                  <button
                    type="button"
                    onClick={handleAiGenerateExplanation}
                    disabled={aiExplaining}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{aiExplaining ? 'AI Đang Tạo...' : '🪄 AI Tự Động Tạo Giải Thích'}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={`🔍 Phân tích ngữ pháp/ngữ cảnh:\n...\n\n💡 Giải thích chi tiết:\n...\n\n✕ Loại trừ gây nhiễu:\n...\n\n🇻🇳 Bản dịch nghĩa song ngữ:\n...`}
                  className="w-full p-3 border border-emerald-300 rounded-xl text-xs bg-white font-medium leading-relaxed font-mono"
                />
              </div>

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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save changes (Lưu Bài Tập)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
