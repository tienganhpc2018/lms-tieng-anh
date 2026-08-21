import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Send, CheckCircle2, Volume2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AudioRecordEngine({ activity }) {
  const { user, profile } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchPreviousSubmission = async () => {
      if (!user?.id || !activity?.id) return;
      try {
        const { data } = await supabase
          .from('activity_submissions')
          .select('*')
          .eq('activity_id', activity.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          setMySubmission(data[0]);
          setSubmitted(true);
        }
      } catch (err) {}
    };
    fetchPreviousSubmission();
  }, [user, activity]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('❌ Không thể mở Micro trên thiết bị của em. Vui lòng cho phép quyền truy cập Micro trên trình duyệt!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const handleSubmitAudio = async () => {
    if (!audioBlob) return;
    setSubmitting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;

        const { data, error } = await supabase.from('activity_submissions').insert([
          {
            activity_id: activity.id,
            user_id: user?.id,
            student_name: profile?.full_name || profile?.username || user?.email,
            answers: { audio_url: base64Audio, duration: recordingTime },
            score: null,
          },
        ]).select().single();

        if (data) {
          setMySubmission(data);
          setSubmitted(true);
          alert('🎉 ĐÃ NỘP BÀI GHI ÂM THÀNH CÔNG CHO THẦY HẢI!');
        }
      };
    } catch (err) {
      alert('Lỗi nộp bài: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto font-sans select-none">
      <div className="border-b border-slate-100 pb-4 space-y-1">
        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[11px] rounded-md">
          🎙️ BÀI LUYỆN NÓI & PHÁT ÂM TIẾNG ANH
        </span>
        <h2 className="text-lg font-extrabold text-slate-900">
          {activity?.title || 'Bài Luyện Nói Ghi Âm'}
        </h2>
      </div>

      {activity?.content && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-slate-800 text-xs font-semibold leading-relaxed space-y-2">
          <span className="font-extrabold text-amber-900 uppercase block">📌 Yêu cầu từ Thầy Hải:</span>
          <p className="whitespace-pre-line">{activity.content}</p>
        </div>
      )}

      <div className="p-8 bg-slate-900 rounded-3xl text-white text-center space-y-6 shadow-xl border border-slate-800">
        <div className="w-20 h-20 bg-rose-600/20 text-rose-500 rounded-full flex items-center justify-center mx-auto border-2 border-rose-500/40 shadow-inner">
          <Mic className={`w-10 h-10 ${isRecording ? 'animate-pulse text-rose-400' : 'text-slate-300'}`} />
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-black font-mono tracking-wider text-rose-400">
            {formatTime(recordingTime)}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {isRecording ? '🔴 Đang ghi âm giọng nói của em...' : audioUrl ? '✅ Đã hoàn thành bản ghi âm!' : 'Bấm nút màu đỏ bên dưới để bắt đầu ghi âm'}
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 pt-2">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-extrabold text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer transform hover:scale-105"
            >
              <Mic className="w-4 h-4" />
              <span>🎙️ Bắt Đầu Ghi Âm</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-extrabold text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>⏹️ Dừng Ghi Âm</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <button
              onClick={resetRecording}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-extrabold text-xs transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ghi Âm Lại</span>
            </button>
          )}
        </div>

        {audioUrl && (
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-left">
            <span className="text-[11px] font-extrabold text-emerald-400 block flex items-center space-x-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Nghe lại bản ghi âm của em trước khi nộp:</span>
            </span>
            <audio src={audioUrl} controls className="w-full h-10 rounded-xl" />
          </div>
        )}
      </div>

      {audioUrl && !submitted && (
        <button
          onClick={handleSubmitAudio}
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-101"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Đang gửi bài...' : '🚀 NỘP BÀI GHI ÂM CHO THẦY HẢI'}</span>
        </button>
      )}

      {submitted && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span>Em đã nộp bài ghi âm thành công cho Thầy Hải! Thầy sẽ nghe bài và cho điểm em nhé!</span>
            {mySubmission?.answers?.audio_url && (
              <audio src={mySubmission.answers.audio_url} controls className="w-full h-8 mt-2" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
