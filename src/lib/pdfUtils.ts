import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { parsePageRange, buildPageLabels } from "./pageRangeParser";
import { toRoman, toLowerRoman } from "./romanNumerals";
import type { PageNumberConfig, Position } from "./presets";

function resolveFont(
  pdfDoc: PDFDocument,
  family: string,
  bold: boolean,
  italic: boolean
) {
  // pdf-lib only has basic standard fonts; bold/italic combos
  const map: Record<string, StandardFonts> = {
    "Helvetica-normal": StandardFonts.Helvetica,
    "Helvetica-bold": StandardFonts.HelveticaBold,
    "Helvetica-italic": StandardFonts.HelveticaOblique,
    "Helvetica-bold-italic": StandardFonts.HelveticaBoldOblique,
    "Times-Roman-normal": StandardFonts.TimesRoman,
    "Times-Roman-bold": StandardFonts.TimesRomanBold,
    "Times-Roman-italic": StandardFonts.TimesRomanItalic,
    "Times-Roman-bold-italic": StandardFonts.TimesRomanBoldItalic,
    "Courier-normal": StandardFonts.Courier,
    "Courier-bold": StandardFonts.CourierBold,
    "Courier-italic": StandardFonts.CourierOblique,
    "Courier-bold-italic": StandardFonts.CourierBoldOblique,
  };

  const suffix = bold && italic ? "bold-italic" : bold ? "bold" : italic ? "italic" : "normal";
  const key = `${family}-${suffix}`;
  const standardFont = map[key] ?? StandardFonts.Helvetica;
  return pdfDoc.embedFont(standardFont);
}

function computeXY(
  position: Position,
  pageWidth: number,
  pageHeight: number,
  marginX: number,
  marginY: number,
  textWidth: number,
  fontSize: number
): { x: number; y: number } {
  let x: number;
  let y: number;

  switch (position) {
    case "top-left":
      x = marginX;
      y = pageHeight - marginY - fontSize;
      break;
    case "top-center":
      x = (pageWidth - textWidth) / 2;
      y = pageHeight - marginY - fontSize;
      break;
    case "top-right":
      x = pageWidth - marginX - textWidth;
      y = pageHeight - marginY - fontSize;
      break;
    case "middle-left":
      x = marginX;
      y = (pageHeight - fontSize) / 2;
      break;
    case "middle-center":
      x = (pageWidth - textWidth) / 2;
      y = (pageHeight - fontSize) / 2;
      break;
    case "middle-right":
      x = pageWidth - marginX - textWidth;
      y = (pageHeight - fontSize) / 2;
      break;
    case "bottom-left":
      x = marginX;
      y = marginY;
      break;
    case "bottom-center":
      x = (pageWidth - textWidth) / 2;
      y = marginY;
      break;
    case "bottom-right":
      x = pageWidth - marginX - textWidth;
      y = marginY;
      break;
    default:
      x = (pageWidth - textWidth) / 2;
      y = marginY;
  }

  return { x, y };
}

function formatLabel(num: number, style: PageNumberConfig["numberStyle"]): string {
  if (style === "roman") return toRoman(num);
  if (style === "roman-lower") return toLowerRoman(num);
  return String(num);
}

export async function applyPageNumbers(
  pdfBytes: ArrayBuffer,
  config: PageNumberConfig
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  // Resolve range
  const endPage = config.endPage ?? totalPages;
  const rangePages: number[] = [];
  for (let i = config.startPage; i <= Math.min(endPage, totalPages); i++) {
    rangePages.push(i);
  }

  // Remove skipped pages
  const skippedSet = new Set(
    config.skipPages ? parsePageRange(config.skipPages, totalPages) : []
  );
  const numberedPages = rangePages.filter((p) => !skippedSet.has(p));

  // Build label map
  const labelMap = buildPageLabels(totalPages, numberedPages, config.startNumber);

  // Embed font
  const font = await resolveFont(pdfDoc, config.fontFamily, config.bold, config.italic);

  // Draw labels
  for (const [pageNum, labelNum] of labelMap.entries()) {
    const pageIndex = pageNum - 1;
    if (pageIndex < 0 || pageIndex >= totalPages) continue;

    const page = pages[pageIndex];
    const { width, height } = page.getSize();

    const label = `${config.prefix}${formatLabel(labelNum, config.numberStyle)}${config.suffix}`;
    const textWidth = font.widthOfTextAtSize(label, config.fontSize);

    const { x, y } = computeXY(
      config.position,
      width,
      height,
      config.marginX,
      config.marginY,
      textWidth,
      config.fontSize
    );

    page.drawText(label, {
      x,
      y,
      size: config.fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDoc.save();
}
