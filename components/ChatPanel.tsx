
import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import type { SavedAnalysis, ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import { CloseIcon, SendIcon, UserIcon, AiIcon, SpinnerIcon } from './Icons';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: SavedAnalysis | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, analysis }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (analysis?.analysisResult) {
      const context = `Filnamn: ${analysis.fileName}\nSammanfattning: ${analysis.analysisResult.summary}`;
      const newChat = geminiService.startChat(context);
      setChat(newChat);
      setMessages([]); // Reset messages when analysis changes
    } else {
      setChat(null);
      setMessages([]);
    }
  }, [analysis]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessageStream({ message: input });
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of response) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', content: modelResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', content: 'Ursäkta, något gick fel. Försök igen.' };
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length-1] = errorMessage;
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <div className={`flex items-start gap-3 my-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
      {message.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center"><AiIcon className="w-5 h-5 text-indigo-400" /></div>}
      <div className={`p-3 rounded-xl max-w-lg ${message.role === 'user' ? 'bg-slate-700' : 'bg-slate-900/50'}`}>
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{message.content}</p>
      </div>
       {message.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-400" /></div>}
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[450px] max-w-full bg-slate-800/90 backdrop-blur-lg border-l border-slate-700 z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-200">Chatta med din data</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-4">
          {!analysis ? (
            <div className="text-center text-slate-500 h-full flex items-center justify-center">
              <p>Välj en analys för att börja chatta.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-500 h-full flex items-center justify-center">
              <p>Ställ en fråga om "{analysis.name}" för att börja.</p>
            </div>
          ) : (
            <div>
              {messages.map((msg, index) => <MessageBubble key={index} message={msg} />)}
              {isLoading && (
                  <div className="flex items-start gap-3 my-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center"><AiIcon className="w-5 h-5 text-indigo-400" /></div>
                      <div className="p-3 rounded-xl bg-slate-900/50 flex items-center">
                          <SpinnerIcon className="w-5 h-5 text-slate-400" />
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={analysis ? 'Ställ en fråga...' : 'Välj en analys först'}
              disabled={!analysis || isLoading}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!analysis || isLoading || !input.trim()}
              className="p-2.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              aria-label="Skicka"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
};

export default ChatPanel;
