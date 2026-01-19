import React
import { useState, useEffect } from react
import ChatInterface from './components/ChatInterface';
import TherapistModal from './components/TherapistModal';
import BreathingWidget from './components/BreathingWidget';
import { Message, Role, AppState } from './types';
import { sendMessageToGemini, initializeChat } from './services/geminiService';
import { Shield, Sparkles } from 'lucide-react';

// Use a simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: Role.MODEL,
  content: "Hi there. I'm Lumi. I know life can feel overwhelming sometimes. I'm here to listen without judgment. How are you feeling today?",
  timestamp: new Date()
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [isTyping, setIsTyping] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showTherapist, setShowTherapist] = useState(false);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
    // Simulate a small delay for onboarding feel
    setTimeout(() => {
      setAppState(AppState.CHAT);
    }, 1000);
  }, []);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg: Message = {
      id: generateId(),
      role: Role.USER,
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Get response from Gemini
      const response = await sendMessageToGemini(text);

      // Check for Crisis Trigger
      if (response.crisisTriggered) {
        setAppState(AppState.CRISIS);
        setShowTherapist(true);
      }

      // Add AI Message
      // Even if crisis is triggered, we show the empathetic text response
      // which usually says "I'm hearing that you are in pain..."
      if (response.text) {
          const aiMsg: Message = {
            id: generateId(),
            role: Role.MODEL,
            content: response.text,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Error in chat loop:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCloseTherapist = () => {
    setShowTherapist(false);
    setAppState(AppState.CHAT);
  };

  if (appState === AppState.ONBOARDING) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-lumi-100 to-calm-100">
        <div className="text-center animate-pulse">
            <div className="w-20 h-20 bg-gradient-to-tr from-lumi-400 to-calm-400 rounded-full mx-auto mb-6 shadow-xl flex items-center justify-center text-white text-3xl font-bold">
                L
            </div>
            <h1 className="text-2xl font-bold text-slate-700">Lumi</h1>
            <p className="text-slate-500">Your safe space is loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-50 flex items-center justify-center p-0 md:p-6 lg:p-12 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lumi-200/40 rounded-full blur-3xl animate-[float_8s_infinite]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-calm-200/40 rounded-full blur-3xl animate-[float_10s_infinite_reverse]"></div>

      <div className="w-full max-w-5xl h-full md:h-[90vh] flex flex-col md:flex-row gap-6 relative z-10">
        
        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex flex-col w-64 gap-4">
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/50">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-lumi-500" />
                    Lumi
                </h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    A safe space to talk, vent, and find your calm.
                </p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/50 flex-1">
                <h3 className="font-semibold text-slate-700 mb-4">Quick Tools</h3>
                <button 
                    onClick={() => setShowBreathing(true)}
                    className="w-full text-left p-3 rounded-xl hover:bg-lumi-50 transition-colors flex items-center gap-3 text-slate-600 hover:text-lumi-700"
                >
                    <div className="w-8 h-8 rounded-full bg-lumi-100 flex items-center justify-center text-lumi-600">
                        🌬️
                    </div>
                    <span className="font-medium">Deep Breaths</span>
                </button>
                 <button 
                    onClick={() => setShowTherapist(true)}
                    className="w-full text-left p-3 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-3 text-slate-600 hover:text-red-700 mt-2"
                >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Get Help Now</span>
                </button>
            </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 h-full shadow-2xl rounded-none md:rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm border border-white/50">
            <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                onTriggerBreathing={() => setShowBreathing(true)}
            />
        </div>

      </div>

      {/* Modals */}
      <TherapistModal isOpen={showTherapist} onClose={handleCloseTherapist} />
      <BreathingWidget isOpen={showBreathing} onClose={() => setShowBreathing(false)} />
    </div>
  );
};

export default App;
