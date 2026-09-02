import React, { useEffect, useState } from 'react';
import { Package, Award, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function H5PViewer({ activity }) {
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const h5pUrl = activity.content_url || 'https://h5p.org/h5p/embed/61248';

  const handleMarkComplete = async () => {
    setCompleted(true);
    setScore(100);
    if (user) {
      await supabase.from('scorm_h5p_tracking').upsert([
        {
          activity_id: activity.id,
          student_id: user.id,
          tracking_data: { h5pCompleted: true },
          status: 'completed',
          score: 100,
          updated_at: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header H5P Info */}
      <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-sky-900 uppercase">Học Liệu Tương Tác H5P</h4>
            <p className="text-xs text-sky-700">Tương tác trực tiếp trên bài giảng tương tác bên dưới</p>
          </div>
        </div>

        {completed ? (
          <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            <span>Đã Hoàn Thành (100 điểm)</span>
          </span>
        ) : (
          <button
            onClick={handleMarkComplete}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
          >
            Đánh Dấu Đã Hoàn Thành
          </button>
        )}
      </div>

      {/* Frame H5P Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px]">
        <iframe
          src={h5pUrl}
          title={activity.title}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}
