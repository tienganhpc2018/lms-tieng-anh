// QUẢN LÝ DỮ LIỆU BỘ SOẠN ĐỀ, GIAO ĐỀ, CHẤM ĐIỂM TIẾNG ANH 8 GLOBAL SUCCESS
// Key chuẩn lưu trữ LocalStorage kiên cố
export const EXAM_STORAGE_KEYS = {
  ASSIGNED_HOMEWORK: 'tienganh8_assigned_homework_v1',
  EXAM_SUBMISSIONS: 'tienganh8_exam_submissions_v1',
  EXAM_DRAFTS: 'tienganh8_exam_drafts_v1',
  ANNOUNCEMENTS: 'tienganh8_teacher_announcements_v1',
  ACTIVE_ROLE: 'tienganh8_active_role_v1', // 'teacher' | 'student'
};

// 4 Lớp học mặc định theo đúng yêu cầu đề bài
export const DEFAULT_CLASSES = [
  { id: '8a1', name: 'Lớp 8A1', grade: 'Khối 8', count: 38, year: '2025-2026' },
  { id: '8a2', name: 'Lớp 8A2', grade: 'Khối 8', count: 36, year: '2025-2026' },
  { id: '8a3', name: 'Lớp 8A3', grade: 'Khối 8', count: 35, year: '2025-2026' },
  { id: '8a4', name: 'Lớp 8A4', grade: 'Khối 8', count: 37, year: '2025-2026' },
];

// Danh sách học sinh mẫu Lớp 8A1 (có Minh Hằng là học sinh đại diện)
export const DEFAULT_STUDENTS_8A1 = [
  { id: 'hs_8a1_01', name: 'Trần Minh Hằng', gender: 'Nữ', code: 'HS80101', avg: 9.2, attendance: '100%', progress: 95, classId: '8a1' },
  { id: 'hs_8a1_02', name: 'Nguyễn Tuấn Anh', gender: 'Nam', code: 'HS80102', avg: 8.5, attendance: '98%', progress: 88, classId: '8a1' },
  { id: 'hs_8a1_03', name: 'Lê Hoàng Bách', gender: 'Nam', code: 'HS80103', avg: 7.8, attendance: '95%', progress: 80, classId: '8a1' },
  { id: 'hs_8a1_04', name: 'Phạm Quỳnh Chi', gender: 'Nữ', code: 'HS80104', avg: 9.0, attendance: '100%', progress: 92, classId: '8a1' },
  { id: 'hs_8a1_05', name: 'Vũ Quốc Đạt', gender: 'Nam', code: 'HS80105', avg: 8.0, attendance: '96%', progress: 85, classId: '8a1' },
  { id: 'hs_8a1_06', name: 'Đỗ Thùy Dương', gender: 'Nữ', code: 'HS80106', avg: 8.8, attendance: '99%', progress: 90, classId: '8a1' },
  { id: 'hs_8a1_07', name: 'Hoàng Minh Đức', gender: 'Nam', code: 'HS80107', avg: 7.5, attendance: '94%', progress: 75, classId: '8a1' },
  { id: 'hs_8a1_08', name: 'Bùi Khánh Linh', gender: 'Nữ', code: 'HS80108', avg: 9.4, attendance: '100%', progress: 98, classId: '8a1' },
  { id: 'hs_8a1_09', name: 'Đặng Bảo Nam', gender: 'Nam', code: 'HS80109', avg: 8.2, attendance: '97%', progress: 84, classId: '8a1' },
  { id: 'hs_8a1_10', name: 'Ngô Thảo Nguyên', gender: 'Nữ', code: 'HS80110', avg: 8.7, attendance: '98%', progress: 89, classId: '8a1' },
];

// Bộ đề kiểm tra 5 phần mẫu chuẩn GDPT 2018 (Tiếng Anh 8 Global Success - Unit 1, 2, 3)
export const SEED_EXAMS = [
  {
    id: 'exam_ta8_gk1_01',
    title: 'ĐỀ KIỂM TRA GIỮA HỌC KÌ I - TIẾNG ANH 8 GLOBAL SUCCESS',
    grade: 'Khối 8',
    year: '2025-2026',
    book: 'Global Success (Bộ GD&ĐT)',
    durationMinutes: 45,
    totalPoints: 10,
    targetClasses: ['8A1', '8A2'],
    dueDate: '2026-10-30T23:59',
    status: 'open', // 'open' (Đang mở cho lớp) | 'draft' (Bản nháp)
    assignedDate: '2026-10-18T08:00',
    audioUrlTask1: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=english-listening-test-sample.mp3',
    audioUrlTask2: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=short-uk-dialogue.mp3',
    audioUrlTask3: '',
    audioTranscript: 'Welcome to the English listening test for Grade 8. Today we are talking about life in the countryside and how teenagers spend their leisure time. Many young people enjoy making crafts, playing sports, and spending time outdoors with their family...',
    
    // PHẦN 1: LISTENING (2.0 điểm)
    listening: {
      task1: {
        instruction: 'Part 1: Listen to the recording and fill in each blank with NO MORE THAN TWO WORDS.',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=english-listening-test-sample.mp3',
        questions: [
          { id: 'l1_1', text: '1. Most teenagers in the countryside enjoy spending their leisure time doing ________ activities.', answer: 'outdoor', points: 0.25 },
          { id: 'l1_2', text: '2. Nam and his friends usually go ________ along the river bank after school.', answer: 'kite flying', points: 0.25 },
          { id: 'l1_3', text: '3. Life in a rural village is often described as peaceful and ________.', answer: 'simple', points: 0.25 },
          { id: 'l1_4', text: '4. During the harvest season, local farmers work from early morning until ________.', answer: 'sunset', points: 0.25 },
        ]
      },
      task2: {
        instruction: 'Part 2: Listen to the conversation and choose the best answer (A, B, C or D).',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=short-uk-dialogue.mp3',
        questions: [
          {
            id: 'l2_1',
            text: '5. What is the speaker’s favourite leisure activity?',
            options: ['A. Playing online games', 'B. Making origami models', 'C. Surfing social media', 'D. Watching television'],
            correct: 'B',
            points: 0.25
          },
          {
            id: 'l2_2',
            text: '6. Who introduced him to this exciting hobby?',
            options: ['A. His art teacher', 'B. His grandmother', 'C. His elder sister', 'D. A school counsellor'],
            correct: 'C',
            points: 0.25
          },
          {
            id: 'l2_3',
            text: '7. How often does he practice his craft project?',
            options: ['A. Every single day', 'B. Twice a week', 'C. Only on Sundays', 'D. Once a month'],
            correct: 'B',
            points: 0.25
          },
          {
            id: 'l2_4',
            text: '8. What is the main benefit of this hobby mentioned by the boy?',
            options: ['A. Making a lot of money', 'B. Becoming famous online', 'C. Reducing study stress and relaxing', 'D. Winning school prizes'],
            correct: 'C',
            points: 0.25
          }
        ]
      }
    },

    // PHẦN 2: KNOWLEDGE OF LANGUAGE (2.5 điểm)
    language: {
      phonetics: [
        {
          id: 'lang_ph1',
          text: '9. Choose the word whose underlined part is pronounced differently from the others:',
          options: ['A. leisure', 'B. ensure', 'C. measure', 'D. pleasure'],
          correct: 'B',
          explanation: 'Phần gạch chân "s" ở "ensure" phát âm là /ʃ/, trong khi các từ còn lại phát âm là /ʒ/.',
          points: 0.25
        },
        {
          id: 'lang_ph2',
          text: '10. Choose the word that has a different stress pattern from the others:',
          options: ['A. balance', 'B. cattle', 'C. prefer', 'D. pasture'],
          correct: 'C',
          explanation: '"prefer" có trọng âm rơi vào âm tiết thứ 2 (/prɪˈfɜːr/), các từ còn lại trọng âm rơi vào âm tiết thứ 1.',
          points: 0.25
        }
      ],
      leaflet: {
        title: 'Read the following leaflet about Teen Healthy Habits and choose the correct answer for questions 11-14:',
        content: `HEALTHY LIVING TIPS FOR TEENS\nDo you often feel stressed out before exams? Follow our 4 gold tips:\nFirst, maintain a well-balanced diet with plenty of vegetables and fruits (11) ________ your immune system. Second, take regular exercise instead of spending hours on your smartphone (12) ________ games. Third, talk to your friends or the school (13) ________ when feeling down. Finally, make sure to get at least 8 hours of sleep so you can concentrate (14) ________ your lessons next morning!`,
        questions: [
          { id: 'lf_11', text: 'Question 11:', options: ['A. boost', 'B. to boost', 'C. boosted', 'D. boosting'], correct: 'B', points: 0.25 },
          { id: 'lf_12', text: 'Question 12:', options: ['A. play', 'B. played', 'C. playing', 'D. to play'], correct: 'C', points: 0.25 },
          { id: 'lf_13', text: 'Question 13:', options: ['A. counsellor', 'B. artisan', 'C. firefighter', 'D. breadwinner'], correct: 'A', points: 0.25 },
          { id: 'lf_14', text: 'Question 14:', options: ['A. in', 'B. with', 'C. on', 'D. for'], correct: 'C', points: 0.25 },
        ]
      },
      announcement: {
        title: 'SCHOOL NOTICE BOARD: RURAL EXPERIENCE FIELD TRIP',
        content: `The Youth Union announces our upcoming field trip to Duong Lam Ancient Village on Saturday, 25th October. All grade 8 students must assemble at the school gate at 6:30 AM (15) ________. Please wear school uniform and bring a notebook to record information about traditional architecture and local (16) ________ crafts.`,
        questions: [
          { id: 'ann_15', text: 'Question 15:', options: ['A. sharp', 'B. sharply', 'C. sharpen', 'D. sharpness'], correct: 'A', points: 0.25 },
          { id: 'ann_16', text: 'Question 16:', options: ['A. artisan', 'B. handmade', 'C. electrical', 'D. modern'], correct: 'B', points: 0.25 },
        ]
      }
    },

    // PHẦN 3: READING (2.5 điểm)
    reading: {
      part1: {
        title: 'Part 1: Life in Duong Lam Ancient Village',
        credit: 'Adapted from Vietnam National Tourism Administration',
        passage: `Duong Lam Ancient Village is located in Son Tay Town, about 44 km from Hanoi centre. It is the first ancient village in Vietnam recognised as a national historical and cultural relic. What makes Duong Lam special is its preserved laterite houses (nhà đá ong) that are over 300 years old.\nVillagers here maintain a peaceful and slow-paced lifestyle. In the early morning, elderly people often gather at the communal house yard to drink hot green tea and chat about daily farm work. Children walk or ride bicycles to school through winding brick alleys. Visiting Duong Lam offers tourists an authentic glimpse into the traditional culture of the Red River Delta.`,
        questions: [
          { id: 'r1_1', text: '17. Duong Lam is situated about 44 kilometres from central Hanoi.', options: ['True', 'False'], correct: 'True', points: 0.25 },
          { id: 'r1_2', text: '18. All ancient houses in the village are made of modern bricks and glass.', options: ['True', 'False'], correct: 'False', points: 0.25 },
          { id: 'r1_3', text: '19. The village is known for its fast-paced and noisy commercial lifestyle.', options: ['True', 'False'], correct: 'False', points: 0.25 },
          { id: 'r1_4', text: '20. Elderly villagers usually drink green tea together at the communal house.', options: ['True', 'False'], correct: 'True', points: 0.25 },
          { id: 'r1_5', text: '21. Visiting Duong Lam helps tourists understand traditional northern rural culture.', options: ['True', 'False'], correct: 'True', points: 0.25 },
        ]
      },
      part2: {
        title: 'Part 2: Teen Leisure Time and Digital Devices',
        credit: 'From Global Success 8 - Reading Extension',
        passage: `In recent years, the way teenagers spend their spare time has changed dramatically. A decade ago, young people engaged more in outdoor games like football, badminton, or cycling around the neighbourhood. Today, a large number of teens prefer staying indoors, scrolling through social media feeds, or playing multiplayer online games.\nWhile technology connects friends across long distances, excessive screen time leads to physical fatigue and poor concentration at school. Health experts suggest teenagers should balance their leisure time: spend at least 45 minutes daily on physical activities and engage in hands-on hobbies like cooking, drawing, or DIY crafts.`,
        questions: [
          {
            id: 'r2_1',
            text: '22. What is the passage mainly about?',
            options: [
              'A. How to build a computer game',
              'B. Changes in teen leisure activities and advice for a balanced life',
              'C. The history of sports in secondary schools',
              'D. How to become popular on social media'
            ],
            correct: 'B',
            points: 0.25
          },
          {
            id: 'r2_2',
            text: '23. Ten years ago, teenagers used to spend more time ________.',
            options: [
              'A. watching television until midnight',
              'B. shopping online with credit cards',
              'C. playing outdoor sports and games',
              'D. texting on smartphones'
            ],
            correct: 'C',
            points: 0.25
          },
          {
            id: 'r2_3',
            text: '24. According to the text, what can excessive screen time cause?',
            options: [
              'A. Better memory and higher exam scores',
              'B. Greater musical talent',
              'C. Physical fatigue and poor concentration',
              'D. Stronger bones and muscles'
            ],
            correct: 'C',
            points: 0.25
          },
          {
            id: 'r2_4',
            text: '25. What do health experts recommend teenagers do every day?',
            options: [
              'A. Play video games for at least 3 hours',
              'B. Spend 45 minutes on physical activity',
              'C. Avoid speaking to friends online',
              'D. Sleep all afternoon'
            ],
            correct: 'B',
            points: 0.25
          },
          {
            id: 'r2_5',
            text: '26. The word "engage in" in paragraph 2 is closest in meaning to ________.',
            options: ['A. take part in', 'B. look down on', 'C. give up', 'D. turn off'],
            correct: 'A',
            points: 0.25
          }
        ]
      }
    },

    // PHẦN 4: COMMUNICATION (1.0 điểm)
    communication: [
      {
        id: 'comm_1',
        context: 'Mark invites Nam to join his basketball club this Sunday.',
        dialogue: 'Mark: "Would you like to play basketball with our team this Sunday afternoon?"\nNam: "________"',
        options: [
          'A. Yes, I’d love to. What time does it start?',
          'B. No, you can’t play now.',
          'C. Never mind, it is not my problem.',
          'D. You are welcome.'
        ],
        correct: 'A',
        points: 0.5
      },
      {
        id: 'comm_2',
        context: 'Hoa is asking the teacher about the project due date.',
        dialogue: 'Hoa: "Excuse me, teacher. Could you please remind us of the due date for the English video project?"\nTeacher: "________"',
        options: [
          'A. It’s very expensive to buy.',
          'B. The deadline is next Friday, October 31st.',
          'C. I don’t like making videos.',
          'D. You should turn off your laptop.'
        ],
        correct: 'B',
        points: 0.5
      }
    ],

    // PHẦN 5: WRITING (2.0 điểm)
    writing: {
      sentenceBuilding: [
        {
          id: 'w_build_1',
          cues: 'Life / in / countryside / be / more / peaceful / than / life / in / city / .',
          correct: 'Life in the countryside is more peaceful than life in the city.',
          points: 0.25
        },
        {
          id: 'w_build_2',
          cues: 'Teenagers / should / divide / their / time / wisely / between / study / and / rest / .',
          correct: 'Teenagers should divide their time wisely between study and rest.',
          points: 0.25
        }
      ],
      sentenceTransformation: [
        {
          id: 'w_trans_1',
          original: 'Mai is interested in making DIY crafts in her spare time.',
          startWith: 'Mai enjoys',
          correct: 'Mai enjoys making DIY crafts in her spare time.',
          points: 0.25
        },
        {
          id: 'w_trans_2',
          original: 'He started learning to play the guitar two years ago.',
          startWith: 'He has',
          correct: 'He has learned to play the guitar for two years.',
          points: 0.25
        }
      ],
      paragraph: {
        topic: 'Write a paragraph (80 - 100 words) about your favourite leisure activity or life in your neighbourhood.',
        cues: [
          'What is your favourite leisure activity / neighbourhood feature?',
          'How often do you do it, or who do you do it with?',
          'Why do you enjoy it and what benefits does it bring to your life?'
        ],
        points: 1.0,
        sampleEssay: 'My favourite leisure activity is cycling around my neighbourhood with my best friends every Saturday afternoon. Our neighbourhood is quiet, green, and full of shade from tall trees. Cycling not only allows me to enjoy the fresh breeze, but it also keeps me healthy and energetic after long hours of studying. Moreover, chatting and laughing with friends helps me reduce school stress and feel refreshed for the new week.'
      }
    },

    // Cấu trúc sections tương thích chuẩn
    sections: {
      listening: {
        task1: {
          instruction: 'Part 1: Listen to the recording and fill in each blank with NO MORE THAN TWO WORDS.',
          audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=english-listening-test-sample.mp3',
          questions: [
            { id: 'l1_1', number: 1, prompt: '1. Most teenagers in the countryside enjoy spending their leisure time doing ________ activities.', correctAnswer: 'outdoor', explanation: 'Bài nghe: doing outdoor activities' },
            { id: 'l1_2', number: 2, prompt: '2. Nam and his friends usually go ________ along the river bank after school.', correctAnswer: 'kite flying', explanation: 'Bài nghe: go kite flying' },
            { id: 'l1_3', number: 3, prompt: '3. Life in a rural village is often described as peaceful and ________.', correctAnswer: 'simple', explanation: 'Bài nghe: peaceful and simple' },
            { id: 'l1_4', number: 4, prompt: '4. During the harvest season, local farmers work from early morning until ________.', correctAnswer: 'sunset', explanation: 'Bài nghe: work until sunset' }
          ]
        },
        task2: {
          instruction: 'Part 2: Listen to the conversation and choose the best answer (A, B, C or D).',
          audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=short-uk-dialogue.mp3',
          questions: [
            { id: 'l2_1', number: 5, prompt: '5. What is the speaker’s favourite leisure activity?', options: ['Playing online games', 'Making origami models', 'Surfing social media', 'Watching television'], correctAnswer: 'B', explanation: 'Making origami models' },
            { id: 'l2_2', number: 6, prompt: '6. Who introduced him to this exciting hobby?', options: ['His art teacher', 'His grandmother', 'His elder sister', 'A school counsellor'], correctAnswer: 'C', explanation: 'His elder sister' },
            { id: 'l2_3', number: 7, prompt: '7. How often does he practice his craft project?', options: ['Every single day', 'Twice a week', 'Only on Sundays', 'Once a month'], correctAnswer: 'B', explanation: 'Twice a week' },
            { id: 'l2_4', number: 8, prompt: '8. What is the main benefit of this hobby mentioned by the boy?', options: ['Making a lot of money', 'Becoming famous online', 'Reducing study stress and relaxing', 'Winning school prizes'], correctAnswer: 'C', explanation: 'Reducing study stress and relaxing' }
          ]
        }
      },
      languageFocus: {
        questions: [
          { id: 'lf_9', number: 9, prompt: 'Choose the word whose underlined part is pronounced differently: leisure / ensure / measure / pleasure', options: ['leisure', 'ensure', 'measure', 'pleasure'], correctAnswer: 'B', explanation: '"ensure" phát âm là /ʃ/, các từ còn lại là /ʒ/.' },
          { id: 'lf_10', number: 10, prompt: 'Choose the word with different stress pattern: balance / cattle / prefer / pasture', options: ['balance', 'cattle', 'prefer', 'pasture'], correctAnswer: 'C', explanation: '"prefer" có trọng âm 2, các từ còn lại trọng âm 1.' },
          { id: 'lf_11', number: 11, prompt: 'First, maintain a well-balanced diet (11) ________ your immune system.', options: ['boost', 'to boost', 'boosted', 'boosting'], correctAnswer: 'B', explanation: 'Dùng to-V chỉ mục đích.' },
          { id: 'lf_12', number: 12, prompt: 'Second, take regular exercise instead of spending hours on your smartphone (12) ________ games.', options: ['play', 'played', 'playing', 'to play'], correctAnswer: 'C', explanation: 'spend time doing sth.' },
          { id: 'lf_13', number: 13, prompt: 'Third, talk to your friends or the school (13) ________ when feeling down.', options: ['counsellor', 'artisan', 'firefighter', 'breadwinner'], correctAnswer: 'A', explanation: 'school counsellor: chuyên viên tư vấn trường học.' },
          { id: 'lf_14', number: 14, prompt: 'Finally, make sure to get at least 8 hours of sleep so you can concentrate (14) ________ your lessons next morning!', options: ['in', 'with', 'on', 'for'], correctAnswer: 'C', explanation: 'concentrate on: tập trung vào.' },
          { id: 'lf_15', number: 15, prompt: 'All grade 8 students must assemble at the school gate at 6:30 AM (15) ________.', options: ['sharp', 'sharply', 'sharpen', 'sharpness'], correctAnswer: 'A', explanation: '6:30 AM sharp: đúng 6 giờ 30.' },
          { id: 'lf_16', number: 16, prompt: 'Please wear school uniform and bring a notebook to record information about traditional architecture and local (16) ________ crafts.', options: ['artisan', 'handmade', 'electrical', 'modern'], correctAnswer: 'B', explanation: 'handmade crafts: đồ thủ công làm bằng tay.' },
          { id: 'lf_17', number: 17, prompt: 'Nam is very keen ________ playing traditional musical instruments.', options: ['on', 'in', 'at', 'with'], correctAnswer: 'A', explanation: 'keen on: đam mê, thích.' },
          { id: 'lf_18', number: 18, prompt: 'Life in the countryside moves ________ than in big bustling cities.', options: ['more slowly', 'slowlier', 'slower', 'slowly'], correctAnswer: 'A', explanation: 'So sánh hơn của trạng từ slowly: more slowly.' }
        ]
      },
      reading: {
        passage1: {
          text: 'Duong Lam Ancient Village is located in Son Tay Town, about 44 km from Hanoi centre. It is the first ancient village in Vietnam recognised as a national historical and cultural relic. What makes Duong Lam special is its preserved laterite houses that are over 300 years old. Villagers maintain a peaceful and slow-paced lifestyle.',
          questions: [
            { id: 'r1_19', number: 19, prompt: 'Duong Lam is located in Son Tay Town.', options: ['True', 'False'], correctAnswer: 'A', explanation: 'Thông tin trong bài đọc: about 44 km from Hanoi centre.' },
            { id: 'r1_20', number: 20, prompt: 'The ancient houses are built with laterite bricks over 300 years old.', options: ['True', 'False'], correctAnswer: 'A', explanation: 'Chính xác.' },
            { id: 'r1_21', number: 21, prompt: 'The village lifestyle is fast-paced and noisy.', options: ['True', 'False'], correctAnswer: 'B', explanation: 'Ngược lại: peaceful and slow-paced.' },
            { id: 'r1_22', number: 22, prompt: 'Children usually ride bicycles or walk to school.', options: ['True', 'False'], correctAnswer: 'A', explanation: 'Đúng theo nội dung bài đọc.' },
            { id: 'r1_23', number: 23, prompt: 'Visiting Duong Lam offers tourists an authentic glimpse into northern rural culture.', options: ['True', 'False'], correctAnswer: 'A', explanation: 'Đúng.' }
          ]
        },
        passage2: {
          text: 'In recent years, the way teenagers spend their spare time has changed dramatically. A decade ago, young people engaged more in outdoor games like football or cycling. Today, a large number of teens prefer staying indoors, scrolling through social media feeds, or playing online games. Excessive screen time leads to physical fatigue and poor concentration. Health experts suggest teenagers should balance their leisure time: spend at least 45 minutes daily on physical activities and engage in hands-on hobbies like cooking, drawing, or DIY crafts.',
          questions: [
            { id: 'r2_24', number: 24, prompt: 'What is the passage mainly about?', options: ['Building online games', 'Changes in teen leisure activities and tips for a balanced life', 'Sports history', 'Social media popularity'], correctAnswer: 'B', explanation: 'Đoạn văn nói về sự thay đổi sở thích và lời khuyên cân bằng.' },
            { id: 'r2_25', number: 25, prompt: 'Ten years ago, teenagers used to spend more time ________.', options: ['watching TV until midnight', 'shopping online', 'playing outdoor sports and games', 'texting on phones'], correctAnswer: 'C', explanation: 'engaged more in outdoor games' },
            { id: 'r2_26', number: 26, prompt: 'According to the text, what can excessive screen time cause?', options: ['Better memory', 'Musical talent', 'Physical fatigue and poor concentration', 'Stronger bones'], correctAnswer: 'C', explanation: 'mệt mỏi thể chất và kém tập trung.' },
            { id: 'r2_27', number: 27, prompt: 'What do health experts recommend teenagers do every day?', options: ['Play video games 3 hours', 'Spend 45 minutes on physical activity', 'Avoid talking to friends', 'Sleep all afternoon'], correctAnswer: 'B', explanation: '45 minutes daily on physical activities' },
            { id: 'r2_28', number: 28, prompt: 'The phrase "engage in" is closest in meaning to ________.', options: ['take part in', 'look down on', 'give up', 'turn off'], correctAnswer: 'A', explanation: 'engage in = tham gia = take part in.' }
          ]
        }
      },
      communication: {
        questions: [
          { id: 'c_29', number: 29, prompt: 'Mark: "Would you like to play basketball with our team this Sunday?" — Nam: "________"', options: ['Yes, I’d love to. What time does it start?', 'No, you can’t play now.', 'Never mind, it is not my problem.', 'You are welcome.'], correctAnswer: 'A', explanation: 'Lời đáp lại lời mời lịch sự.' },
          { id: 'c_30', number: 30, prompt: 'Hoa: "Excuse me, teacher. Could you please remind us of the due date for the English video project?" — Teacher: "________"', options: ['It’s very expensive.', 'The deadline is next Friday, October 31st.', 'I don’t like making videos.', 'You should turn off your laptop.'], correctAnswer: 'B', explanation: 'Cung cấp hạn nộp bài.' },
          { id: 'c_31', number: 31, prompt: 'Tom: "Congratulations on winning first prize in the English speaking contest!" — Lan: "________"', options: ['Thanks a lot. That’s very kind of you.', 'You must be joking!', 'No problem at all.', 'It’s too bad.'], correctAnswer: 'A', explanation: 'Đáp lại lời chúc mừng.' },
          { id: 'c_32', number: 32, prompt: 'Mai: "How about going cycling around West Lake this afternoon?" — Phong: "________"', options: ['That sounds great!', 'I don’t care.', 'It’s too good.', 'You are right.'], correctAnswer: 'A', explanation: 'Đồng ý với lời rủ đi xe đạp.' }
        ]
      },
      writing: {
        task1: {
          questions: [
            { id: 'w1_33', number: 33, prompt: 'Life / in / countryside / be / more / peaceful / than / life / in / city / .', suggestedAnswer: 'Life in the countryside is more peaceful than life in the city.' },
            { id: 'w1_34', number: 34, prompt: 'Teenagers / should / divide / their / time / wisely / between / study / and / rest / .', suggestedAnswer: 'Teenagers should divide their time wisely between study and rest.' },
            { id: 'w1_35', number: 35, prompt: 'He / spend / two / hours / do / volunteer / work / every / weekend / .', suggestedAnswer: 'He spends two hours doing volunteer work every weekend.' },
            { id: 'w1_36', number: 36, prompt: 'People / in / rural / areas / live / close / to / nature / than / city / dwellers / .', suggestedAnswer: 'People in rural areas live closer to nature than city dwellers.' }
          ]
        },
        task2: {
          questions: [
            { id: 'w2_37', number: 37, prompt: 'Mai is interested in making DIY crafts in her spare time. ➔ Mai enjoys...', suggestedAnswer: 'Mai enjoys making DIY crafts in her spare time.' },
            { id: 'w2_38', number: 38, prompt: 'He started learning to play the guitar two years ago. ➔ He has...', suggestedAnswer: 'He has learned to play the guitar for two years.' },
            { id: 'w2_39', number: 39, prompt: 'No one in my class can run faster than David. ➔ David is the...', suggestedAnswer: 'David is the fastest runner in my class.' },
            { id: 'w2_40', number: 40, prompt: 'Nam loves playing football after school. (fond) ➔ Nam is...', suggestedAnswer: 'Nam is fond of playing football after school.' }
          ]
        },
        paragraph: {
          prompt: 'Write a paragraph (80 - 100 words) about your favourite leisure activity or life in your neighbourhood.',
          guidance: 'Mention activity, how often, who with, and benefits.',
          sampleParagraph: 'My favourite leisure activity is cycling around my neighbourhood with my best friends every Saturday afternoon. Our neighbourhood is quiet, green, and full of shade from tall trees. Cycling not only allows me to enjoy the fresh breeze, but it also keeps me healthy and energetic after long hours of studying. Moreover, chatting and laughing with friends helps me reduce school stress and feel refreshed for the new week.'
        }
      }
    }
  }
];

// Hàm chuẩn hóa bảo đảm luôn có sections đầy đủ
export const normalizeExam = (exam) => {
  if (!exam) return SEED_EXAMS[0];
  const base = SEED_EXAMS[0];
  const listening = exam?.sections?.listening || exam?.listening || base?.sections?.listening || {};
  const languageFocus = exam?.sections?.languageFocus || exam?.language || base?.sections?.languageFocus || {};
  const reading = exam?.sections?.reading || exam?.reading || base?.sections?.reading || {};
  const communication = exam?.sections?.communication || exam?.communication || base?.sections?.communication || [];
  const writing = exam?.sections?.writing || exam?.writing || base?.sections?.writing || {};

  return {
    ...base,
    ...exam,
    listening: exam.listening || base.listening,
    language: exam.language || base.language,
    reading: exam.reading || base.reading,
    communication: exam.communication || base.communication,
    writing: exam.writing || base.writing,
    sections: {
      listening,
      languageFocus,
      reading,
      communication,
      writing
    }
  };
};

// Các tiện ích load & save LocalStorage
export const loadAssignedExams = () => {
  try {
    const raw = localStorage.getItem(EXAM_STORAGE_KEYS.ASSIGNED_HOMEWORK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeExam);
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc assigned exams:', e);
  }
  // Mặc định lưu SEED_EXAMS vào để lần sau dùng luôn
  const normalizedSeeds = SEED_EXAMS.map(normalizeExam);
  saveAssignedExams(normalizedSeeds);
  return normalizedSeeds;
};

export const saveAssignedExams = (exams) => {
  try {
    localStorage.setItem(EXAM_STORAGE_KEYS.ASSIGNED_HOMEWORK, JSON.stringify(exams));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tienganh8ExamsUpdated', { detail: { exams } }));
    }
  } catch (e) {
    console.error('Lỗi lưu exams:', e);
  }
};

export const loadExamSubmissions = () => {
  try {
    const raw = localStorage.getItem(EXAM_STORAGE_KEYS.EXAM_SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveExamSubmissions = (subs) => {
  try {
    localStorage.setItem(EXAM_STORAGE_KEYS.EXAM_SUBMISSIONS, JSON.stringify(subs));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tienganh8SubmissionsUpdated', { detail: { subs } }));
    }
  } catch (e) {
    console.error('Lỗi lưu submissions:', e);
  }
};

export const loadTeacherAnnouncements = () => {
  try {
    const raw = localStorage.getItem(EXAM_STORAGE_KEYS.ANNOUNCEMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = [
    {
      id: 'ann_01',
      title: '📢 Nhắc nhở: Kiểm tra Giữa Kì 1 môn Tiếng Anh 8',
      content: 'Thầy Hải gửi đề kiểm tra giữa kì cho Lớp 8A1 & 8A2. Các em chú ý ôn tập kĩ từ vựng Unit 1, 2, 3 và chuẩn bị tai nghe để làm phần Listening!',
      sender: 'Thầy Nguyễn Văn Hải',
      date: '18/10/2026',
      target: 'Tất cả các lớp'
    }
  ];
  saveTeacherAnnouncements(defaults);
  return defaults;
};

export const saveTeacherAnnouncements = (anns) => {
  try {
    localStorage.setItem(EXAM_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(anns));
  } catch (e) {}
};

// Quản lý Role Switcher linh hoạt (Giáo viên / Học sinh)
export const getActiveRole = () => {
  try {
    return localStorage.getItem(EXAM_STORAGE_KEYS.ACTIVE_ROLE) || 'teacher';
  } catch (e) {
    return 'teacher';
  }
};

export const setActiveRole = (role) => {
  try {
    localStorage.setItem(EXAM_STORAGE_KEYS.ACTIVE_ROLE, role);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tienganh8RoleChanged', { detail: { role } }));
    }
  } catch (e) {}
};

export const assignExamToClass = (examId, targetClass, deadline, isOpenNow = true) => {
  const exams = loadAssignedExams();
  let updatedExam = null;
  const updatedList = exams.map((ex) => {
    if (ex.id === examId) {
      updatedExam = {
        ...ex,
        assignedClass: targetClass,
        deadline: deadline || ex.deadline,
        status: isOpenNow ? 'published' : 'draft',
        publishedAt: isOpenNow ? new Date().toISOString() : ex.publishedAt
      };
      return updatedExam;
    }
    return ex;
  });

  if (updatedExam) {
    saveAssignedExams(updatedList);
    return updatedExam;
  }
  return null;
};
