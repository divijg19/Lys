"use client";

export default function AboutSection() {
  return (
    <section className="w-full max-w-4xl mx-auto mt-24 px-4 text-center sm:text-left">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
        About Me
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        I’m Divij — a full-stack developer and systems thinker passionate about building scalable, meaningful, and community-driven tech solutions.
        I blend code with strategy, focusing on MERN, AWS, and DevOps to craft reliable infrastructure and intuitive user experiences.
      </p>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        With experience across leadership roles in TEDx, GDSC, and AIESEC, I bring a unique perspective to software: it’s not just about what you build,
        but who it empowers. I’m currently working on a skill-sharing platform and a game called <span className="italic">The Crowns Blade</span>.
      </p>
    </section>
  );
}
