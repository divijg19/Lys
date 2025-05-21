// src/lib/types.ts
// Centralized types for use across the app

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
}

export interface Service {
  id?: number;
  icon: string;
  title: string;
  description: string;
}
