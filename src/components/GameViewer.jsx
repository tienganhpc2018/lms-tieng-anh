import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Gamepad2, AlertCircle, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export const GameViewer = ({ material }) => {
  const [html5Src, setHtml5Src] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!material) return;

    if (material.type === 'game_html5' && material.file_url) {
      loadZipGame(material.file_url);
    } else {
      setHtml5Src(null);
    }
  }, [material]);

  const loadZipGame = async (zipUrl) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(zipUrl);
      if (!res.ok) throw new Error('Không thể tải gói trò chơi HTML5 ZIP.');
      
      const blob = await res.blob();
      const zip = await JSZip.loadAsync(blob);

      let indexPath = Object.keys(zip.files).find(
        (filename) => filename.toLowerCase().endsWith('index.html')
      );

      if (!indexPath) {
        throw new Error('Gói ZIP không chứa file index.html.');
      }

      const indexFile = zip.files[indexPath];
      const indexHtmlText = await indexFile.async('string');

      const blobUrl = URL.createObjectURL(
        new Blob([indexHtmlText], { type: 'text/html' })
      );
      setHtml5Src(blobUrl);
    } catch (err) {
      console.error('Failed to unpack HTML5 ZIP game:', err);
      setError(err.message || 'Lỗi khi giải nén và phát game HTML5.');
    } finally {
      setLoading(false);
    }
  };

  if (!material) return null;

  return (
    <div className="w-full flex flex-col items-center glass-panel rounded-3xl p-4 border border-slate-800">
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-brand-400" />
          <h3 className="font-bold text-slate-100">{material.title}</h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 font-semibold border border-brand-500/30">
          {material.type === 'game_html5' ? 'HTML5 Zip Game' : 'Embedded Game (iFrame)'}
        </span>
      </div>

      {loading && <LoadingSpinner label="Đang tải và giải nén gói trò chơi..." />}

      {error && (
        <div className="p-6 text-center text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl w-full">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
          <iframe
            src={material.type === 'game_html5' ? html5Src : material.file_url}
            title={material.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
