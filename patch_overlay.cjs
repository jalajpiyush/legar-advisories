const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

const regex = /<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/95 text-white">[\s\S]*?<\/div>\n      \)}/;

const newOverlay = `<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111] text-white overflow-hidden">
          <div className="relative flex flex-col items-center justify-center w-full h-full max-w-md p-6">
          {paymentFlowState === 'verifying' ? (
            <div className="flex flex-col items-center animate-in fade-in duration-700">
              <div className="relative w-[48px] h-[48px] mb-8">
                <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
              </div>
              <h2 className="text-[26px] font-serif mb-3 tracking-tight font-medium" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>Verifying payment method...</h2>
              <p className="text-[15px] text-[#A1A1AA]">Don't navigate away from this page yet</p>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in zoom-in-95 fade-in duration-700">
              <div className="w-[56px] h-[56px] rounded-full border-[2px] border-white flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-white stroke-[1.5]" />
              </div>
              <h2 className="text-[28px] font-serif mb-2 tracking-tight font-medium" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>
                Welcome to {currentPlan === 'Free' ? 'Individuals' : currentPlan}
              </h2>
            </div>
          )}
          </div>
        </div>
      )}`;

content = content.replace(regex, newOverlay);
fs.writeFileSync('src/pages/Billing.tsx', content);
