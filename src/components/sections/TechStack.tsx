import Image from "next/image";

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

export default function TechStackSection() {
  return (
    <section className="flex flex-col items-center gap-8 sm:items-start sm:text-left w-full">
      <h2 className="text-2xl font-semibold mb-6 text-primary">Tech Stack</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
        {techStack.map((tech) => (
          <div key={tech.name} className="flex flex-col items-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <Image src={tech.src} alt={tech.name} width={40} height={40} className="w-10 h-10 mb-2" />
            <span className="font-medium text-gray-800 dark:text-white">{tech.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
