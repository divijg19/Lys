// Global ambient window properties for debug / hydration markers.
export {};
declare global {
  interface Window {
    __lysHydrated?: boolean;
    __lysHydrationTime?: number;
  }
}
