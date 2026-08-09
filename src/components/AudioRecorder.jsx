import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RefreshCw, Volume2 } from 'lucide-react';
import { Button } from './Button';

export const AudioRecorder = ({ onRecordComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    // Setup Web Speech API Recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setAudioUrl(null);
    setTranscript('');
    setTimer(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onRecordComplete) {
          onRecordComplete({ audioBlob, audioUrl: url, transcript });
        }
      };

      mediaRecorderRef.current.start();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsRecording(true);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Vui lòng cho phép quyền truy cập micro để thực hiện bài nói Speaking.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          THU ÂM BÀI NÓI (SPEAKING RECORDER)
        </span>
        {isRecording && (
          <span className="text-xs font-bold text-rose-400 animate-pulse flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            ĐANG THU ÂM... ({formatTime(timer)})
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 my-2">
        {!isRecording ? (
          <Button onClick={startRecording} variant="emerald" icon={Mic}>
            {audioUrl ? 'Thu Âm Lại' : 'Bắt Đầu Nói'}
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="danger" icon={Square}>
            Dừng Thu Âm
          </Button>
        )}
      </div>

      {/* Real-time transcript preview */}
      <div className="w-full bg-slate-900/80 rounded-2xl p-4 border border-slate-800 text-left min-h-[80px]">
        <p className="text-xs font-semibold text-slate-400 mb-1">TRANSCRIPT GHI ÂM (ENGLISH):</p>
        <p className="text-sm text-slate-200 italic">
          {transcript || (isRecording ? 'Đang lắng nghe giọng nói...' : 'Chưa có dữ liệu lời nói.')}
        </p>
      </div>

      {audioUrl && (
        <div className="w-full flex items-center justify-center pt-2">
          <audio controls src={audioUrl} className="w-full max-w-md" />
        </div>
      )}
    </div>
  );
};
