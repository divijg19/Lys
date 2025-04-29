// src/components/ContactSection.tsx
export default function ContactSection() {
    return (
      <section className="flex flex-col items-center gap-8 sm:items-start sm:text-left py-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Contact Me</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Feel free to reach out if you want to discuss opportunities, collaborations, or just to say hi!
        </p>
  
        {/* Contact Links */}
        <div className="flex gap-6">
          <a
            href="mailto:your-email@example.com"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
          >
            Email Me
          </a>
          <a
            href="https://linkedin.com/in/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
          >
            GitHub
          </a>
        </div>
      </section>
    );
  }
  