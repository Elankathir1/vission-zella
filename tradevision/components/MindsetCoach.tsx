
import React, { useState, useRef, useEffect } from 'react';
import { startMindsetChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const MindsetCoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello. I am your Mindset AI. Which stage of your trade are we in? (Before, During, or After)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatSession(startMindsetChat());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || !chatSession || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatSession.sendMessageStream({ message: textToSend });
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        fullResponse += (c.text || '');
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-fadeIn">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Mindset <span className="text-blue-500">Coach</span></h1>
        <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Emotional auditing assistant</p>
      </header>
      <div className="flex-1 flex flex-col bg-[#12151a] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-[2rem] p-6 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/[0.03] text-gray-200'}`}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default MindsetCoach;
