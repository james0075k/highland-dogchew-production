'use client'
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Volume2 } from 'lucide-react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! Let us know if you have any questions, we are here to help.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const instantAnswers = [
    { id: 1, question: 'Track my order', answer: 'To track your order, please provide your order number and we will check the status for you.' },
    { id: 2, question: 'Is yak dog chew not to hard for my dog?', answer: 'Yak chews are designed to be long-lasting but safe. They soften as your dog chews them. Always supervise your pet and choose the appropriate size for their breed.' },
    { id: 3, question: 'Does yak dog chew contains lactose?', answer: 'Our yak chews are naturally low in lactose as they are made from hardened cheese. The traditional smoke-drying process removes most of the lactose, making them suitable for most dogs.' },
    { id: 4, question: 'From what age can puppies have them?', answer: 'We recommend yak chews for puppies from 4-6 months old, once they have their adult teeth. Always choose the appropriate size and supervise young dogs.' },
    { id: 5, question: 'What chew size to choose?', answer: 'Choose based on your dog\'s weight:\n• Small (30-40g): Under 10kg\n• Medium (60-80g): 10-20kg\n• Large (100-120g): 20-35kg\n• XL (150g+): Over 35kg' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Thank you for your message! Our team will get back to you shortly. In the meantime, you can check our instant answers above.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleInstantAnswer = (question, answer) => {
    // Add user's question
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Add bot's answer after a short delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  return (
    <>
      {/*
        Floating widget stack on the right side (mobile → desktop):
          bottom-[72px] : WhatsApp button   (clears sticky cart bar)
          bottom-[132px]: GoToTop button    (z-[55])
          bottom-[192px]: Chatbot button    (this widget) — stacks above GoToTop
        On sm+ everything collapses to right-6 with proportional offsets.
        Z-index 50 keeps it under WhatsApp (z-[60]) so the WhatsApp panel
        doesn't get obscured when both are open.
      */}
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-[192px] sm:right-6 sm:bottom-[152px] z-50 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Widget — full-width sheet on mobile, fixed-width panel on desktop */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 sm:w-[380px] h-[85vh] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-5 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5" />
                <h3 className="text-xl font-bold">Chat with us</h3>
              </div>
              <p className="text-sm text-orange-100 leading-relaxed">
                Hi! Let us know if you have any questions, we are here to help.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-orange-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <span className={`text-xs mt-1 block ${
                    message.type === 'user' ? 'text-orange-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Instant Answers Section */}
          <div className="bg-white border-t border-gray-200 p-4 max-h-[280px] overflow-y-auto">
            <h4 className="text-center font-bold text-gray-900 mb-3 text-sm">
              Instant answers
            </h4>
            <div className="space-y-2">
              {instantAnswers.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleInstantAnswer(item.question, item.answer)}
                  className="w-full text-left p-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-sm text-gray-700 font-medium"
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Write message"
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === ''}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChatbotWidget;