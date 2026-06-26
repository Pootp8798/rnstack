// In a pnpm monorepo, babel-preset-expo cannot resolve
// `react-native-worklets/plugin` from its hoisted location, so it silently
// skips it. Without that plugin, react-native-reanimated worklets recurse at
// runtime ("Maximum call stack size exceeded" in get NativeModules). We add the
// preset's worklets handling off (to avoid a duplicate) and register the plugin
// explicitly — it resolves fine from the app's own node_modules and MUST be last.
module.exports = (api) => {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { worklets: false, reanimated: false }]],
    plugins: ["react-native-worklets/plugin"],
  };
};
