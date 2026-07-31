import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
  title: string;
  children: React.ReactNode;
}

function LegalLayout({ onBack, title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
        <div className="prose prose-sm md:prose-base prose-blue max-w-none text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Terms({ onBack }: { onBack: () => void }) {
  return (
    <LegalLayout title="Terms of Service" onBack={onBack}>
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using Legal Advisories, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
      
      <h3>2. User Responsibilities</h3>
      <p>You are responsible for any documents you upload and any queries you submit. You must ensure you have the necessary rights and permissions to share such information.</p>
      
      <h3>3. No Legal Advice</h3>
      <p><strong>Legal Advisories is not a law firm.</strong> The information and AI-generated responses provided by the platform are for informational and educational purposes only. The platform <strong>does not create an advocate-client relationship</strong>. AI-generated responses may contain mistakes, inaccuracies, or outdated information. Always consult a licensed legal professional before making important legal decisions.</p>
      
      <h3>4. Limitation of Liability</h3>
      <p>To the maximum extent permitted by applicable law, Legal Advisories and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the platform.</p>
      
      <h3>5. Refund and Cancellation Policy</h3>
      <p>Subscriptions may be canceled at any time. Refunds for paid services are evaluated on a case-by-case basis and are generally not provided for partial subscription periods.</p>
      
      <h3>6. Governing Law</h3>
      <p>These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
    </LegalLayout>
  );
}

export function Privacy({ onBack }: { onBack: () => void }) {
  return (
    <LegalLayout title="Privacy Policy" onBack={onBack}>
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, including your email address, uploaded files, and chat history. We may also collect usage data and analytics to improve our services.</p>
      
      <h3>2. How We Use Your Information</h3>
      <p>Your information is used to provide, maintain, and improve our platform, including generating AI responses. We do not sell your personal data to third parties.</p>
      
      <h3>3. Data Retention</h3>
      <p>We retain your data for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time.</p>
      
      <h3>4. Security Measures</h3>
      <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
      
      <h3>5. AI Providers</h3>
      <p>Your queries and uploaded documents may be processed by third-party AI providers (such as OpenAI or Google) to generate responses. These providers are bound by strict confidentiality and data processing agreements and do not use your data to train their public models.</p>
      
      <h3>6. User Rights (DPDP Act Compliance)</h3>
      <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. Users in India have rights under the Digital Personal Data Protection (DPDP) Act. To exercise these rights, please contact us.</p>
      
      <h3>7. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@legaladvisories.example.com.</p>
    </LegalLayout>
  );
}

export function Disclaimer({ onBack }: { onBack: () => void }) {
  return (
    <LegalLayout title="AI Disclaimer" onBack={onBack}>
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
        <p className="text-amber-900 font-medium text-lg leading-relaxed mb-0">
          Legal Advisories is an AI-powered legal research and document assistance platform. It provides informational and educational content only and is not a substitute for advice from a qualified lawyer. Using this platform does not create an advocate-client relationship. Always consult a licensed legal professional before making important legal decisions.
        </p>
      </div>
      <div className="mt-8">
        <h3>Understanding AI Limitations</h3>
        <p>While we strive for accuracy, artificial intelligence systems can occasionally produce incorrect, incomplete, or biased information (often referred to as "hallucinations").</p>
        <ul>
          <li><strong>No Guarantee of Accuracy:</strong> Laws change frequently, and AI may rely on outdated or misinterpreted data.</li>
          <li><strong>Not Specific to Your Situation:</strong> AI cannot fully understand the nuances and context of your specific legal situation.</li>
          <li><strong>Verification Required:</strong> You should independently verify any citations, case laws, or statutes provided by the AI.</li>
        </ul>
      </div>
    </LegalLayout>
  );
}
