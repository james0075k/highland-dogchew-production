
import React from 'react';
import { CheckCircle } from 'lucide-react';

const Process = () => {
  const steps = [
    {
      number: 1,
      title: 'Milk Procurement',
      description: 'We purchase milk from the highlands of Nepal, including both local and domestic sectors.',
      highlights: [
        'Purchase and delivery are conducted under a controlled quality system',
        'Before receiving the milk, it undergoes mandatory platform tests such as the alcohol test, acidity, COB, and MBRT to ensure quality'
      ],
      image: '/images/dog-1.jpeg'
    },
    {
      number: 2,
      title: 'Storage and Handling',
      description: 'After procurement, the milk is stored under strict conditions.',
      highlights: [
        'All storage conditions are automated and scheduled according to applied checklists to maintain consistency',
        'The First-In-First-Out (FIFO) system is strictly followed to ensure that the oldest stock is used first, thereby preserving product freshness'
      ],
      image: '/images/dog-4.jpeg'
    },
    {
      number: 3,
      title: 'Product Preparation',
      description: 'The preparation of CHURPI involves adhering to strict quality standards.',
      highlights: [
        'All mandatory quality parameters are followed without exception to ensure the highest quality product',
        'We offer customization of the CHURPI dog chew based on the buyer\'s specific requirements, allowing for adjustments to ingredients and formulations as needed'
      ],
      image: '/images/dog-6.jpeg'
    },
    {
      number: 4,
      title: 'Production Process',
      description: 'The production of CHURPI begins with preheating the milk to 45 degrees Celsius in a batch pasteurizer, followed by full cream separation.',
      highlights: [
        'The milk is then heated to 85 degrees, held, and coagulated at 78 degrees using lime juice',
        'After coagulation, the milk solids are filtered, boiled, and cooked for 15-20 minutes before being molded and pressed into the desired shape',
        'The fresh CHURPI cakes are then obtained after 8-10 hours of hydraulic pressing'
      ],
      image: '/images/dog-8.jpeg'
    },
    {
      number: 5,
      title: 'Product Safety',
      description: 'Ensuring the safety of the CHURPI dog chew is paramount.',
      highlights: [
        'The entire manufacturing process is conducted using stainless steel machines to maintain proper hygiene and sanitation',
        'After pressing, the CHURPI cakes are stored at a temperature of 2-5 degrees Celsius before moving on to the slicing stage'
      ],
      image: '/images/dog-11.jpeg'
    },
    {
      number: 6,
      title: 'Slicing and Sizing',
      description: 'The CHURPI is then sliced with precision. Technical slicing is done to ensure that all sizing criteria are met.',
      highlights: [
        'Each sliced bar is verified against the size requirements specified by the buyer',
        'The final product meets the desired specifications as outlined in the purchase order'
      ],
      image: '/images/dog-18.jpeg'
    },
    {
      number: 7,
      title: 'Drying Process',
      description: 'Once sliced, the CHURPI is transferred to drying units. The slices are dried under controlled relative humidity and temperature for 45 to 60 days.',
      highlights: [
        'Drying time depends on the product\'s physiological and chemical properties',
        'The process includes grading, sorting, smoking, buffing, sterilizing, blunting, and other required finishing procedures',
        'The entire process is conducted under strict surveillance to maintain consistent quality throughout'
      ],
      image: '/images/dog-26.jpeg'
    },
    {
      number: 8,
      title: 'Final Product Preparation',
      description: 'After the drying process is complete, the CHURPI dog chew is ready for the final steps.',
      highlights: [
        'The product is packaged carefully to preserve its quality',
        'Before delivery, the CHURPI undergoes quality assurance checks and receives prime certifications',
        'The final product meets the highest standards'
      ],
      image: '/images/dog-30.jpeg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/dog-29.jpeg')" }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            PROCESS
          </h1>
          <p className="text-xl text-white/90 italic">
            Home / <span className="text-cyan-400">Process</span>
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="space-y-20">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 items-center`}
            >
              {/* Image Side */}
              <div className="lg:w-1/2">
                <div className="relative">
                  {/* Step Number Badge */}
                  <div className="absolute -top-6 -left-6 z-10">
                    <div className="bg-cyan-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                      <span className="text-xl font-bold">Step {step.number}</span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-[400px] object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="lg:w-1/2">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h2>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Highlights */}
                <div className="space-y-4">
                  {step.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                      <p className="text-gray-700 leading-relaxed">
                        <span className="font-semibold">{highlight.split('.')[0]}.</span>
                        {highlight.split('.').slice(1).join('.')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Decorative Line */}
                {index < steps.length - 1 && (
                  <div className="mt-12 pt-12 border-t-2 border-cyan-100" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Assurance Banner */}
          
    </div>
  );
};

export default Process;