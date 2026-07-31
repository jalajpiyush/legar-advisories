import React from 'react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Legal Advisories</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">
              An AI-powered legal research and document assistance platform.
            </p>
            <div className="text-xs text-gray-400">
              <p>Powered by AI</p>
              <p className="mt-1">© {new Date().getFullYear()} Legal Advisories Inc. All rights reserved.</p>
              <p className="mt-1">123 Legal Tech Park, Bengaluru, Karnataka, India 560001</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => onNavigate('terms')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('disclaimer')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  AI Disclaimer
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@legaladvisories.example.com" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CookieBanner({ onAccept }: { onAccept: () => void }) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
    if (onAccept) onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-600">
        We use cookies to improve your experience and analyze platform usage. By continuing to use our site, you accept our use of cookies.
      </div>
      <div className="flex gap-3 shrink-0">
        <button onClick={() => setIsVisible(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          Decline
        </button>
        <button onClick={handleAccept} className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors">
          Accept Cookies
        </button>
      </div>
    </div>
  );
}
