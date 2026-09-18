const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

// We need to add state for this flow.
const stateRegex = /const \[paymentNotice, setPaymentNotice\] = useState<\{ type: 'success' \| 'failed'; message: string \} \| null>\(null\);/;
const newState = `const [paymentNotice, setPaymentNotice] = useState<{ type: 'success' | 'failed'; message: string } | null>(null);
  const [paymentFlowState, setPaymentFlowState] = useState<'verifying' | 'welcome' | null>(null);`;

content = content.replace(stateRegex, newState);

const useEffectRegex = /if \(status === 'success'\) \{[\s\S]*?window.history.replaceState\(\{\}, document.title, window.location.pathname\);\n    \} else if/m;

const newEffect = `if (status === 'success') {
      setPaymentFlowState('verifying');
      setTimeout(() => {
        setPaymentFlowState('welcome');
        setTimeout(() => {
          setPaymentFlowState(null);
        }, 3000);
      }, 2500);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if`;

content = content.replace(useEffectRegex, newEffect);

const returnRegex = /return \(\n    <div className="flex flex-col h-full overflow-y-auto bg-gray-50\/30 dark:bg-black relative">/;

const newReturn = `return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50/30 dark:bg-black relative">
      {paymentFlowState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white">
          {paymentFlowState === 'verifying' ? (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="w-16 h-16 border-[3px] border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
              <h2 className="text-[22px] font-serif mb-2" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>Verifying payment method...</h2>
              <p className="text-sm text-neutral-400">Don't navigate away from this page yet</p>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in zoom-in-95 fade-in duration-500">
              <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-[24px] font-serif mb-2" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>
                Welcome to {currentPlan === 'Free' ? 'Individuals' : currentPlan}
              </h2>
            </div>
          )}
        </div>
      )}`;

content = content.replace(returnRegex, newReturn);

fs.writeFileSync('src/pages/Billing.tsx', content);
