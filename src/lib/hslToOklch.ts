export function hslToOklch(h: number, s: number, l: number): { l: number; c: number; h: number } {
  const hue = (((h % 360) + 360) % 360) / 360;
  const sat = s > 1 ? s / 100 : s;
  const lit = l > 1 ? l / 100 : l;

  // HSL → sRGB
  const d = sat * (1 - Math.abs(2 * lit - 1));
  const m = lit - d / 2;
  const x = d * (1 - Math.abs(((hue * 6) % 2) - 1));

  let r: number;
  let g: number;
  let b: number;

  switch (Math.floor(hue * 6)) {
    case 0:
      r = d;
      g = x;
      b = 0;
      break;
    case 1:
      r = x;
      g = d;
      b = 0;
      break;
    case 2:
      r = 0;
      g = d;
      b = x;
      break;
    case 3:
      r = 0;
      g = x;
      b = d;
      break;
    case 4:
      r = x;
      g = 0;
      b = d;
      break;
    default:
      r = d;
      g = 0;
      b = x;
      break;
  }

  r += m;
  g += m;
  b += m;

  // sRGB → linear RGB
  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));

  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);

  // linear RGB → XYZ (D65)
  const xVal = 0.41239079926595934 * rl + 0.357584339383878 * gl + 0.1804807884018343 * bl;
  const yVal = 0.21263900587151027 * rl + 0.715168678767756 * gl + 0.07219231536073371 * bl;
  const zVal = 0.01933081871559182 * rl + 0.11919477979462598 * gl + 0.9505321522496607 * bl;

  // XYZ → LMS
  const lx = 0.8189330101 * xVal + 0.3618667424 * yVal - 0.1288597137 * zVal;
  const ly = 0.0329845436 * xVal + 0.9293118715 * yVal + 0.0361456387 * zVal;
  const lz = 0.0482003018 * xVal + 0.2643662691 * yVal + 0.633851707 * zVal;

  // LMS → OKLab
  const l_ = Math.cbrt(lx);
  const m_ = Math.cbrt(ly);
  const s_ = Math.cbrt(lz);

  const okl = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const oka = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const okb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // OKLab → OKLCH
  const chroma = Math.sqrt(oka * oka + okb * okb);
  const hueDeg =
    chroma < 0.0002 ? 0 : ((((Math.atan2(okb, oka) * 180) / Math.PI) % 360) + 360) % 360;

  return { l: okl, c: chroma, h: hueDeg };
}
