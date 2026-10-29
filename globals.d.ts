// Lets global stylesheet imports (import "./globals.css") type-check on TypeScript
// versions that check side-effect imports; Next only declares *.module.css.
declare module "*.css";
