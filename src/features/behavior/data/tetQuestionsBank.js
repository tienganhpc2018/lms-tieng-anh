// Ngân hàng câu hỏi Tiếng Anh chuẩn chương trình GDPT theo Lớp, Unit, Lesson và 3 dạng bài tập:
// 1. Trắc nghiệm (multiple_choice)
// 2. Trả lời ngắn / Điền từ (short_answer)
// 3. Sắp xếp từ thành câu (word_reorder)

const STORAGE_KEY = 'tet_custom_questions_bank_v2';

export const DEFAULT_TET_ENGLISH_BANK = [
  // ==========================================
  // LỚP 3
  // ==========================================
  {
    grade: 3,
    units: [
      {
        unit: 1,
        title: 'Unit 1: Hello & Greetings',
        questions: [
          {
            id: 'g3_u1_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'Hello, my name _____ Nam.',
            options: ['is', 'am', 'are', 'be'],
            correctAnswer: 'is',
            explanation: "Với chủ ngữ số ít 'my name', dùng động từ to be 'is'."
          },
          {
            id: 'g3_u1_sa1',
            lesson: 1,
            type: 'short_answer',
            question: 'Nice to meet _____. (Điền 1 từ thích hợp)',
            correctAnswer: 'you',
            hint: 'Từ có 3 chữ cái, nghĩa là "bạn / bạn nhé"',
            explanation: 'Nice to meet you: Rất vui được gặp bạn.'
          },
          {
            id: 'g3_u1_wo1',
            lesson: 1,
            type: 'word_reorder',
            question: 'Sắp xếp các từ sau thành câu chào hỏi:',
            scrambledWords: ['How', 'you', 'are', '?'],
            correctOrder: ['How', 'are', 'you', '?'],
            explanation: 'Câu hỏi thăm sức khỏe: How are you?'
          },
          {
            id: 'g3_u1_mc2',
            lesson: 2,
            type: 'multiple_choice',
            question: 'How are you? - I am _____, thank you.',
            options: ['fine', 'five', 'name', 'hello'],
            correctAnswer: 'fine',
            explanation: "I am fine, thank you: Mình khỏe, cảm ơn bạn."
          },
          {
            id: 'g3_u1_sa2',
            lesson: 2,
            type: 'short_answer',
            question: 'Goodbye, see you _____! (Điền 1 từ thích hợp)',
            correctAnswer: 'again',
            hint: 'Từ có 5 chữ cái, bắt đầu bằng chữ a...',
            explanation: 'See you again: Hẹn gặp lại bạn.'
          },
          {
            id: 'g3_u1_wo2',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp các từ sau thành câu giới thiệu tên:',
            scrambledWords: ['is', 'My', 'Mai', '.', 'name'],
            correctOrder: ['My', 'name', 'is', 'Mai', '.'],
            explanation: 'Cấu trúc giới thiệu tên: My name is Mai.'
          }
        ]
      },
      {
        unit: 2,
        title: 'Unit 2: Our Names',
        questions: [
          {
            id: 'g3_u2_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: "What's _____ name? - My name is Peter.",
            options: ['your', 'you', 'he', 'she'],
            correctAnswer: 'your',
            explanation: "Hỏi tên bạn: What is your name?"
          },
          {
            id: 'g3_u2_sa1',
            lesson: 2,
            type: 'short_answer',
            question: 'How do you spell your _____? (Điền từ)',
            correctAnswer: 'name',
            hint: 'Từ có 4 chữ cái, có nghĩa là "tên"',
            explanation: 'How do you spell your name? (Bạn đánh vần tên như thế nào?)'
          },
          {
            id: 'g3_u2_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu hỏi tên người đối diện:',
            scrambledWords: ['name', 'What', 'is', 'your', '?'],
            correctOrder: ['What', 'is', 'your', 'name', '?'],
            explanation: 'Câu hỏi chuẩn: What is your name?'
          }
        ]
      },
      {
        unit: 3,
        title: 'Unit 3: Our Friends',
        questions: [
          {
            id: 'g3_u3_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'Is this Mary? - Yes, it _____.',
            options: ['is', 'are', 'am', "isn't"],
            correctAnswer: 'is',
            explanation: "Câu trả lời khẳng định với 'Is this...': Yes, it is."
          },
          {
            id: 'g3_u3_sa1',
            lesson: 2,
            type: 'short_answer',
            question: 'This is my _____, Quan. (Điền 1 từ chỉ "bạn bè")',
            correctAnswer: 'friend',
            hint: 'Từ có 6 chữ cái: f-r-i-...',
            explanation: 'This is my friend: Đây là bạn của mình.'
          },
          {
            id: 'g3_u3_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu giới thiệu bạn bè:',
            scrambledWords: ['my', 'is', 'This', 'friend', '.'],
            correctOrder: ['This', 'is', 'my', 'friend', '.'],
            explanation: 'Cấu trúc: This is my friend.'
          }
        ]
      },
      {
        unit: 4,
        title: 'Unit 4: Our School',
        questions: [
          {
            id: 'g3_u4_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'Is your school big? - Yes, it is _____.',
            options: ['big', 'small', 'new', 'old'],
            correctAnswer: 'big',
            explanation: 'Câu hỏi trường có to không: Yes, it is big.'
          },
          {
            id: 'g3_u4_sa1',
            lesson: 2,
            type: 'short_answer',
            question: 'Go to the _____. (Điền từ chỉ "lớp học")',
            correctAnswer: 'classroom',
            hint: 'Từ ghép bắt đầu bằng class...',
            explanation: 'Go to the classroom: Đi vào phòng học.'
          },
          {
            id: 'g3_u4_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu:',
            scrambledWords: ['school', 'is', 'My', 'big', '.'],
            correctOrder: ['My', 'school', 'is', 'big', '.'],
            explanation: 'Cấu trúc: My school is big.'
          }
        ]
      },
      {
        unit: 5,
        title: 'Unit 5: School Things',
        questions: [
          {
            id: 'g3_u5_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'I have a _____. It is a red pen.',
            options: ['pen', 'ruler', 'book', 'eraser'],
            correctAnswer: 'pen',
            explanation: "Phía sau có gợi ý 'red pen' (bút mực đỏ)."
          },
          {
            id: 'g3_u5_sa1',
            lesson: 2,
            type: 'short_answer',
            question: 'Open your _____ and read. (Điền từ chỉ "quyển sách")',
            correctAnswer: 'book',
            hint: 'Từ có 4 chữ cái, bắt đầu bằng b...',
            explanation: 'Open your book: Mở sách của em ra.'
          },
          {
            id: 'g3_u5_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu nói về đồ dùng học tập:',
            scrambledWords: ['have', 'I', 'a', 'pencil', '.'],
            correctOrder: ['I', 'have', 'a', 'pencil', '.'],
            explanation: 'Cấu trúc sở hữu: I have a pencil.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // LỚP 4
  // ==========================================
  {
    grade: 4,
    units: [
      {
        unit: 1,
        title: 'Unit 1: My Friends & Countries',
        questions: [
          {
            id: 'g4_u1_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'Where are you from? - I am from _____.',
            options: ['Vietnam', 'Vietnamese', 'American', 'English'],
            correctAnswer: 'Vietnam',
            explanation: "Sau 'from' là tên quốc gia: Vietnam."
          },
          {
            id: 'g4_u1_sa1',
            lesson: 2,
            type: 'short_answer',
            question: 'What nationality are you? - I am _____. (Quốc tịch Việt Nam)',
            correctAnswer: 'vietnamese',
            hint: 'Từ chỉ quốc tịch Việt Nam (viết thường hoặc hoa đều được)',
            explanation: 'Quốc tịch người Việt Nam là Vietnamese.'
          },
          {
            id: 'g4_u1_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu hỏi xuất xứ quê hương:',
            scrambledWords: ['Where', 'you', 'from', 'are', '?'],
            correctOrder: ['Where', 'are', 'you', 'from', '?'],
            explanation: 'Câu hỏi quê quán: Where are you from?'
          }
        ]
      },
      {
        unit: 2,
        title: 'Unit 2: Time & Daily Routines',
        questions: [
          {
            id: 'g4_u2_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'What time is it? - It is seven _____ o’clock.',
            options: ['thirty', 'fifteen', 'forty-five', 'sharp'],
            correctAnswer: 'sharp',
            explanation: "It's seven o'clock (đúng 7 giờ)."
          },
          {
            id: 'g4_u2_sa1',
            lesson: 2,
            type: 'short_answer',
            question: 'I get _____ at 6 o’clock in the morning. (Điền giới từ)',
            correctAnswer: 'up',
            hint: 'Từ có 2 chữ cái: get ... nghĩa là thức dậy',
            explanation: 'Cụm từ "get up" có nghĩa là thức dậy.'
          },
          {
            id: 'g4_u2_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu hỏi thời gian:',
            scrambledWords: ['time', 'is', 'What', 'it', '?'],
            correctOrder: ['What', 'time', 'is', 'it', '?'],
            explanation: 'Câu hỏi mấy giờ: What time is it?'
          }
        ]
      }
    ]
  },

  // ==========================================
  // LỚP 5
  // ==========================================
  {
    grade: 5,
    units: [
      {
        unit: 1,
        title: "Unit 1: What's your address?",
        questions: [
          {
            id: 'g5_u1_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'I live _____ 81 Tran Hung Dao Street.',
            options: ['at', 'in', 'on', 'with'],
            correctAnswer: 'at',
            explanation: 'Có số nhà cụ thể dùng giới từ "at".'
          },
          {
            id: 'g5_u1_sa1',
            lesson: 2,
            type: 'short_answer',
            question: "What's the village like? - It's small and _____. (Điền từ có nghĩa là 'yên tĩnh')",
            correctAnswer: 'quiet',
            hint: 'Từ có 5 chữ cái: q-u-i-e-t',
            explanation: 'Quiet: Yên tĩnh, thanh bình.'
          },
          {
            id: 'g5_u1_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu hỏi địa chỉ:',
            scrambledWords: ['your', 'address', 'What', 'is', '?'],
            correctOrder: ['What', 'is', 'your', 'address', '?'],
            explanation: "Câu hỏi địa chỉ: What is your address?"
          }
        ]
      },
      {
        unit: 2,
        title: 'Unit 2: I always get up early. How about you?',
        questions: [
          {
            id: 'g5_u2_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'How often do you go to the cinema? - _____ a month.',
            options: ['Once', 'One', 'First', 'Single'],
            correctAnswer: 'Once',
            explanation: 'Once a month: Mỗi tháng một lần.'
          },
          {
            id: 'g5_u2_sa1',
            lesson: 2,
            type: 'short_answer',
            question: 'I brush my _____ twice a day. (Điền từ chỉ "răng")',
            correctAnswer: 'teeth',
            hint: 'Số nhiều của tooth là t...',
            explanation: 'Brush my teeth: Đánh răng.'
          },
          {
            id: 'g5_u2_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu về thói quen hàng ngày:',
            scrambledWords: ['I', 'always', 'early', 'up', 'get', '.'],
            correctOrder: ['I', 'always', 'get', 'up', 'early', '.'],
            explanation: 'Cấu trúc: I always get up early.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // LỚP 6
  // ==========================================
  {
    grade: 6,
    units: [
      {
        unit: 1,
        title: 'Unit 1: My New School',
        questions: [
          {
            id: 'g6_u1_mc1',
            lesson: 1,
            type: 'multiple_choice',
            question: 'We _____ uniform on Mondays.',
            options: ['wear', 'plays', 'has', 'studies'],
            correctAnswer: 'wear',
            explanation: 'Wear uniform: Mặc đồng phục.'
          },
          {
            id: 'g6_u1_sa1',
            lesson: 2,
            type: 'short_answer',
            question: 'Phong does his _____ after dinner. (Điền từ chỉ "bài tập về nhà")',
            correctAnswer: 'homework',
            hint: 'Từ ghép bắt đầu bằng home...',
            explanation: 'Do homework: Làm bài tập về nhà.'
          },
          {
            id: 'g6_u1_wo1',
            lesson: 3,
            type: 'word_reorder',
            question: 'Sắp xếp câu về trường mới:',
            scrambledWords: ['love', 'I', 'new', 'my', 'school', '.'],
            correctOrder: ['I', 'love', 'my', 'new', 'school', '.'],
            explanation: 'Cấu trúc: I love my new school.'
          }
        ]
      }
    ]
  }
];

// Hàm nạp ngân hàng câu hỏi (Ưu tiên bộ nhớ lưu trữ tùy chỉnh của GV)
export function loadTetBank() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading custom tet bank:', e);
  }
  return DEFAULT_TET_ENGLISH_BANK;
}

// Lưu ngân hàng câu hỏi của GV vào localStorage
export function saveTetBank(bank) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bank));
  } catch (e) {
    console.error('Error saving tet bank:', e);
  }
}

// Khôi phục bộ câu hỏi mẫu từ hệ thống
export function resetTetBankToDefault() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting tet bank:', e);
  }
  return DEFAULT_TET_ENGLISH_BANK;
}

// Hàm lấy danh sách câu hỏi phù hợp theo cấu hình của Thầy Cô (có hỗ trợ Lesson)
export function getFilteredTetQuestions({
  grade = 3,
  unit = 'all',
  lesson = 'all',
  questionType = 'all',
  count = 2,
  bank = null
}) {
  const sourceBank = bank || loadTetBank();
  let pool = [];

  const gradeGroup = sourceBank.find((g) => Number(g.grade) === Number(grade)) || sourceBank[0];

  if (!gradeGroup) return [];

  gradeGroup.units.forEach((u) => {
    if (unit === 'all' || Number(u.unit) === Number(unit)) {
      (u.questions || []).forEach((q) => {
        // Lọc theo Lesson
        const matchLesson = lesson === 'all' || Number(q.lesson || 1) === Number(lesson);
        // Lọc theo Dạng câu hỏi
        const matchType = questionType === 'all' || q.type === questionType;

        if (matchLesson && matchType) {
          pool.push({
            ...q,
            unitNumber: u.unit,
            unitTitle: u.title,
            grade: gradeGroup.grade,
            lesson: q.lesson || 1
          });
        }
      });
    }
  });

  // Nếu không tìm thấy câu với điều kiện gắt, nới lỏng bỏ qua điều kiện Lesson
  if (pool.length === 0) {
    gradeGroup.units.forEach((u) => {
      if (unit === 'all' || Number(u.unit) === Number(unit)) {
        (u.questions || []).forEach((q) => {
          if (questionType === 'all' || q.type === questionType) {
            pool.push({
              ...q,
              unitNumber: u.unit,
              unitTitle: u.title,
              grade: gradeGroup.grade,
              lesson: q.lesson || 1
            });
          }
        });
      }
    });
  }

  // Nếu vẫn rỗng, lấy tất cả câu hỏi của khối lớp đó
  if (pool.length === 0) {
    gradeGroup.units.forEach((u) => {
      (u.questions || []).forEach((q) => {
        pool.push({
          ...q,
          unitNumber: u.unit,
          unitTitle: u.title,
          grade: gradeGroup.grade,
          lesson: q.lesson || 1
        });
      });
    });
  }

  // Xáo trộn ngẫu nhiên bộ câu hỏi
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
