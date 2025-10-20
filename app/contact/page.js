export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto min-h-[70vh] flex items-center justify-center" style={{ padding: '2rem 1rem' }}>
      <div className="glass-card p-12 w-full">
        <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
        <p className="text-lg opacity-80 mb-8 leading-relaxed">
          I&apos;d love to hear from you! Whether you have a question, collaboration idea, 
          or just want to say hello, feel free to reach out.
        </p>
        
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-2 text-lg">Email</h3>
            <a 
              className="text-lg hover:opacity-70 transition-opacity" 
              href="mailto:your@email.com"
            >
              your@email.com
            </a>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-2 text-lg">Social</h3>
            <p className="opacity-70">Connect with me on your preferred platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
