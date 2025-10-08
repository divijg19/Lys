// Minimal mock for #velite used in modal tests
export const expertise = {
  categories: [
    {
      name: "Frontend",
      icon: "Code",
      skills: [
        {
          name: "React",
          iconPath: "/assets/icons/react.svg",
          level: "Proficient",
          keyCompetencies: ["Hooks", "JSX", "Context"],
          details: "React is a JavaScript library for building user interfaces.",
          projectSlugs: ["lys"],
          rationale: "Widely used for modern web apps.",
          highlights: ["Built reusable components", "Used hooks extensively"],
          ecosystem: ["Redux", "React Router"],
        },
      ],
    },
  ],
};

export const projects = [
  {
    slug: "lys",
    title: "Lys Portfolio",
    url: "/projects/lys",
  },
];
