'use client'
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import Image from 'next/image';

/* ── Paw Chat Icon ─────────────────────────────────────────────────── */
function PawChatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Paw pads */}
      <ellipse cx="8" cy="7.5" rx="1.6" ry="2" fill="currentColor" stroke="none" />
      <ellipse cx="16" cy="7.5" rx="1.6" ry="2" fill="currentColor" stroke="none" />
      <ellipse cx="5.2" cy="11.5" rx="1.4" ry="1.8" fill="currentColor" stroke="none" />
      <ellipse cx="18.8" cy="11.5" rx="1.4" ry="1.8" fill="currentColor" stroke="none" />
      {/* Main pad */}
      <path
        d="M8.5 14.5c0 0-1 3.5 3.5 4.5s4.5-2.5 4.5-4c0-1.5-1.5-3-4-3s-4 1-4 2.5z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

const WhatsappWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const whatsappNumber = '9779851254578';
  const businessName = 'Highland Yakchew';
  const avatar = '/images/logos.jpeg';

  const handleSendMessage = (messageText = message) => {
    if (messageText.trim() === '') return;
    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <>
      {/* ── Chat Button — minimal, theme-matched ──────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[72px] right-4 sm:bottom-6 sm:right-6 z-[60] group"
          aria-label="Chat with us"
        >
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-[#2E1F14] dark:bg-[#f5e9dc] rounded-full shadow-lg shadow-black/10 dark:shadow-black/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <PawChatIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-400 dark:text-amber-700" />

            {/* Online indicator */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500 border-[1.5px] sm:border-2 border-[#2E1F14] dark:border-[#f5e9dc]" />
            </span>
          </div>
        </button>
      )}

      {/* ── Chat Panel ─────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 z-[60] sm:w-[380px] bg-white dark:bg-[#1e1510] sm:rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/40 overflow-hidden border-t sm:border border-gray-100 dark:border-[#2a2018] ww-slide-up max-h-[85vh] sm:max-h-none flex flex-col">

          {/* Header */}
          <div className="bg-[#2E1F14] dark:bg-[#2a1f15] text-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={avatar}
                  alt={businessName}
                  width={40}
                  height={40}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-amber-400/40 object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-[#2E1F14]" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">{businessName}</h3>
                <p className="text-[11px] text-amber-300/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Online now
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Preview Bubble */}
          <div className="bg-[#faf8f5] dark:bg-[#161210] px-4 sm:px-5 py-4 sm:py-5 flex-shrink-0">
            <div className="bg-white dark:bg-[#1e1510] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-[#2a2018] max-w-[85%]">
              <p className="text-sm text-gray-700 dark:text-[#c8b6a6] leading-relaxed">
                Hi there! How can we help you today? We typically reply within minutes.
              </p>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                Just now
              </span>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white dark:bg-[#1e1510] border-t border-gray-100 dark:border-[#2a2018] p-4 flex-shrink-0">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#161210] border border-gray-200 dark:border-[#2a2018] rounded-xl focus:border-amber-400 dark:focus:border-amber-600 focus:outline-none text-sm text-gray-800 dark:text-[#f5e9dc] placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={message.trim() === ''}
                className="bg-[#2E1F14] dark:bg-amber-600 hover:bg-[#432d1f] dark:hover:bg-amber-500 disabled:bg-gray-200 dark:disabled:bg-[#2a2018] disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={() => handleSendMessage(message || 'Hello! I would like to know more about your products.')}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Continue on WhatsApp
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes wwSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .ww-slide-up {
          animation: wwSlideUp 0.25s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </>
  );
};

export default WhatsappWidget;
