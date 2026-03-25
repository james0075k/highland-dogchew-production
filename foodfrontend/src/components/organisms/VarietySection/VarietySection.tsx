'use client'
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import Image from 'next/image';

const VarietySection = () => {
  const [activeTab, setActiveTab] = useState('TURMERIC');
  const [selectedImage, setSelectedImage] = useState(0);

  const flavors = [
    'TURMERIC',
    'MINT',
    'BLUEBERRY',
    'STRAWBERRY',
    'PUMPKIN',
    'HONEY',
    'PEANUT',
    'COCONUT',
    'FLAXSEED'
  ];

  const products = {
    TURMERIC: {
      name: 'Turmeric',
      images: [
        '/images/dog-17.jpeg',
        '/images/dog-28.jpeg',
        '/images/dog-12.jpeg',
        '/images/dog-32.jpeg'
      ],
      description: 'Churpi is a flavorful dog chew infused with the benefits of turmeric. This chew is perfect for addressing wounds, cuts, and mouth issues, and is especially effective for healing cuts on a dog\'s gums and tongue.',
      benefits: 'Turmeric Churpi not only provides the natural antibiotic properties of turmeric but also offers anti-inflammatory and antioxidant benefits. It helps reduce swelling, fight infections, and support overall oral health, making it a valuable addition to your pet\'s care routine.'
    },
    MINT: {
      name: 'Mint',
      images: [
        '/images/dog-22.jpeg',
        '/images/dog-13.jpeg',
        '/images/dog-3.jpeg'
      ],
      description: 'Mint flavored Churpi provides a refreshing and cooling experience for your dog while maintaining all the natural benefits of yak milk.',
      benefits: 'Mint Churpi helps freshen breath naturally while providing long-lasting chewing satisfaction. The natural mint flavor makes it particularly appealing to dogs while supporting dental health.'
    },
    BLUEBERRY: {
      name: 'Blueberry',
      images: [
        '/images/dog-15.jpeg',
        '/images/dog-25.jpeg',
        '/images/dog-21.jpeg'
      ],
      description: 'Blueberry Churpi combines the nutritional power of antioxidant-rich blueberries with premium yak milk for a healthy, delicious treat.',
      benefits: 'Rich in antioxidants, Blueberry Churpi supports immune system health and provides cognitive benefits while offering a naturally sweet flavor dogs love.'
    },
    STRAWBERRY: {
      name: 'Strawberry',
      images: [
        '/images/dog-16.jpeg',
        '/images/dog-33.jpeg',
        '/images/dog-27.jpeg'
      ],
      description: 'Strawberry flavored Churpi offers a sweet, fruity taste that dogs adore while maintaining the high-quality protein content of traditional yak chews.',
      benefits: 'Strawberry Churpi is packed with vitamin C and natural sweetness, making it an irresistible treat that also supports your dog\'s overall health.'
    },
    PUMPKIN: {
      name: 'Pumpkin',
      images: [
        '/images/dog-19.jpeg',
        '/images/dog-20.jpeg',
        '/images/dog-1.jpeg'
      ],
      description: 'Pumpkin Churpi combines the digestive benefits of pumpkin with the protein-rich goodness of yak milk for optimal pet health.',
      benefits: 'Rich in fiber and nutrients, Pumpkin Churpi supports healthy digestion and is gentle on sensitive stomachs while providing long-lasting chewing satisfaction.'
    },
    HONEY: {
      name: 'Honey',
      images: [
        '/images/dog-10.jpeg',
        '/images/dog-26.jpeg',
        '/images/dog-2.jpeg'
      ],
      description: 'Honey flavored Churpi offers natural sweetness and antibacterial properties combined with premium yak milk protein.',
      benefits: 'Honey Churpi provides natural energy and supports immune health with its antibacterial properties while offering a delicious taste dogs love.'
    },
    PEANUT: {
      name: 'Peanut',
      images: [
        '/images/dog-24.jpeg',
        '/images/dog-23.jpeg',
        '/images/dog-30.jpeg'
      ],
      description: 'Peanut Churpi combines the classic flavor dogs crave with the nutritional benefits of yak milk for a protein-packed treat.',
      benefits: 'High in protein and healthy fats, Peanut Churpi provides sustained energy and supports muscle health while offering irresistible flavor.'
    },
    COCONUT: {
      name: 'Coconut',
      images: [
        '/images/dog-7.jpeg',
        '/images/dog-11.jpeg',
        '/images/dog-4.jpeg'
      ],
      description: 'Coconut Churpi offers tropical flavor with the added benefits of coconut\'s natural oils for skin and coat health.',
      benefits: 'Coconut Churpi supports healthy skin and a shiny coat while providing medium-chain fatty acids for sustained energy and overall wellness.'
    },
    FLAXSEED: {
      name: 'Flaxseed',
      images: [
        '/images/dog-9.jpeg',
        '/images/dog-5.jpeg',
        '/images/dog-8.jpeg'
      ],
      description: 'Flaxseed Churpi is enriched with omega-3 fatty acids for optimal health benefits combined with traditional yak milk protein.',
      benefits: 'Rich in omega-3 fatty acids, Flaxseed Churpi supports heart health, reduces inflammation, and promotes a healthy, glossy coat.'
    }
  };

  const currentProduct = products[activeTab];
  const totalImages = currentProduct.images.length;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Flavor Tabs */}
      <section className="border-b border-gray-200 sticky top-0 bg-white z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {flavors.map((flavor) => (
              <button
                key={flavor}
                onClick={() => {
                  setActiveTab(flavor);
                  setSelectedImage(0);
                }}
                className={`px-6 py-4 font-semibold text-sm tracking-wide whitespace-nowrap transition-all duration-300 ${
                  activeTab === flavor
                    ? 'text-cyan-600 border-b-4 border-cyan-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-4 border-transparent'
                }`}
              >
                {flavor}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Content */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <Image
                src={currentProduct.images[selectedImage]}
                alt={`${currentProduct.name} ${selectedImage + 1}`}
                fill
                className="object-cover"
              />
              
              {/* Navigation Arrows */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {currentProduct.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-3 transition-all ${
                    selectedImage === index
                      ? 'border-cyan-600 ring-4 ring-cyan-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {currentProduct.name}
            </h1>

            {/* Description */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                <span className="font-bold">{currentProduct.name}</span>{' '}
                {currentProduct.description}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-8" />

            {/* Benefits */}
            <div>
              <p className="text-lg text-gray-700 leading-relaxed">
                {currentProduct.benefits}
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-12 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Product Highlights
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-600 text-xl">✓</span>
                  <span className="text-gray-700">100% Natural Ingredients</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-600 text-xl">✓</span>
                  <span className="text-gray-700">Long Lasting Chew</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-600 text-xl">✓</span>
                  <span className="text-gray-700">High Protein Content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-600 text-xl">✓</span>
                  <span className="text-gray-700">Supports Dental Health</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default VarietySection;