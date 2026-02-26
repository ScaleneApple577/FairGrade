import React from "react";
import type { HighlightRange } from "@/lib/monitoringUtils";

// ==================== TYPES ====================

interface DocsRendererProps {
  docJson: any;
  highlightRanges?: HighlightRange[];
}

interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: { magnitude: number; unit: string };
  weightedFontFamily?: { fontFamily: string };
  foregroundColor?: { color?: { rgbColor?: RgbColor } };
  backgroundColor?: { color?: { rgbColor?: RgbColor } };
  baselineOffset?: string;
  smallCaps?: boolean;
  link?: { url?: string };
}

interface RgbColor {
  red?: number;
  green?: number;
  blue?: number;
}

interface ParagraphStyle {
  namedStyleType?: string;
  alignment?: string;
  lineSpacing?: number;
  spaceAbove?: { magnitude: number; unit: string };
  spaceBelow?: { magnitude: number; unit: string };
  indentFirstLine?: { magnitude: number; unit: string };
  indentStart?: { magnitude: number; unit: string };
}

// Mutable counter passed through rendering to track char offset
interface CharCounter {
  offset: number;
}

// ==================== HELPERS ====================

function rgbToHex(rgb: RgbColor | undefined): string | undefined {
  if (!rgb) return undefined;
  const r = Math.round((rgb.red ?? 0) * 255);
  const g = Math.round((rgb.green ?? 0) * 255);
  const b = Math.round((rgb.blue ?? 0) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function ptToPx(magnitude: number | undefined, unit?: string): number | undefined {
  if (magnitude == null) return undefined;
  if (unit === "PT") return magnitude * (4 / 3);
  return magnitude;
}

function getTextStyleCSS(style: TextStyle | undefined): React.CSSProperties {
  if (!style) return {};
  const css: React.CSSProperties = {};

  if (style.bold) css.fontWeight = "bold";
  if (style.italic) css.fontStyle = "italic";

  const decorations: string[] = [];
  if (style.underline) decorations.push("underline");
  if (style.strikethrough) decorations.push("line-through");
  if (decorations.length > 0) css.textDecoration = decorations.join(" ");

  if (style.fontSize?.magnitude) {
    css.fontSize = `${style.fontSize.magnitude}pt`;
  }
  if (style.weightedFontFamily?.fontFamily) {
    css.fontFamily = style.weightedFontFamily.fontFamily;
  }

  const fg = style.foregroundColor?.color?.rgbColor;
  const fgHex = rgbToHex(fg);
  if (fgHex && fgHex !== "#000000") css.color = fgHex;

  const bg = style.backgroundColor?.color?.rgbColor;
  const bgHex = rgbToHex(bg);
  if (bgHex) css.backgroundColor = bgHex;

  if (style.baselineOffset === "SUPERSCRIPT") {
    css.verticalAlign = "super";
    css.fontSize = "0.7em";
  } else if (style.baselineOffset === "SUBSCRIPT") {
    css.verticalAlign = "sub";
    css.fontSize = "0.7em";
  }

  if (style.smallCaps) css.fontVariant = "small-caps";

  return css;
}

function getParagraphStyleCSS(style: ParagraphStyle | undefined): React.CSSProperties {
  if (!style) return {};
  const css: React.CSSProperties = {};

  if (style.alignment === "CENTER") css.textAlign = "center";
  else if (style.alignment === "END") css.textAlign = "right";
  else if (style.alignment === "JUSTIFIED") css.textAlign = "justify";

  if (style.lineSpacing) css.lineHeight = style.lineSpacing / 100;

  if (style.spaceAbove?.magnitude) {
    css.marginTop = `${ptToPx(style.spaceAbove.magnitude, style.spaceAbove.unit)}px`;
  }
  if (style.spaceBelow?.magnitude) {
    css.marginBottom = `${ptToPx(style.spaceBelow.magnitude, style.spaceBelow.unit)}px`;
  }
  if (style.indentFirstLine?.magnitude) {
    css.textIndent = `${ptToPx(style.indentFirstLine.magnitude, style.indentFirstLine.unit)}px`;
  }
  if (style.indentStart?.magnitude) {
    css.paddingLeft = `${ptToPx(style.indentStart.magnitude, style.indentStart.unit)}px`;
  }

  return css;
}

function namedStyleToTag(namedStyle: string | undefined): string {
  switch (namedStyle) {
    case "TITLE": return "h1";
    case "SUBTITLE": return "h2";
    case "HEADING_1": return "h1";
    case "HEADING_2": return "h2";
    case "HEADING_3": return "h3";
    case "HEADING_4": return "h4";
    case "HEADING_5": return "h5";
    case "HEADING_6": return "h6";
    default: return "p";
  }
}

const HEADING_STYLES: Record<string, React.CSSProperties> = {
  TITLE: { fontSize: "26pt", fontWeight: "normal", marginBottom: "3pt", color: "#000" },
  SUBTITLE: { fontSize: "15pt", fontWeight: "normal", marginBottom: "16pt", color: "#666" },
  HEADING_1: { fontSize: "20pt", fontWeight: "normal", marginTop: "20pt", marginBottom: "6pt" },
  HEADING_2: { fontSize: "16pt", fontWeight: "normal", marginTop: "18pt", marginBottom: "6pt" },
  HEADING_3: { fontSize: "13.999pt", fontWeight: "normal", marginTop: "16pt", marginBottom: "4pt", color: "#434343" },
  HEADING_4: { fontSize: "12pt", fontWeight: "normal", marginTop: "14pt", marginBottom: "4pt", color: "#666" },
  HEADING_5: { fontSize: "11pt", fontWeight: "normal", marginTop: "12pt", marginBottom: "4pt", color: "#666" },
  HEADING_6: { fontSize: "11pt", fontWeight: "normal", fontStyle: "italic", marginTop: "12pt", marginBottom: "4pt", color: "#666" },
};

// ==================== HIGHLIGHT HELPERS ====================

/**
 * Find overlapping highlight ranges for a given text span [start, end).
 */
function findOverlappingHighlights(
  textStart: number,
  textEnd: number,
  highlights: HighlightRange[],
): HighlightRange[] {
  return highlights.filter((h) => h.start < textEnd && h.end > textStart);
}

/**
 * Split a text string into segments, some highlighted, based on overlapping ranges.
 * Returns array of { text, highlight? } segments.
 */
function splitTextWithHighlights(
  text: string,
  textStart: number,
  highlights: HighlightRange[],
): { text: string; highlight?: HighlightRange }[] {
  const overlapping = findOverlappingHighlights(textStart, textStart + text.length, highlights);
  if (overlapping.length === 0) {
    return [{ text }];
  }

  // Collect all split points within this text's range
  const points = new Set<number>();
  points.add(textStart);
  points.add(textStart + text.length);
  for (const h of overlapping) {
    if (h.start > textStart && h.start < textStart + text.length) points.add(h.start);
    if (h.end > textStart && h.end < textStart + text.length) points.add(h.end);
  }

  const sorted = Array.from(points).sort((a, b) => a - b);
  const segments: { text: string; highlight?: HighlightRange }[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const segStart = sorted[i];
    const segEnd = sorted[i + 1];
    const segText = text.slice(segStart - textStart, segEnd - textStart);
    if (!segText) continue;

    // Find the first highlight covering this segment
    const covering = overlapping.find((h) => h.start <= segStart && h.end >= segEnd);
    segments.push({ text: segText, highlight: covering });
  }

  return segments;
}

// ==================== RENDERERS ====================

function renderTextRunWithHighlights(
  element: any,
  idx: number,
  counter: CharCounter,
  highlights: HighlightRange[],
): React.ReactNode {
  const textRun = element.textRun;
  if (!textRun) return null;

  const text = textRun.content as string;
  if (!text) return null;

  const textStart = counter.offset;
  counter.offset += text.length;

  const style = getTextStyleCSS(textRun.textStyle);
  const isLink = !!textRun.textStyle?.link?.url;

  // If no highlights, render normally
  if (!highlights.length || findOverlappingHighlights(textStart, textStart + text.length, highlights).length === 0) {
    if (isLink) {
      return (
        <a
          key={idx}
          href={textRun.textStyle.link.url}
          style={{ ...style, color: style.color || "#1155cc", textDecoration: "underline" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      );
    }
    if (Object.keys(style).length === 0) {
      return <React.Fragment key={idx}>{text}</React.Fragment>;
    }
    return <span key={idx} style={style}>{text}</span>;
  }

  // Split text at highlight boundaries
  const segments = splitTextWithHighlights(text, textStart, highlights);

  const baseStyle = isLink
    ? { ...style, color: style.color || "#1155cc", textDecoration: "underline" as const }
    : style;

  const rendered = segments.map((seg, sIdx) => {
    if (seg.highlight) {
      return (
        <mark
          key={sIdx}
          title={seg.highlight.label}
          style={{
            ...baseStyle,
            backgroundColor: seg.highlight.color,
            borderRadius: "2px",
            padding: "0 1px",
          }}
        >
          {seg.text}
        </mark>
      );
    }
    if (Object.keys(baseStyle).length === 0) {
      return <React.Fragment key={sIdx}>{seg.text}</React.Fragment>;
    }
    return <span key={sIdx} style={baseStyle}>{seg.text}</span>;
  });

  if (isLink) {
    return (
      <a
        key={idx}
        href={textRun.textStyle.link.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        {rendered}
      </a>
    );
  }

  return <React.Fragment key={idx}>{rendered}</React.Fragment>;
}

function renderInlineImage(element: any, idx: number, inlineObjects: any): React.ReactNode {
  const objId = element.inlineObjectElement?.inlineObjectId;
  if (!objId || !inlineObjects?.[objId]) return null;

  const obj = inlineObjects[objId];
  const props = obj?.inlineObjectProperties?.embeddedObject;
  if (!props) return null;

  const uri = props.imageProperties?.contentUri;
  if (!uri) return null;

  const size = props.size;
  const width = size?.width?.magnitude ? `${ptToPx(size.width.magnitude, size.width.unit)}px` : undefined;
  const height = size?.height?.magnitude ? `${ptToPx(size.height.magnitude, size.height.unit)}px` : undefined;

  return (
    <img
      key={idx}
      src={uri}
      alt={props.title || props.description || ""}
      style={{ width, height, maxWidth: "100%", display: "inline-block", verticalAlign: "bottom" }}
      onError={(e) => {
        const img = e.currentTarget;
        img.style.display = "none";
        const placeholder = document.createElement("span");
        placeholder.textContent = "[Image unavailable]";
        placeholder.style.cssText = "display:inline-block;padding:8px 16px;background:#f0f0f0;color:#999;border:1px dashed #ccc;border-radius:4px;font-size:11px;";
        img.parentElement?.insertBefore(placeholder, img);
      }}
    />
  );
}

function renderParagraphElements(
  elements: any[],
  inlineObjects: any,
  counter: CharCounter,
  highlights: HighlightRange[],
): React.ReactNode[] {
  return elements.map((el, idx) => {
    if (el.textRun) return renderTextRunWithHighlights(el, idx, counter, highlights);
    if (el.inlineObjectElement) return renderInlineImage(el, idx, inlineObjects);
    if (el.horizontalRule) {
      return <hr key={idx} style={{ border: "none", borderTop: "1px solid #dadce0", margin: "12px 0" }} />;
    }
    return null;
  });
}

function renderParagraph(
  paragraph: any,
  paragraphStyle: ParagraphStyle | undefined,
  idx: number,
  inlineObjects: any,
  counter: CharCounter,
  highlights: HighlightRange[],
): React.ReactNode {
  const namedStyle = paragraphStyle?.namedStyleType;
  const Tag = namedStyleToTag(namedStyle) as keyof JSX.IntrinsicElements;

  const headingCSS = namedStyle ? HEADING_STYLES[namedStyle] : undefined;
  const paraCSS = getParagraphStyleCSS(paragraphStyle);

  const style: React.CSSProperties = {
    margin: 0,
    ...headingCSS,
    ...paraCSS,
    fontFamily: paraCSS.fontFamily || "Arial, sans-serif",
  };

  // Default body text style
  if (Tag === "p" && !style.fontSize) {
    style.fontSize = "11pt";
    style.lineHeight = style.lineHeight || 1.15;
  }

  const children = renderParagraphElements(paragraph.elements || [], inlineObjects, counter, highlights);

  return <Tag key={idx} style={style}>{children}</Tag>;
}

function renderTable(
  table: any,
  idx: number,
  inlineObjects: any,
  lists: any,
  counter: CharCounter,
  highlights: HighlightRange[],
): React.ReactNode {
  const rows = table.tableRows || [];
  return (
    <table
      key={idx}
      style={{
        borderCollapse: "collapse",
        width: "100%",
        margin: "8px 0",
        fontSize: "11pt",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <tbody>
        {rows.map((row: any, rowIdx: number) => (
          <tr key={rowIdx}>
            {(row.tableCells || []).map((cell: any, cellIdx: number) => {
              const cellStyle: React.CSSProperties = {
                border: "1px solid #dadce0",
                padding: "5px 7px",
                verticalAlign: "top",
              };

              const bgColor = cell.tableCellStyle?.backgroundColor?.color?.rgbColor;
              if (bgColor) {
                const hex = rgbToHex(bgColor);
                if (hex) cellStyle.backgroundColor = hex;
              }

              return (
                <td key={cellIdx} style={cellStyle} colSpan={cell.tableCellStyle?.columnSpan || 1} rowSpan={cell.tableCellStyle?.rowSpan || 1}>
                  {renderElements(cell.content || [], inlineObjects, lists, counter, highlights)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderListItem(
  paragraph: any,
  paragraphStyle: ParagraphStyle | undefined,
  bullet: any,
  inlineObjects: any,
  lists: any,
  counter: CharCounter,
  highlights: HighlightRange[],
): React.ReactNode {
  const nestingLevel = bullet.nestingLevel ?? 0;
  const listId = bullet.listId;
  const listDef = lists?.[listId];
  const nestProps = listDef?.listProperties?.nestingLevels?.[nestingLevel];

  // Determine ordered vs unordered from glyph type
  const glyphType = nestProps?.glyphType;
  const isOrdered = glyphType && glyphType !== "GLYPH_TYPE_UNSPECIFIED";

  const paraCSS = getParagraphStyleCSS(paragraphStyle);
  const style: React.CSSProperties = {
    margin: 0,
    fontSize: "11pt",
    lineHeight: paraCSS.lineHeight || 1.15,
    fontFamily: "Arial, sans-serif",
    ...paraCSS,
  };

  const children = renderParagraphElements(paragraph.elements || [], inlineObjects, counter, highlights);

  return { isOrdered, nestingLevel, style, children };
}

function renderElements(
  content: any[],
  inlineObjects: any,
  lists: any,
  counter: CharCounter,
  highlights: HighlightRange[],
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < content.length) {
    const element = content[i];

    if (element.paragraph) {
      const para = element.paragraph;
      const pStyle = para.paragraphStyle;
      const bullet = para.bullet;

      if (bullet) {
        // Collect consecutive list items with the same listId
        const listItems: { item: any; pStyle: any; bullet: any }[] = [];
        const listId = bullet.listId;

        while (i < content.length && content[i].paragraph?.bullet?.listId === listId) {
          const p = content[i].paragraph;
          listItems.push({ item: p, pStyle: p.paragraphStyle, bullet: p.bullet });
          i++;
        }

        // Render grouped list
        result.push(renderListGroup(listItems, inlineObjects, lists, result.length, counter, highlights));
      } else {
        result.push(renderParagraph(para, pStyle, result.length, inlineObjects, counter, highlights));
        i++;
      }
    } else if (element.table) {
      result.push(renderTable(element.table, result.length, inlineObjects, lists, counter, highlights));
      i++;
    } else if (element.sectionBreak) {
      i++;
    } else {
      i++;
    }
  }

  return result;
}

function renderListGroup(
  items: { item: any; pStyle: any; bullet: any }[],
  inlineObjects: any,
  lists: any,
  baseKey: number,
  counter: CharCounter,
  highlights: HighlightRange[],
): React.ReactNode {
  // Build a flat list of rendered items with nesting info
  const rendered = items.map((entry, idx) => {
    const info = renderListItem(entry.item, entry.pStyle, entry.bullet, inlineObjects, lists, counter, highlights);
    return { ...info, key: idx };
  });

  // Determine list type from first item
  const isOrdered = (rendered[0] as any)?.isOrdered ?? false;
  const ListTag = isOrdered ? "ol" : "ul";

  return (
    <ListTag
      key={baseKey}
      style={{
        margin: "0",
        paddingLeft: "36px",
        fontSize: "11pt",
        fontFamily: "Arial, sans-serif",
        lineHeight: 1.15,
      }}
    >
      {rendered.map((item: any) => (
        <li key={item.key} style={{ ...item.style, paddingLeft: `${item.nestingLevel * 36}px` }}>
          {item.children}
        </li>
      ))}
    </ListTag>
  );
}

// ==================== ROOT COMPONENT ====================

export default function DocsRenderer({ docJson, highlightRanges }: DocsRendererProps) {
  if (!docJson?.body?.content) {
    return <div style={{ color: "#80868b", fontFamily: "Arial, sans-serif", fontSize: "11pt" }}>Empty document</div>;
  }

  const inlineObjects = docJson.inlineObjects;
  const lists = docJson.lists;
  const counter: CharCounter = { offset: 0 };
  const highlights = highlightRanges ?? [];

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "11pt", lineHeight: 1.15, color: "#202124" }}>
      {renderElements(docJson.body.content, inlineObjects, lists, counter, highlights)}
    </div>
  );
}
