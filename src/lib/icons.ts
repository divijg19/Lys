// src/lib/icons.ts
// Central icon exports for use throughout the app

import { BookOpen, FolderOpen, Home, Mail, Sparkles, User } from "lucide-react";

export { BookOpen, FolderOpen, Home, Mail, Sparkles, User };

// For themeIconMap (example, can be extended as needed)
export const themeIconMap = {
  react: Sparkles,
  nextjs: Home,
  nodejs: User,
  typescript: FolderOpen,
  aws: BookOpen,
  // ...add more as needed
};
