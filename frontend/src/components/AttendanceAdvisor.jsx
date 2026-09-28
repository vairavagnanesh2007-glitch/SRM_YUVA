import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw,
  MessageSquare,
  Clock,
  ChevronDown
} from 'lucide-react';
import { askAdvisor } from '../services/api';

export default function AttendanceAdvisor({ 
  sectionId = 'III-ECE-B', 
  currentSubjectCode = '21MAB302T',
  classesConducted = 25,
  classesAttended = 17,
  attendancePercentage = 68.0,
  todayDate = '2026-09-28'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);

  const initialBotMessage = {
    id: 'welcome',
    sender: 'bot',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Hi! I'm your **Attendance Advisor AI**.\n\nI have direct access to the **${sectionId}** timetable and your course metrics for **${currentSubjectCode}**.\n\nAsk me anything or tap a quick question below:`,
    suggestions: [
      "Can I skip tomorrow?",
      "If I take a 3-day sick leave starting tomorrow?",
      "How many classes can I safely miss?",
      "How many classes to reach 75%?",
      "Can On-Duty hours rescue me?"
    ]
  };

  const [messages, setMessages] = useState([initialBotMessage]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        handleSendQuery(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [sectionId, currentSubjectCode, classesConducted, classesAttended]);

  // Text to Speech
  const speakText = (text) => {
    if (!isSpeechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~•]/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F7E0}-\u{1F7EB}]/gu, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition error", err);
      }
    }
  };

  const handleSendQuery = async (customQuery = null) => {
    const queryToSend = (customQuery || inputQuery).trim();
    if (!queryToSend || loading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryToSend,
      time: currentTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await askAdvisor({
        query: queryToSend,
        sectionId: sectionId,
        currentSubjectCode: currentSubjectCode,
        classesConducted: classesConducted,
        classesAttended: classesAttended,
        attendancePercentage: attendancePercentage,
        todayDate: todayDate
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: response.type,
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(response.answer);
    } catch (err) {
      console.error("Advisor error", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "I couldn't reach the calculation service right now. Please ensure the backend is running at http://127.0.0.1:8000.",
          type: "ERROR"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([initialBotMessage]);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  // Helper to format bot markdown text cleanly
  const renderFormattedText = (rawText) => {
    return rawText.split('\n').map((line, idx) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-emerald-600 font-bold">•</span>
            <span>{formattedLine}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return <p key={idx} className="my-0.5">{formattedLine}</p>;
    });
  };

  return (
    <>
      {/* Real Bot Launcher Bubble (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          {/* Subtle invitation chip */}
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-md text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-all animate-bounce"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask Attendance AI</span>
          </div>

          {/* Floating trigger button */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center relative cursor-pointer ring-4 ring-slate-900/10 border-2 border-white"
            title="Chat with AI Attendance Advisor"
          >
            <Bot className="w-6 h-6 text-white" />
            {/* Pulsing online indicator */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </button>
        </div>
      )}

      {/* Real Chat Bot Window (White Theme) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-5rem)] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">Attendance AI</h3>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {sectionId} • {currentSubjectCode} ({attendancePercentage}%)
                </span>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                className={`p-1.5 rounded-full transition-colors ${
                  isSpeechEnabled ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-700'
                }`}
                title={isSpeechEnabled ? "Voice Speech Enabled" : "Voice Speech Muted"}
              >
                {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                title="Restart Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble Container */}
                <div
                  className={`p-3.5 text-xs rounded-2xl shadow-2xs leading-relaxed max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.sender === 'bot' ? (
                    <div>{renderFormattedText(msg.text)}</div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>

                {/* Timestamp & Speaker Icon */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.time}</span>
                  {msg.sender === 'bot' && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="hover:text-slate-700 transition-colors"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Suggestions Pills if any */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendQuery(sug)}
                        className="text-[11px] text-left px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all shadow-2xs hover:border-slate-300"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex flex-col items-start space-y-1">
                <div className="p-3.5 rounded-2xl rounded-bl-xs bg-white border border-slate-200 text-slate-600 text-xs shadow-2xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  </div>
                  <span className="text-[11px] text-slate-400">Analyzing timetable...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2 bg-slate-100 border border-slate-200 focus-within:border-slate-400 focus-within:bg-white rounded-full px-3 py-1.5 transition-all shadow-inner"
            >
              {/* Mic Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-1.5 rounded-full transition-all ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={isListening ? "Listening... click to stop" : "Voice Dictation"}
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isListening ? "Listening... speak now" : "Ask about skips, leaves, recovery..."}
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
