import { useMemo } from "react";

export interface BodyMapData {
  paths: Record<string, { d: string; transform?: string }>;
  masks: { d: string; transform?: string }[];
  viewBox: string;
}

function parseSvgBodyMap(svgText: string): BodyMapData {
  const viewBoxMatch = svgText.match(/viewBox="([^"]*)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 100 100";

  const paths: Record<string, { d: string; transform?: string }> = {};
  const masks: { d: string; transform?: string }[] = [];

  const extractPathData = (pathStr: string) => {
    const dMatch = pathStr.match(/(?:^|\s)d="([^"]*)"/);
    if (!dMatch) return null;

    let d = dMatch[1];
    if (!d || !/^[mM]/.test(d.trim())) return null;

    const idMatch = pathStr.match(/id="([^"]*)"/);
    const id = idMatch ? idMatch[1] : null;

    const labelMatch = pathStr.match(/inkscape:label="([^"]*)"/);
    const label = labelMatch ? labelMatch[1] : null;

    const transformMatch = pathStr.match(/transform="([^"]*)"/);
    const transform = transformMatch ? transformMatch[1] : undefined;

    const key = label || id;
    if (!key) return null;

    return { key, d, id, label, transform };
  };

  const pathRegex = /<path([\s\S]*?)\/?>/g;
  let match;
  while ((match = pathRegex.exec(svgText)) !== null) {
    const attributes = match[1];
    const data = extractPathData(attributes);
    if (data) {
      let { key, d, id, label, transform } = data;

      if (label === "DONOTRENDER") {
        masks.push({ d, transform });
        continue;
      }

      if (id === "path1" || label === "MainLayer") {
        const secondM = d.slice(1).search(/[mM]/);
        if (secondM !== -1) {
          d = d.slice(0, secondM + 1);
          if (!/z$/i.test(d.trim())) {
            d += "z";
          }
        }
        key = "MainLayer";
      }
      paths[key] = { d, transform };
    }
  }

  const groupRegex = /<g[^>]*transform="([^"]*)"[^>]*>([\s\S]*?)<\/g>/g;
  while ((match = groupRegex.exec(svgText)) !== null) {
    const transform = match[1];
    const content = match[2];

    const innerPathRegex = /<path([\s\S]*?)\/?>/g;
    let innerMatch;
    while ((innerMatch = innerPathRegex.exec(content)) !== null) {
      const attributes = innerMatch[1];
      const data = extractPathData(attributes);
      if (data) {
        const { key } = data;
        if (paths[key]) {
          paths[key].transform = transform;
        }
      }
    }
  }

  return { paths, masks, viewBox };
}

/** source: SVG markup string (e.g. from require('./file.svg') with metro.svg-transformer) */
export function useSvgBodyMap(source: string): BodyMapData | null {
  return useMemo(() => {
    if (!source || typeof source !== "string") return null;
    try {
      return parseSvgBodyMap(source);
    } catch {
      return null;
    }
  }, [source]);
}
