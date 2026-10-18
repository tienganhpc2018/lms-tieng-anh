import React, { useState } from 'react';
import { BookOpen, FileText, Music, Video, ExternalLink, Plus, CheckCircle, Download, Sparkles } from 'lucide-react';

const UNITS_GRADE_8 = [
  { id: 1, title: 'Unit 1: Leisure Time', desc: 'Từ vựng hoạt động giải trí, sở thích tuổi teen; Động từ chỉ sự thích/ghét + V-ing/To V', lessons: 7, audios: 4, docs: 3 },
  { id: 2, title: 'Unit 2: Life in the Countryside', desc: 'Cuộc sống nông thôn, so sánh hơn của trạng từ (Comparative forms of adverbs)', lessons: 7, audios: 4, docs: 3 },
  { id: 3, title: 'Unit 3: Teenagers', desc: 'Áp lực học đường, CLB trường học, mạng xã hội; Câu đơn và câu ghép (Simple & Compound sentences)', lessons: 7, audios: 5, docs: 4 },
  { id: 4, title: 'Unit 4: Ethnic Groups of Viet Nam', desc: 'Văn hóa các dân tộc Việt Nam; Câu hỏi Yes/No, Wh-questions và mạo từ', lessons: 7, audios: 3, docs: 3 },
  { id: 5, title: 'Unit 5: Our Customs and Traditions', desc: 'Phong tục và truyền thống gia đình; Động từ khuyết thiếu should, shouldn’t, have to', lessons: 7, audios: 4, docs: 2 },
  { id: 6, title: 'Unit 6: Lifestyles', desc: 'Lối sống truyền thống và hiện đại; Thì tương lai đơn và thì tương lai gần', lessons: 7, audios: 4, docs: 3 },
  { id: 7, title: 'Unit 7: Environmental Protection', desc: 'Bảo vệ môi trường, rác thải nhựa; Câu điều kiện loại 1 (Conditional Type 1)', lessons: 7, audios: 4, docs: 4 },
  { id: 8, title: 'Unit 8: Shopping', desc: 'Thói quen mua sắm, siêu thị & chợ truyền thống; Thì hiện tại đơn diễn tả lịch trình', lessons: 7, audios: 3, docs: 3 },
  { id: 9, title: 'Unit 9: Natural Disasters', desc: 'Thiên tai, lũ lụt, bão nhiệt đới; Thì quá khứ tiếp diễn (Past Continuous)', lessons: 7, audios: 5, docs: 4 },
  { id: 10, title: 'Unit 10: Communication in the Future', desc: 'Phương tiện giao tiếp tương lai, thần giao cách cảm; Đại từ sở hữu', lessons: 7, audios: 4, docs: 3 },
  { id: 11, title: 'Unit 11: Science and Technology', desc: 'Khoa học và công nghệ, robot thông minh; Câu gián tiếp (Reported Speech)', lessons: 7, audios: 4, docs: 3 },
  { id: 12, title: 'Unit 12: Life on Other Planets', desc: 'Sự sống ngoài vũ trụ, người ngoài hành tinh; Ôn tập câu hỏi gián tiếp', lessons: 7, audios: 4, docs: 3 },
];

export default function LessonsTab() {
  const [selectedUnit, setSelectedUnit] = useState(UNITS_GRADE_8[0]);
  const [activeLessonSection, setActiveLessonSection] = useState('getting_started');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 border border-white/20">
            Chương Trình GDPT 2018
          </span>
          <h2 className="text-xl font-black mt-1">Học Liệu & Giáo Án Số Tiếng Anh 8 (Global Success)</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
            Tập hợp đầy đủ 12 Unit chuẩn Bộ Giáo Dục & Đào Tạo: File nghe MP3 chất lượng cao, bài giảng trình chiếu PowerPoint, phiếu học tập PDF và liên kết bài tập tương tác.
          </p>
        </div>

        <button
          onClick={() => alert('Chức năng tải gói học liệu số 12 Unit đang nén file ZIP...')}
          className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition flex items-center space-x-1.5 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Tải trọn bộ 12 Unit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 12 Units Navigation List (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-h-[750px] overflow-y-auto space-y-2">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 mb-2">
            Mục lục 12 Unit SGK Lớp 8
          </div>
          {UNITS_GRADE_8.map((u) => {
            const isSelected = u.id === selectedUnit.id;
            return (
              <div
                key={u.id}
                onClick={() => setSelectedUnit(u)}
                className={`p-3 rounded-xl border transition cursor-pointer text-xs ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 font-bold shadow-2xs'
                    : 'border-slate-100 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-black text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {u.title}
                  </span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold">
                    {u.lessons} tiết
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{u.desc}</p>
                <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Music className="w-3 h-3 text-emerald-600" />
                    <span>{u.audios} file audio</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-teal-600" />
                    <span>{u.docs} tài liệu PDF</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Chi tiết Unit đang chọn & Học liệu số (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">Unit đang chọn:</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{selectedUnit.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{selectedUnit.desc}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                Học kỳ I
              </span>
            </div>

            {/* Sub-sections tabs in unit: Getting Started, A Closer Look 1, etc. */}
            <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-100 pb-3">
              {[
                { id: 'getting_started', label: '1. Getting Started' },
                { id: 'closer_look_1', label: '2. A Closer Look 1 (Vocab & Pronunciation)' },
                { id: 'closer_look_2', label: '3. A Closer Look 2 (Grammar)' },
                { id: 'communication', label: '4. Communication' },
                { id: 'skills_1', label: '5. Skills 1 (Reading & Speaking)' },
                { id: 'skills_2', label: '6. Skills 2 (Listening & Writing)' },
                { id: 'looking_back', label: '7. Looking Back & Project' }
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveLessonSection(sec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeLessonSection === sec.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Học liệu số đính kèm */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                Học liệu số & Tài nguyên đính kèm
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Audio MP3 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-xs">Audio Track SGK Tiếng Anh 8</div>
                    <div className="text-[11px] text-slate-500">Giọng Anh - Anh chuẩn Cambridge (MP3 320kbps)</div>
                    <audio
                      controls
                      className="w-full mt-2 h-7"
                      src="https://actions.google.com/sounds/v1/ambiences/outdoor_morning.ogg"
                    />
                  </div>
                </div>

                {/* PDF Giáo án */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-xs">Kế hoạch bài dạy (Giáo án CV 5512)</div>
                    <div className="text-[11px] text-slate-500">Đầy đủ 4 bước hoạt động: Mở đầu, Hình thành KT, Luyện tập, Vận dụng</div>
                    <button
                      onClick={() => alert('Mở xem trước giáo án chuẩn CV 5512')}
                      className="mt-2 text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                    >
                      <span>Xem file PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Bài giảng PowerPoint */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-xs">Slide Trình Chiếu PowerPoint</div>
                    <div className="text-[11px] text-slate-500">Tích hợp trò chơi khởi động Warm-up & Minigame</div>
                    <button
                      onClick={() => alert('Tải slide bài giảng PowerPoint')}
                      className="mt-2 text-xs font-bold text-indigo-700 hover:underline flex items-center space-x-1"
                    >
                      <span>Tải bài giảng (.pptx)</span>
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Phiếu học tập */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-xs">Phiếu học tập tự luyện (Worksheet)</div>
                    <div className="text-[11px] text-slate-500">Kèm đáp án và thang chấm điểm chi tiết</div>
                    <button
                      onClick={() => alert('Tải phiếu bài tập in ấn cho học sinh')}
                      className="mt-2 text-xs font-bold text-amber-700 hover:underline flex items-center space-x-1"
                    >
                      <span>Tải phiếu học tập</span>
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
