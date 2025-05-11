"use client";

import Image from "next/image";

export default function TechStackSection() {
  const techStack = [
    { name: "AWS", src: "/assets/icons/aws.svg" },
    { name: "JavaScript", src: "/assets/icons/javascript.svg" },
    { name: "Typescript", src: "/assets/icons/typescript.svg" },
    { name: "Python", src: "/assets/icons/python.svg" },
    { name: "MongoDB", src: "/assets/icons/mongodb.svg" },
    { name: "Express", src: "/assets/icons/express.svg" },
    { name: "React", src: "/assets/icons/react.svg" },
    { name: "Nodejs", src: "/assets/icons/nodejs.svg" },
    { name: "R", src: "/assets/icons/r.svg" },
    { name: "GoLang", src: "/assets/icons/golang.svg" },
    { name: "C++", src: "/assets/icons/c++.svg" },
    { name: "Lua", src: "/assets/icons/lua.svg" },
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
              alt={`${tech.name} logo`}
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
              loading="lazy"
            />
            <p className="mt-2 text-base font-medium text-gray-800 dark:text-white">
              {tech.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
