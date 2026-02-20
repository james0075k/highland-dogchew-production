import React from 'react';

export default function HimalayanStorySection() {
  return (
    <div className="py-4 md:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Section 1: Handmade By The Himalayan Farmers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-20 md:mb-32">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
                alt="Himalayan mountains with yaks"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="font-antique text-3xl md:text-4xl lg:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-6 tracking-[-0.01em]">
              Handmade By The Himalayan Farmers
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-[#5b4636] dark:text-[#c8b6a6] leading-relaxed">
              Yak milk chews, in tiny bits were first created and consumed as snacks by the Himalayan people decades ago as a good source of protein and still do now. We took the same idea and turned it into an all natural long lasting hard cheese dog chews – treats for your dog. Made from Yak milk, our yak chews for dogs contain the highest protein & calcium content with minimal fat and no chemically binding agents.
            </p>
          </div>
        </div>

        {/* Section 2: What To Do With End Pieces? */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="font-antique text-3xl md:text-4xl lg:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-6 tracking-[-0.01em]">
              What To Do With End Pieces?
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-[#5b4636] dark:text-[#c8b6a6] leading-relaxed">
              Simply microwave the nugget for about 45 seconds until it puffs up (vary the time depending on your microwave power) - Let it <span className="font-bold text-orange-600 dark:text-amber-500">COOL</span> - and then watch as your dog enjoys the crunchy texture and delicious smoky taste.
            </p>

            {/* Instructions Steps */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 dark:bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="pt-1">
                  <p className="text-[#2E1F14] dark:text-[#f5e9dc] font-semibold">Microwave for 45 seconds</p>
                  <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm">Until it puffs up nicely</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 dark:bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="pt-1">
                  <p className="text-[#2E1F14] dark:text-[#f5e9dc] font-semibold">Let it cool completely</p>
                  <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm">Safety first for your pup</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 dark:bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="pt-1">
                  <p className="text-[#2E1F14] dark:text-[#f5e9dc] font-semibold">Watch them enjoy!</p>
                  <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm">Crunchy texture & smoky taste</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <div className="rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
              <img
                src="https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=1200&q=80"
                alt="Puffed yak milk treats in basket"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
