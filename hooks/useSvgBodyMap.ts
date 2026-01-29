import { useEffect, useState } from "react";
import { Asset } from "expo-asset";

interface BodyMapData {
  paths: Record<string, { d: string; transform?: string }>;
  masks: { d: string; transform?: string }[];
  viewBox: string;
}

// Module-level cache to store parsed data
const SVG_CACHE: Record<string, BodyMapData> = {};

export function useSvgBodyMap(source: number) {
  const [data, setData] = useState<BodyMapData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSvg = async () => {
      try {
        const asset = Asset.fromModule(source);
        const cacheKey = asset.uri || asset.localUri || String(source);

        if (SVG_CACHE[cacheKey]) {
          if (isMounted) setData(SVG_CACHE[cacheKey]);
          return;
        }

        await asset.downloadAsync();
        const response = await fetch(asset.localUri || asset.uri);
        const svgText = await response.text();

        const viewBoxMatch = svgText.match(/viewBox="([^"]*)"/);
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 100 100";

        const paths: Record<string, { d: string; transform?: string }> = {};
        const masks: { d: string; transform?: string }[] = [];
        
        // Helper to extract Key and D from a path string
        const extractPathData = (pathStr: string) => {
           // Strict match for d to avoid capturing id/label content
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

        // 1. Parse ALL paths first (Root + Grouped)
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
            
            // MainLayer Fix
            if (id === "path1" || label === "MainLayer") {
               // Split by 'M' or 'm' to isolate the first subpath (outer contour)
               // This handles cases where holes are defined by new 'M' commands within a single 'd' string
               // We look for the first M/m, then capture everything until the NEXT M/m or end of string.
               // Since the string starts with M/m, we can split.
               // Note: .split yields ["", "coords...", "coords..."] if starts with delimiter
               
               // Use a regex that keeps the delimiter or reconstructs it
               // Simpler: find index of second M/m (ignoring start)
               const secondM = d.slice(1).search(/[mM]/);
               if (secondM !== -1) {
                   // slice(0, secondM + 1) because search is relative to slice(1)
                   // so index in d is secondM + 1
                   d = d.slice(0, secondM + 1);
                   
                   // Ensure it closes if it wasn't closed (though 'z' is usually strict)
                   if (!/z$/i.test(d.trim())) {
                       d += "z";
                   }
               }
               key = "MainLayer";
            }
            paths[key] = { d, transform };
          }
        }

        // 2. Parse Groups to find transforms and apply
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

        const result = { paths, masks, viewBox };
        SVG_CACHE[cacheKey] = result;
        
        if (isMounted) setData(result);

      } catch (error) {
        console.error("Failed to load SVG body map:", error);
      }
    };

    loadSvg();

    return () => {
      isMounted = false;
    };
  }, [source]);

  return data;
}
