# rnstack

A batteries-included, **mobile-first** React Native monorepo starter — **Expo + Turborepo + pnpm**,
wired with **NativeWind v5** (Tailwind v4) and **React Native Reusables** components that are
**pre-fixed to render correctly on native** (not just web).

The point of rnstack is to skip the days normally lost to monorepo + NativeWind + RNR setup
quirks. Clone it, install, run — you get a working app with 30+ UI components, theming, and
light/dark mode out of the box.

> **Status:** working starter you can clone today. A `create-rnstack` CLI (scaffold by project
> name, choose how many apps), an API layer with refresh-token auth, and prebuilt Home/Settings
> screens are **planned** — see [Roadmap](#roadmap).

## Stack

Expo SDK 56 (New Architecture, RN 0.85) · Expo Router · NativeWind v5 (Tailwind v4) ·
React Native Reusables · TypeScript 6 · pnpm + Turborepo · Biome · Node ≥ 22.13.

## Layout

```
apps/
  mobile/        Expo app (Expo Router) — the reference app
packages/
  ui/            @repo/ui — React Native Reusables components, theme toggle, cn()
  config/        @repo/config — shared tsconfig base + Biome config
```

## Getting started

```sh
pnpm install
cp .env.example apps/mobile/.env     # set EXPO_PUBLIC_API_BASE_URL
pnpm start                           # turbo run start → expo start
```

Then open the app on a device/emulator (press `a` for Android, `i` for iOS, `w` for web).

> ### ⚠️ Expo Go & SDK 56
> This project targets **Expo SDK 56**. The Expo Go in the app stores may not be updated for
> SDK 56 yet (*"Project is incompatible with this version of Expo Go"*). Install the SDK-56
> build directly from Expo: **https://expo.dev/go?sdkVersion=56&platform=android&device=true**,
> or build a dev client (`eas build --profile development`), or run in the browser (`w`).

## Quality gate (run before committing)

```sh
pnpm format      # biome format --write .
pnpm lint        # turbo run lint
pnpm typecheck   # turbo run typecheck
```

## Running & building

rnstack is **build-tool agnostic** — it ships with **no EAS / cloud account baked in**. Pick the
path that fits you.

### 1. Local dev (default — no native toolchain)

```sh
pnpm start            # turbo run start → expo start; press a / i / w
```

Runs in Expo Go (SDK 56 — see the note above) or the browser. This is all most contributors need.

### 2. Local native build (you have Android Studio / Xcode)

Compile a real binary on your own machine — no account required:

```sh
cd apps/mobile
npx expo run:android      # builds & installs a debug APK on a device/emulator
npx expo run:ios          # macOS + Xcode

# release artifacts via prebuild + native tooling:
npx expo prebuild         # generates ios/ & android/ (gitignored)
cd android && ./gradlew assembleRelease   # → app/build/outputs/apk/release/*.apk
```

### 3. EAS cloud build (opt-in — no local Android Studio / Xcode)

[EAS Build](https://docs.expo.dev/build/introduction/) compiles **on Expo's servers**, so you can
produce an installable APK/AAB (and iOS builds) with no local native toolchain. rnstack does **not**
configure EAS for you — it's tied to a personal account, so each developer links their own:

```sh
npm i -g eas-cli                       # or: pnpm dlx eas-cli
eas login
cd apps/mobile
eas init                               # links YOUR Expo project; writes owner + projectId into app.json
eas build:configure                    # generates an eas.json with build profiles
eas build --platform android --profile preview   # prints a download URL / QR for the APK
```

On the first Android build, answer **yes** to "Generate a new Android Keystore?" — Expo creates and
stores the signing key for you (no local `keytool`). Builds run asynchronously; press `Ctrl+C` after
it queues and re-attach with `eas build:list`.

> ⚠️ **Monorepo gotcha:** run every `eas` command **from `apps/mobile/`** (where `app.json` lives),
> _not_ the repo root — at the root the CLI links the wrong project and writes a stray root
> `eas.json`. The `owner` / `extra.eas.projectId` that `eas init` writes are **yours** — they
> belong in your own copy, and are safe to commit in a private app repo (they're public identifiers,
> not secrets). The starter intentionally ships without them.

## Theming

Theme lives in **one place**: [`apps/mobile/src/global.css`](apps/mobile/src/global.css). It has
three parts:

1. **Token values** — `@layer base { :root { --primary: hsl(…); } }` plus a
   `@media (prefers-color-scheme: dark)` block. **Edit these values to re-brand.**
2. **Utility registration** — `@theme inline { --color-primary: var(--primary); … }` tells
   Tailwind v4 to generate `bg-primary` / `text-primary` etc.
3. **Content sources** — `@source "../../../packages/ui/src/**/*.{ts,tsx}"` so Tailwind scans
   the shared UI package (omit it and shared components render unstyled).

Components reference **semantic tokens** (`bg-primary`, `text-foreground`, …) — never literal
colors. Dark mode follows the system scheme; toggle it at runtime with the `ThemeToggle`
component (`Appearance.setColorScheme()`).

> **Native theming rules** (each fixes a bug that only shows on device):
> - Store tokens as **full colors** (`hsl(0 0% 9%)`), not bare channels — channel tokens +
>   opacity modifiers (`bg-primary/90`) **flicker** on theme change on native.
> - Radius tokens must be **concrete rems** (`0.5rem`), not `calc(var(--radius) - 2px)` —
>   nested `calc(var())` collapses to 0 (square corners) on native.

## Adding UI components

Components come from the React Native Reusables CLI into `packages/ui`:

```sh
cd packages/ui
npx @react-native-reusables/cli@latest add <name> -y
# or all of them:
npx @react-native-reusables/cli@latest add --all -y
```

`components.json` aliases route them into `@repo/ui`. After adding, audit for native gotchas
(no CSS `grid` on native, Android `TextInput` clipping, web-only utilities) — see the
`rnstack-project` skill in [`.claude/skills/`](.claude/skills/rnstack-project/SKILL.md) for the
full checklist.

## Why pnpm `nodeLinker: hoisted`?

`pnpm-workspace.yaml` sets `nodeLinker: hoisted`. pnpm's default isolated store loads two copies
of `react-native` into one bundle (a `Maximum call stack size exceeded` crash at startup);
hoisting guarantees a single native runtime. This is Expo's recommended linker for monorepos.

## Roadmap

Planned, not yet built:

- **`create-rnstack` CLI** — scaffold a new monorepo by project name in one command.
- **Multi-app generation** — choose how many apps to create under `apps/` at init.
- **API layer** — minimal data fetching with refresh-token auth (TanStack Query).
- **Starter screens** — Home and Settings, pre-wired.

## License

ISC © Sanjay Kumar Sah
