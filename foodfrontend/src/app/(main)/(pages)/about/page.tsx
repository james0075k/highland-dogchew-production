"use client";

import React from "react";

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-[#f6f2ea]">
      {/* Page frame (like the screenshot white margins) */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14 mt-20">
        <div className="overflow-hidden rounded-[28px] bg-[#fbf8f2] shadow-[0_18px_55px_rgba(0,0,0,0.10)] ring-1 ring-black/5">
          {/* Top Image */}
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

          {/* Note Section */}
          <div className="px-6 pb-12 pt-8 md:px-12 md:pb-16 md:pt-10">
            {/* Title - elegant/cursive look */}
            <h2
              className="text-center text-[15px] md:text-[16px] tracking-wide text-neutral-700"
              style={{
                fontFamily:
                  'ui-serif, Georgia, "Times New Roman", Times, serif',
                fontStyle: "italic",
              }}
            >
              A Note From Our Founder
            </h2>

            {/* Separator */}
            <div className="mx-auto mt-5 h-px w-24 bg-neutral-300/80" />

            {/* Body text - script-ish / classic note feel */}
            <div
              className="mx-auto mt-8 max-w-3xl text-[15px] leading-[1.95] text-neutral-700 md:text-[16px]"
             style={{
                fontFamily:
                  'ui-serif, Georgia, "Times New Roman", Times, serif',
                fontStyle: "italic",
              }}
            >
              <p className="mb-7">
                From the start, we knew our responsibility didn&apos;t end with
                making a great product. When something comes from the
                mountains, it should also support the people who live there.
              </p>

              <p className="mb-7">
                The Highland Yak Chew Future Foundation exists to give back to
                high-altitude communities, with a focus on the women who are
                deeply involved in yak care, milk production, and traditional
                cheese making. Their work keeps these traditions alive.
              </p>

              <p className="mb-7">
                A portion of every sale supports fair wages, healthcare access,
                skill training, and sustainable income opportunities. We focus
                on long-term progress, helping communities grow stronger and
                more independent over time.
              </p>

              <p className="mt-9 text-neutral-800">
                <span className="font-semibold">
                  Choosing Highland Yak Chew
                </span>{" "}
                means supporting sustainable practices that honor both the land
                and the people who call it home.
              </p>
            </div>

            {/* Optional subtle signature line (remove if you don’t want it) */}
            <div className="mx-auto mt-10 max-w-3xl text-right text-sm text-neutral-600">
              — Highland Yak Chew
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
