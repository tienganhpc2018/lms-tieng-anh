// DỊCH VỤ TRỢ LÝ AI VIẾT NHẬT KÝ KỶ NIỆM LỚP HỌC (GEMINI AI & LOCAL FALLBACK)

/**
 * Sinh đoạn văn kỷ niệm lớp học bằng Gemini API hoặc Bộ mẫu thông minh cục bộ
 */
export async function generateJournalParagraph({
  title = '',
  category = 'Kỷ niệm',
  keywords = '',
}) {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    window.VITE_GEMINI_API_KEY ||
    localStorage.getItem('gemini_api_key') ||
    '';

  // 1. Thử gọi API Gemini nếu có API Key
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const systemPrompt = `Bạn là một nhà giáo tâm huyết và là người ghi chép nhật ký lớp học tài hoa.
Hãy viết một đoạn văn ngắn (khoảng 100 - 150 từ) bằng tiếng Việt thật truyền cảm, ấm áp, trong sáng, tôn vinh tình bạn và tình thầy trò tuổi học trò.
Chủ đề sự kiện: "${title || 'Kỷ niệm lớp học'}"
Danh mục: "${category}"
Từ khóa gợi ý: "${keywords || 'khoảnh khắc đẹp, tình bạn, nỗ lực'}".
Lưu ý: Không dùng gạch đầu dòng, không chào hỏi, viết thành một đoạn văn xuôi mượt mà, cảm xúc.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText && generatedText.trim().length > 20) {
          return {
            success: true,
            text: generatedText.trim().replace(/^["']|["']$/g, ''),
            source: 'gemini',
          };
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to smart local templates:', e);
    }
  }

  // 2. BỘ SINH CỤC BỘ THÔNG MINH (LOCAL FALLBACK TEMPLATES) - KHÔNG BAO GIỜ BÁO LỖI HAY ĐỨNG MÁY!
  const localTemplates = {
    'Học tập': [
      `Không khí học tập hôm nay sôi nổi hơn bao giờ hết khi cả lớp cùng nhau bắt tay vào hoạt động ${title || 'trải nghiệm sáng tạo'}. Từng ánh mắt chăm chú, từng bàn tay khéo léo kết nối ý tưởng thành hiện thực với ${keywords || 'sự nỗ lực và say mê'}. Những nụ cười rạng rỡ khi bài toán khó được giải hay sản phẩm nhóm hoàn thành chính là minh chứng đẹp nhất cho tinh thần học hỏi không ngừng của tập thể.`,
      `Mỗi tiết học không chỉ đơn thuần là trang sách lý thuyết mà là một hành trình khám phá đầy kỳ diệu. Cùng nhau thảo luận, tranh luận và chia sẻ kiến thức, các bạn học sinh đã chứng minh rằng khi chúng ta đoàn kết, mọi thử thách trí tuệ đều có thể chinh phục một cách xuất sắc.`,
    ],
    'Văn nghệ': [
      `Ánh đèn sân khấu bừng sáng cũng là lúc giai điệu tri ân và niềm tự hào lớp học cất lên vang dội. Trong tà áo rực rỡ và những nụ cười tỏa nắng, từng động tác múa, từng câu hát đã gói trọn tình cảm chân thành nhất. Những tràng pháo tay giòn giã từ thầy cô và bạn bè chính là phần thưởng vô giá lưu giữ mãi trong tim.`,
      `Không gian bỗng lắng đọng rồi vỡ òa trong tiếng vỗ tay nồng nhiệt. Những ngày tập luyện hăng say sau giờ học, những giọt mồ hôi rơi trên sàn tập giờ đây đã kết tinh thành một tiết mục biểu diễn thăng hoa và trọn vẹn cảm xúc.`,
    ],
    'Dã ngoại': [
      `Rời xa bảng đen phấn trắng và không gian lớp học quen thuộc, cả lớp đã có một ngày hòa mình trọn vẹn vào thiên nhiên trong lành. Những trò chơi teambuilding đầy ắp tiếng cười, những cái nắm tay cùng vượt qua thử thách đã kéo gần khoảng cách của tất cả thành viên, dệt nên kỷ niệm thanh xuân đẹp đẽ nhất.`,
      `Hành trình khám phá hôm nay là cơ hội tuyệt vời để mỗi bạn học sinh trải nghiệm, gắn kết và trưởng thành. Nhìn những nụ cười hồn nhiên bên nhau dưới bóng râm mát lành, thầy cô tin rằng tình bạn tuổi học trò này sẽ mãi là hành trang quý giá theo các em suốt cuộc đời.`,
    ],
    'Thể thao': [
      `Tiếng còi khai cuộc vừa vang lên, sân trường như bùng nổ bởi tiếng reo hò cổ vũ cuồng nhiệt. Mỗi pha bóng đẹp mắt, từng bước chạy kiên cường với ${keywords || 'quyết tâm sắt đá'} đã thể hiện trọn vẹn ý chí thể thao cao thượng và tinh thần đồng đội keo sơn của lớp chúng mình.`,
      `Chiến thắng không chỉ nằm ở tỉ số trên bảng điểm, mà nằm ở tinh thần không bao giờ bỏ cuộc. Dù mồ hôi ướt đẫm áo, các em vẫn nở nụ cười rạng rỡ và trao nhau những cái đập tay khích lệ đầy tự hào.`,
    ],
    'Kỷ niệm': [
      `Thời gian trôi qua lặng lẽ nhưng những khoảnh khắc quý giá dưới mái trường thân yêu sẽ mãi mãi ở lại. Từng tấm ảnh chụp chung, từng mẩu giấy ghi lại lời nhắn nhủ yêu thương đều là những mảnh ghép rực rỡ tạo nên bức tranh thanh xuân tươi đẹp của tập thể lớp chúng mình.`,
      `Một buổi sinh hoạt đong đầy tiếng cười và cả những giọt nước mắt xúc động. Mai này dù đi đâu xa, chỉ cần nhớ về những ngày tháng cùng nhau học tập và trưởng thành nơi đây, lòng mỗi người sẽ luôn tìm thấy một bến đỗ ấm áp.`,
    ],
    'Khác': [
      `Một ngày hoạt động ý nghĩa và tràn đầy niềm vui của tập thể lớp. Cùng nhau trải qua những khoảnh khắc đáng nhớ với ${keywords || 'sự đồng lòng và sẻ chia'}, chúng mình càng thêm yêu quý và trân trọng mái nhà chung thứ hai này.`,
    ],
  };

  const pool = localTemplates[category] || localTemplates['Khác'];
  const selectedText = pool[Math.floor(Math.random() * pool.length)];

  return {
    success: true,
    text: selectedText,
    source: 'local_template',
  };
}

/**
 * Sinh nhanh chú thích ảnh theo chủ đề
 */
export function generateSmartCaption(category = 'Kỷ niệm', index = 1) {
  const captions = {
    'Học tập': [
      'Khoảnh khắc say mê thảo luận và cùng nhau hoàn thiện sản phẩm.',
      'Tập trung cao độ trước thử thách học thuật đầy hấp dẫn.',
      'Niềm vui rạng ngời khi nhóm tìm ra lời giải xuất sắc.',
    ],
    'Văn nghệ': [
      'Tiết mục biểu diễn thăng hoa trong tràng pháo tay tán thưởng rộn rã.',
      'Nụ cười rạng rỡ và tự tin tỏa sáng dưới ánh đèn sân khấu.',
      'Khoảnh khắc chuẩn bị chu đáo trước giờ biểu diễn.',
    ],
    'Dã ngoại': [
      'Cùng nhau vượt qua thử thách gắn kết tình đồng đội.',
      'Bữa trưa dã ngoại ấm cúng và đầy ắp tiếng cười giòn tan.',
      'Bức ảnh tập thể lưu giữ trọn vẹn bầu trời xanh và nụ cười thanh xuân.',
    ],
    'Thể thao': [
      'Pha bứt phá thần tốc trong tiếng hò reo cổ vũ của cả lớp.',
      'Cái nắm tay chúc mừng tinh thần fair-play đồng đội.',
      'Khoảnh khắc giương cao chiếc cúp chiến thắng đầy tự hào.',
    ],
    'Kỷ niệm': [
      'Góc lớp thân quen nơi lưu giữ những năm tháng học trò tươi đẹp.',
      'Khoảnh khắc cùng thổi nến và ước nguyện những điều tốt đẹp nhất.',
      'Nụ cười trong veo của tuổi học trò dưới mái trường dấu yêu.',
    ],
  };

  const list = captions[category] || captions['Kỷ niệm'];
  return list[(index - 1) % list.length];
}
