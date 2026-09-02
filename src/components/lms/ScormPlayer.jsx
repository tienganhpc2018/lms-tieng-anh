import React, { useEffect, useState } from 'react';
import { ScormEngine } from '../../lib/scormEngine';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ScormPlayer({ activity }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('incomplete');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!activity || !user) return;

    let engine = new ScormEngine(activity.id, user.id, async (data) => {
      setStatus(data.status);
      setScore(data.score);

      // Lưu tự động dữ liệu CMI lên Supabase DB
      await supabase.from('scorm_h5p_tracking').upsert([
        {
          activity_id: activity.id,
          student_id: user.id,
          tracking_data: data.tracking_data,
          status: data.status,
          score: data.score,
          updated_at: new Date().toISOString(),
        },
      ]);
    });

    // 1. Khởi tạo SCORM 1.2 window.API
    engine.initSCORM12();

    // 2. Fetch dữ liệu cũ (nếu có)
    const loadOldData = async () => {
      const { data } = await supabase
        .from('scorm_h5p_tracking')
        .select('*')
        .eq('activity_id', activity.id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (data) {
        engine.loadSavedData(data);
        setStatus(data.status || 'incomplete');
        setScore(data.score || 0);
      }
      setLoading(false);
    };

    loadOldData();

    return () => {
      engine.destroy();
    };
  }, [activity.id, user?.id]);

  if (loading) return <LoadingSpinner text="Đang khởi chạy gói bài giảng SCORM E-learning..." />;

  const scormUrl = activity.content_url || 'https://www.scorm.com/wp-content/assets/golf_samples/GolfExamplev1.2/index.html';

  return (
    <div className="space-y-4">
      {/* SCORM Status Bar */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase">Trạng Thái SCORM Package</h4>
            <p className="text-xs text-amber-700">
              Trạng thái: <strong className="uppercase">{status}</strong> | Điểm ghi nhận:{' '}
              <strong className="text-amber-900 font-bold">{score} / 100</strong>
            </p>
          </div>
        </div>
        <span className="text-[11px] text-amber-600 font-medium">Tự động đồng bộ CMI Protocol</span>
      </div>

      {/* Frame bài giảng SCORM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[650px] relative">
        <iframe
          src={scormUrl}
          title={activity.title}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}
