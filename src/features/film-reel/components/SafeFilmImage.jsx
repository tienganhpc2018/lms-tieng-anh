import React, { useState, useEffect } from 'react';
import { ImageOff, ExternalLink } from 'lucide-react';
import { extractGoogleDriveFileId, getGoogleDriveFallbackUrls } from '../utils/googleDriveHelper';

const DEFAULT_FALLBACK_COVER = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80';

export default function SafeFilmImage({
  src,
  alt = '',
  className = '',
  fallbackSrc = DEFAULT_FALLBACK_COVER,
  showWarningIfDriveError = false,
  onClick,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [candidateList, setCandidateList] = useState([]);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [isDrive, setIsDrive] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(fallbackSrc);
      setIsDrive(false);
      setCandidateList([]);
      setLoadFailed(false);
      return;
    }

    const fileId = extractGoogleDriveFileId(src);
    if (fileId) {
      setIsDrive(true);
      const candidates = getGoogleDriveFallbackUrls(src);
      setCandidateList(candidates);
      setCandidateIdx(0);
      setCurrentSrc(candidates[0]);
      setLoadFailed(false);
    } else {
      setIsDrive(false);
      setCandidateList([]);
      setCurrentSrc(src);
      setLoadFailed(false);
    }
  }, [src, fallbackSrc]);

  const handleImgError = () => {
    if (isDrive && candidateList.length > 0) {
      const nextIdx = candidateIdx + 1;
      if (nextIdx < candidateList.length) {
        setCandidateIdx(nextIdx);
        setCurrentSrc(candidateList[nextIdx]);
        return;
      }
    }

    // Nếu đã thử hết các URL Google Drive hoặc ảnh thường bị lỗi
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setLoadFailed(true);
    }
  };

  if (loadFailed && isDrive && showWarningIfDriveError) {
    const fileId = extractGoogleDriveFileId(src);
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-slate-900 text-center text-white select-none ${className}`}>
        <ImageOff className="w-8 h-8 text-amber-400 mb-2" />
        <p className="text-xs font-bold text-amber-300">Không thể tải ảnh Google Drive</p>
        <p className="text-[11px] text-slate-300 mt-1 max-w-xs leading-relaxed">
          Ảnh có thể chưa được bật quyền <b>"Bất kỳ ai có đường liên kết"</b> (Anyone with the link).
        </p>
        {fileId && (
          <a
            href={`https://drive.google.com/file/d/${fileId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <span>Mở kiểm tra trên Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc || fallbackSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={handleImgError}
      onClick={onClick}
      {...props}
    />
  );
}
