// BỘ DỮ LIỆU MẪU SÁCH MỀM TƯƠNG TÁC (INTERACTIVE LESSON BOOK DATA)
// TÍCH HỢP ĐẦY ĐỦ 4 CẤP: KHỐI LỚP ➔ UNIT ➔ LESSONS ➔ TASKS

export const LESSON_TEMPLATES = [
  { id: 'getting_started', title: 'GETTING STARTED', icon: '🚀', page: 8 },
  { id: 'closer_look_1', title: 'A CLOSER LOOK 1', icon: '📖', page: 10 },
  { id: 'closer_look_2', title: 'A CLOSER LOOK 2', icon: '⚡', page: 11 },
  { id: 'communication', title: 'COMMUNICATION', icon: '💬', page: 12 },
  { id: 'skills_1', title: 'SKILLS 1', icon: '🎧', page: 13 },
  { id: 'skills_2', title: 'SKILLS 2', icon: '✍️', page: 14 },
  { id: 'looking_back', title: 'LOOKING BACK', icon: '🏆', page: 15 },
  { id: 'project', title: 'PROJECT', icon: '🎨', page: 16 },
  { id: 'now_i_can', title: 'NOW I CAN ...', icon: '🌟', page: 17 }
];

export const DEFAULT_BOOK_DATA = {
  // LỚP 9 - GLOBAL SUCCESS
  grade_9: {
    unit_1: {
      unitNumber: 1,
      unitTitle: 'Local community',
      lessons: {
        getting_started: {
          title: 'GETTING STARTED',
          pageNumber: 8,
          headline: 'I really love where I live now.',
          tasks: [
            {
              id: 'task_1',
              taskNumber: 1,
              taskTitle: 'Listen and read.',
              type: 'listen_and_read',
              audioUrl: '',
              dialogue: [
                { id: 'd1', speaker: 'Ann', text: "Hi, Mi. Long time no see. How’re you doing?", vi: "Chào Mi. Lâu rồi không gặp. Dạo này cậu thế nào?" },
                { id: 'd2', speaker: 'Mi', text: "I’m fine, thanks. By the way, we moved to a new house in a suburb last month.", vi: "Mình khỏe, cảm ơn cậu. Nhân tiện, tháng trước nhà mình vừa chuyển đến một ngôi nhà mới ở ngoại ô." },
                { id: 'd3', speaker: 'Ann', text: "Oh, that’s why I haven’t seen you in the Reading Club very often.", vi: "Ồ, hèn chi dạo này mình ít thấy cậu ở Câu lạc bộ Đọc sách." },
                { id: 'd4', speaker: 'Mi', text: "Yes. We’re still busy moving in, you know.", vi: "Đúng rồi. Cậu biết đấy, nhà mình vẫn còn đang bận dọn đồ vào nhà mới." },
                { id: 'd5', speaker: 'Ann', text: "How’s your new neighbourhood?", vi: "Khu xóm mới của cậu thế nào?" },
                { id: 'd6', speaker: 'Mi', text: "It’s much bigger than our old one. The streets are wider, and there are fewer people.", vi: "Nó rộng hơn khu cũ nhiều lắm. Đường phố rộng hơn và ít người hơn." },
                { id: 'd7', speaker: 'Ann', text: "Is there anything you don’t like about it?", vi: "Có điểm nào cậu không thích ở đó không?" },
                { id: 'd8', speaker: 'Mi', text: "Well, there aren't many shops or restaurants nearby. But there's a craft village where they make pottery.", vi: "À, xung quanh không có nhiều cửa hàng hay nhà hàng. Nhưng có một làng nghề thủ công nơi họ làm gốm." },
                { id: 'd9', speaker: 'Ann', text: "That sounds interesting! Do you have good neighbours?", vi: "Nghe thú vị thật! Hàng xóm của cậu có tốt không?" },
                { id: 'd10', speaker: 'Mi', text: "Yes, they are very friendly and helpful. I think I'll get on well with them.", vi: "Có chứ, họ rất thân thiện và hay giúp đỡ. Mình nghĩ mình sẽ hòa thuận với họ." },
                { id: 'd11', speaker: 'Ann', text: "That's great!", vi: "Tuyệt quá!" }
              ],
              images: [
                'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'
              ]
            },
            {
              id: 'task_2',
              taskNumber: 2,
              taskTitle: 'Read the conversation again. Fill in each blank with no more than TWO words from the conversation.',
              type: 'fill_in_blanks_split',
              questions: [
                { id: 'q1', num: 1, textPrefix: "Mi's family moved to a new house in a suburb ", textSuffix: ".", answer: "last month", acceptedAnswers: ["last month"] },
                { id: 'q2', num: 2, textPrefix: "Her new neighbourhood is bigger with wider streets and ", textSuffix: ".", answer: "fewer people", acceptedAnswers: ["fewer people"] },
                { id: 'q3', num: 3, textPrefix: "There is a ", textSuffix: " near Mi's house.", answer: "craft village", acceptedAnswers: ["craft village", "pottery village"] },
                { id: 'q4', num: 4, textPrefix: "Mi thinks she will get on with her new ", textSuffix: ".", answer: "neighbours", acceptedAnswers: ["neighbours", "neighbors"] }
              ]
            },
            {
              id: 'task_3',
              taskNumber: 3,
              taskTitle: 'Match each word or phrase with its definition.',
              type: 'matching',
              pairs: [
                { id: 'p1', word: 'suburb', definition: 'an area outside the centre of a city where people live', vi: 'khu vực ngoại ô' },
                { id: 'p2', word: 'craft village', definition: 'a village where people make things by hand', vi: 'làng nghề thủ công' },
                { id: 'p3', word: 'get on with', definition: 'have a friendly relationship with someone', vi: 'hòa thuận, ăn ý với ai' },
                { id: 'p4', word: 'neighbour', definition: 'someone who lives next to or near your house', vi: 'người hàng xóm' },
                { id: 'p5', word: 'facilities', definition: 'buildings or equipment provided for a particular purpose', vi: 'cơ sở vật chất, tiện ích' }
              ]
            },
            {
              id: 'task_4',
              taskNumber: 4,
              taskTitle: 'Complete each sentence with a word or phrase from 3.',
              type: 'sentence_completion',
              questions: [
                { id: 'sc1', num: 1, sentence: 'Many families prefer living in a quiet _______ rather than the noisy city center.', answer: 'suburb', options: ['suburb', 'craft village', 'neighbour', 'facilities'] },
                { id: 'sc2', num: 2, sentence: 'Bat Trang is a famous _______ near Hanoi where artisans make pottery.', answer: 'craft village', options: ['craft village', 'suburb', 'neighbour', 'facilities'] },
                { id: 'sc3', num: 3, sentence: 'She is friendly and kind, so she can _______ all her new classmates.', answer: 'get on with', options: ['get on with', 'move in', 'remind of', 'look up'] },
                { id: 'sc4', num: 4, sentence: 'Our new _______ gave us some fresh fruit from their garden yesterday.', answer: 'neighbour', options: ['neighbour', 'suburb', 'facilities', 'craft village'] },
                { id: 'sc5', num: 5, sentence: 'The sports complex offers modern _______ including a pool and gym.', answer: 'facilities', options: ['facilities', 'suburb', 'neighbour', 'craft village'] }
              ]
            },
            {
              id: 'task_5',
              taskNumber: 5,
              taskTitle: 'Quiz What is the place?',
              type: 'quiz',
              questions: [
                {
                  id: 'qz1',
                  question: 'Where can visitors see handmade pottery, conical hats, or bamboo baskets being crafted?',
                  options: ['A craft village', 'A busy supermarket', 'A subway station', 'An airport'],
                  answer: 'A craft village',
                  explanation: 'A craft village is known for producing traditional handmade products.'
                },
                {
                  id: 'qz2',
                  question: 'What is a quiet residential area situated on the outskirts of a large city called?',
                  options: ['A suburb', 'A downtown street', 'An industrial factory', 'A skyscraper'],
                  answer: 'A suburb',
                  explanation: 'A suburb is an outer district of a city with residential homes and wider streets.'
                },
                {
                  id: 'qz3',
                  question: 'People who live right next door or near your house are your:',
                  options: ['Neighbours', 'Tourists', 'Strangers', 'Passersby'],
                  answer: 'Neighbours',
                  explanation: 'Neighbours are the people living in your local community close to your home.'
                }
              ]
            }
          ]
        }
      }
    }
  },

  // LỚP 7 - GLOBAL SUCCESS
  grade_7: {
    unit_1: {
      unitNumber: 1,
      unitTitle: 'Hobbies',
      lessons: {
        getting_started: {
          title: 'GETTING STARTED',
          pageNumber: 8,
          headline: 'My favourite hobby',
          tasks: [
            {
              id: 'task_1',
              taskNumber: 1,
              taskTitle: 'Listen and read.',
              type: 'listen_and_read',
              audioUrl: '',
              dialogue: [
                { id: 'd1', speaker: 'Ann', text: "Your house is very nice, Trang.", vi: "Nhà cậu đẹp thật đấy Trang." },
                { id: 'd2', speaker: 'Trang', text: "Thanks! Let’s go upstairs. I’ll show you my room.", vi: "Cảm ơn cậu! Chúng mình lên gác nhé. Mình sẽ cho cậu xem phòng của mình." },
                { id: 'd3', speaker: 'Ann', text: "I love your dollhouse. It’s amazing. Did you make it yourself?", vi: "Mình thích ngôi nhà búp bê của cậu quá. Nó thật tuyệt vời. Cậu tự làm nó à?" },
                { id: 'd4', speaker: 'Trang', text: "Yes. I like building dollhouses very much.", vi: "Đúng rồi. Mình rất thích làm nhà búp bê." },
                { id: 'd5', speaker: 'Ann', text: "Really? Is it hard to build one?", vi: "Thật sao? Làm một cái nhà như vậy có khó không?" },
                { id: 'd6', speaker: 'Trang', text: "Not really. All you need is some cardboard and glue. Then just use a bit of creativity. What do you do in your free time?", vi: "Không khó lắm đâu. Tất cả những gì cậu cần là một ít bìa các-tông và keo dán. Sau đó chỉ cần một chút sáng tạo. Cậu thường làm gì vào thời gian rảnh?" },
                { id: 'd7', speaker: 'Ann', text: "I like horse riding.", vi: "Mình thích cưỡi ngựa." },
                { id: 'd8', speaker: 'Trang', text: "That’s rather unusual. Not many people do that.", vi: "Sở thích đó khá là lạ đấy. Không có nhiều người làm như vậy đâu." },
                { id: 'd9', speaker: 'Ann', text: "Actually, it’s more common than you think. There are some horse riding clubs in Ha Noi now. I go to the Riders’ Club every Sunday.", vi: "Thực ra nó phổ biến hơn cậu nghĩ đấy. Bây giờ có một số câu lạc bộ cưỡi ngựa ở Hà Nội rồi. Mình đến Câu lạc bộ Kỵ Mã vào mỗi Chủ Nhật." },
                { id: 'd10', speaker: 'Trang', text: "I’d love to go to your club this Sunday. I want to learn how to ride.", vi: "Mình rất muốn đến câu lạc bộ của cậu vào Chủ Nhật này. Mình muốn học cách cưỡi ngựa." },
                { id: 'd11', speaker: 'Ann', text: "Sure. My lesson starts at 8 a.m.", vi: "Chắc chắn rồi. Tiết học của mình bắt đầu lúc 8 giờ sáng." }
              ],
              images: [
                'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop&q=80'
              ]
            },
            {
              id: 'task_2',
              taskNumber: 2,
              taskTitle: 'Read the conversation again. Fill in each blank with no more than TWO words from the conversation.',
              type: 'fill_in_blanks_split',
              questions: [
                { id: 'q1', num: 1, textPrefix: "Trang likes building ", textSuffix: " very much.", answer: "dollhouses", acceptedAnswers: ["dollhouses", "doll house", "doll houses"] },
                { id: 'q2', num: 2, textPrefix: "To build a dollhouse, you need some cardboard, glue, and a bit of ", textSuffix: ".", answer: "creativity", acceptedAnswers: ["creativity"] },
                { id: 'q3', num: 3, textPrefix: "Ann’s favourite hobby is ", textSuffix: ".", answer: "horse riding", acceptedAnswers: ["horse riding", "riding horses"] },
                { id: 'q4', num: 4, textPrefix: "Ann goes to the Riders’ Club every ", textSuffix: ".", answer: "Sunday", acceptedAnswers: ["Sunday", "sunday"] },
                { id: 'q5', num: 5, textPrefix: "Ann’s horse riding lesson starts at ", textSuffix: ".", answer: "8 a.m.", acceptedAnswers: ["8 a.m.", "8 am", "8:00 a.m.", "8:00 am"] }
              ]
            },
            {
              id: 'task_3',
              taskNumber: 3,
              taskTitle: 'Match each word or phrase with its definition.',
              type: 'matching',
              pairs: [
                { id: 'p1', word: 'dollhouse', definition: 'a miniature toy house made for dolls to play with', vi: 'nhà búp bê' },
                { id: 'p2', word: 'cardboard', definition: 'stiff, thick paper used for making boxes or models', vi: 'bìa các-tông cứng' },
                { id: 'p3', word: 'creativity', definition: 'the ability to use your imagination to invent new things', vi: 'sự sáng tạo' },
                { id: 'p4', word: 'unusual', definition: 'different from what is normal or expected; not common', vi: 'bất thường, hiếm gặp' },
                { id: 'p5', word: 'horse riding', definition: 'the sport or leisure activity of riding on a horse', vi: 'môn thể thao cưỡi ngựa' }
              ]
            },
            {
              id: 'task_4',
              taskNumber: 4,
              taskTitle: 'Complete each sentence with a word or phrase from 3.',
              type: 'sentence_completion',
              questions: [
                { id: 'sc1', num: 1, sentence: 'Trang used recycled _______ boxes and glue to craft her dollhouse.', answer: 'cardboard', options: ['cardboard', 'unusual', 'creativity', 'horse riding'] },
                { id: 'sc2', num: 2, sentence: 'Doing origami requires fine hand skills and high _______.', answer: 'creativity', options: ['creativity', 'dollhouse', 'cardboard', 'horse riding'] },
                { id: 'sc3', num: 3, sentence: 'Collecting vintage stamps is quite _______ among teenagers today.', answer: 'unusual', options: ['unusual', 'creativity', 'cardboard', 'facilities'] },
                { id: 'sc4', num: 4, sentence: 'She put small wooden tables and chairs inside her _______.', answer: 'dollhouse', options: ['dollhouse', 'cardboard', 'creativity', 'suburb'] },
                { id: 'sc5', num: 5, sentence: 'Ann wears a protective helmet whenever she goes _______.', answer: 'horse riding', options: ['horse riding', 'dollhouse', 'cardboard', 'creativity'] }
              ]
            },
            {
              id: 'task_5',
              taskNumber: 5,
              taskTitle: 'Quiz: Guess the Hobby!',
              type: 'quiz',
              questions: [
                {
                  id: 'qz1',
                  question: 'Which hobby involves using cardboard, glue, and scissors to make miniature rooms?',
                  options: ['Building dollhouses', 'Horse riding', 'Gardening', 'Jogging in the park'],
                  answer: 'Building dollhouses',
                  explanation: 'Trang builds dollhouses using cardboard and glue with her creativity.'
                },
                {
                  id: 'qz2',
                  question: 'Where does Ann go every Sunday morning at 8 a.m. to practice riding?',
                  options: ['The Riders’ Club', 'The Reading Club', 'The Art Studio', 'The Swimming Pool'],
                  answer: 'The Riders’ Club',
                  explanation: 'Ann takes horse riding lessons at the Riders’ Club in Hanoi.'
                }
              ]
            }
          ]
        }
      }
    }
  }
};
