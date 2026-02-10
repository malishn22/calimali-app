const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const configWithNativeWind = withNativeWind(config, { input: "./global.css" });

// SVG as string: require('./file.svg') returns the file content so it works in APK without fetch
configWithNativeWind.resolver.sourceExts.push("svg");
configWithNativeWind.resolver.assetExts = configWithNativeWind.resolver.assetExts.filter((ext) => ext !== "svg");
process.env.METRO_SVG_UPSTREAM = configWithNativeWind.transformer.babelTransformerPath;
configWithNativeWind.transformer.babelTransformerPath = require.resolve("./metro.svg-transformer.js");

module.exports = configWithNativeWind;
