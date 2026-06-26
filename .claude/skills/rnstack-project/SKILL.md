---
name: rnstack-project
description: Architecture, conventions, and native gotchas for the rnstack React Native monorepo starter. READ THIS before adding or editing code in this repo — especially before touching NativeWind theming, RN Reusables components, the package layout, or the dependency setup. Applies to any work under apps/* or packages/*.
---

# rnstack — project guide

**rnstack** is a batteries-included, **mobile-first** React Native monorepo starter: Expo + Turborepo + pnpm, NativeWind v5 (Tailwind v4), and React Native Reusables (RNR) components pre-fixed to render correctly on native. The goal is that a user can scaffold a working RN monorepo in one command instead of fighting the setup for days.

> Branding: the product/package name is **rnstack** (root `package.json` `name: "rnstack"`; CLI: `create-rnstack`; repo: github.com/sanjaysah101/rnstack). The local working folder may still be named `rn-monorepo` — that's cosmetic; the product is **rnstack**.

Primary target is **native (iOS/Android)**. Web works but is secondary — never trade native correctness for web parity.

## Repository layout

```
rn-monorepo/
├── apps/
│   └── mobile/                 # Expo app (expo-router, SDK 56)
│       ├── src/
│       │   ├── app/            # expo-router routes (_layout.tsx, index.tsx, ...)
│       │   ├── lib/            # app-level helpers (theme.ts: THEME + NAV_THEME)
│       │   └── global.css      # SINGLE source of truth for theming (see below)
│       ├── metro.config.js     # minimal; expo/metro-config handles the monorepo
│       ├── babel.config.js     # explicit react-native-worklets/plugin (pnpm needs it)
│       ├── app.json            # expo config (NO owner/eas.projectId — added per-dev by eas init)
│       └── AGENTS.md           # "read versioned Expo docs before coding"
├── packages/
│   ├── ui/                     # @repo/ui — the shared UI kit (RNR components live here)
│   │   ├── src/
│   │   │   ├── components/ui/  # RNR components (button, input, dialog, ...)
│   │   │   ├── lib/utils.ts    # cn()
│   │   │   └── index.ts        # barrel: re-exports lib/utils
│   │   └── components.json     # RNR/shadcn CLI config (aliases point at @repo/ui)
│   └── config/                 # @repo/config — shared tsconfig.base.json + biome.json
├── pnpm-workspace.yaml         # workspaces + nodeLinker: hoisted + overrides
└── turbo.json                  # lint / typecheck / build / start / dev tasks
```

## Non-negotiable setup decisions (do NOT revert without strong reason)

These were each chosen to fix a concrete, verified breakage. Changing them re-breaks native.

1. **`nodeLinker: hoisted`** in `pnpm-workspace.yaml`. pnpm's default isolated store creates a *separate instance of `react-native` per peer context*, loading two copies into one bundle → `Maximum call stack size exceeded` at startup. Hoisting guarantees one physical copy. This is Expo's recommended linker for monorepos.
2. **Workspace `overrides`** pin every RN-family package (`react`, `react-native`, `react-native-reanimated`, `react-native-worklets`, `react-native-safe-area-context`, `react-native-screens`) to one version. Belt-and-suspenders with hoisting.
3. **`lightningcss: 1.30.1`** override. Newer 1.32.x crashes the react-native-css compiler ("failed to deserialize Specifier"). pnpm v11 reads overrides from `pnpm-workspace.yaml`, NOT `package.json`.
4. **`apps/mobile/babel.config.js`** explicitly adds `react-native-worklets/plugin` with `{ worklets: false, reanimated: false }` on the preset. In a pnpm monorepo `babel-preset-expo` can't resolve the worklets plugin from its hoisted location and silently skips it → reanimated recursion crash.
5. **`@repo/ui` RN-family deps are `peerDependencies`** (+ dev copies for standalone typecheck), never regular `dependencies` — the app provides the single native runtime.
6. **`metro.config.js` is minimal.** Expo SDK 52+ auto-configures monorepos; do not add manual `watchFolders` / `nodeModulesPaths` / resolver hacks.

## Theming — `apps/mobile/src/global.css` is the single source of truth

NativeWind v5 + Tailwind v4 is **CSS-first** (no `tailwind.config.js`). Structure: tokens → `@theme inline` → `@source`.

**Three rules that are not optional — each fixes a bug that only appears on native:**

- **Store color tokens as FULL colors**, e.g. `--primary: hsl(0 0% 9%)`, and reference them in `@theme inline` as `var(--primary)`. Do NOT store bare HSL channels (`0 0% 9%`) consumed via `hsl(var(--primary))`. Channel-tokens + an opacity modifier (`bg-primary/90`, `dark:bg-input/30`) **flicker** on theme change on native.
- **Radius tokens must be concrete rems** (`--radius-md: 0.5rem`), never `calc(var(--radius) - 2px)`. react-native-css doesn't resolve nested `calc(var())` on native → `rounded-*` collapses to 0 (square corners).
- **`@source "../../../packages/ui/src/**/*.{ts,tsx}"`** must stay — workspace packages are symlinked and Tailwind won't scan them otherwise, so classes used only in `@repo/ui` get purged.

Dark mode: NativeWind v5 maps `dark:` to `@media (prefers-color-scheme: dark)`. Toggle at runtime with `Appearance.setColorScheme()` (see `@repo/ui` ThemeToggle) — the `useColorScheme` hook from `nativewind` is deprecated; use the one from `react-native`.

## Writing / editing RN Reusables components (native correctness)

RNR's published components target web patterns; several break only on device. Before editing a component, know these:

- **`grid` / grid-`gap` do nothing on native.** Use `flex flex-col gap-N`.
- **Android `TextInput` clips text and shrinks when empty.** The fix pattern (see `components/ui/input.tsx`): wrap the `TextInput` in a `View` that owns the fixed height (`h-10`); let the input fill it at natural line size (`flex-1 p-0 leading-5`, no `h-full`); set `style={{ includeFontPadding: false, textAlignVertical: "center" }}` (these are TextStyle props, not JSX props — `includeFontPadding` is not on `TextInputProps`).
- **Web-only utilities** (`hover:`, `focus-visible:`, `ring-*`, `outline-none`, `transition-*`, `select-text`, `scroll-m-*`) belong inside `Platform.select({ web: ... })`. They are no-ops on native and clutter the native style.
- Always test components **on a device/emulator**, not just web — web rendering is not representative.

Full detail on these gotchas is also captured in the memory note `nativewind-v5-native-gotchas`.

## Conventions

- **Imports inside `@repo/ui`** use the package's own name + subpath: `import { cn } from "@repo/ui/lib/utils"`, `import { Text } from "@repo/ui/components/ui/text"`. Resolution works via the package `exports` map (`./components/*` → `./src/components/*.tsx`, `./lib/*` → `./src/lib/*.ts`).
- **App imports** use `@/*` (→ `apps/mobile/src/*`) for app code and `@repo/ui/...` for the kit.
- **File naming:** components/files are **kebab-case** (`theme-toggle.tsx`, `alert-dialog.tsx`). Exported React components are PascalCase; hooks are `useXxx`.
- **Styling:** Tailwind classes via `className`, composed with `cn()`. No inline `StyleSheet` unless a prop can't be expressed in Tailwind (e.g. the `includeFontPadding` case).
- **Package names:** internal packages are scoped `@repo/*`. (When publishing, swap `@repo` for a real npm scope.)
- **Tooling:** Biome (not ESLint/Prettier) — config in `@repo/config/biome.json`, 2-space indent, 100 col. Run `pnpm lint` / `pnpm typecheck` (Turbo) before committing. TypeScript `strict`, `moduleResolution: bundler`.
- **Env vars:** public runtime config via `EXPO_PUBLIC_*` (already wired into `turbo.json` globalEnv as `EXPO_PUBLIC_API_BASE_URL`).
- **Expo SDK 56:** read the versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing Expo-specific code (per `apps/mobile/AGENTS.md`).

## How to add things

**Add an RNR component** — run the RNR CLI from `packages/ui` (it reads `components.json`, writes into `src/components/ui`, and adds `@rn-primitives/*` deps):
```
cd packages/ui && npx @react-native-reusables/cli@latest add <name> --yes
```
Then audit it for the native gotchas above (grid, TextInput, web-only utils) before using it.

**Add a shared component to the kit:** put it in `packages/ui/src/components/...`, import within the package via `@repo/ui/...`, and (if it should be part of the public surface) re-export from `src/index.ts`.

**Add a screen:** create a route file under `apps/mobile/src/app/` (expo-router file-based routing).

## Building the app — keep it build-tool agnostic

This is a **starter/CLI template**: it must NOT bake in any individual's EAS/cloud account. The
default path is local dev (`pnpm start`). Two opt-in build paths exist; never assume EAS.

**Deliberately NOT committed** (each ties to one Expo account / would break forkers):
`apps/mobile/eas.json`, and `owner` + `extra.eas.projectId` in `apps/mobile/app.json`. `eas init` /
`eas build:configure` regenerate these in the *developer's own* copy. Do not re-add them to the
template — that leaks the maintainer's private-org identity and makes every fork's build fail.

**Local native build** (needs Android Studio / Xcode): `npx expo run:android` / `run:ios`, or
`npx expo prebuild` then Gradle/Xcode. `package.json` already has `android`/`ios` scripts.

**EAS cloud build** (opt-in — no local toolchain). Non-obvious rules (each fixed a real failure):

1. **Run every `eas` command from `apps/mobile/`, never the repo root.** `eas init` / `eas build`
   key off the nearest `app.json`. Run at the root and the CLI links a *different* project (e.g.
   `@<account>/rnstack`) and writes a stray root `eas.json` — delete it if that happens.
2. **`eas project:init --path <dir>` does not exist** — `--path` is not a valid flag. Use
   `cd apps/mobile && eas init`.
3. **Cloud keystore:** on the first Android build, answer **yes** to "Generate a new Android
   Keystore?" — Expo stores it server-side (works with no local `keytool`).
4. **Monorepo install on the server:** EAS uploads only git-tracked source and installs on its
   workers using the root `pnpm-lock.yaml` + `pnpm-workspace.yaml` (`nodeLinker: hoisted`). Keep
   the lockfile committed/in sync.
5. No-Android-Studio: when EAS asks "Install and run on emulator?", answer **no** (yes →
   `spawn adb ENOENT`, harmless — the build artifact is already done). Or use `--no-wait`.

```sh
eas login && cd apps/mobile
eas init && eas build:configure                  # links YOUR account; writes app.json + eas.json
eas build --platform android --profile preview   # installable APK; prints a download URL/QR
```

## Verifying changes

- `pnpm typecheck` (Turbo, all packages) — or `cd apps/mobile && npx tsc --noEmit`. NOTE: a stray `apps/mobile/example/` dir (leftover Expo template) reports unrelated errors — filter them out (`grep -v '^example/'`).
- `pnpm lint` (Biome via Turbo). Don't run `npx biome` directly — npm's devEngines guard rejects it; use `pnpm exec biome ...`.
- Real check for native runtime issues: `cd apps/mobile && npx expo export --platform android --output-dir <tmp>` compiles the full bundle (catches resolution/CSS-compile errors a typecheck misses). For behavior, run on device with `npx expo start --clear`.
- After babel/metro/resolver/linker changes, ALWAYS clear cache (`--clear`) — stale Metro cache masks fixes.

## Roadmap — PLANNED, NOT YET BUILT

These do not exist in the repo yet. Do not assume their files/APIs are present; if asked to use them, build them first or confirm scope.

- **`create-rnstack` CLI** — scaffold a new monorepo by project name in one command, installing deps and applying the fixes above automatically. MUST stay build-tool agnostic: never bake in an EAS/cloud account, keystore, or `projectId`/`owner`; the scaffold runs/builds locally out of the box and treats EAS as opt-in (developer runs `eas init` for their own account).
- **Multi-app generation** — let the user choose how many apps to create under `apps/` at init time.
- **API layer** — minimal data-fetching with **refresh-token** auth logic (token storage, refresh-on-401 interceptor). TanStack Query is the intended data layer (already referenced in the root package description).
- **Starter screens** — Home and Settings screens that almost every project needs, pre-wired.
- **More skills** — additional task-specific skills beyond this project guide.

When implementing roadmap items, keep them mobile-first, follow the conventions above, and add to/refresh this skill so it stays the accurate source of truth.
