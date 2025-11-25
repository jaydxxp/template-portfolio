'use client';

import { useState, useRef, useEffect } from 'react';
import { IoSend, IoClose } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import { RiMessage3Fill } from 'react-icons/ri';
import { useTheme } from 'next-themes';
import axios from 'axios';

export default function PortfolioAssistant() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Jaydeep's Portfolio Assistant. How can I help you?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const profilePicture = '/me1.png';

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e?: React.FormEvent, directMessage?: string) => {
    if (e) e.preventDefault();

    const messageToSend = directMessage || input.trim();
    if (!messageToSend || isLoading) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    try {
      const response = await axios.post('/api', {
        message: messageToSend
      });

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.response }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const parts: (string | JSX.Element)[] = [];
    let keyCounter = 0;

    let processedContent = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2">$1</a>'
    );
    console.log(processedContent)

    const combinedRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>|\*\*(.+?)\*\*|(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/gi;
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(processedContent)) !== null) {
     
      if (match.index > lastIndex) {
        const textBefore = processedContent.slice(lastIndex, match.index);
        if (textBefore) parts.push(textBefore);
      }

      if (match[1]) {
       
        parts.push(
          <a
            key={`link-${keyCounter++}`}
            href={match[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A66C2] hover:underline hover:text-[#004182] font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {match[2]}
          </a>
        );
      } else if (match[3]) {
      
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-semibold">
            {match[3]}
          </strong>
        );
      } else if (match[4]) {
     
        parts.push(
          <em key={`italic-${keyCounter++}`} className="italic">
            {match[4]}
          </em>
        );
      }

      lastIndex = match.index + match[0].length;
    }

  
    if (lastIndex < processedContent.length) {
      const remaining = processedContent.slice(lastIndex);
      if (remaining) parts.push(remaining);
    }

    return parts.length > 0 ? parts : content;
  };

  const suggestedQuestions = [
    'What are your main skills?',
    'Tell me about your experience',
    'What projects have you worked on?',
    'How can I contact you?'
  ];

  if (!mounted) return null;

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-zinc-900' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-black';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-zinc-800' : 'border-gray-200';
  const inputBg = isDark ? 'bg-zinc-800' : 'bg-gray-100';
  const userMsgBg = isDark ? 'bg-white text-black' : 'bg-black text-white';
  const assistantMsgBg = isDark ? 'bg-zinc-800' : 'bg-gray-200';
  const assistantMsgText = isDark ? 'text-gray-100' : 'text-gray-900';

  return (
    <>

       <button
        onClick={handleButtonClick}
        className={`fixed bottom-20 right-6 md:bottom-8 md:right-8 ${
          isDark ? 'bg-white' : 'bg-black'
        } w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50`}
      >
        <RiMessage3Fill
          className={`w-6 h-6 md:w-7 md:h-7 ${
            isDark ? 'text-black' : 'text-white'
          }`}
        />
      </button>


      {isOpen && (
        <div className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-40 w-[calc(100vw-2rem)] md:w-96 max-w-[calc(100vw-2rem)]">
          <div
            className={`${cardBg} rounded-lg border ${borderColor} overflow-hidden transition-colors duration-300 shadow-2xl`}
          >
       
            <div
              className={`p-3 md:p-4 border-b ${borderColor} flex items-center justify-between`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <img
                    src={profilePicture}
                    alt="Assistant"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h1
                    className={`text-xs md:text-sm font-semibold ${textPrimary}`}
                  >
                    Portfolio Assistant
                  </h1>
                  <p
                    className={`text-[10px] md:text-xs text-green-500 flex items-center gap-1`}
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg ${inputBg} ${textPrimary} hover:opacity-80 transition-opacity`}
              >
                <IoClose className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="h-64 md:h-80 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <div
                    className={`flex gap-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <img
                        src={profilePicture}
                        alt="Assistant"
                        className="w-6 h-6 md:w-7 md:h-7 rounded-full flex-shrink-0 object-cover"
                      />
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                        message.role === 'user'
                          ? userMsgBg
                          : `${assistantMsgBg} ${assistantMsgText}`
                      }`}
                    >
                      <p className="text-[11px] md:text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {renderMessageContent(message.content)}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div
                        className={`w-6 h-6 md:w-7 md:h-7 ${
                          isDark ? 'bg-white' : 'bg-black'
                        } rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <FaUser
                          className={`w-3 h-3 ${
                            isDark ? 'text-black' : 'text-white'
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {index === 0 && showSuggestions && (
                    <div className="mt-3">
                      <p
                        className={`${textSecondary} text-[10px] md:text-xs mb-2`}
                      >
                        Suggested questions
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedQuestions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSubmit(undefined, question)}
                            className={`text-[10px] md:text-xs px-2 md:px-2.5 py-1 ${inputBg} ${textPrimary} rounded-full hover:opacity-80 transition-opacity border ${borderColor}`}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <img
                    src={profilePicture}
                    alt="Assistant"
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className={`${assistantMsgBg} rounded-2xl px-3 py-2`}>
                    <div className="flex gap-1">
                      <div
                        className={`w-1.5 h-1.5 ${
                          isDark ? 'bg-gray-400' : 'bg-gray-600'
                        } rounded-full animate-bounce`}
                      ></div>
                      <div
                        className={`w-1.5 h-1.5 ${
                          isDark ? 'bg-gray-400' : 'bg-gray-600'
                        } rounded-full animate-bounce`}
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className={`w-1.5 h-1.5 ${
                          isDark ? 'bg-gray-400' : 'bg-gray-600'
                        } rounded-full animate-bounce`}
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

  
            <div className={`p-3 md:p-4 border-t ${borderColor}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  placeholder="Type your message..."
                  className={`flex-1 ${inputBg} ${textPrimary} placeholder-gray-500 rounded-lg px-3 py-2 text-[11px] md:text-xs focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-white' : 'focus:ring-black'
                  } transition-colors`}
                  disabled={isLoading}
                />
                <button
                  onClick={(e) => handleSubmit(e)}
                  disabled={isLoading || !input.trim()}
                  className={`${
                    isDark ? 'bg-white text-black' : 'bg-black text-white'
                  } rounded-lg px-3 md:px-4 py-2 font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity`}
                >
                  <IoSend className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}