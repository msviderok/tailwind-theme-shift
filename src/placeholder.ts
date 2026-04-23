export const PLACEHOLDER = `
/* BoldKit Theme - Light & Dark Mode */
:root {
  /* Base Colors */
  --background: oklch(0.986 0.001 106.42);
  --foreground: oklab(0.207 0.003 -0.010);

  /* Primary */
  --primary: lch(77.05% 37.22 3.64);
  --primary-foreground: lab(7.88% 1.06 -3.60);

  /* Secondary */
  --secondary: hsl(154 56% 78%);
  --secondary-foreground: hwb(240 9% 89%);

  /* Accent */
  --accent: rgb(195 177 231);
  --accent-foreground: #17171c;

  /* Muted */
  --muted: color(srgb 0.905 0.905 0.895);
  --muted-foreground: color(srgb-linear 0.16391 0.16391 0.19459);

  /* Card & Popover */
  --card: color(display-p3 1 1 1);
  --card-foreground: color(a98-rgb 0.11466 0.11466 0.13137);
  --popover: color(prophoto-rgb 1 1 1);
  --popover-foreground: color(rec2020 0.03904 0.03859 0.05095);

  /* Destructive */
  --destructive: color(xyz 0.38537 0.2276 0.07725);
  --destructive-foreground: color(xyz-d50 0.9643 1 0.8251);

  /* Border & Input */
  --border: color(xyz-d65 0.00868 0.00876 0.01225);
  --input: oklch(0.207 0.010 285.49);
  --ring: oklab(0.207 0.003 -0.010);

  /* Radius - Minimal for neubrutalism */
  --radius: 0rem;

  /* BoldKit specific */
  --shadow-color: lch(7.88% 3.76 286.36);
  --shadow-offset: 5px;
  --border-width: 4px;
}

.dark {
  /* Base Colors */
  --background: lab(7.88% 1.06 -3.60);
  --foreground: hsl(60 9% 98%);

  /* Primary */
  --primary: hwb(344 64% 0%);
  --primary-foreground: rgb(23 23 28);

  /* Secondary */
  --secondary: #a7e6cb;
  --secondary-foreground: color(srgb 0.09 0.09 0.11);

  /* Accent */
  --accent: color(srgb-linear 0.54566 0.43949 0.79934);
  --accent-foreground: color(display-p3 0.09 0.09 0.10835);

  /* Muted */
  --muted: color(a98-rgb 0.19421 0.19421 0.22919);
  --muted-foreground: color(prophoto-rgb 0.59833 0.60258 0.5703);

  /* Card & Popover */
  --card: color(rec2020 0.06661 0.06575 0.08938);
  --card-foreground: color(xyz 0.91014 0.95852 1.03693);
  --popover: color(xyz-d50 0.01488 0.01491 0.01628);
  --popover-foreground: color(xyz-d65 0.91014 0.95852 1.03693);

  /* Destructive */
  --destructive: oklch(0.636 0.208 25.38);
  --destructive-foreground: oklab(1.000 0.000 0.000);

  /* Border & Input */
  --border: lch(98.38% 0.46 105.22);
  --input: lab(98.38% -0.12 0.44);
  --ring: hsl(60 9% 98%);

  /* Shadow */
  --shadow-color: hwb(0 0% 100%);
}`.trim();
