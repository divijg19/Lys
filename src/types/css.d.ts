declare module "*.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "@/styles/globals.css";
