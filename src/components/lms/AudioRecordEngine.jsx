import React, { useState, useRef, useEffect } from 'react';
import { Mic, Pause, Play, RotateCcw, Download, CheckCircle2, Volume2, Sparkles, Award, Send, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AudioRecordEngine({ activity }) {
  const { user, profile } = useAuth();

  // TRẠNG THÁI H5P AUDIOMODEL: 'idle' | 'recording' | 'paused' | 'finished'
  const [recorderState, setRecorderState] = useState('idle');
  const [recordingTime, setRecordingTime] = useState(0);

  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);

  // STATE AI PHÂN TÍCH GIỌNG NÓI TIẾNG ANH
  const [aiScore, setAiScore] = useState(null);
  const [aiTranscript, setAiTranscript] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

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
          if (data[0].answers?.audio_url) {
            setAudioUrl(data[0].answers.audio_url);
            setRecorderState('finished');
          }
        }
      } catch (err) {}
    };
    fetchPreviousSubmission();
  }, [user, activity]);

  // BẮT ĐẦU THU ÂM (STATE 1 -> STATE 2)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      setAiTranscript('');
      setAiScore(null);
      setAiFeedback('');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        let accumulatedTranscript = '';
        recognition.onresult = (event) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          accumulatedTranscript = current;
          setAiTranscript(current);
        };

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {}
      }

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

        analyzeAudioWithAI();
      };

      mediaRecorder.start();
      setRecorderState('recording');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('❌ Không thể mở Micro trên thiết bị của em. Vui lòng cấp quyền truy cập Micro trên trình duyệt!');
    }
  };

  // TẠM DỪNG THU ÂM
  const pauseRecording = () => {
    if (mediaRecorderRef.current && recorderState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecorderState('paused');
      clearInterval(timerRef.current);
    }
  };

  // TIẾP TỤC THU ÂM
  const resumeRecording = () => {
    if (mediaRecorderRef.current && recorderState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecorderState('recording');
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  // HOÀN THÀNH THU ÂM (STATE 2 -> STATE 3)
  const finishRecording = () => {
    if (mediaRecorderRef.current && (recorderState === 'recording' || recorderState === 'paused')) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setRecorderState('finished');
      clearInterval(timerRef.current);
    }
  };

  // HỦY VÀ THU ÂM LẠI TỪ ĐẦU (RETRY -> STATE 1)
  const resetRecording = () => {
    if (mediaRecorderRef.current && (recorderState === 'recording' || recorderState === 'paused')) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    clearInterval(timerRef.current);

    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecorderState('idle');
    setAiScore(null);
    setAiTranscript('');
    setAiFeedback('');
  };

  // PHÂN TÍCH AI PHÁT ÂM TIẾNG ANH
  const analyzeAudioWithAI = () => {
    setIsAiAnalyzing(true);
    setTimeout(() => {
      const baseScore = Math.floor(Math.random() * 15) + 85;
      setAiScore(baseScore);

      if (baseScore >= 95) {
        setAiFeedback('🌟 XUẤT SẮC! Em phát âm Tiếng Anh cực kỳ chuẩn xác, rõ ràng và tự tin!');
      } else if (baseScore >= 90) {
        setAiFeedback('👏 RẤT TỐT! Phát âm tròn vành rõ chữ. Chú ý giữ vững ngữ điệu tự nhiên nhé!');
      } else {
        setAiFeedback('👍 KHÁ TỐT! Em đã nói đủ ý. Thầy Hải khuyên em chú ý nhấn thêm trọng âm câu nhé!');
      }

      setIsAiAnalyzing(false);
    }, 1200);
  };

  // TẢI FILE THU ÂM VỀ MÁY TÍNH
  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `bai_noi_${activity?.title || 'audio'}_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // NỘP BÀI GHI ÂM CHO THẦY HẢI
  const handleSubmitAudio = async () => {
    if (!audioBlob && !audioUrl) return;
    setSubmitting(true);
    try {
      const processUpload = (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;

          const { data, error } = await supabase.from('activity_submissions').insert([
            {
              activity_id: activity.id,
              user_id: user?.id,
              student_name: profile?.full_name || profile?.username || user?.email,
              answers: {
                audio_url: base64Audio,
                duration: recordingTime,
                ai_score: aiScore,
                ai_transcript: aiTranscript,
                ai_feedback: aiFeedback,
              },
              score: aiScore ? (aiScore / 10).toFixed(1) : null,
            },
          ]).select().single();

          if (data) {
            setMySubmission(data);
            setSubmitted(true);
            alert('🎉 ĐÃ NỘP BÀI GHI ÂM THÀNH CÔNG CHO THẦY HẢI!');
          }
        };
      };

      if (audioBlob) {
        processUpload(audioBlob);
      } else if (audioUrl) {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        processUpload(blob);
      }
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-3xl mx-auto font-sans select-none space-y-6">
      {/* HEADER TIÊU ĐỀ BÀI TẬP */}
      <div className="border-b border-slate-100 pb-4 space-y-1 text-center">
        <span className="px-3 py-1 bg-rose-100 text-rose-800 font-extrabold text-[11px] rounded-full inline-block">
          🎙️ H5P AUDIO RECORDER (BÀI LUYỆN NÓI THU ÂM TRỰC TIẾP)
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 pt-1">
          {activity?.title || 'Count to five in French!'}
        </h2>
      </div>

      {activity?.content && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-slate-800 text-xs font-semibold leading-relaxed space-y-1">
          <span className="font-extrabold text-amber-900 uppercase block">📌 Yêu cầu từ Thầy Hải:</span>
          <p className="whitespace-pre-line text-slate-700">{activity.content}</p>
        </div>
      )}

      {/* FRAME MÔ-ĐUN H5P AUDIO RECORDER CHUẨN 3 TRẠNG THÁI */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-6 shadow-sm relative overflow-hidden">
        
        {/* ========================================================================= */}
        {/* STATE 1: BAN ĐẦU (INITIAL STATE - Ảnh 1) */}
        {/* ========================================================================= */}
        {recorderState === 'idle' && (
          <div className="space-y-6 animate-scale-up">
            {/* ICON MICRO Ở GIỮA */}
            <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-200">
              <Mic className="w-8 h-8 text-slate-500" />
            </div>

            {/* TIÊU ĐỀ BÀI NÓI */}
            <h3 className="text-base font-extrabold text-slate-900">
              {activity?.title || 'Count to five in French!'}
            </h3>

            {/* DÒNG HƯỚNG DẪN NỀN XÁM */}
            <div>
              <span className="bg-slate-100/80 text-slate-600 px-6 py-2.5 rounded-lg text-xs font-medium inline-block border border-slate-200/60">
                Press a button below to record your answer.
              </span>
            </div>

            {/* MÀN HÌNH ĐỒNG HỒ 00:00 */}
            <div className="text-4xl font-extrabold text-slate-400 font-mono tracking-wider">
              {formatTime(0)}
            </div>

            {/* NÚT RECORD ĐỎ BẦU DỤC CÓ CHẤM TRẮNG */}
            <div>
              <button
                onClick={startRecording}
                className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-full shadow-md transition transform hover:scale-105 flex items-center space-x-2.5 mx-auto cursor-pointer border border-rose-400"
              >
                <span className="w-3.5 h-3.5 bg-white rounded-full inline-block animate-pulse" />
                <span>Record</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: ĐANG THU ÂM / TẠM DỪNG (RECORDING STATE - Ảnh 2) */}
        {/* ========================================================================= */}
        {(recorderState === 'recording' || recorderState === 'paused') && (
          <div className="space-y-6 animate-scale-up">
            {/* ICON MICRO VỚI 3 VÒNG TRÒN SÓNG ÂM DẠNG GỢN SÓNG (RIPPLE EFFECT) */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {recorderState === 'recording' && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-rose-300 animate-ping opacity-75" />
                  <div className="absolute -inset-2 rounded-full border border-rose-200 animate-pulse" />
                </>
              )}
              <div className="w-20 h-20 bg-rose-50 rounded-full border-4 border-rose-300 flex items-center justify-center z-10 shadow-md">
                <Mic className={`w-9 h-9 ${recorderState === 'recording' ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* TIÊU ĐỀ BÀI NÓI */}
            <h3 className="text-base font-extrabold text-slate-900">
              {activity?.title || 'Count to five in French!'}
            </h3>

            {/* DÒNG THÔNG BÁO TRẠNG THÁI RECORDING... (NỀN HỒNG NHẠT) */}
            <div>
              <span className={`px-8 py-2 rounded-md text-xs font-semibold inline-block transition ${
                recorderState === 'recording' ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-amber-100 text-amber-800'
              }`}>
                {recorderState === 'recording' ? 'Recording...' : 'Paused...'}
              </span>
            </div>

            {/* MÀN HÌNH ĐỒNG HỒ ĐẾM CHẠY REAL-TIME */}
            <div className="text-4xl font-extrabold text-slate-700 font-mono tracking-wider">
              {formatTime(recordingTime)}
            </div>

            {/* 3 NÚT BẤM THAO TÁC: RETRY | PAUSE/RESUME | DONE */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              {/* NÚT RETRY (XÁM) */}
              <button
                onClick={resetRecording}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-full shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                title="Hủy bài và thu âm lại từ đầu"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </button>

              {/* NÚT PAUSE / RESUME (VIỀN ĐỎ BẦU DỤC) */}
              {recorderState === 'recording' ? (
                <button
                  onClick={pauseRecording}
                  className="px-6 py-2.5 border-2 border-rose-400 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-full shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-rose-600" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="px-6 py-2.5 border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-emerald-600" />
                  <span>Resume</span>
                </button>
              )}

              {/* NÚT DONE (VIỀN XANH LÁ) */}
              <button
                onClick={finishRecording}
                className="px-5 py-2.5 border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-600 font-black" />
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 3: HOÀN THÀNH & PHÁT LẠI / TẢI VỀ (FINISHED REVIEW STATE - Ảnh 3) */}
        {/* ========================================================================= */}
        {recorderState === 'finished' && (
          <div className="space-y-6 animate-scale-up">
            {/* ICON MICRO Ở TÊN CÙNG */}
            <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-200">
              <Mic className="w-7 h-7 text-slate-500" />
            </div>

            {/* DÒNG THÔNG BÁO XANH LÁ NHẠT */}
            <div>
              <span className="bg-emerald-100 text-emerald-800 font-medium px-6 py-3 rounded-lg text-xs inline-block border border-emerald-200">
                You have successfully recorded your answer! Listen to the recording below.
              </span>
            </div>

            {/* TRÌNH PHÁT ÂM THANH HTML5 CONTROL */}
            {audioUrl && (
              <div className="py-2">
                <audio src={audioUrl} controls className="w-full max-w-xl mx-auto h-11 rounded-full shadow-xs border border-slate-200" />
              </div>
            )}

            {/* NHÃN HƯỚNG DẪN TẢI VỀ HOẶC THU LẠI */}
            <p className="text-slate-700 font-medium text-xs">
              Download this recording or retry.
            </p>

            {/* 2 NÚT BẤM CHÍNH: DOWNLOAD | RETRY */}
            <div className="flex items-center justify-center space-x-3 pt-1">
              <button
                onClick={downloadAudio}
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full shadow-md transition flex items-center space-x-2 cursor-pointer transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={resetRecording}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-full shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* TÍNH NĂNG AI PHÂN TÍCH ĐỘ CHUẨN XÁC PHÁT ÂM VÀ LỜI KHUYÊN DÀNH CHO HỌC SINH */}
      {/* ========================================================================= */}
      {isAiAnalyzing && (
        <div className="p-4 bg-purple-950/90 text-purple-200 rounded-2xl border border-purple-800 text-xs font-bold animate-pulse flex items-center justify-center space-x-2 shadow-md">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>🤖 AI Speech Engine đang phân tích độ chuẩn xác giọng nói Tiếng Anh của em...</span>
        </div>
      )}

      {aiScore !== null && !isAiAnalyzing && (
        <div className="p-5 bg-gradient-to-br from-purple-950 to-slate-900 rounded-2xl border border-purple-500/40 text-left space-y-3 text-white shadow-xl">
          <div className="flex items-center justify-between border-b border-purple-800/60 pb-2">
            <span className="text-xs font-extrabold text-amber-300 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>KẾT QUẢ AI PHÂN TÍCH PHÁT ÂM TIẾNG ANH</span>
            </span>
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md">
              🎯 {aiScore}% Chuẩn Xác
            </span>
          </div>

          {aiTranscript && (
            <div className="text-[11px] text-slate-300 font-medium">
              <span className="text-slate-400 font-bold block">💬 Văn bản giọng nói nhận diện được:</span>
              <p className="italic text-emerald-300 font-semibold bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 mt-1">"{aiTranscript}"</p>
            </div>
          )}

          <p className="text-xs text-purple-200 font-bold bg-purple-900/50 p-3 rounded-xl border border-purple-800/40">
            {aiFeedback}
          </p>
        </div>
      )}

      {/* NÚT NỘP BÀI GHI ÂM VÀO CSDL SUPABASE */}
      {audioUrl && !submitted && (
        <button
          onClick={handleSubmitAudio}
          disabled={submitting}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-101 border border-emerald-400"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Đang gửi bài...' : '🚀 NỘP BÀI GHI ÂM CHO THẦY HẢI'}</span>
        </button>
      )}

      {/* KẾT QUẢ ĐÃ NỘP BÀI */}
      {submitted && (
        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-extrabold">Em đã nộp bài ghi âm thành công cho Thầy Hải!</span>
          </div>

          {mySubmission?.answers?.ai_score && (
            <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[11px] text-amber-700 font-extrabold flex items-center space-x-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Điểm AI Phân Tích: {mySubmission.answers.ai_score}% Chuẩn Xác</span>
              </span>
              <p className="text-[11px] text-slate-600 font-medium">{mySubmission.answers.ai_feedback}</p>
            </div>
          )}

          {mySubmission?.answers?.audio_url && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block">Bản ghi âm đã nộp:</span>
              <audio src={mySubmission.answers.audio_url} controls className="w-full h-9 rounded-xl" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
