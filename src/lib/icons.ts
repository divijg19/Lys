// src/lib/icons.ts
// Central icon exports for use throughout the app

import {
  Sparkles,
  Home,
  User,
  FolderOpen,
  BookOpen,
  Mail,
} from "lucide-react";

export { Sparkles, Home, User, FolderOpen, BookOpen, Mail };

// For themeIconMap (example, can be extended as needed)
export const themeIconMap = {
  react: Sparkles,
  nextjs: Home,
  nodejs: User,
  typescript: FolderOpen,
  aws: BookOpen,
  // ...add more as needed
};
