"use client";

import Image from "next/image";

export default function TechStackSection() {
  const techStack = [
    { name: "JavaScript", src: "/tech/javascript-icon.png" },
    { name: "React", src: "/tech/react-icon.png" },
    { name: "AWS", src: "/tech/aws-icon.png" },
    { name: "MERN", src: "/tech/mern-icon.png" },
    { name: "Python", src: "/tech/python-icon.png" },
    { name: "R", src: "/tech/r-icon.png" },
    { name: "C++", src: "/tech/cpp-icon.png" },
    { name: "GoLang", src: "/tech/golang-icon.png" },
    { name: "Ruby on Rails", src: "/tech/rails-icon.png" },
  ];

  return (
    <section className="flex flex-col items-center gap-8 sm:items-start sm:text-left">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Tech Stack
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Here are the technologies I work with:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6">
        {techStack.map((tech) => (
          <div className="flex flex-col items-center" key={tech.name}>
            <Image
              src={tech.src}
              alt={tech.name}
              width={64}
              height={64}
              className="w-16 h-16"
            />
            <p className="text-lg text-gray-800 dark:text-white">{tech.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
