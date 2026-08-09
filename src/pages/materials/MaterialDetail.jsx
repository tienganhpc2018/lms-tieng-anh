import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { GameViewer } from '../../components/GameViewer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ArrowLeft, ExternalLink, Download } from 'lucide-react';

export const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMaterial(data);
    } catch (err) {
      console.error('Error fetching material:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Đang nạp chi tiết học liệu..." />;

  if (!material) {
    return (
      <div className="p-8 text-center text-slate-400">
        Không tìm thấy tài liệu này trong hệ thống.
      </div>
    );
  }

  const isGame = material.type === 'game_iframe' || material.type === 'game_html5';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/materials')} variant="ghost" size="sm" icon={ArrowLeft}>
          Trở về Kho Học Liệu
        </Button>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={isGame ? 'emerald' : 'brand'}>{material.type.toUpperCase()}</Badge>
          <span className="text-xs font-semibold text-slate-400">Khối Lớp {material.grade_level || 'Chung'}</span>
        </div>

        <h1 className="text-2xl font-black text-slate-100">{material.title}</h1>
        <p className="text-sm text-slate-300">{material.description || 'Chưa có mô tả chi tiết.'}</p>
      </div>

      {isGame ? (
        <GameViewer material={material} />
      ) : material.type === 'video' ? (
        <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800">
          <video controls src={material.file_url} className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center space-y-4">
          <p className="text-sm text-slate-300">Tài liệu định dạng file PDF/DOCX. Bấm nút dưới đây để tải về hoặc xem trực tuyến:</p>
          <a
            href={material.file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all"
          >
            <Download className="w-4 h-4" /> Tải Xuống / Mở Document Trực Tiếp
          </a>
        </div>
      )}
    </div>
  );
};
