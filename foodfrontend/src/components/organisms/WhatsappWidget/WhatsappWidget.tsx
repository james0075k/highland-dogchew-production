'use client'
import React, { useState } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';

const WhatsappWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Your WhatsApp number (format: country code + number, no spaces or special characters)
  const whatsappNumber = '9779851254578'; // Replace with your actual number
  const businessName = 'Highland Churpi';
  const avatar = 'https://ui-avatars.com/api/?name=Highland+Churpi&background=25D366&color=fff&size=128';

  // const quickMessages = [
  //   { id: 1, text: 'Hello! I want to know more about your products' },
  //   { id: 2, text: 'What are your prices?' },
  //   { id: 3, text: 'Do you offer bulk discounts?' },
  //   { id: 4, text: 'What sizes are available?' },
  //   { id: 5, text: 'How long does shipping take?' }
  // ];

  const handleSendMessage = (messageText = message) => {
    if (messageText.trim() === '') return;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  // const handleQuickMessage = (text) => {
  //   setMessage(text);
  // };

  return (
    <>
      {/* WhatsApp Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-32 right-12 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open WhatsApp chat"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* WhatsApp Widget */}
      {isOpen && (
        <div className="fixed bottom-32 right-12 z-50 w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <img
                  src={avatar}
                  alt={businessName}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-white rounded-full border-2 border-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{businessName}</h3>
                <p className="text-sm text-green-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Typically replies instantly
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Preview */}
     

          {/* Quick Messages */}
          <div className="bg-white border-t border-gray-200 p-4 max-h-[200px] overflow-y-auto">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Quick Messages</h4>
            <div className="space-y-2">
              {/* {quickMessages.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickMessage(item.text)}
                  className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-sm text-gray-700"
                >
                  {item.text}
                </button>
              ))} */}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={message.trim() === ''}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp CTA Button */}
            <button
              onClick={() => handleSendMessage(message || 'Hello! I would like to know more about your products.')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Start Chat on WhatsApp
            </button>

            <p className="text-xs text-gray-500 text-center mt-2">
              Powered by WhatsApp
            </p>
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

export default WhatsappWidget;