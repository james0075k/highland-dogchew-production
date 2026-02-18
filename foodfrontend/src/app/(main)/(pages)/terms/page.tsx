"use client";

import React from "react";

const TermsAndConditions = () => {
  return (
    <section className="w-full bg-white py-14 md:py-20 mt-20">
      <div className="max-w-4xl mx-auto px-6"  style={{
              fontFamily:
                'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}>
        {/* Title */}
        <h1 className="text-center text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
          Terms & Conditions
        </h1>

        <p className="mt-3 text-center text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-12 space-y-10 text-gray-700 leading-relaxed text-[16px] md:text-[17px]">
          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. General Information
            </h2>
            <p>
              Welcome to Highland Yak Chew. By accessing our website, purchasing
              our products, or using any services provided by us, you agree to
              comply with and be bound by these Terms & Conditions. If you do not
              agree with any part of these terms, please do not use our website
              or products.
            </p>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Product Information
            </h2>
            <p>
              Highland Yak Chew products are made using natural ingredients,
              primarily yak and cow milk. Due to the natural production process,
              variations in size, shape, color, and texture may occur. These
              variations are normal and do not affect product quality or safety.
            </p>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Dog Safety & Usage Disclaimer
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Products are intended for dogs only.</li>
              <li>
                Always supervise your dog while they are chewing any product.
              </li>
              <li>Not recommended for puppies under 4 months of age.</li>
              <li>
                Remove small or sharp pieces to reduce the risk of choking.
              </li>
              <li>
                Every dog chews differently; Highland Yak Chew is not
                responsible for injuries caused by improper use or lack of
                supervision.
              </li>
              <li>
                Consult your veterinarian if your dog has allergies or special
                dietary requirements.
              </li>
            </ul>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Orders & Payments
            </h2>
            <p>
              All prices are listed in the applicable currency and are subject to
              change without notice. Orders are confirmed only after successful
              payment. We reserve the right to cancel or refuse any order due to
              pricing errors, stock availability, or suspected fraudulent
              activity.
            </p>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Shipping & Delivery
            </h2>
            <p>
              Orders are generally processed within 1–2 business days, excluding
              weekends and public holidays. Delivery times may vary based on
              location. Shipping fees are displayed at checkout. For
              international orders, customers are responsible for any customs
              duties, taxes, or import fees.
            </p>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Returns & Refunds
            </h2>
            <p>
              Due to the nature of dog chew products, we do not accept returns of
              used items. If your product arrives damaged or defective, please
              contact us within a reasonable time so we can review and resolve
              the issue.
            </p>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Intellectual Property
            </h2>
            <p>
              All content on this website, including text, images, logos, and
              designs, is the property of Highland Yak Chew and may not be used,
              copied, or reproduced without prior written permission.
            </p>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              Highland Yak Chew shall not be liable for any indirect, incidental,
              or consequential damages arising from the use or misuse of our
              products or website.
            </p>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Changes to These Terms
            </h2>
            <p>
              We reserve the right to update or modify these Terms & Conditions
              at any time. Continued use of our website or products after changes
              are posted constitutes acceptance of those changes.
            </p>
          </div>

          {/* Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Contact Us
            </h2>
            <p>
              If you have any questions regarding these Terms & Conditions,
              please contact us through our website or official support channels.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsAndConditions;
