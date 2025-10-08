// Centralized expertise-related types
// Importing type-only to avoid bundling large objects at runtime
import type { expertise } from "#velite";

export type ExpertiseCategories = typeof expertise.categories;
export type Skill = ExpertiseCategories[0]["skills"][0];
