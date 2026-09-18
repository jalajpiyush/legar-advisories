import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface FeedbackButtonsProps {
  message: string;
}

export function FeedbackButtons({ message }: FeedbackButtonsProps) {
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'positive' | 'negative_prompt' | 'submitted'>('idle');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePositive = async () => {
    setFeedbackStatus('submitted');
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, isPositive: true })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const submitNegative = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          isPositive: false, 
          reason,
          customReason: reason === 'Other' ? customReason : null
        })
      });
      setFeedbackStatus('submitted');
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  if (feedbackStatus === 'submitted') {
    return (
      <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium px-2 py-1">
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-1">
      <button 
        onClick={handlePositive}
        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
        title="Helpful"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button 
        onClick={() => setFeedbackStatus('negative_prompt')}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Not Helpful"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>

      {feedbackStatus === 'negative_prompt' && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">What was wrong?</h4>
            <button onClick={() => setFeedbackStatus('idle')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 mb-4">
            {['Incorrect law', 'Wrong jurisdiction', 'Missing information', 'Hallucinated citation', 'Too generic', 'Didn\'t answer my question', 'Poor drafting', 'Other'].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 p-1.5 rounded-md">
                <input 
                  type="radio" 
                  name="reason" 
                  value={opt} 
                  checked={reason === opt}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-[#c6a87c] focus:ring-[#c6a87c]"
                />
                {opt}
              </label>
            ))}
          </div>

          {reason === 'Other' && (
            <textarea 
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please explain..."
              className="w-full text-sm p-2 mb-3 border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 rounded-lg focus:ring-2 focus:ring-[#c6a87c] outline-none text-gray-900 dark:text-neutral-100 resize-none h-16"
            />
          )}

          <button 
            onClick={submitNegative}
            disabled={!reason || isSubmitting}
            className="w-full py-2 bg-[#c6a87c] text-white rounded-lg text-sm font-medium hover:bg-[#b5986c] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}
    </div>
  );
}
