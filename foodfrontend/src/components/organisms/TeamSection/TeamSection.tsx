'use client'
import React, { useState } from 'react';
import { Linkedin, Mail, Phone } from 'lucide-react';
import TextHeader from '@/components/atoms/headings';

const TeamSection = () => {
  const [hoveredMember, setHoveredMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: 'Navraj Koirala',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
      description: 'With years of experience, Shiva Koirala drives the creation of *Churpi*, a premium dog chew. His expertise and passion ensure every product meets the highest standards.',
      position: 'left',
      email: 'shiva@highland1.com',
      linkedin: '#'
    },
    {
      id: 2,
      name: 'Arjun Koirala',
      role: 'MD - Operations Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
      description: 'Shreejan Koirala oversees operations, ensuring *Churpi*, our Yak milk dog chew, meets the highest standards of quality and care.',
      position: 'center',
      email: 'shreejan@highland1.com',
      linkedin: '#'
    },
    {
      id: 3,
      name: 'Nirajan Koirala',
      role: 'Partner & Quality Manager',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
      description: 'As a supportive partner, Nirajan Koirala plays a key role in maintaining the quality and care that goes into producing *Churpi*, our Yak milk dog chew.',
      position: 'right',
      email: 'nirajan@highland1.com',
      linkedin: '#'
    }
  ];

  return (
    <section className="w-full py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
<TextHeader
  text="Our Highland Team"

  align="center"
  size="custom"
  textcolor="gray-900"
  className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
/>

          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full" />
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the passionate people behind HighLand Churpi, dedicated to bringing the finest quality dog chews to your beloved pets.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative"
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {/* Card Container */}
              <div className="relative">
                {/* Speech Bubble Tail */}
                <div className={`absolute ${
                  member.position === 'left' ? 'left-1/4' :
                  member.position === 'center' ? 'left-1/2 -translate-x-1/2' :
                  'right-1/4'
                } -bottom-6 w-0 h-0 border-l-[20px] border-r-[20px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-400/30 transition-all duration-300 group-hover:border-t-yellow-400/50 z-10`} />

                {/* Image Container with Border */}
                <div className="relative mx-auto w-72 h-72 mb-8">
                  {/* Animated Border Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse" />
                  
                  {/* Inner Border */}
                  <div className="absolute inset-2 rounded-full bg-white" />
                  
                  {/* Image */}
                  <div className="absolute inset-4 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Social Icons (appear on hover) */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-20">
                    <a
                      href={member.linkedin}
                      className="bg-white/90 hover:bg-blue-600 text-gray-800 hover:text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="bg-white/90 hover:bg-orange-500 text-gray-800 hover:text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300">
                    {member.name}
                  </h3>
                  
                  <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                    <p className="text-sm font-semibold text-white uppercase tracking-wide">
                      {member.role}
                    </p>
                  </div>

                  <p className="text-gray-600 leading-relaxed max-w-sm mx-auto mt-4 px-4">
                    {member.description}
                  </p>

                  {/* Contact Email */}
                  <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors duration-300"
                    >
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Decorative Element */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-orange-400" />
            <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-orange-400" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default TeamSection;