// src/components/TechStackSection.tsx
export default function TechStackSection() {
    return (
      <section className="flex flex-col items-center gap-8 sm:items-start sm:text-left">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Tech Stack
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Here are the technologies I work with:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6">
          {/* Example tech stack items */}
          <div className="flex flex-col items-center">
            <img
              src="/path-to-image/javascript-icon.png" // Add your tech images in the public folder
              alt="JavaScript"
              className="w-16 h-16"
            />
            <p className="text-lg text-gray-800 dark:text-white">JavaScript</p>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/path-to-image/react-icon.png"
              alt="React"
              className="w-16 h-16"
            />
            <p className="text-lg text-gray-800 dark:text-white">React</p>
          </div>
          {/* Add more technologies in a similar manner */}
        </div>
      </section>
    );
  }  