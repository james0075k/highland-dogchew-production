import React from 'react';

export default function SizeGuideSection() {
  return (
    <div className="py-4 md:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Main Heading */}
        <div className="text-center mb-12">
          <h2 className="font-antique text-3xl md:text-4xl lg:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4 tracking-[-0.01em]">
            WHAT SIZE TO CHOOSE?
          </h2>
          <p className="text-lg md:text-xl text-[#7A5C4F] dark:text-[#c8b6a6]">
            Find the perfect size for your furry friend
          </p>
        </div>

        {/* Dog Size Chart Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-stone-200 dark:bg-[#241b16] p-8">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80"
            alt="Dog size comparison chart"
            className="w-full rounded-lg"
          />
          <div className="mt-6 grid grid-cols-5 gap-2 text-center">
            <div>
              <p className="font-bold text-sm md:text-base text-[#2E1F14] dark:text-[#f5e9dc]">King</p>
              <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">Giant Breeds</p>
            </div>
            <div>
              <p className="font-bold text-sm md:text-base text-[#2E1F14] dark:text-[#f5e9dc]">Extra Large</p>
              <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">Large Breeds</p>
            </div>
            <div>
              <p className="font-bold text-sm md:text-base text-[#2E1F14] dark:text-[#f5e9dc]">Large</p>
              <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">Medium-Large</p>
            </div>
            <div>
              <p className="font-bold text-sm md:text-base text-[#2E1F14] dark:text-[#f5e9dc]">Medium</p>
              <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">Medium Dogs</p>
            </div>
            <div>
              <p className="font-bold text-sm md:text-base text-[#2E1F14] dark:text-[#f5e9dc]">Small</p>
              <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">Small Breeds</p>
            </div>
          </div>
        </div>

        {/* Description Text */}
        <div className="text-center max-w-7xl mx-auto mb-16">
          <p className="text-base md:text-lg text-[#5b4636] dark:text-[#c8b6a6] leading-relaxed">
            Yak milk chews, in tiny bits were first created and consumed as snacks by the Himalayan people decades ago as a good source of protein and still do now. We took the same idea and turned it into an all natural long hard cheese dog chews - toys for your pet - Himalayan Yak Dog Chew. Made from Yak milk, our Himalayan yak chews for dogs contain the highest protein & calcium content with minimal fat and no chemically binding agents.
          </p>
        </div>

        {/* Why it's so good section */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-[#241b16] dark:to-[#2a1f18] rounded-3xl p-8 md:p-12 shadow-lg dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-transparent dark:border-[#3a2c23]">
          <h3 className="font-antique text-2xl md:text-3xl lg:text-4xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] text-center mb-8 tracking-[-0.01em]">
            Why it&apos;s so good?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500 dark:bg-amber-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-2">
                FULL OF CALCIUM & PROTEIN
              </h4>
              <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">
                Packed with essential nutrients for strong bones and muscles
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 dark:bg-green-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-2">
                100% NATURAL
              </h4>
              <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">
                Made from pure yak milk with no artificial additives
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 dark:bg-blue-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-2">
                GMO & GLUTEN FREE
              </h4>
              <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">
                Safe for dogs with sensitive stomachs and allergies
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
