import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Bot,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { InterviewSession, InterviewQuestion, SubmittedAnswer } from '../types';
import { AudioWaveform } from '../components/AudioWaveform';

interface InterviewSessionPageProps {
  onNavigate: (page: string, params?: any) => void;
  interviewId: string;
}

export const InterviewSessionPage: React.FC<InterviewSessionPageProps> = ({ onNavigate, interviewId }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [isVoiceUsed, setIsVoiceUsed] = useState<Record<string, boolean>>({});

  // Voice recording & Speech recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [voiceVolumeEnabled, setVoiceVolumeEnabled] = useState(true);

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins default
  const [questionSeconds, setQuestionSeconds] = useState(0);

  // Follow-up question state
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [confirmEndModal, setConfirmEndModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const qTimerRef = useRef<any>(null);

  // 1. Fetch Interview Session
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await api.interviews.getById(interviewId);
        setSession(res.session);

        const initialAnswers: Record<string, string> = {};
        const initialTimes: Record<string, number> = {};
        const initialVoice: Record<string, boolean> = {};

        (res.session.submittedAnswers || []).forEach(a => {
          initialAnswers[a.questionId] = a.userAnswer;
          initialTimes[a.questionId] = a.timeSpentSeconds;
          initialVoice[a.questionId] = a.isVoiceInput;
        });

        setAnswers(initialAnswers);
        setTimeSpent(initialTimes);
        setIsVoiceUsed(initialVoice);

        const totalSecs = (res.session.durationMinutes || 15) * 60;
        setSecondsRemaining(totalSecs);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load interview session.');
        onNavigate('dashboard');
      }
    }

    if (interviewId) {
      fetchSession();
    }
  }, [interviewId]);

  // 2. Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsTranscribing(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (session && session.questions[currentIndex]) {
          const qId = session.questions[currentIndex].id;
          setAnswers(prev => {
            const current = prev[qId] || '';
            const addition = finalTranscript || interimTranscript;
            return {
              ...prev,
              [qId]: (current ? current.trim() + ' ' : '') + addition.trim(),
            };
          });
          setIsVoiceUsed(prev => ({ ...prev, [qId]: true }));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsTranscribing(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. You can continue typing your answer in the text box.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [currentIndex, session]);

  // 3. Timers
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    qTimerRef.current = setInterval(() => {
      setQuestionSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(qTimerRef.current);
    };
  }, [currentIndex]);

  // Reset question timer & speak question when current question changes
  useEffect(() => {
    setQuestionSeconds(0);
    setFollowUpQuestion(null);
    if (session && session.questions[currentIndex] && voiceVolumeEnabled) {
      speakQuestionText(session.questions[currentIndex].question);
    }
  }, [currentIndex, session]);

  // Text to Speech
  const speakQuestionText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingQuestion(true);
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setIsSpeakingQuestion(false);
    }
  };

  const toggleVoiceVolume = () => {
    if (voiceVolumeEnabled) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setVoiceVolumeEnabled(false);
      setIsSpeakingQuestion(false);
    } else {
      setVoiceVolumeEnabled(true);
      if (session && session.questions[currentIndex]) {
        speakQuestionText(session.questions[currentIndex].question);
      }
    }
  };

  // Toggle Microphone Recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
        setIsTranscribing(false);
        toast.info('Voice recording paused. You can review and edit your transcribed answer.');
      } catch (e) {
        setIsRecording(false);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info('Microphone listening... Speak clearly.');
      } catch (e) {
        toast.error('Could not start microphone. Check browser permissions.');
      }
    }
  };

  // Save current question answer to backend
  const saveCurrentAnswerToBackend = async () => {
    if (!session) return;
    const currentQ = session.questions[currentIndex];
    const answerText = answers[currentQ.id] || '';

    try {
      await api.interviews.saveAnswer(session.id, {
        questionId: currentQ.id,
        questionText: currentQ.question,
        category: currentQ.category,
        userAnswer: answerText,
        timeSpentSeconds: questionSeconds,
        isVoiceInput: Boolean(isVoiceUsed[currentQ.id]),
      });
    } catch (err) {
      console.warn('Could not auto-save answer:', err);
    }
  };

  // Ask for an adaptive AI follow-up
  const handleRequestFollowUp = async () => {
    if (!session) return;
    const currentQ = session.questions[currentIndex];
    const currentAns = answers[currentQ.id] || '';

    if (currentAns.trim().length < 15) {
      toast.error('Please provide an initial answer before requesting an AI follow-up inquiry.');
      return;
    }

    try {
      setLoadingFollowUp(true);
      toast.info('Interviewer analyzing your response for deeper follow-up...');
      const res = await api.interviews.followUp({
        jobRole: session.jobRole,
        originalQuestion: currentQ.question,
        userAnswer: currentAns,
      });

      setFollowUpQuestion(res.followUp);
      if (voiceVolumeEnabled) {
        speakQuestionText(res.followUp);
      }
      toast.success('Interviewer asked a follow-up question!');
    } catch (err) {
      toast.error('Could not generate follow-up question.');
    } finally {
      setLoadingFollowUp(false);
    }
  };

  // Next Question
  const handleNextQuestion = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    await saveCurrentAnswerToBackend();

    if (session && currentIndex < session.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleCompleteInterview();
    }
  };

  // Previous Question
  const handlePreviousQuestion = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    await saveCurrentAnswerToBackend();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Complete Interview & Run Evaluation
  const handleCompleteInterview = async () => {
    if (!session) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      setSubmitting(true);
      toast.info('Submitting all answers to Gemini 3.8 Flash for multi-category evaluation...');

      const formattedAnswers: SubmittedAnswer[] = session.questions.map(q => ({
        questionId: q.id,
        questionText: q.question,
        category: q.category,
        userAnswer: answers[q.id] || '(Skipped / No answer submitted)',
        timeSpentSeconds: timeSpent[q.id] || questionSeconds || 30,
        isVoiceInput: Boolean(isVoiceUsed[q.id]),
      }));

      const res = await api.interviews.complete(session.id, formattedAnswers);

      toast.success('Interview evaluated! Redirecting to your performance report...');
      onNavigate('evaluation-report', { interviewId: session.id });
    } catch (err: any) {
      toast.error(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading AI Interview Session...</p>
        </div>
      </div>
    );
  }

  const currentQ: InterviewQuestion = session.questions[currentIndex] || session.questions[0];
  const progressPercent = Math.round(((currentIndex + 1) / session.questions.length) * 100);
  const currentAnswerText = answers[currentQ.id] || '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Bar: Session Info, Progress, Countdown Timer */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Role & Type */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base text-slate-900">{session.jobRole}</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
              {session.interviewType}
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {session.difficulty}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Target Duration: {session.durationMinutes} mins • {session.questions.length} Total Questions
          </p>
        </div>

        {/* Right: Progress and Timers */}
        <div className="flex items-center space-x-4 shrink-0">
          {/* Question progress */}
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700 block">
              Question {currentIndex + 1} of {session.questions.length}
            </span>
            <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
              secondsRemaining < 180
                ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* End Interview Early */}
          <button
            onClick={() => setConfirmEndModal(true)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* AI Interviewer Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Interviewer Persona Card */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">AI Senior Interviewer</span>
              </div>
              <button
                onClick={toggleVoiceVolume}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={voiceVolumeEnabled ? 'Mute AI voice' : 'Enable AI voice'}
              >
                {voiceVolumeEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Avatar & Speaking animation */}
            <div className="text-center py-4 space-y-3">
              <div className="relative inline-block">
                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl mx-auto transition-transform ${
                    isSpeakingQuestion ? 'scale-105 ring-4 ring-indigo-400/50 animate-pulse' : ''
                  }`}
                >
                  <Bot className="w-10 h-10" />
                </div>
                {isSpeakingQuestion && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Speaking
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200">Director of Engineering</h3>
                <p className="text-xs text-slate-400">Evaluating for {session.jobRole}</p>
              </div>
            </div>

            {/* Key Expected Points to Keep in Mind */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interviewer Guidance</span>
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Speak clearly and outline your high-level approach first.</li>
                <li>Give real-world project context or architectural trade-offs.</li>
                <li>Aim for concise, structured verbal delivery (60-120s).</li>
              </ul>
            </div>
          </div>

          {/* Time spent on current question */}
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
            Time on this question: <span className="font-mono text-white font-bold">{formatTime(questionSeconds)}</span>
          </div>
        </div>

        {/* Right 2 Columns: Question Display, Voice Controls & Answer Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {currentQ.category} Round • Question #{currentIndex + 1}
              </span>
              <button
                onClick={() => speakQuestionText(currentQ.question)}
                className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-indigo-600"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Question</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              "{currentQ.question}"
            </h2>

            {/* Follow-up Question Callout if triggered */}
            {followUpQuestion && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-1.5 animate-in slide-in-from-top-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Adaptive Follow-up Inquiry</span>
                </div>
                <p className="text-sm font-semibold italic">"{followUpQuestion}"</p>
                <p className="text-[11px] text-purple-700">Address this follow-up directly in your response.</p>
              </div>
            )}

            {/* Trigger AI Follow-up button */}
            {!followUpQuestion && currentAnswerText.trim().length > 30 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRequestFollowUp}
                  disabled={loadingFollowUp}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loadingFollowUp ? 'Generating follow-up...' : 'Request AI Follow-up Probe'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Voice Recording Controls & Real-time Waveform */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Voice Answer & Live Transcription</h3>
                <p className="text-xs text-slate-500">
                  {speechSupported
                    ? 'Click the microphone to speak your response. Browser speech recognition will transcribe in real time.'
                    : 'Speech recognition is not supported in this browser. Please type your answer directly in the box below.'}
                </p>
              </div>

              {speechSupported && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-sm transition active:scale-95 ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 fill-white" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Audio Waveform visualization */}
            <AudioWaveform isRecording={isRecording} />

            {/* Transcribed Text Area (Editable) */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Your Answer (Review & Edit Transcript)</span>
                </label>
                <span className="text-slate-400">{currentAnswerText.length} characters</span>
              </div>

              <textarea
                value={currentAnswerText}
                onChange={e => {
                  setAnswers({ ...answers, [currentQ.id]: e.target.value });
                }}
                rows={5}
                placeholder="Speak using the microphone or type your complete answer here. You can refine or expand your thoughts at any time..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handlePreviousQuestion}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {currentIndex < session.questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center space-x-2 active:scale-95"
              >
                <span>Save & Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteInterview}
                disabled={submitting}
                className="px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-emerald-600/25 transition flex items-center space-x-2 active:scale-95 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="inline-flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Answers with Gemini AI...</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish & Generate Evaluation Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Ending Early */}
      {confirmEndModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Finish Mock Interview Early?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You have answered {Object.keys(answers).filter(k => answers[k]?.trim()).length} out of {session.questions.length} questions. You will receive an AI evaluation on all submitted answers.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setConfirmEndModal(false)}
                className="w-1/2 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Continue Practice
              </button>
              <button
                onClick={() => {
                  setConfirmEndModal(false);
                  handleCompleteInterview();
                }}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Submit & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
