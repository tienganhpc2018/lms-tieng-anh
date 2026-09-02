import { supabase } from '../lib/supabase';

/**
 * Service AI Chấm bài luận & bài viết ngắn (WRITING SECTION)
 * Tự động phân tích Ngữ pháp, Từ vựng C2/IELTS Band 8.0, Mạch lạc, Hoàn thành đề bài & OCR ảnh bài làm chụp tay.
 */
export async function gradeWritingSubmissionWithAI({
  questionTitle,
  questionPrompt,
  sampleAnswer,
  studentText = '',
  studentImageUrl = null,
}) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';

    if (!apiKey) {
      // Trả về nhận xét mặc định nếu chưa gắn API Key
      return {
        success: true,
        isSimulated: true,
        overallScore: 8.5,
        criteriaScores: {
          taskFulfillment: '8.5/10 - Đáp ứng tốt các yêu cầu chính của đề bài',
          grammarStructure: '8.0/10 - Cấu trúc câu phong phú, sai sót nhỏ không đáng kể',
          vocabulary: '8.5/10 - Sử dụng từ vựng phù hợp chủ đề',
          coherence: '8.5/10 - Bố cục rõ ràng, tính liên kết cao',
        },
        ocrExtractedText: studentText || '(Bài làm học sinh gõ trực tiếp)',
        grammarFixes: [
          { original: 'She start learn', suggestion: 'She started learning', explanation: 'Thì quá khứ đơn start -> started và theo sau start là V-ing.' }
        ],
        advancedVocabularySuggestions: [
          { original: 'important', c2Upgrade: 'pivotal / of paramount significance', example: 'Craft villages play a pivotal role in preserving cultural heritage.' },
          { original: 'good', c2Upgrade: 'exceptional / exemplary', example: 'The artisan showed exemplary craftsmanship.' },
        ],
        detailedFeedback: 'Bài làm viết khá tốt, đúng trọng tâm đề bài. Cần chú ý hơn về chia thì quá khứ và cách dùng từ nối giữa các đoạn văn để đạt điểm tối đa.',
      };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let contentsParts = [];

    const promptText = `
Bạn là một Siêu Giám Thị & Chuyên Gia Chấm Thi Tiếng Anh (IELTS / VSTEP Master Grader).
Hãy phân tích và chấm điểm bài làm tự luận Tiếng Anh của học sinh dưới đây.

ĐỀ BÀI:
- Phần bài: ${questionTitle || 'WRITING SECTION'}
- Yêu cầu đề bài: ${questionPrompt || 'N/A'}
- Gợi ý đáp án / Dàn ý mẫu: ${sampleAnswer || 'N/A'}

BÀI LÀM CỦA HỌC SINH (Text hoặc Ảnh đính kèm):
- Văn bản học sinh gõ: ${studentText || '(Xem bài làm trong ảnh đính kèm)'}

YÊU CẦU ĐẦU RA (Trả về định dạng JSON thuần túy 100%, không kèm markdown block hay text thừa):
{
  "overallScore": 8.5,
  "ocrExtractedText": "Nội dung văn bản nhận diện được từ ảnh bài làm của học sinh (nếu có)",
  "criteriaScores": {
    "taskFulfillment": "8.5/10 - Điểm và nhận xét mức độ hoàn thành đề bài",
    "grammarStructure": "8.0/10 - Điểm và nhận xét ngữ pháp",
    "vocabulary": "8.5/10 - Điểm và nhận xét từ vựng",
    "coherence": "8.5/10 - Điểm và nhận xét mạch lạc"
  },
  "grammarFixes": [
    {
      "original": "Câu hoặc cụm từ bị sai của học sinh",
      "suggestion": "Cách sửa chuẩn xác",
      "explanation": "Giải thích lỗi sai ngắn gọn bằng Tiếng Việt"
    }
  ],
  "advancedVocabularySuggestions": [
    {
      "original": "Từ đơn giản học sinh đã dùng (ví dụ: important, think, good)",
      "c2Upgrade": "Từ/Cụm từ C2 / Band 8.0 nâng cao đắt giá hơn",
      "example": "Ví dụ câu hoàn chỉnh sử dụng từ nâng cao này"
    }
  ],
  "detailedFeedback": "Đánh giá chi tiết bằng Tiếng Việt thân thiện, khích lệ học sinh và chỉ ra các điểm cần phát huy/khắc phục."
}
`;

    contentsParts.push({ text: promptText });

    if (studentImageUrl && studentImageUrl.startsWith('data:image')) {
      const mimeType = studentImageUrl.substring(studentImageUrl.indexOf(':') + 1, studentImageUrl.indexOf(';'));
      const base64Data = studentImageUrl.substring(studentImageUrl.indexOf(',') + 1);

      contentsParts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: base64Data,
        },
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: contentsParts }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const resData = await response.json();
    const rawContent = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsedResult = {};
    try {
      parsedResult = JSON.parse(rawContent);
    } catch (e) {
      console.warn('Could not parse Gemini JSON response, fallbacking:', rawContent);
      parsedResult = {
        overallScore: 8.0,
        detailedFeedback: rawContent,
      };
    }

    return {
      success: true,
      isSimulated: false,
      ...parsedResult,
    };
  } catch (error) {
    console.error('Error in gradeWritingSubmissionWithAI:', error);
    return {
      success: false,
      error: error.message,
      overallScore: 8.0,
      detailedFeedback: 'Đã nhận bài làm tự luận của học sinh. Bài thi đang chờ giáo viên duyệt nhận xét thủ công.',
    };
  }
}
