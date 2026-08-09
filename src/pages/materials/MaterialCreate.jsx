import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { ArrowLeft, Upload, Gamepad2, FileText, Link as LinkIcon } from 'lucide-react';

export const MaterialCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('document'); // document, video, game_iframe, game_html5
  const [fileUrl, setFileUrl] = useState('');
  const [gradeLevel, setGradeLevel] = useState(6);
  const [unitNumber, setUnitNumber] = useState(1);
  const [topic, setTopic] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalUrl = fileUrl;

      // Handle file upload to Supabase Storage if file is provided
      if (file && (type === 'document' || type === 'video' || type === 'game_html5')) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('materials')
          .upload(filePath, file);

        if (uploadErr) throw uploadErr;

        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath);

        finalUrl = publicUrlData.publicUrl;
      }

      if (!finalUrl && type === 'game_iframe') {
        throw new Error('Vui lòng nhập iFrame / Embed URL cho trò chơi.');
      }

      const { error: insertErr } = await supabase.from('materials').insert({
        title,
        description,
        type,
        file_url: finalUrl,
        author_id: user.id,
        grade_level: Number(gradeLevel),
        unit_number: Number(unitNumber),
        topic,
        is_public: isPublic,
      });

      if (insertErr) throw insertErr;

      alert('Tải lên học liệu / trò chơi thành công!');
      navigate('/materials');
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/materials')} variant="ghost" size="sm" icon={ArrowLeft}>
          Quay lại Kho Học Liệu
        </Button>
      </div>

      <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Tải Lên Học Liệu & Trò Chơi Mới</h1>
          <p className="text-xs text-slate-400">Hỗ trợ File PDF, PPTX, Video MP4, iFrame Embed & Gói HTML5 Zip</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Loại Định Dạng Học Liệu</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'document', label: 'Tài liệu (PDF, Word)', icon: FileText },
                { id: 'video', label: 'Video MP4', icon: Upload },
                { id: 'game_iframe', label: 'Game Embed (URL)', icon: LinkIcon },
                { id: 'game_html5', label: 'Game HTML5 (.zip)', icon: Gamepad2 },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      type === t.id
                        ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <span className="text-xs font-bold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tiêu Đề Học Liệu / Trò Chơi</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Game Từ Vựng Unit 1 - Grade 7 Global Success"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          {type === 'game_iframe' ? (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Đường Dẫn iFrame / Embed URL (Wordwall / Quizizz)</label>
              <input
                type="url"
                required
                placeholder="https://wordwall.net/embed/..."
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tải File Lên (Trực tiếp lưu Supabase Storage)</label>
              <input
                type="file"
                accept={type === 'game_html5' ? '.zip' : type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx'}
                onChange={handleFileChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500/20 file:text-brand-300 hover:file:bg-brand-500/30"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Khối Lớp</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value={6}>Lớp 6</option>
                <option value={7}>Lớp 7</option>
                <option value={8}>Lớp 8</option>
                <option value={9}>Lớp 9</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Unit Số</label>
              <input
                type="number"
                min={1}
                max={12}
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chủ Đề (Topic)</label>
              <input
                type="text"
                placeholder="School Things..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả học liệu</label>
            <textarea
              rows={3}
              placeholder="Ghi chú thêm về cách chơi hoặc yêu cầu bài tập..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => navigate('/materials')}>
              Hủy
            </Button>
            <Button type="submit" loading={loading} variant="primary">
              Tải Lên Kho Học Liệu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
