"use client";
import { useState, useRef, lazy, Suspense } from 'react';
import emailjs from '@emailjs/browser';
import { useCursorAnimation } from '../context/CursorAnimationContext';
import ErrorBoundary from '../components/ErrorBoundary';

// Lazy load the cursor animation (heavy component)
const SplashCursor = lazy(() => import('./animationCursor'));

export default function ContactPage() {
  const { isCursorAnimationEnabled } = useCursorAnimation();
  const formRef = useRef();
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Debug: Log environment variables
    console.log('🔍 EmailJS Config:');
    console.log('Service ID:', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID);
    console.log('Template ID:', process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID);
    console.log('Public Key:', process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
    console.log('Form Data:', formData);

    try {
      // Send email using EmailJS
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          name: formData.from_name,        // Changed from from_name to name
          email: formData.from_email,      // Changed from from_email to email
          subject: formData.subject,
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      console.log('✅ EmailJS Success:', result);

      setStatus({ 
        type: 'success', 
        message: 'Message sent successfully! I\'ll get back to you soon.' 
      });
      
      // Reset form
      setFormData({ from_name: '', from_email: '', subject: '', message: '' });

    } catch (error) {
      console.error('❌ EmailJS Error:', error);
      console.error('Error Text:', error.text);
      console.error('Error Status:', error.status);
      setStatus({ 
        type: 'error', 
        message: 'Failed to send message. Please try again. Error: ' + (error.text || error.message)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <>
        {/* Cursor Animation Effect - Only show if enabled, lazy loaded */}
        {isCursorAnimationEnabled && (
          <Suspense fallback={null}>
            <SplashCursor />
          </Suspense>
        )}
        
        <div 
          className="min-h-[calc(100vh-130px)] flex items-center justify-center"
          style={{
            position: 'relative',
            zIndex: 10,
          padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 1.5rem)',
        }}
      >
        <div className="w-full" style={{ maxWidth: 'clamp(500px, 85vw, 650px)' }}>
          {/* Main Glass Container */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'clamp(16px, 3vw, 20px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15), 0 4px 16px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              margin: '0 auto',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* Header Section */}
            <div className="text-center" style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
              <h1 
                style={{
                  fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
                  fontWeight: 'bold',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.02em'
                }}
              >
                CONTACT ME
              </h1>
              
              {/* Your Email Display with Icon */}
              <div 
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '50px',
                  padding: 'clamp(0.5rem, 1.5vw, 0.65rem) clamp(1rem, 3vw, 1.25rem)',
                  marginTop: 'clamp(0.25rem, 1vw, 0.5rem)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
              >
                <a 
                  href="mailto:naveensaranga1212@email.com"
                  className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-all"
                  style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                >
                  <svg style={{ width: 'clamp(16px, 3vw, 18px)', height: 'clamp(16px, 3vw, 18px)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  naveensaranga1212@email.com
                </a>
              </div>
            </div>

            {/* Divider */}
            <div 
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                marginBottom: 'clamp(1.25rem, 3vw, 1.75rem)'
              }}
            />

            {/* Contact Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
            {/* Name Field */}
            <div>
              <label 
                htmlFor="name" 
                className="block font-semibold opacity-90"
                style={{ 
                  letterSpacing: '0.05em',
                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.65rem)'
                }}
              >
                YOUR NAME *
              </label>
              <input
                type="text"
                id="name"
                name="from_name"
                value={formData.from_name}
                onChange={handleChange}
                required
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 2vw, 0.9rem) clamp(1rem, 2.5vw, 1.15rem)',
                  borderRadius: 'clamp(12px, 2vw, 14px)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(0.9rem, 2vw, 0.95rem)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                }}
              />
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block font-semibold opacity-90"
                style={{ 
                  letterSpacing: '0.05em',
                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.65rem)'
                }}
              >
                YOUR EMAIL *
              </label>
              <input
                type="email"
                id="email"
                name="from_email"
                value={formData.from_email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 2vw, 0.9rem) clamp(1rem, 2.5vw, 1.15rem)',
                  borderRadius: 'clamp(12px, 2vw, 14px)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(0.9rem, 2vw, 0.95rem)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                }}
              />
            </div>

            {/* Subject Field */}
            <div>
              <label 
                htmlFor="subject" 
                className="block font-semibold opacity-90"
                style={{ 
                  letterSpacing: '0.05em',
                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.65rem)'
                }}
              >
                SUBJECT *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What's this about?"
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 2vw, 0.9rem) clamp(1rem, 2.5vw, 1.15rem)',
                  borderRadius: 'clamp(12px, 2vw, 14px)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(0.9rem, 2vw, 0.95rem)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                }}
              />
            </div>

            {/* Message Field */}
            <div>
              <label 
                htmlFor="message" 
                className="block font-semibold opacity-90"
                style={{ 
                  letterSpacing: '0.05em',
                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.65rem)'
                }}
              >
                MESSAGE *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Tell me what's on your mind..."
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 2vw, 0.9rem) clamp(1rem, 2.5vw, 1.15rem)',
                  borderRadius: 'clamp(12px, 2vw, 14px)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(0.9rem, 2vw, 0.95rem)',
                  resize: 'vertical',
                  minHeight: 'clamp(120px, 20vw, 140px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                }}
              />
            </div>

            {/* Status Message */}
            {status.message && (
              <div 
                style={{
                  padding: 'clamp(0.75rem, 2vw, 0.9rem) clamp(1rem, 2.5vw, 1.15rem)',
                  borderRadius: 'clamp(12px, 2vw, 14px)',
                  background: status.type === 'success' 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: status.type === 'success'
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)',
                  color: status.type === 'success' ? '#86efac' : '#fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(0.5rem, 1.5vw, 0.65rem)',
                  fontSize: 'clamp(0.85rem, 2vw, 0.9rem)'
                }}
              >
                <svg style={{ width: 'clamp(18px, 3vw, 20px)', height: 'clamp(18px, 3vw, 20px)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {status.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                {status.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                borderRadius: 'clamp(12px, 2vw, 14px)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)',
                fontWeight: '600',
                letterSpacing: '0.05em',
                opacity: isSubmitting ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)';
                }
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SENDING...
                </span>
              ) : (
                'SEND MESSAGE'
              )}
            </button>
          </form>
        </div>
        </div>
      </div>
      </>
    </ErrorBoundary>
  );
}
