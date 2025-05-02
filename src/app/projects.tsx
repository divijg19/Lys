import Link from "next/link";

export default function Projects() {
  return (
    <div className="min-h-screen p-8 sm:p-20">
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-8">
        My Projects
      </h1>

      <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
        {/* Project 1 */}
        <div className="w-full sm:w-[300px] p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Nargis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            A web app for managing tasks and goals. Built with MERN stack and
            AWS.
          </p>
          <Link
            href="/projects/nargis"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
          >
            View Details
          </Link>
        </div>

        {/* Repeat for other projects */}
        <div className="w-full sm:w-[300px] p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Portfolio Website
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            My personal portfolio showcasing skills, projects, and contact
            details.
          </p>
          <Link
            href="/projects/portfolio"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
