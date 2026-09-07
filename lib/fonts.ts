import { Bricolage_Grotesque, Instrument_Sans, Instrument_Serif } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-bricolage",
});

export const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-instrument",
});

/** Legacy inner pages only (they ask for the family by name). Remove with them in phase 4. */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

/** Class string to place on <html> so the CSS variables exist everywhere. */
export const fontVars = `${bricolage.variable} ${instrument.variable} ${instrumentSerif.variable}`;
