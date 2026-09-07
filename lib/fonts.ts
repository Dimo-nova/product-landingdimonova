import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

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

/** Class string to place on <html> so the CSS variables exist everywhere. */
export const fontVars = `${bricolage.variable} ${instrument.variable}`;
