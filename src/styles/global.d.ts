// Allow importing global CSS in Storybook TS context
declare module "*.css" {
  const content: unknown;
  export default content;
}
declare module "@/styles/globals.css";
declare module "@/styles/a11y.css";
