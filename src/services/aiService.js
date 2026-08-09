const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Call Gemini REST API directly using standard fetch
 */
async function callGemini(prompt, systemInstruction = '') {
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY chưa được cấu hình trong file .env');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: (systemInstruction ? systemInstruction + '\n\n' : '') + prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Generate Smart Test Questions via AI based on Grade, Unit, Topics
 */
export async function generateExamQuestions({ grade, unit, topics, count = 5, difficulty = 'medium' }) {
  const systemInstruction = `Bạn là Chuyên gia Khảo thí Tiếng Anh THCS chương trình Global Success Lớp ${grade}. 
Hãy tạo ${count} câu hỏi trắc nghiệm chuẩn bám sát Unit ${unit || 'Tổng hợp'}, Topics: ${topics.join(', ')}.
Yêu cầu trả về DUY NHẤT một chuỗi JSON chuẩn (dạng Array of Objects), KHÔNG kèm bối cảnh hay Markdown wrapper fence:
[
  {
    "id": "q1",
    "skill": "grammar",
    "content": "Câu hỏi...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct_answer": "A",
    "explanation": "Giải thích chi tiết bằng tiếng Việt..."
  }
]`;

  const prompt = `Tạo bài thi Tiếng Anh Lớp ${grade}, độ khó: ${difficulty}.`;
  const rawText = await callGemini(prompt, systemInstruction);
  
  try {
    const cleanJson = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to parse AI question output:', rawText);
    throw new Error('AI phản hồi không đúng định dạng JSON. Vui lòng thử lại.');
  }
}

/**
 * AI Writing Correction & Feedback
 */
export async function evaluateWritingSubmission({ promptText, studentEssay }) {
  const systemInstruction = `Bạn là Giám khảo chấm thi Writing Tiếng Anh THCS chuyên nghiệp.
Phân tích bài viết của học sinh theo các tiêu chí: 
1. Grammar & Spelling (Sửa lỗi ngữ pháp & chính tả từng câu)
2. Vocabulary Range (Từ vựng đã dùng & từ gợi ý nâng cao)
3. Coherence & Task Response (Mạch lạc & Đạt yêu cầu đề bài)
4. Overall Score (Thang điểm 10.0)
5. Model Rewrite (Bài mẫu sửa đổi tối ưu nhất)

Trả về DUY NHẤT JSON chuẩn dạng:
{
  "score": 8.5,
  "summary": "Nhận xét tổng quan...",
  "grammar_corrections": [
    { "original": "lỗi câu cũ", "corrected": "câu đã sửa", "reason": "Lý do bằng tiếng Việt" }
  ],
  "vocabulary_suggestions": [
    { "word": "từ đơn giản", "suggestion": "từ cao cấp hơn", "context": "trong câu..." }
  ],
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Điểm cần cải thiện 1"],
  "model_essay": "Bài mẫu hoàn chỉnh viết lại chuẩn phong cách Global Success..."
}`;

  const prompt = `Đề bài Writing: "${promptText}"\n\nBài làm của Học sinh:\n"${studentEssay}"`;
  const rawText = await callGemini(prompt, systemInstruction);

  try {
    const cleanJson = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to parse AI writing evaluation:', rawText);
    throw new Error('Không thể phân tích phản hồi AI Writing. Vui lòng thử lại.');
  }
}

/**
 * AI Speaking Evaluator & Feedback
 */
export async function evaluateSpeakingSubmission({ promptText, transcript }) {
  const systemInstruction = `Bạn là Giám khảo chấm Speaking Tiếng Anh THCS.
Phân tích bản phát âm/nói của học sinh dựa trên nội dung transcript được chuyển từ giọng nói:
1. Pronunciation & Phonetics hints
2. Fluency & Natural Expressions
3. Grammar & Lexical Accuracy
4. Score (Thang điểm 10.0)

Trả về DUY NHẤT JSON chuẩn:
{
  "score": 8.0,
  "pronunciation_feedback": "Nhận xét về phát âm...",
  "fluency_feedback": "Nhận xét độ trôi chảy...",
  "grammar_lexical_feedback": "Nhận xét từ vựng & ngữ pháp...",
  "suggested_phrases": ["Cụm từ hay nên dùng 1", "Cụm từ 2"],
  "sample_speaking_transcript": "Bài nói mẫu đạt điểm 10..."
}`;

  const prompt = `Đề bài Speaking: "${promptText}"\n\nTranscript phát âm của Học sinh:\n"${transcript}"`;
  const rawText = await callGemini(prompt, systemInstruction);

  try {
    const cleanJson = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to parse AI speaking evaluation:', rawText);
    throw new Error('Không thể phân tích phản hồi AI Speaking. Vui lòng thử lại.');
  }
}

/**
 * AI Grammar Listing for Selected Topics & Units
 */
export async function explainGrammarForTopics({ grade, unit, topics }) {
  const systemInstruction = `Bạn là Giáo viên Tiếng Anh Chuyên nghiệp biên soạn bộ tài liệu Global Success Lớp ${grade}.
Khi người dùng chọn các topic [${topics.join(', ')}] thuộc Unit ${unit}, hãy phân tích và liệt kê chi tiết các điểm NGỮ PHÁP (GRAMMAR) cốt lõi của Unit đó.

Trả về DUY NHẤT JSON chuẩn:
[
  {
    "title": "Tên điểm ngữ pháp",
    "rule": "Quy tắc / Cấu trúc công thức bằng tiếng Việt",
    "examples": ["Ví dụ 1 với dịch nghĩa", "Ví dụ 2"],
    "common_errors": "Lỗi sai thường gặp của học sinh"
  }
]`;

  const prompt = `Liệt kê Ngữ pháp Tiếng Anh Lớp ${grade} Unit ${unit} theo các chủ đề: ${topics.join(', ')}.`;
  const rawText = await callGemini(prompt, systemInstruction);

  try {
    const cleanJson = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to parse AI grammar breakdown:', rawText);
    throw new Error('Không thể tải phân tích Ngữ pháp từ AI.');
  }
}
