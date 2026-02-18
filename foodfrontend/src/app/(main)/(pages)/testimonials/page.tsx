import React from "react";
// import TestimonialSection from "@/components/organisms/Testimonial/TestimonialSection";

const Testimonials = () => {
  const shipping = [
    "Orders ship within 1–2 business days excluding bank holiday",
    "Delivery time varies by location",
    "Shipping fees shown at checkout",
    "Domestic and limited international shipping available",
    "Import taxes or duties apply internationally",
  ];

  const products = [
    "Suitable for most dog breeds and sizes",
    "Not recommended for puppies under 4 months",
    "Made from natural yak and cow milk",
    "Grain-free and gluten-free",
    "No artificial colors, flavors, or preservatives",
    "High protein and low fat",
    "Supports dental health",
    "Gentle on digestion",
    "Supervision recommended during chewing",
    "Small pieces can be microwaved for 30–60 seconds and cooled before feeding",
  ];

  return (
    <section className="max-w-7xl mx-auto px-6">
      {/* <TestimonialSection /> */}

      <div className="mt-14 md:mt-20 pb-14 md:pb-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <InfoPosterCard
            title="SHIPPING"
            items={shipping}
            imageSrc="/images/ship.jpg"
          />
          <InfoPosterCard
            title="PRODUCTS"
            items={products}
            imageSrc="/images/about.webp"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

function InfoPosterCard({
  title,
  items,
  imageSrc,
}: {
  title: string;
  items: string[];
  imageSrc: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#fbf8f2] shadow-[0_18px_55px_rgba(0,0,0,0.10)] ring-1 ring-black/5">
      {/* Top image */}
      <div className="relative aspect-[16/11] w-full bg-neutral-200">
        <img
          src={imageSrc}
          alt={`${title} poster image`}
          className="h-full w-full object-cover grayscale"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbf8f2] to-transparent" />
      </div>

      {/* Paper note */}
      <div className="px-6 pb-12 pt-10 md:px-10 md:pb-14 md:pt-10">
        <h3
          className="text-center text-[22px] md:text-[24px] tracking-[0.10em] text-neutral-900"
           style={{
              fontFamily:
                'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}
        >
          {title}
        </h3>

        <div className="mx-auto mt-5 h-px w-20 bg-neutral-300/80" />

        <ul
          className="mx-auto mt-8 max-w-xl space-y-3 text-[18px] leading-relaxed text-neutral-800 md:text-[19px]"
            style={{
              fontFamily:
                'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}
        >
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-4">
              <span className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-neutral-900" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
