"use client";

import React from "react";

type PromiseCard = {
  title: string;
  image: string;
  intro?: string;
  bullets?: string[];
  outro?: string;
  paragraphs?: string[];
};

const OurPromiseCards = () => {
  const promiseText = [
    "Everything we do starts with one priority. Is it truly good for dogs?",
    "We believe dogs do best with simple, natural nutrition and well-made products. That’s why we avoid unnecessary ingredients and focus on quality, safety, and sourcing you can trust.",
    "Nothing extra. Nothing artificial. Just a chew dogs enjoy and owners rely on.",
  ];

  const cards: PromiseCard[] = [
    {
      title: "RESPONSIBLE PACKAGING",
      image: "/images/image1.webp",
      intro: "Our care doesn’t stop with the product.",
      bullets: [
        "Minimal, recyclable packaging",
        "Reduced plastic use",
        "Paper inserts made from recycled or certified materials",
        "Compact shipping to lower environmental impact",
      ],
      outro:
        "Looking after pets also means looking after the planet they live on.",
    },
    {
      title: "NATURAL, SIMPLE, AND DOG-APPROVED",
      image: "/images/image2.webp",
      bullets: [
        "Made using yak and cow milk",
        "High protein, low fat",
        "Long-lasting and satisfying",
        "Supports dental hygiene through chewing",
        "Easy to digest",
        "No artificial additives",
        "Grain-free and gluten-free",
        "Responsibly sourced and cruelty-free",
      ],
      outro:
        "",
    },
    {
      title: "MADE FOR SMARTER CHEWING",
      image: "/images/image3.webp",
      paragraphs: [
        "Chewing plays an important role in a dog’s health. It helps keep teeth cleaner, strengthens jaws, and provides mental stimulation.",
        "Highland Yak Chews are firm and durable without splintering like bones. When the chew becomes small, it can be microwaved into a light, crunchy snack, reducing waste and extending enjoyment.",
      ],
    },
  ];

  return (
    <section className="w-full bg-[#fbf8f2] py-14 md:py-20 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER: OUR PROMISE TO DOGS */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-14">
          <h2
            className="text-[24px] md:text-[30px] tracking-[0.14em] text-neutral-900"
              style={{
                fontFamily:
                  'ui-serif, Georgia, "Times New Roman", Times, serif',
                fontStyle: "italic",
              }}
          >
            OUR PROMISE TO DOGS
          </h2>

          <div className="mx-auto mt-5 h-px w-24 bg-neutral-300/80" />

          <div
            className="mt-8 space-y-6 text-[18px] md:text-[20px] leading-relaxed text-neutral-800"
            style={{
              fontFamily:
                'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}
          >
            {promiseText.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>

        {/* 3 POSTER CARDS */}
        <div className="grid gap-8 lg:grid-cols-3">
          {cards.map((card) => (
            <PosterCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurPromiseCards;

function PosterCard({ card }: { card: PromiseCard }) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#fbf8f2] shadow-[0_18px_55px_rgba(0,0,0,0.10)] ring-1 ring-black/5">
      {/* Image top */}
      <div className="relative aspect-[16/11] w-full bg-neutral-200">
        <img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover grayscale"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbf8f2] to-transparent" />
      </div>

      {/* Paper text */}
      <div className="px-6 pb-12 pt-10 md:px-8">
        <h3
          className="text-center text-[18px] md:text-[20px] tracking-[0.12em] text-neutral-900"
             style={{
              fontFamily:
                'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}
        >
          {card.title}
        </h3>

        <div className="mx-auto mt-5 h-px w-20 bg-neutral-300/80" />

        {/* Intro */}
        {card.intro ? (
          <p
            className="mt-7 text-[18px] md:text-[19px] text-neutral-800 text-center"
             style={{
              fontFamily:
                'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}
          >
            {card.intro}
          </p>
        ) : null}

        {/* Bullets */}
        {card.bullets?.length ? (
          <ul
            className="mx-auto mt-6 max-w-xl space-y-3 text-[18px] leading-relaxed text-neutral-800 md:text-[19px]"
            style={{
              fontFamily:
                'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}>
          
            {card.bullets.map((item, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-neutral-900" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Paragraphs */}
        {card.paragraphs?.length ? (
          <div
            className="mt-7 space-y-6 text-[18px] md:text-[19px] leading-relaxed text-neutral-800 text-left"
            style={{
              fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
            }}
          >
            {card.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}

        {/* Outro */}
        {card.outro ? (
          <p
            className="mt-8 text-[18px] md:text-[19px] text-neutral-800 text-center"
            style={{
              fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
            }}
          >
            {card.outro}
          </p>
        ) : null}
      </div>
    </div>
  );
}
