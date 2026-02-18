'use client'
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { apiRequest } from '@/utils/apiService';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // ✅ Backend endpoint: POST /api/v1/contact
      const res = await apiRequest("/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSuccessMsg(res?.message || "Message sent successfully!");
      setFormData({ name: '', email: '', subject: '', message: '' });
      console.log(res)
    } catch (err) {
      setErrorMsg(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white"  style={{
              fontFamily:
                'ui-serif, Georgia, "Times New Roman", Times, serif',
              fontStyle: "italic",
            }}>
      {/* Hero Section */}
      <section className="relative h-[400px] bg-cover bg-center"
      
        style={{ backgroundImage: "url(/images/about1.webp)" }}>
          
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6" >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            CONTACT
          </h1>
          <p className="text-lg text-white/90">
            Home / <span className="text-cyan-400">CONTACT</span>
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Get in touch
            </h2>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              We are available 24/7 by email or phone. You can also use our quick contact form to ask a question about our products.
            </p>

            {/* ✅ Success / Error */}
            {(successMsg || errorMsg) && (
              <div className={`mb-6 p-4 rounded-lg border ${
                successMsg ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {successMsg || errorMsg}
              </div>
            )}

            {/* Contact Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                required
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                rows="6"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                required
              />

              {/* reCAPTCHA placeholder (UI only) */}
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                <input type="checkbox" className="w-5 h-5" />
                <span className="text-sm text-gray-600">I&apos;m not a robot</span>
                <div className="ml-auto">
                  <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="h-8" />
                </div>
              </div>

              <button
                type="submit"   // ✅ important
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>

          {/* Right Column */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <Mail className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">We&apos;d Love to Hear From You!</h3>
              <p className="text-gray-600 max-w-md">
                Whether you have questions about our products, need support, or just want to say hello, we&apos;re here to help.
              </p>
            </div>
            
          </div>

          
          
        </div>
     
      </section>


  <section className="w-full h-[450px] md:h-[500px] lg:h-[600px]">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.682160402595!2d-0.4483869!3d51.5190469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48766d8b57bb686f%3A0x9dbdcf7df5a726a9!2sDickens%20Ave%2C%20Uxbridge%2C%20UK!5e0!3m2!1sen!2snp!4v1766241428979!5m2!1sen!2snp" 
          className="w-full h-full"
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Highland Yak Chew Location"
        />
      </section>
    
    </div>
  );
};

export default Contact;
