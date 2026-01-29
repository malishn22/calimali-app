import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Path, G, SvgXml } from 'react-native-svg';
import { useSvgNeckMap } from '@/hooks/useSvgNeckMap';

interface NeckMapBackProps {
    muscleStyleMap: Record<string, { fill: string; stroke: string; strokeWidth: number }>;
    onMusclePress?: (muscleId: string) => void;
    width?: number;
    height?: number;
}

const NECK_BACK_SOURCE = require('../../assets/images/svg/calimali-neck-back.svg');

const NeckMapBack: React.FC<NeckMapBackProps> = ({
    muscleStyleMap,
    onMusclePress,
    width = 200,
    height = 200,
}) => {
    const bodyMap = useSvgNeckMap(NECK_BACK_SOURCE, muscleStyleMap);

    if (!bodyMap) {
        return (
            <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="small" color="#3f3f46" />
            </View>
        );
    }

    return (
        <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
            <SvgXml
                xml={bodyMap.xml}
                width={width}
                height={height}
            />
        </View>
    );
};

export default NeckMapBack;
