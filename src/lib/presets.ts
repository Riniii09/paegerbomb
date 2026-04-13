export type NumberStyle = "arabic" | "roman" | "roman-lower";
export type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface PageNumberConfig {
  // Range
  startPage: number;        // 1-based page where numbering begins (pages before = skipped)
  endPage: number | null;   // null = until last page
  skipPages: string;        // comma/range string of pages to skip within range, e.g. "3, 7-9"

  // Display
  startNumber: number;      // first label value
  numberStyle: NumberStyle;
  prefix: string;
  suffix: string;

  // Typography
  fontSize: number;
  fontFamily: "Helvetica" | "Times-Roman" | "Courier";
  bold: boolean;
  italic: boolean;

  // Position
  position: Position;
  marginX: number; // px from edge
  marginY: number; // px from edge
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<PageNumberConfig>;
}

export const DEFAULT_CONFIG: PageNumberConfig = {
  startPage: 1,
  endPage: null,
  skipPages: "",
  startNumber: 1,
  numberStyle: "arabic",
  prefix: "",
  suffix: "",
  fontSize: 11,
  fontFamily: "Helvetica",
  bold: false,
  italic: false,
  position: "bottom-center",
  marginX: 40,
  marginY: 30,
};

export const PRESETS: Preset[] = [
  {
    id: "pce-report",
    name: "PCE Report",
    description: "Footer centre, start from page 5, regular numbers till end",
    icon: "📋",
    config: {
      startPage: 5,
      endPage: null,
      skipPages: "",
      startNumber: 1,
      numberStyle: "arabic",
      prefix: "",
      suffix: "",
      position: "bottom-center",
      fontSize: 11,
      fontFamily: "Times-Roman",
      bold: false,
      italic: false,
      marginY: 40,
    },
  },
  {
    id: "chapter-roman",
    name: "Roman Numerals",
    description: "Classic roman numerals in footer left",
    icon: "📖",
    config: {
      startPage: 1,
      endPage: null,
      skipPages: "",
      startNumber: 1,
      numberStyle: "roman-lower",
      prefix: "",
      suffix: "",
      position: "bottom-left",
      fontSize: 11,
      fontFamily: "Times-Roman",
      bold: false,
      italic: true,
    },
  },
  {
    id: "header-numbered",
    name: "Header Right",
    description: "Clean numbers in the header, top right",
    icon: "📄",
    config: {
      startPage: 1,
      endPage: null,
      skipPages: "",
      startNumber: 1,
      numberStyle: "arabic",
      prefix: "",
      suffix: "",
      position: "top-right",
      fontSize: 10,
      fontFamily: "Helvetica",
      bold: false,
      italic: false,
    },
  },
];
