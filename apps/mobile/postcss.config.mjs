// Tailwind v4 uses the PostCSS plugin (NativeWind v5). autoprefixer is unnecessary
// in Expo because lightningcss handles it.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
