import React from "react";
import Svg, { Path, G, Defs, Mask, Rect } from "react-native-svg";
import { ActivityIndicator, View } from "react-native";
import { useSvgBodyMap } from "../../hooks/useSvgBodyMap";

interface BodyMapFrontProps {
  muscleStyleMap: Record<string, { fill: string; stroke: string; strokeWidth: number }>;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export default function BodyMapFront({ muscleStyleMap, width = 150, height = 450 }: BodyMapFrontProps) {
  const svgData = useSvgBodyMap(require("../../assets/images/svg/calimali-body-front.svg"));

  if (!svgData) {
    return (
      <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="#3f3f46" />
      </View>
    );
  }

  const { paths, viewBox } = svgData;
  const mainLayer = paths["MainLayer"] || paths["path1"];
  const mainLayerD = mainLayer?.d;

  // Filter out MainLayer/path1 from muscles
  const musclePaths = Object.entries(paths).filter(
    ([key]) => key !== "MainLayer" && key !== "path1"
  );

  return (
    <Svg width={width} height={height} viewBox={viewBox}>
      <Defs>
        <Mask id="mask-front">
          <Rect width="100%" height="100%" fill="white" />
          {svgData.masks?.map((mask, index) => (
            <Path
              key={`mask-cutout-${index}`}
              d={mask.d}
              transform={mask.transform}
              fill="black"
              stroke="black"
              strokeWidth="1"
            />
          ))}
        </Mask>
      </Defs>

      <G mask="url(#mask-front)">
        {/* Background Primer (Seals gaps) */}
        <G>
          {Object.entries(paths).map(([id, data]) => (
            <Path
              key={`primer-${id}`}
              d={data.d}
              transform={data.transform}
              fill="#3f3f46"
              stroke="#3f3f46"
              strokeWidth="0.1"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </G>

        {/* Body Silhouette (MainLayer) - Edge definition */}
        {mainLayerD && (
          <Path
            d={mainLayerD}
            fill="#3f3f46"
            stroke="#3f3f46"
            strokeWidth="0.1"
            fillRule="nonzero"
          />
        )}

        {/* Muscles Group */}
        <G>
          {musclePaths.map(([id, data]) => {
            const { d, transform } = data;
            const style = muscleStyleMap[id] || { fill: "#18181b", stroke: "#18181b", strokeWidth: 0.05 };

            return (
              <Path
                key={id}
                d={d}
                transform={transform}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
              />
            );
          })}
        </G>
      </G>
    </Svg>
  );
}
