/**
 * Ambient types for Vite's `?worker` import form.
 *
 * Vite ships these declarations in vite/client, but Astro's tsconfig does not
 * load them automatically (and pnpm's strict layout keeps vite unreachable
 * from project files), so the project declares the one shape it uses.
 */
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}
