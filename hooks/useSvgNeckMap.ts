import { useEffect, useState } from "react";
import { Asset } from "expo-asset";

interface NeckMapData {
  xml: string;
  viewBox: string;
}

const SVG_CACHE: Record<string, NeckMapData> = {};

export function useSvgNeckMap(source: number, muscleStyleMap: Record<string, { fill: string; stroke: string; strokeWidth: number }>) {
  const [data, setData] = useState<NeckMapData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSvg = async () => {
      try {
        const asset = Asset.fromModule(source);
        
        await asset.downloadAsync();
        const response = await fetch(asset.localUri || asset.uri);
        let svgText = await response.text();

        const viewBoxMatch = svgText.match(/viewBox="([^"]*)"/);
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 100 100";

        // 1. Clean XML and Image
        svgText = svgText.replace(/<\?xml.*?\?>/, "");
        svgText = svgText.replace(/<!--.*?-->/g, "");
        svgText = svgText.replace(/<image[\s\S]*?(\/>|<\/image>)/g, "");

        // 2. GLOBAL CLEANUP
        svgText = svgText.replace(/\s(fill|stroke|opacity|stroke-width|stroke-linecap|stroke-linejoin)="[^"]*"/g, "");
        svgText = svgText.replace(/\sstyle="[^"]*"/g, "");

        // Helper to inject attributes robustly
        const injectAttributes = (text: string, pattern: RegExp, attributes: string) => {
            return text.replace(pattern, (match, openTagContent) => {
                 const isSelfClosing = openTagContent.trim().endsWith("/");
                 let cleanTag = openTagContent;
                 
                 if (isSelfClosing) {
                     cleanTag = cleanTag.substring(0, cleanTag.lastIndexOf("/"));
                     return `${cleanTag} ${attributes} />`;
                 } else {
                     return `${cleanTag} ${attributes} >`;
                 }
            });
        };

        // 3. Colorize "MainLayer" / "path1" (Silhouette)
        const SILHOUETTE_COLOR = "#3f3f46"; 
        const layer1Pattern = /(<(?:g|path)[^>]*?(?:id|inkscape:label)=["'](?:Layer 1|MainLayer|path1)["'][^>]*?)>/gi;
        svgText = injectAttributes(svgText, layer1Pattern, `fill="${SILHOUETTE_COLOR}" stroke="none"`);

        // 4. Colorize Muscles
        Object.entries(muscleStyleMap).forEach(([muscleId, style]) => {
             const labelPattern = new RegExp(`(<(?:g|path|rect)[^>]*?(?:id|inkscape:label)=["']${muscleId}["'][^>]*?)>`, 'gi');
             
             svgText = injectAttributes(svgText, labelPattern, `fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"`);
        });

        const result = { xml: svgText, viewBox };
        if (isMounted) setData(result);

      } catch (error) {
        console.error("Failed to load SVG neck map:", error);
      }
    };

    loadSvg();

    return () => {
      isMounted = false;
    };
  }, [source, muscleStyleMap]); 

  return data;
}
