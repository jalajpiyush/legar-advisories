import React, { useState } from 'react';
import { db } from '../lib/auth';
import { collection, addDoc } from 'firebase/firestore';

interface ContactSalesProps {
  onBack: () => void;
}

export function ContactSales({ onBack }: ContactSalesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    job_title: '',
    phone: '',
    org_type: '',
    country: 'India',
    marketing_opt_in: false
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Manual validation to provide better feedback
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.company || !formData.org_type) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting submission...', formData);
      
      // Call backend to handle both email sending and database storage
      const response = await fetch('/api/contact/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Backend notification failed');
      }

      setIsSuccess(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      setError('Failed to send request: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-white relative">
        <div className="w-full flex justify-between items-center px-6 md:px-12 py-6 absolute top-0 left-0 right-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded flex items-center justify-center">
              <span className="text-white font-serif text-[20px] font-bold">L</span>
            </div>
            <div className="font-serif text-3xl font-medium tracking-tight text-black">Legal Advisories</div>
          </div>
          <button onClick={onBack} className="text-gray-500 text-sm hover:text-gray-900 transition-colors font-medium">
            Back to full website
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-[600px] text-center space-y-8">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tight">Request Received.</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Thank you for your interest in Legal Advisories. A demo request has been sent to our sales team (legaladvisoriesofficial@gmail.com). We will get back to you shortly to schedule a session.
            </p>
            <button 
              onClick={onBack}
              className="bg-black text-white px-8 py-3 rounded-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white relative overflow-y-auto">
      {/* Top Header section */}
      <div className="w-full flex justify-between items-center px-6 md:px-12 py-6 absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded flex items-center justify-center">
            <span className="text-white font-serif text-[20px] font-bold leading-none select-none" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>L</span>
          </div>
          <div className="font-serif text-3xl font-medium tracking-tight text-black">Legal Advisories</div>
        </div>
        <button onClick={onBack} className="text-gray-500 text-sm hover:text-gray-900 transition-colors font-medium">
          Back to full website
        </button>
      </div>

      <div className="w-full bg-white pt-40 pb-24 px-6 relative z-10">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-[4rem] md:text-[5.5rem] font-serif text-gray-900 leading-[1.05] tracking-tight mb-8">
            See Why Top Legal Teams Use Legal Advisories.
          </h1>
          <p className="text-[18px] md:text-[20px] text-gray-900 font-normal leading-[1.5] mb-16 max-w-2xl">
            Purpose built for the world's most demanding legal workflows. Book a demo to see Legal Advisories in action.
          </p>

        </div>
      </div>

      {/* Bottom section with form and dark background */}
      <div className="relative flex-1 flex flex-col justify-between">
        {/* Dark textured background image */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <div className="w-full h-full bg-[#1c1c1a]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-[900px] mx-auto px-6 mt-[-40px] pb-32">
          <div className="bg-white rounded-md p-8 md:p-12 shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">First Name: *</label>
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" 
                    required 
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Last Name: *</label>
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" 
                    required 
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Business Email Address: *</label>
                  <input 
                    type="email" 
                    placeholder="Business Email Address" 
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Company Name: *</label>
                  <input 
                    type="text" 
                    placeholder="Company Name" 
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" 
                    required 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Job Title: *</label>
                  <input 
                    type="text" 
                    placeholder="Job Title" 
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" 
                    required 
                    value={formData.job_title}
                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Phone Number:</label>
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[15px] text-gray-900">Organization Type: *</label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors appearance-none bg-white text-gray-900" 
                    required
                    value={formData.org_type}
                    onChange={(e) => setFormData({...formData, org_type: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="law_firm">Law Firm</option>
                    <option value="in_house">In-House Counsel</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[15px] text-gray-900">Country: *</label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors appearance-none bg-white text-gray-900" 
                    required 
                    defaultValue="India"
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  >
                    <option value="India">India</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <div className="pt-0.5">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 border-gray-300 rounded-sm text-black focus:ring-black accent-black" 
                    checked={formData.marketing_opt_in}
                    onChange={(e) => setFormData({...formData, marketing_opt_in: e.target.checked})}
                  />
                </div>
                <label className="text-[15px] text-gray-800 leading-snug font-light">
                  Yes, I would like to receive marketing communications regarding Legal Advisories' products, services, and events. I can unsubscribe at any time
                </label>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#111111] text-white font-medium py-3.5 rounded-sm hover:bg-black transition-colors text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-12">
            <p className="text-[#a3a3a3] text-[14px]">
              For details about how we collect, use, and protect your information, please see our <a href="#" className="underline hover:text-white transition-colors">privacy policy</a>.
            </p>
          </div>
        </div>

        <div className="bg-white py-6 w-full relative z-10 mt-auto">
          <div className="max-w-[900px] mx-auto px-6 flex justify-center gap-4 text-[14px] text-gray-500 font-medium">
            <a href="#" className="hover:text-gray-900 transition-colors">Security</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Legal</a>
            <span className="text-gray-400">© 2026 Legal Advisories Corporation</span>
          </div>
        </div>

      </div>
    </div>
  );
}
