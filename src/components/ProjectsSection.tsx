// src/components/ProjectsSection.tsx

import Link from "next/link";

export default function ProjectsSection() {
  return (
    <section className="flex flex-col items-center gap-8 sm:items-start sm:text-left">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Featured Projects
      </h2>
      <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
        {/* Example project 1 */}
        <div className="w-full sm:w-[300px] p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Project 1: Nargis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            A web app for managing tasks and goals. Built with MERN stack and
            AWS.
          </p>
          <Link
            href="/projects/nargis"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
          >
            View Project
          </Link>
        </div>

        {/* Example project 2 */}
        <div className="w-full sm:w-[300px] p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Project 2: Crowns Blade
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            A turn-based strategy game built with Lua for game mechanics and
            Node.js for backend.
          </p>
          <Link
            href="/projects/crowns-blade"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
          >
            View Project
          </Link>
        </div>

        {/* Add more projects below */}
      </div>
    </section>
  );
}
