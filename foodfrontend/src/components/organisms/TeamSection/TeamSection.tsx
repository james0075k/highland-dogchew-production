'use client';
import React, { useState, useEffect } from 'react';
import {
  Linkedin, Mail, Phone, Facebook, Twitter, Github, Instagram, Award, Loader2, Users,
} from 'lucide-react';
import TextHeader from '@/components/atoms/headings';

interface Certification {
  title: string;
  imageUrls?: string;
}

interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  instagram?: string;
}

interface TeamMember {
  _id: string;
  name: string;
  position?: string;
  image?: string;
  shortinfo?: string;
  contactNumber?: string;
  certifications?: Certification[];
  socialLinks?: SocialLinks;
}

const SOCIAL_META: { key: keyof SocialLinks; Icon: React.ElementType; hoverColor: string }[] = [
  { key: 'linkedin', Icon: Linkedin, hoverColor: 'hover:bg-blue-600' },
  { key: 'facebook', Icon: Facebook, hoverColor: 'hover:bg-blue-500' },
  { key: 'twitter', Icon: Twitter, hoverColor: 'hover:bg-sky-500' },
  { key: 'github', Icon: Github, hoverColor: 'hover:bg-gray-800' },
  { key: 'instagram', Icon: Instagram, hoverColor: 'hover:bg-pink-600' },
];

const TeamSection = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
    fetch(`${API_BASE}/teams`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setMembers(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="w-full py-20 flex justify-center">
        <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
      </section>
    );
  }

  if (!members.length) {
    return (
      <section className="w-full py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <TextHeader
            text="Our Highland Team"
            align="center"
            size="custom"
            textcolor="gray-900"
            className="text-5xl md:text-6xl font-bold mb-4"
          />
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full mb-8" />
          <div className="flex flex-col items-center text-gray-400 py-12">
            <Users className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">No team members yet.</p>
          </div>
        </div>
      </section>
    );
  }

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
            Meet the passionate people behind Highland Yak Chew, dedicated to bringing
            the finest quality dog chews to your beloved pets.
          </p>
        </div>

        {/* Team Grid */}
        <div className={`grid grid-cols-1 gap-12 lg:gap-16 ${
          members.length === 1 ? 'md:grid-cols-1 max-w-sm mx-auto' :
          members.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
          'md:grid-cols-3'
        }`}>
          {members.map((member) => (
            <div
              key={member._id}
              className="group relative"
              onMouseEnter={() => setHoveredId(member._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Decorative tail */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-0 h-0
                border-l-[20px] border-r-[20px] border-t-[24px]
                border-l-transparent border-r-transparent
                border-t-yellow-400/30 transition-all duration-300
                group-hover:border-t-yellow-400/50 z-10" />

              {/* Photo */}
              <div className="relative mx-auto w-64 h-64 mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-white" />
                <div className="absolute inset-4 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                      <Users className="w-16 h-16 text-amber-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Social icons on hover */}
                {member.socialLinks && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2
                    opacity-0 group-hover:opacity-100 transition-all duration-500
                    translate-y-4 group-hover:translate-y-0 z-20">
                    {SOCIAL_META.filter(({ key }) => member.socialLinks?.[key]).map(({ key, Icon, hoverColor }) => (
                      <a
                        key={key}
                        href={member.socialLinks![key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`bg-white/90 ${hoverColor} text-gray-800 hover:text-white
                          p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                    {member.contactNumber && (
                      <a
                        href={`tel:${member.contactNumber}`}
                        className="bg-white/90 hover:bg-orange-500 text-gray-800 hover:text-white
                          p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="text-center space-y-3 px-4">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300">
                  {member.name}
                </h3>

                {member.position && (
                  <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                    <p className="text-sm font-semibold text-white uppercase tracking-wide">
                      {member.position}
                    </p>
                  </div>
                )}

                {member.shortinfo && (
                  <p className="text-gray-600 leading-relaxed max-w-sm mx-auto text-sm mt-3">
                    {member.shortinfo}
                  </p>
                )}

                {/* Certifications */}
                {member.certifications && member.certifications.length > 0 && (
                  <div className="pt-3 flex flex-wrap justify-center gap-2">
                    {member.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-medium"
                      >
                        <Award className="w-3 h-3" />
                        {cert.title}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact row */}
                <div className="pt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 flex flex-wrap justify-center gap-3">
                  {member.socialLinks?.linkedin && (
                    <a
                      href={member.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {member.contactNumber && (
                    <a
                      href={`tel:${member.contactNumber}`}
                      className="inline-flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {member.contactNumber}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decorative */}
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
    </section>
  );
};

export default TeamSection;
