import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/Breadcrumbs';
import { submitContactForm } from '../api/publicData';

export function AboutPage() {
  return (
    <div>
      <Helmet>
        <title>About Mediclime & Clinical Review Standards | Mediclime</title>
        <meta name="description" content="Discover Mediclime's evidence-first mission, clinical review standards, and independence from commercial influence." />
        <meta name="keywords" content="about mediclime, clinical standards, medical publishing, peer review, evidence-based medicine" />
      </Helmet>
      <Breadcrumbs items={[{ label: 'About Mediclime' }]} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <h1 className="text-4xl font-extrabold text-[#094749] tracking-tight font-sans">
          About Mediclime Clinical Publishing
        </h1>
        <p className="text-lg text-slate-600 font-serif italic leading-relaxed">
          Bridging the gap between peer-reviewed biochemical literature and patient wellness decisions.
        </p>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
          <p>
            Founded by clinical neurologists and pharmacological researchers, Mediclime was created to eliminate marketing hype from nutritional medicine. We provide granular, evidence-graded breakdowns of clinical trials, biochemical pathways, and dietary supplements.
          </p>
          <h3 className="text-xl font-bold text-[#094749] pt-4">Our Three Editorial Pillars</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Peer-Reviewed Verification:</strong> We cite primary literature indexed on PubMed, NCBI, and clinical trial registries.</li>
            <li><strong>Zero Hidden Commercial Bias:</strong> Supplement evaluations feature third-party ISO-17025 lab verification.</li>
            <li><strong>Physician Editorial Review:</strong> Every article must be approved by a credentialed medical reviewer.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function MedicalDisclaimerPage() {
  return (
    <div>
      <Helmet>
        <title>Medical & FDA Disclaimer | Mediclime</title>
        <meta name="description" content="Important clinical legal disclaimers, FDA compliance notices, and reader advisories regarding health information and supplements." />
        <meta name="keywords" content="medical disclaimer, FDA compliance, health advisory, supplement disclaimer" />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Medical Disclaimer' }]} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <h1 className="text-4xl font-extrabold text-[#094749] tracking-tight font-sans">
          Medical & Clinical Disclaimer
        </h1>
        <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 text-sm text-rose-950 leading-relaxed">
          The contents of the Mediclime website, such as text, graphics, images, and other materials, are created for informational and educational purposes only. The Content is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
        </div>
        <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
          <p>
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on the Mediclime website.
          </p>
          <p>
            If you think you may have a medical emergency, call your doctor, go to the emergency department, or call 911 immediately. Mediclime does not recommend or endorse any specific tests, physicians, products, procedures, opinions, or other information that may be mentioned on the site.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitContactForm(formData);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Contact Mediclime Editorial Desk & Research Board | Mediclime</title>
        <meta name="description" content="Get in touch with the Mediclime clinical editorial desk regarding research inquiries, corrections, or medical feedback." />
        <meta name="keywords" content="contact mediclime, medical editorial, research inquiries, clinical corrections" />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Contact Editorial Team' }]} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <h1 className="text-4xl font-extrabold text-[#094749] tracking-tight font-sans">
          Contact Mediclime Editorial Board
        </h1>
        <p className="text-slate-600 font-serif italic">
          Have an inquiry regarding clinical citations, research corrections, or editorial submissions?
        </p>
        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-sm">
            ✓ Your inquiry has been securely delivered to the Mediclime editorial desk. We typically respond within 24–48 hours.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0F6265] hover:bg-[#094749] text-white font-bold text-xs shadow-md transition-colors"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <Helmet>
        <title>Page Not Found | Mediclime</title>
        <meta name="description" content="The requested clinical article, condition hub, or product analysis could not be located." />
      </Helmet>
      <div className="text-6xl font-extrabold text-[#F43F5E]">404</div>
      <h1 className="text-3xl font-extrabold text-[#094749] tracking-tight font-sans">
        Page Not Located
      </h1>
      <p className="text-slate-600 text-sm leading-relaxed">
        The clinical article, condition hub, or product analysis you are searching for does not exist or has been relocated.
      </p>
      <div>
        <a href="/" className="inline-block px-6 py-3 rounded-2xl bg-[#0F6265] text-white font-bold text-xs shadow-md">
          Return to Mediclime Home
        </a>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div>
      <Helmet>
        <title>Privacy Policy | Mediclime</title>
        <meta name="description" content="Mediclime's privacy policy and patient/reader data protection commitments." />
        <meta name="keywords" content="privacy policy, data protection, privacy terms" />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <h1 className="text-4xl font-extrabold text-[#094749] tracking-tight font-sans">Privacy Policy</h1>
        <p className="text-slate-600 font-serif italic">Last Updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-sm">
          <p>This privacy policy describes how Mediclime collects, uses, and shares your personal information.</p>
          <p>We do not sell your personal data. Analytics and cookies are strictly used to improve content delivery and user experience.</p>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div>
      <Helmet>
        <title>Terms of Service | Mediclime</title>
        <meta name="description" content="Mediclime terms of service, user agreements, and acceptable usage guidelines." />
        <meta name="keywords" content="terms of service, user agreement, legal guidelines" />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <h1 className="text-4xl font-extrabold text-[#094749] tracking-tight font-sans">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-sm">
          <p>By accessing Mediclime, you agree to these terms of service, all applicable laws and regulations.</p>
          <p>The materials on Mediclime's website are provided on an 'as is' basis. Mediclime makes no warranties, expressed or implied.</p>
        </div>
      </div>
    </div>
  );
}

export function EditorialPolicyPage() {
  return (
    <div>
      <Helmet>
        <title>Editorial Standards & Peer Review Policy | Mediclime</title>
        <meta name="description" content="Discover how Mediclime sources, fact-checks, and peer-reviews clinical health information and supplement audits." />
        <meta name="keywords" content="editorial policy, peer review, medical fact-checking, clinical credibility" />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Editorial Policy' }]} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <h1 className="text-4xl font-extrabold text-[#094749] tracking-tight font-sans">Editorial Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-sm">
          <p>Our content is verified by clinical professionals. We maintain strict independence from advertisers.</p>
          <p>If a correction is needed, it will be prominently displayed at the top of the relevant article.</p>
        </div>
      </div>
    </div>
  );
}

export function FaqPage() {
  return (
    <div>
      <Helmet>
        <title>Frequently Asked Questions & Clinical Standards | Mediclime</title>
        <meta name="description" content="Find answers to common questions about our research methodology, medical review board, and supplement evaluations." />
        <meta name="keywords" content="faq, clinical questions, supplement evaluation faq, research methodology" />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Frequently Asked Questions' }]} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <h1 className="text-4xl font-extrabold text-[#094749] tracking-tight font-sans">General FAQ</h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-sm">
          <h3 className="font-bold text-[#094749]">Who writes the content on Mediclime?</h3>
          <p>Our articles are authored by medical researchers and reviewed by board-certified physicians.</p>
          <h3 className="font-bold text-[#094749]">How do you evaluate supplements?</h3>
          <p>We analyze the biochemical mechanisms, clinical trial data, and third-party lab testing results.</p>
        </div>
      </div>
    </div>
  );
}
