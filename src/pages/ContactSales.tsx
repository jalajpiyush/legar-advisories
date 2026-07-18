import React from 'react';

interface ContactSalesProps {
  onBack: () => void;
}

export function ContactSales({ onBack }: ContactSalesProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white relative overflow-y-auto">
      {/* Top Header section */}
      <div className="w-full flex justify-between items-center px-6 md:px-12 py-6 absolute top-0 left-0 right-0 z-20">
        <div className="font-serif text-3xl font-medium tracking-tight text-black">Legal Advisories</div>
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

          <div className="flex items-center gap-8 md:gap-14 opacity-80 flex-wrap pb-8 grayscale">
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-black">ReedSmith</span>
            <span className="font-sans text-2xl md:text-3xl font-bold lowercase tracking-tighter text-black">pwc</span>
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-black">O'Melveny</span>
            <span className="font-sans text-lg md:text-xl font-bold uppercase tracking-widest text-black">Bridgewater</span>
            <span className="font-serif text-lg md:text-xl tracking-[0.2em] text-black">MACFARLANES</span>
          </div>
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
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">First Name: *</label>
                  <input type="text" placeholder="First Name" className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Last Name: *</label>
                  <input type="text" placeholder="Last Name" className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Business Email Address: *</label>
                  <input type="email" placeholder="Business Email Address" className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Company Name: *</label>
                  <input type="text" placeholder="Company Name" className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Job Title: *</label>
                  <input type="text" placeholder="Job Title" className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[15px] text-gray-900">Phone Number:</label>
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[15px] text-gray-900">Organization Type: *</label>
                <div className="relative">
                  <select className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors appearance-none bg-white text-gray-500" required>
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
                  <select className="w-full px-4 py-3.5 border border-gray-300 rounded-sm text-[15px] outline-none focus:border-gray-500 transition-colors appearance-none bg-white text-gray-500" required>
                    <option value="">Select...</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <div className="pt-0.5">
                  <input type="checkbox" className="w-4 h-4 border-gray-300 rounded-sm text-black focus:ring-black accent-black" />
                </div>
                <label className="text-[15px] text-gray-800 leading-snug font-light">
                  Yes, I would like to receive marketing communications regarding Legal Advisories' products, services, and events. I can unsubscribe at any time
                </label>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#111111] text-white font-medium py-3.5 rounded-sm hover:bg-black transition-colors text-[16px]">
                  Submit
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
