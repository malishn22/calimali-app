import { useMemo } from "react";

export interface NeckMapData {
  xml: string;
  viewBox: string;
}

function processSvgNeckMap(
  svgText: string,
  muscleStyleMap: Record<string, { fill: string; stroke: string; strokeWidth: number }>
): NeckMapData {
  const viewBoxMatch = svgText.match(/viewBox="([^"]*)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 100 100";

  let text = svgText
    .replace(/<\?xml[\s\S]*?\?>/, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<image[\s\S]*?(\/>|<\/image>)/g, "")
    .replace(/\s(fill|stroke|opacity|stroke-width|stroke-linecap|stroke-linejoin)="[^"]*"/g, "")
    .replace(/\sstyle="[^"]*"/g, "");

  const injectAttributes = (content: string, pattern: RegExp, attributes: string) => {
    return content.replace(pattern, (match, openTagContent) => {
      const isSelfClosing = openTagContent.trim().endsWith("/");
      let cleanTag = openTagContent;
      if (isSelfClosing) {
        cleanTag = cleanTag.substring(0, cleanTag.lastIndexOf("/"));
        return `${cleanTag} ${attributes} />`;
      }
      return `${cleanTag} ${attributes} >`;
    });
  };

  const SILHOUETTE_COLOR = "#3f3f46";
  const layer1Pattern = /(<(?:g|path)[^>]*?(?:id|inkscape:label)=["'](?:Layer 1|MainLayer|path1)["'][^>]*?)>/gi;
  text = injectAttributes(text, layer1Pattern, `fill="${SILHOUETTE_COLOR}" stroke="none"`);

  Object.entries(muscleStyleMap).forEach(([muscleId, style]) => {
    const labelPattern = new RegExp(
      `(<(?:g|path|rect)[^>]*?(?:id|inkscape:label)=["']${muscleId}["'][^>]*?)>`,
      "gi"
    );
    text = injectAttributes(
      text,
      labelPattern,
      `fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"`
    );
  });

  return { xml: text, viewBox };
}

/** source: SVG markup string (e.g. from require('./file.svg') with metro.svg-transformer) */
export function useSvgNeckMap(
  source: string,
  muscleStyleMap: Record<string, { fill: string; stroke: string; strokeWidth: number }>
): NeckMapData | null {
  return useMemo(() => {
    if (!source || typeof source !== "string") return null;
    try {
      return processSvgNeckMap(source, muscleStyleMap);
    } catch {
      return null;
    }
  }, [source, muscleStyleMap]);
}
