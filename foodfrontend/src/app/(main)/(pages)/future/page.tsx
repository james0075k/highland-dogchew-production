"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Pillar = {
  id: number;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const AUTO_SLIDE_MS = 4500; // change timing here (e.g. 3000 = 3s)

const PillarsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // pause auto sliding while user interacts
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef<number | null>(null);

  const pillars: Pillar[] = useMemo(
    () => [
      {
        id: 1,
        title: "COMMUNITY FIRST",
        paragraphs: [
          "From the start, we knew our responsibility didn’t end with making a great product. When something comes from the mountains, it should also support the people who live there.",
        ],
      },
      {
        id: 2,
        title: "WOMEN-LED TRADITIONS",
        paragraphs: [
          "The Highland Yak Chew Future Foundation supports women involved in yak care, milk production, and traditional cheese making—keeping Himalayan traditions alive.",
        ],
      },
      {
        id: 3,
        title: "REAL IMPACT PER PURCHASE",
        bullets: [
          "Fair wages support",
          "Healthcare access",
          "Skill training",
          "Sustainable income opportunities",
        ],
        paragraphs: [
          "Every purchase contributes to long-term progress for high-altitude communities.",
        ],
      },
      {
        id: 4,
        title: "SUSTAINABLE FUTURE",
        paragraphs: [
          "Choosing Highland Yak Chew means supporting the land and people behind every chew—ensuring long-term progress for generations.",
        ],
      },
    ],
    []
  );

  const goTo = (index: number) => {
    setCurrentIndex(index);

    const el = scrollRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>("[data-pillar]");
    const card = cards[index];
    if (!card) return;

    card.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const next = () => goTo((currentIndex + 1) % pillars.length);
  const prev = () => goTo((currentIndex - 1 + pillars.length) % pillars.length);

  // ✅ Auto slide effect
  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      goTo((currentIndex + 1) % pillars.length);
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, pillars.length]);

  // pause/resume helpers (prevents fighting user scroll)
  const pauseAuto = () => {
    pausedRef.current = true;

    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);

    // resume after user stops interacting for 2s
    resumeTimeoutRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    },  1500);
  };

  return (
    <section className="w-full bg-white py-10 md:py-16 mt-16">


       <div className="relative aspect-[16/11] w-full bg-neutral-200">
            {/* Replace src with your own image in /public  */}
            <img
              src="images/about1.webp"
              alt="Founder"
              className="h-full w-full object-cover grayscale"
            />

            {/* Subtle fade at bottom like print layout */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fbf8f2] to-transparent" />
          </div>
      <div className="md:max-w-7xl md:mx-auto md:px-6">
        <div
          className={[
            "w-full rounded-none md:rounded-[28px]",
            "bg-[#f3f1ed] shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-black/5",
            "px-4 py-10 md:px-10 md:py-12",
          ].join(" ")}
        >
          <h2
            className="text-center text-[24px] md:text-[30px] tracking-[0.14em] text-neutral-900"
            style={{
              fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}
          >
            OUR PILLARS
          </h2>
          <div className="mx-auto mt-5 h-px w-24 bg-neutral-300/80" />

          <div className="relative mt-8">
            <div
              ref={scrollRef}
              onTouchStart={pauseAuto}
              onMouseEnter={pauseAuto}
              onWheel={pauseAuto}
              onScroll={pauseAuto}
              className={[
                "flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar",
                "px-2 md:px-0 pb-2",
              ].join(" ")}
            >
              {pillars.map((p, idx) => {
                const active = idx === currentIndex;

                return (
                  <div
                    key={p.id}
                    data-pillar
                    className={[
                      "snap-center shrink-0",
                      "w-[calc(100vw-24px)]",
                      "md:w-[58%] lg:w-[46%]",
                    ].join(" ")}
                  >
                    <div className="rounded-[26px] bg-[#ece9e4] p-5 md:p-8">
                      <div
                        className={[
                          "rounded-[22px] bg-[#6b6863] shadow-[0_18px_45px_rgba(0,0,0,0.18)]",
                          "h-[420px] md:h-[460px] lg:h-[480px]",
                          "flex flex-col justify-center",
                          "px-5 py-7 md:px-8 md:py-10",
                          active ? "opacity-100" : "opacity-92",
                        ].join(" ")}
                      >
                        <h3
                          className="text-center uppercase tracking-[0.12em] text-[18px] md:text-[20px] text-[#111]"
                          style={{
                            fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
                            fontStyle: "italic",
                          }}
                        >
                          {p.title}
                        </h3>

                        <div
                          className="mt-5 max-h-[300px] md:max-h-[320px] overflow-y-auto pr-1 no-scrollbar"
                          style={{
                            fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
                            fontStyle: "italic",
                          }}
                        >
                          <div className="text-[18px] md:text-[20px] leading-relaxed text-[#111] text-center">
                            {p.paragraphs?.map((t, i) => (
                              <p key={i} className="mb-4">
                                {t}
                              </p>
                            ))}

                            {p.bullets?.length ? (
                              <ul className="mt-3 space-y-2 text-left mx-auto max-w-[420px]">
                                {p.bullets.map((b, i) => (
                                  <li key={i} className="flex gap-3">
                                    <span className="mt-[12px] h-[6px] w-[6px] rounded-full bg-[#111] shrink-0" />
                                    <span className="text-[#111]">{b}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pillars.length > 1 && (
              <>
                <button
                  onClick={() => {
                    pauseAuto();
                    prev();
                  }}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md ring-1 ring-black/10 transition"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5 text-[#2b2a28]" />
                </button>

                <button
                  onClick={() => {
                    pauseAuto();
                    next();
                  }}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md ring-1 ring-black/10 transition"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5 text-[#2b2a28]" />
                </button>
              </>
            )}

            <div className="mt-8 flex justify-center gap-2">
              {pillars.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    pauseAuto();
                    goTo(i);
                  }}
                  aria-label={`Go to pillar ${i + 1}`}
                  className={[
                    "h-2 rounded-full transition-all",
                    i === currentIndex
                      ? "w-10 bg-[#6b6863]"
                      : "w-2 bg-[#cfcac3] hover:bg-[#bdb7af]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default PillarsSection;
