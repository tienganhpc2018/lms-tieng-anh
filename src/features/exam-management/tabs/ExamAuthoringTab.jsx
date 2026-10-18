import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Send,
  Edit3,
  BarChart2,
  Share2,
  Clock,
  Award,
  CheckCircle2,
  Volume2,
  HelpCircle,
  Copy,
  Download,
  Database,
  Sparkles,
  BookOpen,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  RotateCcw,
  Headphones,
  Check,
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { SEED_EXAMS, assignExamToClass } from '../examStorage';

export default function ExamAuthoringTab({
  exams = [],
  onPreviewExam,
  onAssignExam,
  onViewProgress,
  onExamCreated
}) {
  const [activeMenu, setActiveMenu] = useState('created'); // 'created' | 'editor' | 'bank' | 'export'
  const [selectedExamForExport, setSelectedExamForExport] = useState(exams[0] || SEED_EXAMS[0]);
  const [copiedNotification, setCopiedNotification] = useState('');

  // Tab điều hướng 5 phần trong Editor (theo đúng Ảnh 1)
  const [currentSection, setCurrentSection] = useState('section1'); // 'all' | 'section1' | 'section2' | 'section3' | 'section4'
  const [listeningSubTab, setListeningSubTab] = useState('part2'); // 'part1' | 'part2' | 'part3' | 'both_2_3'

  // Trạng thái đề thi đang soạn thảo (đầy đủ 41 câu chuẩn theo Ảnh 1 & 2)
  const [examData, setExamData] = useState(() => {
    return {
      title: 'ĐỀ KIỂM TRA ĐỊNH KỲ TIẾNG ANH 8 GLOBAL SUCCESS (HỌC KÌ I)',
      code: 'ENG8-GK1-01',
      durationMinutes: 45,
      totalPoints: 10,
      assignedClass: '8A1, 8A2',
      deadline: '2026-10-30 23:59',

      // SECTION 1: LISTENING (14 câu • 3.5đ)
      listening: {
        // Part 1: Gap Fill (Câu 1 - 4 • 1.0đ)
        part1: {
          topic: "Phong's Country House",
          instruction: 'Part I. Listen to the passage and fill in each blank with ONE suitable word or number. (1.0 mark)',
          audioName: 'Part1_Phongs_Village_GapFill.mp3',
          audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=english-listening-test-sample.mp3',
          points: 1.0,
          questions: [
            { id: 'q1', num: 1, prompt: 'Linh lives with her parents in a country house in a small ________.', answer: 'village', points: 0.25 },
            { id: 'q2', num: 2, prompt: 'In front of her house, there is a beautiful flower ________.', answer: 'garden', points: 0.25 },
            { id: 'q3', num: 3, prompt: 'Her bedroom is on the ________ floor.', answer: 'second', points: 0.25 },
            { id: 'q4', num: 4, prompt: 'Every morning, Linh wakes up at ________ o\'clock.', answer: 'six', points: 0.25 }
          ]
        },

        // Part 2: Multiple Choice (Câu 5 - 10 • 1.5đ)
        part2: {
          topic: 'Conversation between Nick and Elena',
          instruction: 'Listen to a conversation between Nick, who lives in the city, and his cousin Elena, who lives in the countryside.',
          audioName: 'Part2_NickAndElena_Conversation.mp3',
          audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=short-uk-dialogue.mp3',
          points: 1.5,
          questions: [
            {
              id: 'q5',
              num: 5,
              partLabel: 'Part 2 - Câu 1',
              prompt: 'Nick thinks that life in the countryside is more ________ than in the city.',
              options: ['A. boring', 'B. exciting and fast', 'C. peaceful and relaxing', 'D. expensive'],
              correct: 'C',
              explanation: 'Trong bài nghe, Nick khẳng định cuộc sống làng quê yên bình và thư thái hơn.'
            },
            {
              id: 'q6',
              num: 6,
              partLabel: 'Part 2 - Câu 2',
              prompt: 'What did Elena do yesterday afternoon with her village friends?',
              options: ['A. Went shopping at a mall', 'B. Flew kites on the open meadow', 'C. Played online video games', 'D. Watched movies at the cinema'],
              correct: 'B',
              explanation: 'Elena cùng bạn đi thả diều trên đồng cỏ rộng.'
            },
            {
              id: 'q7',
              num: 7,
              partLabel: 'Part 2 - Câu 3',
              prompt: 'How do local villagers usually travel between the villages?',
              options: ['A. By taxi or metro', 'B. By train', 'C. By bicycle or walking', 'D. By airplane'],
              correct: 'C',
              explanation: 'Người dân thường đi bộ hoặc đạp xe trên những con đường làng quanh co.'
            },
            {
              id: 'q8',
              num: 8,
              partLabel: 'Part 2 - Câu 4',
              prompt: 'When does the harvest festival take place in the countryside?',
              options: ['A. In early spring', 'B. In late autumn', 'C. In the middle of winter', 'D. Every weekend'],
              correct: 'B',
              explanation: 'Lễ hội mùa gặt diễn ra vào cuối thu khi lúa chín vàng.'
            },
            {
              id: 'q9',
              num: 9,
              partLabel: 'Part 2 - Câu 5',
              prompt: 'What does Nick dislike most when visiting the rural area?',
              options: ['A. The fresh air', 'B. The friendly people', 'C. There are too many mosquitoes at night', 'D. The delicious local food'],
              correct: 'C',
              explanation: 'Nick than phiền về muỗi vào buổi tối.'
            },
            {
              id: 'q10',
              num: 10,
              partLabel: 'Part 2 - Câu 6',
              prompt: 'What is Elena’s dream for her future career?',
              options: ['A. Moving to a bustling city to work in banking', 'B. Becoming an agricultural scientist to help farmers', 'C. Opening a souvenir shop', 'D. Staying at home all day'],
              correct: 'B',
              explanation: 'Elena mong ước trở thành kỹ sư nông nghiệp để giúp đỡ bà con nông dân.'
            }
          ]
        },

        // Part 3: True / False (Câu 11 - 14 • 1.0đ)
        part3: {
          topic: 'Part 3: True / False Statements',
          instruction: 'Part 3: Listen to the audio recording about community life and traditions. Decide whether the statements are True or False.',
          audioName: 'Part3_CommunityLife_TrueFalse.mp3',
          audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_morning.ogg',
          points: 1.0,
          questions: [
            {
              id: 'q11',
              num: 11,
              statement: 'Phong usually spends his Sunday mornings volunteering at the local community library.',
              correct: 'TRUE',
              explanation: 'Phong thường xuyên đến thư viện cộng đồng giúp đỡ xếp sách vào sáng Chủ Nhật.'
            },
            {
              id: 'q12',
              num: 12,
              statement: 'Dream Secondary School is located in Da Nang.',
              correct: 'FALSE',
              explanation: 'Trường THCS Dream nằm ở ngoại thành Hà Nội, không phải Đà Nẵng.'
            },
            {
              id: 'q13',
              num: 13,
              statement: 'Students in the village wear green uniforms every day of the week.',
              correct: 'FALSE',
              explanation: 'Học sinh chỉ mặc đồng phục vào thứ Hai và thứ Sáu.'
            },
            {
              id: 'q14',
              num: 14,
              statement: 'After school, Hoa and her classmates usually help elderly neighbours clean their gardens.',
              correct: 'TRUE',
              explanation: 'Các em học sinh thường xuyên giúp đỡ các cụ già neo đơn quét dọn sân vườn.'
            }
          ]
        }
      },

      // SECTION 2: KNOWLEDGE OF LANGUAGE (10 câu • 2.5đ, Câu 11 - 20)
      language: {
        instruction: 'Section 2: Knowledge of Language - Cloze Passages (Part 1: Leaflet & Part 2: Announcement) - 10 blanks. (2.5 điểm - 10 câu)',
        points: 2.5,
        part1: {
          title: 'JOIN OUR SCHOOL CLUBS!',
          badge: 'Leaflet (Tờ rơi trường học)',
          passage: `Are you looking for an exciting way to spend your free time? Join our school clubs today! We offer a wide range of activities (11) ________ sports, arts, and science. Being part of a club helps you develop teamwork skills and make new friends. You can also learn how to (12) ________ your time effectively between studying and relaxing. Don't worry if you are shy; our friendly club leaders will always (13) ________ you warmly. Remember that participating in extracurricular activities is (14) ________ important for your personal growth. Contact Ms. Hoa in Room 204 or register online (15) ________ Friday!`,
          questions: [
            {
              id: 'lang_p1_11',
              num: 11,
              blankLabel: 'Câu 11 (Vị trí 11):',
              options: ['A. such as', 'B. for example', 'C. like as', 'D. as well'],
              correct: 'A',
              points: 0.25,
              explanation: '"such as" dùng để liệt kê các ví dụ cụ thể (sports, arts, and science).'
            },
            {
              id: 'lang_p1_12',
              num: 12,
              blankLabel: 'Câu 12 (Vị trí 12):',
              options: ['A. manage', 'B. waste', 'C. spend', 'D. lose'],
              correct: 'A',
              points: 0.25,
              explanation: 'manage your time: quản lý thời gian hiệu quả.'
            },
            {
              id: 'lang_p1_13',
              num: 13,
              blankLabel: 'Câu 13 (Vị trí 13):',
              options: ['A. welcome', 'B. welcoming', 'C. welcomed', 'D. welcomes'],
              correct: 'A',
              points: 0.25,
              explanation: 'Sau will là động từ nguyên mẫu không "to" (will welcome).'
            },
            {
              id: 'lang_p1_14',
              num: 14,
              blankLabel: 'Câu 14 (Vị trí 14):',
              options: ['A. extremely', 'B. extreme', 'C. extremeness', 'D. extremity'],
              correct: 'A',
              points: 0.25,
              explanation: 'Cần trạng từ "extremely" để bổ nghĩa cho tính từ "important".'
            },
            {
              id: 'lang_p1_15',
              num: 15,
              blankLabel: 'Câu 15 (Vị trí 15):',
              options: ['A. before', 'B. after', 'C. during', 'D. since'],
              correct: 'A',
              points: 0.25,
              explanation: '"before Friday": trước thứ Sáu để kịp hạn đăng ký.'
            }
          ]
        },
        part2: {
          title: 'ANNOUNCEMENT: FIELD TRIP TO DUONG LAM ANCIENT VILLAGE',
          badge: 'Announcement (Thông báo)',
          passage: `The School Youth Union is pleased to announce our annual field trip for Grade 8 students.
Details of the trip:
- Destination: Duong Lam Ancient Village, Son Tay, Hanoi.
- Departure: 6:30 AM sharp this Sunday from the school main gate.
All students must (16) ________ on time so that the bus can leave as scheduled. You are required to wear your school uniform and bring a notebook to record information about traditional laterite houses. Please listen (17) ________ to the tour guide during the visit. We will also have a friendly cooking contest where you can learn to make traditional cakes (18) ________ the locals. If you have any medical conditions, please (19) ________ your homeroom teacher in advance. Let's make this trip a memorable (20) ________!`,
          questions: [
            {
              id: 'lang_p2_16',
              num: 16,
              blankLabel: 'Câu 16 (Vị trí 16):',
              options: ['A. arrive', 'B. leave', 'C. cancel', 'D. delay'],
              correct: 'A',
              points: 0.25,
              explanation: '"arrive on time": đến đúng giờ.'
            },
            {
              id: 'lang_p2_17',
              num: 17,
              blankLabel: 'Câu 17 (Vị trí 17):',
              options: ['A. attentively', 'B. careless', 'C. quick', 'D. slow'],
              correct: 'A',
              points: 0.25,
              explanation: 'Cần trạng từ "attentively" (chăm chú) bổ nghĩa cho động từ "listen".'
            },
            {
              id: 'lang_p2_18',
              num: 18,
              blankLabel: 'Câu 18 (Vị trí 18):',
              options: ['A. with', 'B. by', 'C. on', 'D. at'],
              correct: 'A',
              points: 0.25,
              explanation: '"make traditional cakes with the locals": cùng với người dân địa phương.'
            },
            {
              id: 'lang_p2_19',
              num: 19,
              blankLabel: 'Câu 19 (Vị trí 19):',
              options: ['A. inform', 'B. hide', 'C. forget', 'D. refuse'],
              correct: 'A',
              points: 0.25,
              explanation: '"inform your teacher": thông báo cho giáo viên chủ nhiệm biết.'
            },
            {
              id: 'lang_p2_20',
              num: 20,
              blankLabel: 'Câu 20 (Vị trí 20):',
              options: ['A. experience', 'B. experiment', 'C. expert', 'D. expensive'],
              correct: 'A',
              points: 0.25,
              explanation: '"a memorable experience": một trải nghiệm đáng nhớ.'
            }
          ]
        }
      },

      // SECTION 3: READING (10 câu • 2.5đ, Câu 21 - 30)
      reading: {
        instruction: 'Section 3: Reading Comprehension (Part 1: True / False • 1.25đ & Part 2: Multiple Choice • 1.25đ)',
        points: 2.5,
        part1: {
          title: 'Nam and Smartphone Addiction',
          badge: 'Part 1: Dạng Đúng / Sai (True / False • 5 câu 1.25đ)',
          instruction: 'Read the passage about Nam and decide whether each statement (21 - 25) is TRUE or FALSE.',
          passage: `Nam used to be an energetic boy who loved playing soccer and riding bicycles with his classmates every afternoon. However, since his parents bought him a smartphone for online learning six months ago, everything has changed. Nam now spends almost all his free time staring at the screen. He plays mobile video games, scrolls through TikTok videos, and chats with virtual friends until past midnight.\nAs a consequence, Nam often feels exhausted during morning classes and cannot concentrate on his lessons. His academic performance has dropped significantly. Furthermore, he rarely talks to his parents or goes outside to exercise. Last week, the school counsellor had a private meeting with Nam and advised him to set a strict screen limit of 1 hour per day and re-engage in outdoor sports with his friends.`,
          questions: [
            {
              id: 'read_p1_21',
              num: 21,
              prompt: 'Nam received a smartphone from his parents six months ago.',
              correct: 'TRUE',
              points: 0.25,
              explanation: 'Bài viết nêu: "since his parents bought him a smartphone for online learning six months ago".'
            },
            {
              id: 'read_p1_22',
              num: 22,
              prompt: 'Nam still plays soccer with his classmates every afternoon.',
              correct: 'FALSE',
              points: 0.25,
              explanation: 'Nam không còn chơi bóng mà dành hầu hết thời gian rảnh vào màn hình điện thoại.'
            },
            {
              id: 'read_p1_23',
              num: 23,
              prompt: 'Staying up late playing games makes Nam feel tired in morning classes.',
              correct: 'TRUE',
              points: 0.25,
              explanation: '"Nam often feels exhausted during morning classes and cannot concentrate".'
            },
            {
              id: 'read_p1_24',
              num: 24,
              prompt: 'His exam grades and academic performance have improved recently.',
              correct: 'FALSE',
              points: 0.25,
              explanation: 'Kết quả học tập giảm sút ("academic performance has dropped significantly").'
            },
            {
              id: 'read_p1_25',
              num: 25,
              prompt: 'The school counsellor advised Nam to limit his daily screen time to 1 hour.',
              correct: 'TRUE',
              points: 0.25,
              explanation: '"advised him to set a strict screen limit of 1 hour per day".'
            }
          ]
        },
        part2: {
          title: 'Strategies to Deal with Teen Stress',
          badge: 'Part 2: Trắc nghiệm 4 lựa chọn (A, B, C, D • 5 câu 1.25đ)',
          instruction: 'Read the following passage and choose the best answer (A, B, C or D) for questions 26 - 30.',
          passage: `Teenagers today face numerous pressures from schoolwork, peer expectations, and future career choices. According to recent surveys, more than 60% of secondary school students report feeling stressed before semester exams. Fortunately, psychologists suggest several practical strategies to help teens manage their emotional well-being effectively.\nFirst, time management is essential. Creating a realistic weekly study timetable allows students to balance homework deadlines and leisure activities without last-minute panic. Second, regular physical activity acts as a natural stress reliever. Just 30 minutes of jogging, swimming, or dancing releases endorphins that improve mood and boost memory. Lastly, teens should never hesitate to communicate their feelings. Talking openly with parents, close friends, or school counsellors provides valuable emotional support and practical solutions.`,
          questions: [
            {
              id: 'read_p2_26',
              num: 26,
              prompt: 'What is the main topic of the passage?',
              options: [
                'A. How to pass entrance exams with high scores',
                'B. Causes and practical strategies to manage teen stress',
                'C. The history of psychology in secondary schools',
                'D. Why teenagers should stop studying completely'
              ],
              correct: 'B',
              points: 0.25,
              explanation: 'Toàn bài nói về áp lực của học sinh và các biện pháp thực tế để kiểm soát căng thẳng.'
            },
            {
              id: 'read_p2_27',
              num: 27,
              prompt: 'According to surveys, how many secondary students feel stressed before exams?',
              options: ['A. Over 60%', 'B. Less than 20%', 'C. Exactly 50%', 'D. Nearly 100%'],
              correct: 'A',
              points: 0.25,
              explanation: '"more than 60% of secondary school students report feeling stressed before semester exams".'
            },
            {
              id: 'read_p2_28',
              num: 28,
              prompt: 'How does creating a weekly study timetable help students?',
              options: [
                'A. It makes them study 14 hours a day',
                'B. It balances homework and leisure without last-minute panic',
                'C. It eliminates the need for physical exercise',
                'D. It costs a lot of money to set up'
              ],
              correct: 'B',
              points: 0.25,
              explanation: '"balance homework deadlines and leisure activities without last-minute panic".'
            },
            {
              id: 'read_p2_29',
              num: 29,
              prompt: 'What happens when teenagers do 30 minutes of physical exercise?',
              options: [
                'A. They feel more stressed than before',
                'B. It releases endorphins that improve mood and memory',
                'C. They immediately fall asleep during daytime',
                'D. Their memory becomes significantly weaker'
              ],
              correct: 'B',
              points: 0.25,
              explanation: '"releases endorphins that improve mood and boost memory".'
            },
            {
              id: 'read_p2_30',
              num: 30,
              prompt: 'The word "essential" in paragraph 2 is closest in meaning to ________.',
              options: ['A. extremely important', 'B. unnecessary', 'C. difficult', 'D. boring'],
              correct: 'A',
              points: 0.25,
              explanation: '"essential" có nghĩa là rất quan trọng, thiết yếu (= extremely important).'
            }
          ]
        }
      },

      // SECTION 4: WRITING (7 câu • 2.5đ, Câu 31 - 37)
      writing: {
        points: 2.5,
        banner: 'Cấu trúc chuẩn Phần Writing (Tổng 2.5 điểm - 3 Parts): Part 1: 0.5m • Part 2: 1.0m • Part 3: 1.0m',
        part1: {
          title: 'Part 1: Sắp xếp câu / đoạn hội thoại (Câu 31 - 32 • 0.5đ)',
          instruction: 'Mark the letter A, B, C, or D to indicate the correct arrangement of the sentences to make a meaningful exchange or paragraph.',
          questions: [
            {
              id: 'writ_p1_31',
              num: 31,
              title: 'Sắp xếp đoạn hội thoại giữa Lan và Ba về kế hoạch cuối tuần:',
              cuesList: [
                'a. That sounds fantastic! What time should we meet at the park?',
                'b. Would you like to go rollerblading with our team this Saturday?',
                'c. How about 8:00 AM near the fountain?'
              ],
              options: ['A. b - a - c', 'B. a - b - c', 'C. c - a - b', 'D. b - c - a'],
              correct: 'A',
              points: 0.25,
              explanation: 'Lời rủ rê (b) -> Nhận lời và hỏi giờ (a) -> Chốt giờ hẹn (c).'
            },
            {
              id: 'writ_p1_32',
              num: 32,
              title: 'Sắp xếp các câu để tạo thành đoạn văn hoàn chỉnh về lợi ích của việc đọc sách:',
              cuesList: [
                'a. Furthermore, it helps teenagers expand vocabulary and improve concentration.',
                'b. Reading books is one of the most beneficial leisure activities for students.',
                'c. First of all, books provide endless knowledge about different cultures and history.'
              ],
              options: ['A. b - c - a', 'B. c - b - a', 'C. a - c - b', 'D. b - a - c'],
              correct: 'A',
              points: 0.25,
              explanation: 'Câu chủ đề mở đoạn (b) -> Ý thứ nhất "First of all" (c) -> Ý tiếp theo "Furthermore" (a).'
            }
          ]
        },
        part2: {
          title: 'Part 2: Viết lại câu không đổi nghĩa (Sentence Transformation • Câu 33 - 36 • 1.0đ)',
          instruction: 'Finish each of the following sentences in such a way that it means the same as the sentence printed before it.',
          questions: [
            {
              id: 'writ_p2_33',
              num: 33,
              original: 'Minh is interested in making origami models in his leisure time.',
              startWith: 'Minh enjoys',
              correct: 'Minh enjoys making origami models in his leisure time.',
              points: 0.25,
              explanation: 'Cấu trúc: be interested in V-ing = enjoy V-ing (thích làm gì).'
            },
            {
              id: 'writ_p2_34',
              num: 34,
              original: 'Life in the countryside is more peaceful than life in the bustling city.',
              startWith: 'Life in the bustling city is',
              correct: 'Life in the bustling city is not as peaceful as life in the countryside.',
              points: 0.25,
              explanation: 'So sánh hơn -> So sánh không bằng: not as/so + adj + as.'
            },
            {
              id: 'writ_p2_35',
              num: 35,
              original: 'They started building this community cultural centre two months ago.',
              startWith: 'They have',
              correct: 'They have built this community cultural centre for two months.',
              points: 0.25,
              explanation: 'Quá khứ đơn (started V-ing ... ago) -> Hiện tại hoàn thành (have V3/ed ... for + khoảng thời gian).'
            },
            {
              id: 'writ_p2_36',
              num: 36,
              original: 'No one in our class can solve complicated maths problems as quickly as Lan.',
              startWith: 'Lan is the',
              correct: 'Lan is the fastest student to solve complicated maths problems in our class.',
              points: 0.25,
              explanation: 'So sánh không ai bằng -> So sánh nhất (Lan is the fastest / Lan can solve ... the most quickly).'
            }
          ]
        },
        part3: {
          title: 'Part 3: Viết đoạn văn tự luận (Paragraph Writing • Câu 37 • 1.0đ)',
          instruction: 'Write a paragraph (80 - 100 words) about a topic specified below.',
          num: 37,
          topic: 'What kind of pressure do you face as a teenager and how do you overcome it?',
          guidance: 'You should mention:\n- What types of pressure you face (homework, exams, parents\' expectations, or peer pressure);\n- How it affects your feelings and daily study;\n- What strategies you use to overcome or reduce this pressure (doing exercise, talking to parents/friends, managing timetable).',
          sampleEssay: 'As a Grade 8 student, the biggest pressure I face is heavy schoolwork and preparation for upcoming exams. Sometimes, high expectations from parents make me feel anxious and exhausted. To overcome this stress, I have adopted several effective habits. First, I create a realistic study timetable so I can finish homework on time without cramming late at night. Second, I spend 30 minutes every afternoon playing badminton with my neighbours to recharge my energy. Finally, whenever I feel overwhelmed, I talk openly with my mother, who always gives me warm encouragement and practical advice.',
          barem: [
            { criteria: 'Task response & Content (Đúng chủ đề, đủ ý)', points: '0.4đ' },
            { criteria: 'Organisation & Coherence (Mạch lạc, có từ nối)', points: '0.3đ' },
            { criteria: 'Vocabulary & Grammar (Đa dạng từ vựng, đúng ngữ pháp)', points: '0.3đ' }
          ]
        }
      }
    };
  });

  const fileInputRefPart1 = useRef(null);
  const fileInputRefPart2 = useRef(null);
  const fileInputRefPart3 = useRef(null);

  const handleCopyText = (text, msg) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(msg || 'Đã sao chép vào bộ nhớ tạm!');
    setTimeout(() => setCopiedNotification(''), 3000);
  };

  // Tải file âm thanh từ máy tính
  const handleUploadAudio = (partKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        [partKey]: {
          ...prev.listening[partKey],
          audioName: file.name,
          audioUrl: fileUrl
        }
      }
    }));
    handleCopyText('', `Đã tải âm thanh "${file.name}" cho ${partKey.toUpperCase()} thành công!`);
  };

  // Khôi phục đề nghe mẫu
  const handleResetListening = () => {
    if (window.confirm('Khôi phục phần Nghe (Listening) về cấu hình chuẩn ban đầu?')) {
      setExamData((prev) => ({
        ...prev,
        listening: JSON.parse(JSON.stringify(SEED_EXAMS[0].sections.listening))
      }));
    }
  };

  // Thêm câu hỏi vào Part 2 (Multiple Choice)
  const handleAddQuestionPart2 = () => {
    const p2Questions = examData.listening.part2.questions;
    const nextNum = p2Questions.length > 0 ? p2Questions[p2Questions.length - 1].num + 1 : 5;
    const newQ = {
      id: `q_p2_${Date.now()}`,
      num: nextNum,
      partLabel: `Part 2 - Câu ${p2Questions.length + 1}`,
      prompt: 'Nick and Elena agree that teenagers should spend more time ________.',
      options: ['A. reading books and doing outdoor sports', 'B. playing computer games', 'C. staying awake late', 'D. drinking soft drinks'],
      correct: 'A',
      explanation: 'Cả hai bạn đều đồng ý nên đọc sách và rèn luyện thể thao ngoài trời.'
    };

    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        part2: {
          ...prev.listening.part2,
          questions: [...prev.listening.part2.questions, newQ]
        }
      }
    }));
  };

  // Xóa câu hỏi Part 2
  const handleDeleteQuestionPart2 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        part2: {
          ...prev.listening.part2,
          questions: prev.listening.part2.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // Thêm câu hỏi vào Part 3 (True / False)
  const handleAddQuestionPart3 = () => {
    const p3Questions = examData.listening.part3.questions;
    const nextNum = p3Questions.length > 0 ? p3Questions[p3Questions.length - 1].num + 1 : 11;
    const newQ = {
      id: `q_p3_${Date.now()}`,
      num: nextNum,
      statement: 'Local authorities are planning to build a new playground for children in Duong Lam.',
      correct: 'TRUE',
      explanation: 'Chính quyền địa phương đang có kế hoạch xây dựng sân chơi mới cho trẻ em.'
    };

    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        part3: {
          ...prev.listening.part3,
          questions: [...prev.listening.part3.questions, newQ]
        }
      }
    }));
  };

  // Xóa câu hỏi Part 3
  const handleDeleteQuestionPart3 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      listening: {
        ...prev.listening,
        part3: {
          ...prev.listening.part3,
          questions: prev.listening.part3.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // ===================== CRUD HANDLERS CHO SECTION 2: LANGUAGE =====================
  // Thêm câu hỏi vào Section 2 Part 1 (Leaflet)
  const handleAddQuestionLanguagePart1 = () => {
    const list = examData.language.part1.questions;
    const nextNum = list.length > 0 ? list[list.length - 1].num + 1 : 11;
    const newQ = {
      id: `lang_p1_${Date.now()}`,
      num: nextNum,
      blankLabel: `Câu ${nextNum} (Vị trí ${nextNum}):`,
      options: ['A. active', 'B. actively', 'C. activity', 'D. activate'],
      correct: 'A',
      points: 0.25,
      explanation: 'Chọn dạng từ loại thích hợp cho vị trí trống.'
    };
    setExamData((prev) => ({
      ...prev,
      language: {
        ...prev.language,
        part1: {
          ...prev.language.part1,
          questions: [...prev.language.part1.questions, newQ]
        }
      }
    }));
  };

  const handleDeleteQuestionLanguagePart1 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      language: {
        ...prev.language,
        part1: {
          ...prev.language.part1,
          questions: prev.language.part1.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // Thêm câu hỏi vào Section 2 Part 2 (Announcement)
  const handleAddQuestionLanguagePart2 = () => {
    const list = examData.language.part2.questions;
    const nextNum = list.length > 0 ? list[list.length - 1].num + 1 : 16;
    const newQ = {
      id: `lang_p2_${Date.now()}`,
      num: nextNum,
      blankLabel: `Câu ${nextNum} (Vị trí ${nextNum}):`,
      options: ['A. remember', 'B. forget', 'C. remind', 'D. remind of'],
      correct: 'A',
      points: 0.25,
      explanation: 'Điền từ vựng chuẩn ngữ cảnh thông báo.'
    };
    setExamData((prev) => ({
      ...prev,
      language: {
        ...prev.language,
        part2: {
          ...prev.language.part2,
          questions: [...prev.language.part2.questions, newQ]
        }
      }
    }));
  };

  const handleDeleteQuestionLanguagePart2 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      language: {
        ...prev.language,
        part2: {
          ...prev.language.part2,
          questions: prev.language.part2.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // ===================== CRUD HANDLERS CHO SECTION 3: READING =====================
  // Thêm câu True/False Part 1
  const handleAddQuestionReadingPart1 = () => {
    const list = examData.reading.part1.questions;
    const nextNum = list.length > 0 ? list[list.length - 1].num + 1 : 21;
    const newQ = {
      id: `read_p1_${Date.now()}`,
      num: nextNum,
      prompt: 'Nam and his classmates usually ride bicycles to school together.',
      correct: 'TRUE',
      points: 0.25,
      explanation: 'Chi tiết được đề cập trong bài đọc hiểu.'
    };
    setExamData((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        part1: {
          ...prev.reading.part1,
          questions: [...prev.reading.part1.questions, newQ]
        }
      }
    }));
  };

  const handleDeleteQuestionReadingPart1 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        part1: {
          ...prev.reading.part1,
          questions: prev.reading.part1.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // Thêm câu MCQ Part 2
  const handleAddQuestionReadingPart2 = () => {
    const list = examData.reading.part2.questions;
    const nextNum = list.length > 0 ? list[list.length - 1].num + 1 : 26;
    const newQ = {
      id: `read_p2_${Date.now()}`,
      num: nextNum,
      prompt: 'What should teenagers do whenever they feel stressed?',
      options: ['A. Talk to counsellors or parents', 'B. Play games all night', 'C. Skip meals', 'D. Stay isolated'],
      correct: 'A',
      points: 0.25,
      explanation: 'Lời khuyên từ các chuyên gia tâm lý trong đoạn văn.'
    };
    setExamData((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        part2: {
          ...prev.reading.part2,
          questions: [...prev.reading.part2.questions, newQ]
        }
      }
    }));
  };

  const handleDeleteQuestionReadingPart2 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      reading: {
        ...prev.reading,
        part2: {
          ...prev.reading.part2,
          questions: prev.reading.part2.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // ===================== CRUD HANDLERS CHO SECTION 4: WRITING =====================
  // Thêm câu Sắp xếp Part 1
  const handleAddQuestionWritingPart1 = () => {
    const list = examData.writing.part1.questions;
    const nextNum = list.length > 0 ? list[list.length - 1].num + 1 : 31;
    const newQ = {
      id: `writ_p1_${Date.now()}`,
      num: nextNum,
      title: 'Sắp xếp các câu để hoàn thành đoạn hội thoại:',
      cuesList: [
        'a. Yes, I would love to join.',
        'b. Are you free this afternoon?',
        'c. Great, see you at 3 PM!'
      ],
      options: ['A. b - a - c', 'B. a - b - c', 'C. c - a - b', 'D. b - c - a'],
      correct: 'A',
      points: 0.25,
      explanation: 'Trình tự hợp lý của đoạn hội thoại giao tiếp.'
    };
    setExamData((prev) => ({
      ...prev,
      writing: {
        ...prev.writing,
        part1: {
          ...prev.writing.part1,
          questions: [...prev.writing.part1.questions, newQ]
        }
      }
    }));
  };

  const handleDeleteQuestionWritingPart1 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      writing: {
        ...prev.writing,
        part1: {
          ...prev.writing.part1,
          questions: prev.writing.part1.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // Thêm câu Viết lại Part 2
  const handleAddQuestionWritingPart2 = () => {
    const list = examData.writing.part2.questions;
    const nextNum = list.length > 0 ? list[list.length - 1].num + 1 : 33;
    const newQ = {
      id: `writ_p2_${Date.now()}`,
      num: nextNum,
      original: 'Peter loves playing football with his friends after school.',
      startWith: 'Peter is keen on',
      correct: 'Peter is keen on playing football with his friends after school.',
      points: 0.25,
      explanation: 'love V-ing = be keen on V-ing.'
    };
    setExamData((prev) => ({
      ...prev,
      writing: {
        ...prev.writing,
        part2: {
          ...prev.writing.part2,
          questions: [...prev.writing.part2.questions, newQ]
        }
      }
    }));
  };

  const handleDeleteQuestionWritingPart2 = (qId) => {
    setExamData((prev) => ({
      ...prev,
      writing: {
        ...prev.writing,
        part2: {
          ...prev.writing.part2,
          questions: prev.writing.part2.questions.filter((q) => q.id !== qId)
        }
      }
    }));
  };

  // Lưu toàn bộ đề thi vào kho đề
  const handleSaveExam = () => {
    const formattedExam = {
      id: `exam-${Date.now()}`,
      title: examData.title,
      code: examData.code,
      durationMinutes: examData.durationMinutes,
      totalPoints: examData.totalPoints,
      assignedClass: examData.assignedClass,
      deadline: examData.deadline,
      status: 'draft',
      createdAt: new Date().toISOString(),
      listening: examData.listening,
      language: examData.language,
      reading: examData.reading,
      writing: examData.writing,
      sections: {
        listening: examData.listening,
        languageFocus: examData.language,
        reading: examData.reading,
        communication: { questions: [] },
        writing: examData.writing
      }
    };

    if (onExamCreated) {
      onExamCreated(formattedExam);
    }
    handleCopyText('', 'Đã lưu cấu hình đề thi thành công vào Kho đề!');
    setActiveMenu('created');
  };

  // Đếm tổng số câu hỏi chính xác theo ma trận chuẩn 41 câu
  const totalListeningCount =
    (examData.listening.part1?.questions?.length || 0) +
    (examData.listening.part2?.questions?.length || 0) +
    (examData.listening.part3?.questions?.length || 0);

  const totalLanguageCount =
    (examData.language?.part1?.questions?.length || 0) +
    (examData.language?.part2?.questions?.length || 0);

  const totalReadingCount =
    (examData.reading?.part1?.questions?.length || 0) +
    (examData.reading?.part2?.questions?.length || 0);

  const totalWritingCount =
    (examData.writing?.part1?.questions?.length || 0) +
    (examData.writing?.part2?.questions?.length || 0) +
    (examData.writing?.part3 ? 1 : 0);

  const grandTotal = totalListeningCount + totalLanguageCount + totalReadingCount + totalWritingCount;

  return (
    <div className="space-y-6">
      {/* 4 Menus Navigation Bar */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5 sm:gap-2">
        {[
          { id: 'created', label: 'A. Đề đã tạo (Quản lý đề thi)', icon: '📋' },
          { id: 'editor', label: 'B. Soạn đề (5 phần ma trận)', icon: '✏️' },
          { id: 'bank', label: 'C. Ngân hàng câu hỏi (4 mức độ)', icon: '🗄️' },
          { id: 'export', label: 'D. Xuất LMS / Antigravity', icon: '🚀' }
        ].map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-2 ${
              activeMenu === menu.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-transparent text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{menu.icon}</span>
            <span>{menu.label}</span>
          </button>
        ))}
      </div>

      {copiedNotification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* ========================================================
          MENU A: ĐỀ ĐÃ TẠO (Exam List & Management)
      ======================================================== */}
      {activeMenu === 'created' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">Danh sách các Đề Thi đã tạo</h3>
              <p className="text-xs text-slate-500">
                Quản lý trạng thái mở cho học sinh làm bài, xem trước đề, theo dõi tiến độ nộp bài
              </p>
            </div>
            <button
              onClick={() => setActiveMenu('editor')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đề thi mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => {
              const isPublished = exam.status === 'published';
              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-300 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {exam.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center space-x-1 border ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{isPublished ? 'Đang mở cho lớp' : 'Bản nháp (Chưa mở)'}</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 mb-3">
                      {exam.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Lớp nhận đề:</span>
                        <span className="font-extrabold text-slate-800">{exam.assignedClass || 'Chưa giao'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Thời lượng & Thang điểm:</span>
                        <span className="font-extrabold text-slate-800">
                          {exam.durationMinutes} phút • {exam.totalPoints || 10}đ
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Hạn nộp bài:</span>
                        <span className="font-semibold text-emerald-800">{exam.deadline || 'Chưa đặt hạn'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onPreviewExam(exam)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center space-x-1 border border-emerald-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem lại đề</span>
                    </button>

                    <button
                      onClick={() => onAssignExam(exam)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Giao cho lớp</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveMenu('editor');
                        setExamData((prev) => ({
                          ...prev,
                          title: exam.title,
                          code: exam.code
                        }));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa đề</span>
                    </button>

                    <button
                      onClick={() => onViewProgress(exam)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center space-x-1 border border-indigo-200"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Tiến độ</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedExamForExport(exam);
                        setActiveMenu('export');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1 ml-auto"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>LMS</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MENU B: SOẠN ĐỀ (Editor 5 Phần Ma Trận - CHUẨN THEO ẢNH 1 & 2)
      ======================================================== */}
      {activeMenu === 'editor' && (
        <div className="space-y-5">
          {/* Top Bar lưu & thông tin đề */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Trình soạn đề 5 phần chuẩn ma trận</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{examData.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã đề: <b>{examData.code}</b> • Thời lượng: {examData.durationMinutes} phút • Thang điểm: 10đ
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveMenu('created')}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveExam}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Lưu vào kho đề</span>
              </button>
            </div>
          </div>

          {/* THANH ĐIỀU HƯỚNG TỪNG PHẦN (THEO ĐÚNG ẢNH 1 CỦA THẦY) */}
          <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setCurrentSection('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                currentSection === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tất cả 5 phần ({grandTotal} câu)
            </button>

            <button
              onClick={() => setCurrentSection('section1')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border-2 ${
                currentSection === 'section1'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>SECTION 1: LISTENING ({totalListeningCount})</span>
            </button>

            <button
              onClick={() => setCurrentSection('section2')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                currentSection === 'section2'
                  ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
              }`}
            >
              <span>SECTION 2: LANGUAGE ({totalLanguageCount})</span>
            </button>

            <button
              onClick={() => setCurrentSection('section3')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                currentSection === 'section3'
                  ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100'
              }`}
            >
              <span>SECTION 3: READING ({totalReadingCount})</span>
            </button>

            <button
              onClick={() => setCurrentSection('section4')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                currentSection === 'section4'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>SECTION 4: WRITING ({totalWritingCount})</span>
            </button>
          </div>

          {/* =================================================================
              SECTION 1: LISTENING (CHI TIẾT ĐẦY ĐỦ CỦA ẢNH 1 & ẢNH 2)
          ================================================================== */}
          {(currentSection === 'section1' || currentSection === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
              {/* Header Section 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold shrink-0">
                    🎧
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        SECTION 1
                      </span>
                      <h3 className="text-base font-black text-slate-900">Section 1: Listening</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Listen to separate audio recordings: Part 1 (Phong's Village), Part 2 (Nick & Elena), and Part 3 (Community Life).
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs self-start sm:self-auto">
                  3.5 điểm ({totalListeningCount} câu)
                </div>
              </div>

              {/* Sub-tabs của Listening: Part 1, Part 2, Part 3 */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  onClick={() => setListeningSubTab('part1')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                    listeningSubTab === 'part1'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Part 1: Gap Fill ({examData.listening.part1.questions.length} câu • 1.0đ)
                </button>

                <button
                  onClick={() => setListeningSubTab('part2')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                    listeningSubTab === 'part2' || listeningSubTab === 'both_2_3'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Part 2: Multiple Choice ({examData.listening.part2.questions.length} câu • 1.5đ)
                </button>

                <button
                  onClick={() => setListeningSubTab('part3')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                    listeningSubTab === 'part3' || listeningSubTab === 'both_2_3'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Part 3: True / False ({examData.listening.part3.questions.length} câu • 1.0đ)
                </button>

                <button
                  onClick={() => setListeningSubTab('both_2_3')}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center space-x-1 border border-teal-200 ml-auto"
                >
                  <span>👁️ Xem song song Part 2 & Part 3</span>
                </button>

                <button
                  onClick={handleResetListening}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold transition flex items-center space-x-1"
                  title="Khôi phục đề nghe mặc định"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục đề nghe</span>
                </button>
              </div>

              {/* Thông báo quy tắc đánh số thứ tự trong đề 40 câu chuẩn (The exact note from Image 1) */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <b className="font-extrabold text-indigo-900 block mb-0.5">
                    Quy tắc đánh số thứ tự trong đề thi chuẩn 40 câu:
                  </b>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Đề thi chính thức 40 câu được đánh số liên tục toàn đề (từ 1 đến 40). Trong phần Nghe (Listening): <b>Part 1 gồm 4 câu (Câu 1 - 4)</b> và tiếp nối là <b>Part 2 gồm 6 câu (Câu 5 - 10)</b>, tiếp nối là <b>Part 3 (Câu 11 - 14)</b>. Vì vậy câu đầu tiên của Part 2 mang số 5 (tương ứng câu số 1 của Part 2).
                  </p>
                </div>
              </div>

              {/* =================== NỘI DUNG CÁC PART LISTENING =================== */}

              {/* PART 1: GAP FILL (Hiện khi chọn Part 1) */}
              {listeningSubTab === 'part1' && (
                <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <span className="font-black text-emerald-900 text-sm">
                      PART 1 (Câu 1 - Câu 4): Gap Fill Điền từ (Ảnh 2)
                    </span>
                    <span className="text-xs font-bold text-emerald-700">4 câu • 1.0 điểm</span>
                  </div>

                  {/* Audio Manager Part 1 */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        File audio Part 1:
                      </span>
                      <span className="font-mono text-slate-700">{examData.listening.part1.audioName}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRefPart1}
                        onChange={(e) => handleUploadAudio('part1', e)}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefPart1.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center space-x-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải file MP3</span>
                      </button>
                    </div>
                  </div>

                  <audio controls className="w-full h-8" src={examData.listening.part1.audioUrl} />

                  {/* Danh sách câu hỏi Part 1 */}
                  <div className="space-y-2.5">
                    {examData.listening.part1.questions.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">Câu {q.num} (Part 1 - Điền từ):</span>
                          <span className="text-slate-400 font-semibold">0.25đ</span>
                        </div>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              listening: {
                                ...prev.listening,
                                part1: {
                                  ...prev.listening.part1,
                                  questions: prev.listening.part1.questions.map((item) =>
                                    item.id === q.id ? { ...item, prompt: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-emerald-700">Từ cần điền (Đáp án):</span>
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part1: {
                                    ...prev.listening.part1,
                                    questions: prev.listening.part1.questions.map((item) =>
                                      item.id === q.id ? { ...item, answer: val } : item
                                    )
                                  }
                                }
                              }));
                            }}
                            className="px-2 py-1 rounded border border-slate-300 font-bold text-emerald-800 w-44"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GRID HIỂN THỊ SONG SONG PART 2 & PART 3 (NHƯ ẢNH 1) */}
              {(listeningSubTab === 'part2' || listeningSubTab === 'part3' || listeningSubTab === 'both_2_3') && (
                <div className={`grid grid-cols-1 ${listeningSubTab === 'both_2_3' ? 'lg:grid-cols-2' : ''} gap-5`}>
                  {/* ===================== PART 2: CONVERSATION (ẢNH 1 TRÁI) ===================== */}
                  {(listeningSubTab === 'part2' || listeningSubTab === 'both_2_3') && (
                    <div className="border border-emerald-300 rounded-2xl p-4 bg-emerald-50/20 space-y-4">
                      {/* Header Part 2 */}
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white">
                              PART 2
                            </span>
                            <span className="text-[11px] font-bold text-emerald-800">Câu 5 - Câu 10</span>
                          </div>
                          <h4 className="font-black text-slate-900 text-sm mt-0.5">
                            Part 2: Conversation Nick & Elena (Multiple Choice)
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-emerald-700">
                            {examData.listening.part2.questions.length} câu • 1.5đ
                          </span>
                          <button
                            onClick={handleAddQuestionPart2}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Thêm câu Part 2</span>
                          </button>
                        </div>
                      </div>

                      {/* Inputs Tên chủ đề & Lời chỉ dẫn */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Tên chủ đề Part 2:</label>
                          <input
                            type="text"
                            value={examData.listening.part2.topic}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part2: { ...prev.listening.part2, topic: val }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Yêu cầu đề bài (Part 2 Instruction):</label>
                          <input
                            type="text"
                            value={examData.listening.part2.instruction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part2: { ...prev.listening.part2, instruction: val }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      {/* Audio Bar Part 2 (Theo đúng Ảnh 1) */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold">
                              🔊
                            </span>
                            <span className="font-bold text-slate-800">File nghe Part 2:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              ✓ Đã sẵn sàng
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {examData.listening.part2.audioName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <input
                              type="file"
                              ref={fileInputRefPart2}
                              onChange={(e) => handleUploadAudio('part2', e)}
                              accept="audio/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRefPart2.current?.click()}
                              className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center space-x-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Tải audio Part 2</span>
                            </button>
                            <button
                              onClick={() =>
                                setExamData((prev) => ({
                                  ...prev,
                                  listening: {
                                    ...prev.listening,
                                    part2: {
                                      ...prev.listening.part2,
                                      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=short-uk-dialogue.mp3',
                                      audioName: 'NickAndElena_Cambridge_Sample.mp3'
                                    }
                                  }
                                }))
                              }
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                            >
                              Audio mẫu
                            </button>
                          </div>
                        </div>

                        <audio controls className="w-full h-8" src={examData.listening.part2.audioUrl} />
                      </div>

                      {/* Danh sách các câu hỏi Part 2 */}
                      <div className="space-y-3">
                        {examData.listening.part2.questions.map((q, idx) => (
                          <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                Câu {q.num} (Part 2 - Câu {idx + 1}){' '}
                                <span className="text-[10px] uppercase font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  [PART 2: MULTIPLE CHOICE]
                                </span>
                              </span>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleDeleteQuestionPart2(q.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Xóa câu hỏi này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Prompt */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Yêu cầu câu hỏi (Prompt):
                              </label>
                              <input
                                type="text"
                                value={q.prompt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExamData((prev) => ({
                                    ...prev,
                                    listening: {
                                      ...prev.listening,
                                      part2: {
                                        ...prev.listening.part2,
                                        questions: prev.listening.part2.questions.map((item) =>
                                          item.id === q.id ? { ...item, prompt: val } : item
                                        )
                                      }
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                              />
                            </div>

                            {/* Options A, B, C, D */}
                            <div className="space-y-1.5 pt-1">
                              <div className="text-[11px] font-bold text-slate-600">
                                Các phương án A, B, C, D (Nhấp nút tròn để chọn đáp án đúng):
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const letter = String.fromCharCode(65 + oIdx);
                                  const isCorrect = q.correct === letter;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded-lg border flex items-center space-x-2 ${
                                        isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`radio_${q.id}`}
                                        checked={isCorrect}
                                        onChange={() => {
                                          setExamData((prev) => ({
                                            ...prev,
                                            listening: {
                                              ...prev.listening,
                                              part2: {
                                                ...prev.listening.part2,
                                                questions: prev.listening.part2.questions.map((item) =>
                                                  item.id === q.id ? { ...item, correct: letter } : item
                                                )
                                              }
                                            }
                                          }));
                                        }}
                                        className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <span className="font-bold text-slate-700">{letter}.</span>
                                      <input
                                        type="text"
                                        value={opt.replace(/^[A-D]\.\s*/, '')}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setExamData((prev) => ({
                                            ...prev,
                                            listening: {
                                              ...prev.listening,
                                              part2: {
                                                ...prev.listening.part2,
                                                questions: prev.listening.part2.questions.map((item) => {
                                                  if (item.id === q.id) {
                                                    const nextOpts = [...item.options];
                                                    nextOpts[oIdx] = `${letter}. ${val}`;
                                                    return { ...item, options: nextOpts };
                                                  }
                                                  return item;
                                                })
                                              }
                                            }
                                          }));
                                        }}
                                        className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-hidden"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ===================== PART 3: TRUE / FALSE (ẢNH 1 PHẢI) ===================== */}
                  {(listeningSubTab === 'part3' || listeningSubTab === 'both_2_3') && (
                    <div className="border border-purple-300 rounded-2xl p-4 bg-purple-50/20 space-y-4">
                      {/* Header Part 3 */}
                      <div className="flex items-center justify-between border-b border-purple-200 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-600 text-white">
                              PART 3
                            </span>
                            <span className="text-[11px] font-bold text-purple-800">Câu 11 - Câu 14</span>
                          </div>
                          <h4 className="font-black text-slate-900 text-sm mt-0.5">
                            Part 3: True / False Statements (Đúng / Sai)
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-purple-700">
                            {examData.listening.part3.questions.length} câu • 1.0đ
                          </span>
                          <button
                            onClick={handleAddQuestionPart3}
                            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Thêm câu Đúng/Sai</span>
                          </button>
                        </div>
                      </div>

                      {/* Inputs Tên chủ đề & Lời chỉ dẫn */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Tiêu đề bài nghe Part 3:</label>
                          <input
                            type="text"
                            value={examData.listening.part3.topic}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part3: { ...prev.listening.part3, topic: val }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Lời chỉ dẫn bài thi (Instruction):</label>
                          <input
                            type="text"
                            value={examData.listening.part3.instruction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                listening: {
                                  ...prev.listening,
                                  part3: { ...prev.listening.part3, instruction: val }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      {/* Audio Bar Part 3 (Theo đúng Ảnh 1) */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold">
                              🔊
                            </span>
                            <span className="font-bold text-slate-800">File âm thanh Part 3:</span>
                            <span className="font-mono text-purple-700 font-bold text-[11px]">
                              {examData.listening.part3.audioName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <input
                              type="file"
                              ref={fileInputRefPart3}
                              onChange={(e) => handleUploadAudio('part3', e)}
                              accept="audio/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRefPart3.current?.click()}
                              className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center space-x-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Tải file MP3</span>
                            </button>
                          </div>
                        </div>

                        <audio controls className="w-full h-8" src={examData.listening.part3.audioUrl} />
                      </div>

                      {/* Danh sách câu hỏi Part 3 True / False */}
                      <div className="space-y-3">
                        {examData.listening.part3.questions.map((q, idx) => (
                          <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {q.num}. Nhận định nghe Đúng / Sai (True or False)
                              </span>
                              <button
                                onClick={() => handleDeleteQuestionPart3(q.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Xóa nhận định này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Nhận định kiểm tra (Statement):
                              </label>
                              <input
                                type="text"
                                value={q.statement}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExamData((prev) => ({
                                    ...prev,
                                    listening: {
                                      ...prev.listening,
                                      part3: {
                                        ...prev.listening.part3,
                                        questions: prev.listening.part3.questions.map((item) =>
                                          item.id === q.id ? { ...item, statement: val } : item
                                        )
                                      }
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                              />
                            </div>

                            {/* Radio True / False */}
                            <div>
                              <span className="block text-[11px] font-bold text-slate-600 mb-1.5">
                                Đáp án đúng (Nhấn chọn TRUE hoặc FALSE):
                              </span>
                              <div className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExamData((prev) => ({
                                      ...prev,
                                      listening: {
                                        ...prev.listening,
                                        part3: {
                                          ...prev.listening.part3,
                                          questions: prev.listening.part3.questions.map((item) =>
                                            item.id === q.id ? { ...item, correct: 'TRUE' } : item
                                          )
                                        }
                                      }
                                    }));
                                  }}
                                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border-2 ${
                                    q.correct === 'TRUE'
                                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>◉</span>
                                  <span>TRUE (Đúng)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setExamData((prev) => ({
                                      ...prev,
                                      listening: {
                                        ...prev.listening,
                                        part3: {
                                          ...prev.listening.part3,
                                          questions: prev.listening.part3.questions.map((item) =>
                                            item.id === q.id ? { ...item, correct: 'FALSE' } : item
                                          )
                                        }
                                      }
                                    }));
                                  }}
                                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border-2 ${
                                    q.correct === 'FALSE'
                                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>○</span>
                                  <span>FALSE (Sai)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SECTION 2: KNOWLEDGE OF LANGUAGE (THEO ĐÚNG ẢNH 1: 2 BÀI CLOZE • 10 CÂU 2.5Đ)
          ================================================================== */}
          {(currentSection === 'section2' || currentSection === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
              {/* Header Section 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold shrink-0">
                    📖
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                        SECTION 2
                      </span>
                      <span className="text-xs font-bold text-teal-700">Câu 11 - Câu 20 • 2.5 điểm</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      Section 2: Knowledge of Language - Cloze Passages
                    </h3>
                    <p className="text-xs text-slate-500">
                      Gồm 2 bài đọc điền khuyết: Part 1: Leaflet (Tờ rơi trường học) & Part 2: Announcement (Thông báo)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 font-extrabold text-xs border border-teal-200">
                    {totalLanguageCount} câu hỏi • 2.5 điểm
                  </span>
                </div>
              </div>

              {/* PART 1: LEAFLET (TỜ RƠI TRƯỜNG HỌC - CÂU 11-15) */}
              <div className="border border-teal-300 rounded-2xl p-4 bg-teal-50/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-600 text-white">
                        PART 1
                      </span>
                      <span className="text-[11px] font-bold text-teal-800">Leaflet (Câu 11 - Câu 15)</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-0.5">
                      {examData.language.part1.badge}: {examData.language.part1.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-teal-700">
                      {examData.language.part1.questions.length} câu • 1.25đ
                    </span>
                    <button
                      onClick={handleAddQuestionLanguagePart1}
                      className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm câu Part 1</span>
                    </button>
                  </div>
                </div>

                {/* Tiêu đề & Nội dung đoạn văn Leaflet */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Tiêu đề tờ rơi (Leaflet Title):</label>
                    <input
                      type="text"
                      value={examData.language.part1.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          language: {
                            ...prev.language,
                            part1: { ...prev.language.part1, title: val }
                          }
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Nội dung đoạn văn tờ rơi khuyết từ (Passage with blanks):</label>
                    <textarea
                      rows={4}
                      value={examData.language.part1.passage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          language: {
                            ...prev.language,
                            part1: { ...prev.language.part1, passage: val }
                          }
                        }));
                      }}
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Danh sách 5 câu hỏi con Part 1 (Ảnh 1) */}
                <div className="space-y-3">
                  {examData.language.part1.questions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {q.blankLabel || `Câu ${q.num}:`} Điền từ vào chỗ trống ({q.num})
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold text-[10px]">
                            {q.points || 0.25}đ
                          </span>
                          <button
                            onClick={() => handleDeleteQuestionLanguagePart1(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 4 Lựa chọn ABCD */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-600 mb-1">
                          Các phương án A, B, C, D (Nhấp nút tròn để chọn đáp án đúng):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const letter = String.fromCharCode(65 + oIdx);
                            const isCorrect = q.correct === letter;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg border flex items-center space-x-2 ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`radio_lang_p1_${q.id}`}
                                  checked={isCorrect}
                                  onChange={() => {
                                    setExamData((prev) => ({
                                      ...prev,
                                      language: {
                                        ...prev.language,
                                        part1: {
                                          ...prev.language.part1,
                                          questions: prev.language.part1.questions.map((item) =>
                                            item.id === q.id ? { ...item, correct: letter } : item
                                          )
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-bold text-slate-700">{letter}.</span>
                                <input
                                  type="text"
                                  value={opt.replace(/^[A-D]\.\s*/, '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setExamData((prev) => ({
                                      ...prev,
                                      language: {
                                        ...prev.language,
                                        part1: {
                                          ...prev.language.part1,
                                          questions: prev.language.part1.questions.map((item) => {
                                            if (item.id === q.id) {
                                              const nextOpts = [...item.options];
                                              nextOpts[oIdx] = `${letter}. ${val}`;
                                              return { ...item, options: nextOpts };
                                            }
                                            return item;
                                          })
                                        }
                                      }
                                    }));
                                  }}
                                  className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-hidden"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Giải thích đáp án */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Lời giải thích chi tiết:</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              language: {
                                ...prev.language,
                                part1: {
                                  ...prev.language.part1,
                                  questions: prev.language.part1.questions.map((item) =>
                                    item.id === q.id ? { ...item, explanation: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PART 2: ANNOUNCEMENT (THÔNG BÁO - CÂU 16-20) */}
              <div className="border border-blue-300 rounded-2xl p-4 bg-blue-50/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white">
                        PART 2
                      </span>
                      <span className="text-[11px] font-bold text-blue-800">Announcement (Câu 16 - Câu 20)</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-0.5">
                      {examData.language.part2.badge}: {examData.language.part2.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-blue-700">
                      {examData.language.part2.questions.length} câu • 1.25đ
                    </span>
                    <button
                      onClick={handleAddQuestionLanguagePart2}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm câu Part 2</span>
                    </button>
                  </div>
                </div>

                {/* Tiêu đề & Nội dung đoạn văn Announcement */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Tiêu đề thông báo (Announcement Title):</label>
                    <input
                      type="text"
                      value={examData.language.part2.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          language: {
                            ...prev.language,
                            part2: { ...prev.language.part2, title: val }
                          }
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Nội dung văn bản thông báo khuyết từ:</label>
                    <textarea
                      rows={5}
                      value={examData.language.part2.passage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          language: {
                            ...prev.language,
                            part2: { ...prev.language.part2, passage: val }
                          }
                        }));
                      }}
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 leading-relaxed font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Danh sách 5 câu hỏi con Part 2 */}
                <div className="space-y-3">
                  {examData.language.part2.questions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {q.blankLabel || `Câu ${q.num}:`} Điền từ vào chỗ trống ({q.num})
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                            {q.points || 0.25}đ
                          </span>
                          <button
                            onClick={() => handleDeleteQuestionLanguagePart2(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 4 Lựa chọn ABCD */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-600 mb-1">
                          Các phương án A, B, C, D (Nhấp nút tròn để chọn đáp án đúng):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const letter = String.fromCharCode(65 + oIdx);
                            const isCorrect = q.correct === letter;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg border flex items-center space-x-2 ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`radio_lang_p2_${q.id}`}
                                  checked={isCorrect}
                                  onChange={() => {
                                    setExamData((prev) => ({
                                      ...prev,
                                      language: {
                                        ...prev.language,
                                        part2: {
                                          ...prev.language.part2,
                                          questions: prev.language.part2.questions.map((item) =>
                                            item.id === q.id ? { ...item, correct: letter } : item
                                          )
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-bold text-slate-700">{letter}.</span>
                                <input
                                  type="text"
                                  value={opt.replace(/^[A-D]\.\s*/, '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setExamData((prev) => ({
                                      ...prev,
                                      language: {
                                        ...prev.language,
                                        part2: {
                                          ...prev.language.part2,
                                          questions: prev.language.part2.questions.map((item) => {
                                            if (item.id === q.id) {
                                              const nextOpts = [...item.options];
                                              nextOpts[oIdx] = `${letter}. ${val}`;
                                              return { ...item, options: nextOpts };
                                            }
                                            return item;
                                          })
                                        }
                                      }
                                    }));
                                  }}
                                  className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-hidden"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Giải thích đáp án */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Lời giải thích chi tiết:</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              language: {
                                ...prev.language,
                                part2: {
                                  ...prev.language.part2,
                                  questions: prev.language.part2.questions.map((item) =>
                                    item.id === q.id ? { ...item, explanation: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 3: READING (THEO ĐÚNG ẢNH 2: 2 BÀI ĐỌC • 10 CÂU 2.5Đ)
          ================================================================== */}
          {(currentSection === 'section3' || currentSection === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
              {/* Header Section 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center text-xl font-bold shrink-0">
                    📚
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800">
                        SECTION 3
                      </span>
                      <span className="text-xs font-bold text-cyan-700">Câu 21 - Câu 30 • 2.5 điểm</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      Section 3: Reading Comprehension (Kỹ năng Đọc hiểu)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bài đọc 1: Đúng/Sai (True/False • 5 câu 1.25đ) và Bài đọc 2: Trắc nghiệm 4 lựa chọn (A, B, C, D • 5 câu 1.25đ)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 font-extrabold text-xs border border-cyan-200">
                    {totalReadingCount} câu hỏi • 2.5 điểm
                  </span>
                </div>
              </div>

              {/* BÀI ĐỌC 1: TRUE / FALSE (ẢNH 2 TRÁI) */}
              <div className="border border-cyan-300 rounded-2xl p-4 bg-cyan-50/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-200 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-600 text-white">
                        PART 1
                      </span>
                      <span className="text-[11px] font-bold text-cyan-800">Câu 21 - Câu 25 • Đúng / Sai</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-0.5">
                      Bài đọc 1: {examData.reading.part1.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-cyan-700">
                      {examData.reading.part1.questions.length} câu • 1.25đ
                    </span>
                    <button
                      onClick={handleAddQuestionReadingPart1}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm câu Đúng/Sai</span>
                    </button>
                  </div>
                </div>

                {/* Tiêu đề & Lời chỉ dẫn & Văn bản đọc hiểu */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Tiêu đề bài đọc 1:</label>
                    <input
                      type="text"
                      value={examData.reading.part1.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          reading: {
                            ...prev.reading,
                            part1: { ...prev.reading.part1, title: val }
                          }
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Lời chỉ dẫn bài thi (Instruction):</label>
                    <input
                      type="text"
                      value={examData.reading.part1.instruction}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          reading: {
                            ...prev.reading,
                            part1: { ...prev.reading.part1, instruction: val }
                          }
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Văn bản bài đọc 1 (Reading Passage):</label>
                    <textarea
                      rows={5}
                      value={examData.reading.part1.passage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          reading: {
                            ...prev.reading,
                            part1: { ...prev.reading.part1, passage: val }
                          }
                        }));
                      }}
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 leading-relaxed italic"
                    />
                  </div>
                </div>

                {/* Danh sách 5 câu hỏi Đúng / Sai */}
                <div className="space-y-3">
                  {examData.reading.part1.questions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          Câu {q.num}: Nhận định đọc hiểu Đúng / Sai
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-bold text-[10px]">
                            {q.points || 0.25}đ
                          </span>
                          <button
                            onClick={() => handleDeleteQuestionReadingPart1(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa nhận định này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Nội dung câu hỏi / nhận định:
                        </label>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              reading: {
                                ...prev.reading,
                                part1: {
                                  ...prev.reading.part1,
                                  questions: prev.reading.part1.questions.map((item) =>
                                    item.id === q.id ? { ...item, prompt: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                        />
                      </div>

                      {/* Nút chọn TRUE / FALSE */}
                      <div>
                        <span className="block text-[11px] font-bold text-slate-600 mb-1.5">
                          Đáp án đúng (Nhấn chọn TRUE hoặc FALSE):
                        </span>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setExamData((prev) => ({
                                ...prev,
                                reading: {
                                  ...prev.reading,
                                  part1: {
                                    ...prev.reading.part1,
                                    questions: prev.reading.part1.questions.map((item) =>
                                      item.id === q.id ? { ...item, correct: 'TRUE' } : item
                                    )
                                  }
                                }
                              }));
                            }}
                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border-2 ${
                              q.correct === 'TRUE'
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>◉</span>
                            <span>TRUE (Đúng)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setExamData((prev) => ({
                                ...prev,
                                reading: {
                                  ...prev.reading,
                                  part1: {
                                    ...prev.reading.part1,
                                    questions: prev.reading.part1.questions.map((item) =>
                                      item.id === q.id ? { ...item, correct: 'FALSE' } : item
                                    )
                                  }
                                }
                              }));
                            }}
                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border-2 ${
                              q.correct === 'FALSE'
                                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>○</span>
                            <span>FALSE (Sai)</span>
                          </button>
                        </div>
                      </div>

                      {/* Giải thích chi tiết */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Lời giải thích chi tiết:</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              reading: {
                                ...prev.reading,
                                part1: {
                                  ...prev.reading.part1,
                                  questions: prev.reading.part1.questions.map((item) =>
                                    item.id === q.id ? { ...item, explanation: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BÀI ĐỌC 2: TRẮC NGHIỆM ABCD (ẢNH 2 PHẢI) */}
              <div className="border border-indigo-300 rounded-2xl p-4 bg-indigo-50/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-600 text-white">
                        PART 2
                      </span>
                      <span className="text-[11px] font-bold text-indigo-800">Câu 26 - Câu 30 • Trắc nghiệm 4 lựa chọn</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-0.5">
                      Bài đọc 2: {examData.reading.part2.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-indigo-700">
                      {examData.reading.part2.questions.length} câu • 1.25đ
                    </span>
                    <button
                      onClick={handleAddQuestionReadingPart2}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm câu trắc nghiệm</span>
                    </button>
                  </div>
                </div>

                {/* Tiêu đề & Lời chỉ dẫn & Văn bản đọc hiểu 2 */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Tiêu đề bài đọc 2:</label>
                    <input
                      type="text"
                      value={examData.reading.part2.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          reading: {
                            ...prev.reading,
                            part2: { ...prev.reading.part2, title: val }
                          }
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Lời chỉ dẫn bài thi (Instruction):</label>
                    <input
                      type="text"
                      value={examData.reading.part2.instruction}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          reading: {
                            ...prev.reading,
                            part2: { ...prev.reading.part2, instruction: val }
                          }
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Văn bản bài đọc 2 (Reading Passage):</label>
                    <textarea
                      rows={5}
                      value={examData.reading.part2.passage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          reading: {
                            ...prev.reading,
                            part2: { ...prev.reading.part2, passage: val }
                          }
                        }));
                      }}
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 leading-relaxed text-[11px]"
                    />
                  </div>
                </div>

                {/* Danh sách 5 câu hỏi trắc nghiệm ABCD */}
                <div className="space-y-3">
                  {examData.reading.part2.questions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          Câu {q.num}: {q.prompt}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                            {q.points || 0.25}đ
                          </span>
                          <button
                            onClick={() => handleDeleteQuestionReadingPart2(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Nội dung câu hỏi:
                        </label>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              reading: {
                                ...prev.reading,
                                part2: {
                                  ...prev.reading.part2,
                                  questions: prev.reading.part2.questions.map((item) =>
                                    item.id === q.id ? { ...item, prompt: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                        />
                      </div>

                      {/* 4 Lựa chọn ABCD */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-600 mb-1">
                          Các phương án A, B, C, D (Nhấp nút tròn để chọn đáp án đúng):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const letter = String.fromCharCode(65 + oIdx);
                            const isCorrect = q.correct === letter;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg border flex items-center space-x-2 ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`radio_read_p2_${q.id}`}
                                  checked={isCorrect}
                                  onChange={() => {
                                    setExamData((prev) => ({
                                      ...prev,
                                      reading: {
                                        ...prev.reading,
                                        part2: {
                                          ...prev.reading.part2,
                                          questions: prev.reading.part2.questions.map((item) =>
                                            item.id === q.id ? { ...item, correct: letter } : item
                                          )
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-bold text-slate-700">{letter}.</span>
                                <input
                                  type="text"
                                  value={opt.replace(/^[A-D]\.\s*/, '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setExamData((prev) => ({
                                      ...prev,
                                      reading: {
                                        ...prev.reading,
                                        part2: {
                                          ...prev.reading.part2,
                                          questions: prev.reading.part2.questions.map((item) => {
                                            if (item.id === q.id) {
                                              const nextOpts = [...item.options];
                                              nextOpts[oIdx] = `${letter}. ${val}`;
                                              return { ...item, options: nextOpts };
                                            }
                                            return item;
                                          })
                                        }
                                      }
                                    }));
                                  }}
                                  className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-hidden"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Giải thích chi tiết */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Lời giải thích chi tiết:</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              reading: {
                                ...prev.reading,
                                part2: {
                                  ...prev.reading.part2,
                                  questions: prev.reading.part2.questions.map((item) =>
                                    item.id === q.id ? { ...item, explanation: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION 4: WRITING (THEO ĐÚNG ẢNH 3: 3 PHẦN TỔNG 2.5Đ)
          ================================================================== */}
          {(currentSection === 'section4' || currentSection === 'all') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
              {/* Header Section 4 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xl font-bold shrink-0">
                    ✍️
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                        SECTION 4
                      </span>
                      <span className="text-xs font-bold text-rose-700">Câu 31 - Câu 37 • 2.5 điểm</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      Section 4: Writing (Kỹ năng Viết - 3 Parts)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Part 1: Sắp xếp hội thoại (0.5đ) • Part 2: Viết lại câu không đổi nghĩa (1.0đ) • Part 3: Viết đoạn văn tự luận (1.0đ)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 font-extrabold text-xs border border-rose-200">
                    {totalWritingCount} câu • 2.5 điểm
                  </span>
                </div>
              </div>

              {/* Banner quy chuẩn Phần Writing theo Ảnh 3 */}
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-bold text-xs flex items-center space-x-2">
                <span>📌</span>
                <span>{examData.writing.banner}</span>
              </div>

              {/* PART 1: SẮP XẾP HỘI THOẠI (CÂU 31, 32 • 0.5Đ) */}
              <div className="border border-amber-300 rounded-2xl p-4 bg-amber-50/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-600 text-white">
                        PART 1
                      </span>
                      <span className="text-[11px] font-bold text-amber-800">Câu 31 - Câu 32 • 0.5 điểm</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-0.5">
                      {examData.writing.part1.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-amber-700">
                      {examData.writing.part1.questions.length} câu • 0.5đ
                    </span>
                    <button
                      onClick={handleAddQuestionWritingPart1}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm câu sắp xếp</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {examData.writing.part1.questions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          Câu {q.num}: {q.title}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">
                            {q.points || 0.25}đ
                          </span>
                          <button
                            onClick={() => handleDeleteQuestionWritingPart1(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Các mệnh đề gợi ý cần sắp xếp */}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-700 block text-[11px]">Các mệnh đề cần sắp xếp:</span>
                        {q.cuesList?.map((cue, cIdx) => (
                          <div key={cIdx} className="font-mono text-slate-800 text-[11px]">
                            {cue}
                          </div>
                        ))}
                      </div>

                      {/* 4 Phương án chọn trật tự A, B, C, D */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-600 mb-1">
                          Các phương án thứ tự (Nhấp nút tròn để chọn đáp án đúng):
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const letter = String.fromCharCode(65 + oIdx);
                            const isCorrect = q.correct === letter;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  setExamData((prev) => ({
                                    ...prev,
                                    writing: {
                                      ...prev.writing,
                                      part1: {
                                        ...prev.writing.part1,
                                        questions: prev.writing.part1.questions.map((item) =>
                                          item.id === q.id ? { ...item, correct: letter } : item
                                        )
                                      }
                                    }
                                  }));
                                }}
                                className={`p-2 rounded-lg border text-center font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
                                  isCorrect
                                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span>{isCorrect ? '◉' : '○'}</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lời giải thích */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Lời giải thích chi tiết:</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              writing: {
                                ...prev.writing,
                                part1: {
                                  ...prev.writing.part1,
                                  questions: prev.writing.part1.questions.map((item) =>
                                    item.id === q.id ? { ...item, explanation: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PART 2: VIẾT LẠI CÂU KHÔNG ĐỔI NGHĨA (CÂU 33 - 36 • 1.0Đ) */}
              <div className="border border-rose-300 rounded-2xl p-4 bg-rose-50/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white">
                        PART 2
                      </span>
                      <span className="text-[11px] font-bold text-rose-800">Câu 33 - Câu 36 • 1.0 điểm</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-0.5">
                      {examData.writing.part2.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-rose-700">
                      {examData.writing.part2.questions.length} câu • 1.0đ
                    </span>
                    <button
                      onClick={handleAddQuestionWritingPart2}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm câu viết lại</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {examData.writing.part2.questions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          Câu {q.num}: Viết lại câu không đổi nghĩa
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                            {q.points || 0.25}đ
                          </span>
                          <button
                            onClick={() => handleDeleteQuestionWritingPart2(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Câu gốc */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Câu gốc ban đầu (Original Sentence):</label>
                        <input
                          type="text"
                          value={q.original}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              writing: {
                                ...prev.writing,
                                part2: {
                                  ...prev.writing.part2,
                                  questions: prev.writing.part2.questions.map((item) =>
                                    item.id === q.id ? { ...item, original: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                        />
                      </div>

                      {/* Từ bắt đầu & Đáp án chuẩn tự động chấm */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-rose-800 mb-0.5">Từ gợi ý bắt đầu (Start with):</label>
                          <input
                            type="text"
                            value={q.startWith}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                writing: {
                                  ...prev.writing,
                                  part2: {
                                    ...prev.writing.part2,
                                    questions: prev.writing.part2.questions.map((item) =>
                                      item.id === q.id ? { ...item, startWith: val } : item
                                    )
                                  }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50/40 font-bold text-rose-900"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-emerald-800 mb-0.5">
                            Đáp án chuẩn hoàn chỉnh (Dùng tự động chấm điểm):
                          </label>
                          <input
                            type="text"
                            value={q.correct}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExamData((prev) => ({
                                ...prev,
                                writing: {
                                  ...prev.writing,
                                  part2: {
                                    ...prev.writing.part2,
                                    questions: prev.writing.part2.questions.map((item) =>
                                      item.id === q.id ? { ...item, correct: val } : item
                                    )
                                  }
                                }
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/40 font-bold text-emerald-900"
                          />
                        </div>
                      </div>

                      {/* Lời giải thích */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Giải thích cấu trúc ngữ pháp:</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamData((prev) => ({
                              ...prev,
                              writing: {
                                ...prev.writing,
                                part2: {
                                  ...prev.writing.part2,
                                  questions: prev.writing.part2.questions.map((item) =>
                                    item.id === q.id ? { ...item, explanation: val } : item
                                  )
                                }
                              }
                            }));
                          }}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PART 3: VIẾT ĐOẠN VĂN TỰ LUẬN (CÂU 37 • 1.0Đ) */}
              <div className="border border-purple-300 rounded-2xl p-4 bg-purple-50/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-600 text-white">
                        PART 3
                      </span>
                      <span className="text-[11px] font-bold text-purple-800">Câu 37 • Viết đoạn văn tự luận (80-100 từ)</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-0.5">
                      {examData.writing.part3.title}
                    </h4>
                  </div>

                  <span className="text-xs font-black text-purple-700 px-3 py-1 rounded-xl bg-purple-100 border border-purple-200">
                    1.0 điểm (GV chấm thủ công)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Chủ đề bài viết (Topic Prompt):</label>
                    <input
                      type="text"
                      value={examData.writing.part3.topic}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          writing: {
                            ...prev.writing,
                            part3: { ...prev.writing.part3, topic: val }
                          }
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-extrabold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Gợi ý dàn ý cho học sinh (Guidance / Cues):</label>
                    <textarea
                      rows={3}
                      value={examData.writing.part3.guidance}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          writing: {
                            ...prev.writing,
                            part3: { ...prev.writing.part3, guidance: val }
                          }
                        }));
                      }}
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Đoạn văn mẫu tham khảo (Sample Essay):</label>
                    <textarea
                      rows={4}
                      value={examData.writing.part3.sampleEssay}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExamData((prev) => ({
                          ...prev,
                          writing: {
                            ...prev.writing,
                            part3: { ...prev.writing.part3, sampleEssay: val }
                          }
                        }));
                      }}
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 leading-relaxed italic"
                    />
                  </div>

                  {/* Barem tiêu chí chấm điểm */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-purple-900 block text-[11px]">Barem tiêu chí chấm điểm tự luận (1.0đ):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {examData.writing.part3.barem?.map((b, bIdx) => (
                        <div key={bIdx} className="p-2 rounded-lg bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                          <span className="text-slate-700 font-medium text-[11px]">{b.criteria}</span>
                          <span className="font-extrabold text-purple-800 ml-2">{b.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MENU C: NGÂN HÀNG CÂU HỎI (Question Bank)
      ======================================================== */}
      {activeMenu === 'bank' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Ngân hàng câu hỏi Tiếng Anh 8</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">Kho Câu Hỏi Chuẩn 4 Mức Độ Nhận Thức</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Tổng: 450+ câu hỏi</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { level: 'Nhận biết', count: '140 câu', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              { level: 'Thông hiểu', count: '160 câu', color: 'bg-blue-50 text-blue-800 border-blue-200' },
              { level: 'Vận dụng', count: '100 câu', color: 'bg-amber-50 text-amber-800 border-amber-200' },
              { level: 'Vận dụng cao', count: '50 câu', color: 'bg-rose-50 text-rose-800 border-rose-200' }
            ].map((lvl, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-center ${lvl.color}`}>
                <div className="font-extrabold text-xs">{lvl.level}</div>
                <div className="text-[11px] font-bold mt-0.5">{lvl.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MENU D: XUẤT LMS / ANTIGRAVITY (Export)
      ======================================================== */}
      {activeMenu === 'export' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase">Xuất dữ liệu & Liên thông</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Xuất Đề Thi Ra Nền Tảng LMS & AI Antigravity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleCopyText(JSON.stringify(selectedExamForExport, null, 2), 'Đã sao chép cấu trúc JSON của đề thi!')}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 text-left transition"
            >
              <div className="font-black text-sm text-slate-800 flex items-center space-x-1.5">
                <Copy className="w-4 h-4 text-emerald-600" />
                <span>Sao chép JSON Chuẩn</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tương thích API Backend và đồng bộ LocalStorage <code>tienganh8_assigned_homework_v1</code>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
