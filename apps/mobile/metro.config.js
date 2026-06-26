// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Expo SDK 52+ configures monorepos automatically via expo/metro-config — no
// manual watchFolders / nodeModulesPaths needed. A single physical copy of
// react-native (and friends) is guaranteed by `nodeLinker: hoisted` in
// pnpm-workspace.yaml.
const config = getDefaultConfig(__dirname);

// NativeWind v5: pass the CSS entry as `input`. `inlineRem: 16` is required by
// React Native Reusables so `rem`-based utilities resolve to pixel values.
module.exports = withNativeWind(config, { input: "./src/global.css", inlineRem: 16 });
