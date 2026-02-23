"use client";

import React, { useEffect, useState } from "react";

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
  certifications?: { title: string; imageUrls?: string }[];
  socialLinks?: SocialLinks;
}

const SocialIcon = ({ platform, url }: { platform: string; url: string }) => {
  const icons: Record<string, React.ReactNode> = {
    facebook: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      </svg>
    ),
    instagram: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    github: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
      </svg>
    ),
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
      title={platform}
    >
      {icons[platform]}
    </a>
  );
};

const TeamCard = ({ member }: { member: TeamMember }) => {
  const hasSocials = member.socialLinks &&
    Object.values(member.socialLinks).some(Boolean);

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100/60 hover:border-amber-200">
      {/* Photo */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 aspect-[4/3]">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/60 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-[#2f1e14]">{member.name}</h3>
        {member.position && (
          <p className="text-sm font-semibold text-amber-600 mt-0.5">{member.position}</p>
        )}
        {member.shortinfo && (
          <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-3">{member.shortinfo}</p>
        )}

        {/* Certifications */}
        {member.certifications && member.certifications.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.certifications.slice(0, 3).map((cert, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium"
              >
                {cert.title}
              </span>
            ))}
            {member.certifications.length > 3 && (
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">
                +{member.certifications.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Social links */}
        {hasSocials && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            {Object.entries(member.socialLinks!)
              .filter(([, url]) => url)
              .map(([platform, url]) => (
                <SocialIcon key={platform} platform={platform} url={url as string} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AboutPage = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`);
        const data = await res.json();
        if (data.success) setTeam(data.data || []);
      } catch {
        // silently fail — team section just won't show
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f2ea]">
      {/* ─── Founder's Note ─── */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14 mt-20">
        <div className="overflow-hidden rounded-[28px] bg-[#fbf8f2] shadow-[0_18px_55px_rgba(0,0,0,0.10)] ring-1 ring-black/5">
          {/* Top Image */}
          <div className="relative aspect-[16/11] w-full bg-neutral-200">
            <img
              src="images/about1.webp"
              alt="Founder"
              className="h-full w-full object-cover grayscale"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fbf8f2] to-transparent" />
          </div>

          {/* Note content */}
          <div className="px-6 pb-12 pt-8 md:px-12 md:pb-16 md:pt-10">
            <h2
              className="text-center text-[15px] md:text-[16px] tracking-wide text-neutral-700"
              style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
            >
              A Note From Our Founder
            </h2>
            <div className="mx-auto mt-5 h-px w-24 bg-neutral-300/80" />
            <div
              className="mx-auto mt-8 max-w-3xl text-[15px] leading-[1.95] text-neutral-700 md:text-[16px]"
              style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
            >
              <p className="mb-7">
                From the start, we knew our responsibility didn&apos;t end with making a great product.
                When something comes from the mountains, it should also support the people who live there.
              </p>
              <p className="mb-7">
                The Highland Yak Chew Future Foundation exists to give back to high-altitude communities,
                with a focus on the women who are deeply involved in yak care, milk production, and
                traditional cheese making. Their work keeps these traditions alive.
              </p>
              <p className="mb-7">
                A portion of every sale supports fair wages, healthcare access, skill training, and
                sustainable income opportunities. We focus on long-term progress, helping communities
                grow stronger and more independent over time.
              </p>
              <p className="mt-9 text-neutral-800">
                <span className="font-semibold">Choosing Highland Yak Chew</span>{" "}
                means supporting sustainable practices that honor both the land and the people who call
                it home.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl text-right text-sm text-neutral-600">
              — Highland Yak Chew
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🏔️',
              title: 'Sourced from the Himalayas',
              desc: 'Every chew originates from high-altitude yak milk — pure, natural, and free from artificial additives.',
            },
            {
              icon: '🐕',
              title: 'Vet Approved & Safe',
              desc: 'Our products are tested and trusted by veterinarians. Long-lasting, digestible, and perfect for all breeds.',
            },
            {
              icon: '♻️',
              title: 'Sustainably Made',
              desc: 'We work directly with Himalayan communities, ensuring fair trade and environmentally responsible production.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-md border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-[#2f1e14] text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Meet Our Team ─── */}
      {(loadingTeam || team.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold tracking-widest text-amber-600 uppercase mb-3">
              The People Behind the Chew
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2f1e14]">
              Meet Our Team
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-amber-500" />
            <p className="mt-4 max-w-xl mx-auto text-gray-500 text-sm leading-relaxed">
              Passionate dog lovers, quality experts, and sustainability advocates — our team is
              dedicated to bringing your pup the very best from the Himalayas.
            </p>
          </div>

          {/* Loading skeleton */}
          {loadingTeam ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                  <div className="aspect-[4/3] bg-amber-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-amber-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {team.map((member) => (
                <TeamCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─── Values Strip ─── */}
      <section className="bg-[#2f1e14] py-14">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'Natural Ingredients' },
              { value: '5★', label: 'Customer Rating' },
              { value: '10k+', label: 'Happy Dogs' },
              { value: '3', label: 'Himalayan Regions' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-amber-400">{stat.value}</p>
                <p className="text-sm text-amber-100/80 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
