# rnstack

A batteries-included **Expo + Turborepo** React Native monorepo starter — wired with
**NativeWind v5** (Tailwind v4), **React Native Reusables**, and **TanStack Query**, plus a
shared API-client layer that centralizes the things clients usually get wrong (auth refresh,
money, pagination).

> Build once, scaffold many. This is the reusable base; project-specific apps are created
> from it. A scaffolding CLI (pick app count, theme, etc.) is planned.

## Layout

```
apps/
  mobile/        Expo app (Expo Router) — the reference app
packages/
  api-client/    http() · single-flight 401-refresh · money (minor units) · envelope · query hooks
  ui/            React Native Reusables components (NativeWind v5) · theme tokens · cn()
  config/        shared tsconfig base · tailwind preset · biome
```

## Stack

Expo SDK 56 · Expo Router · NativeWind v5 (Tailwind v4) · React Native Reusables ·
TanStack Query · TypeScript 6 · pnpm + Turborepo · Biome.
Node 24 LTS · the New Architecture (RN 0.85).

## Getting started

```sh
pnpm install
cp .env.example apps/mobile/.env     # set EXPO_PUBLIC_API_BASE_URL
pnpm mobile                          # expo start
```

> ### ⚠️ Expo Go & SDK 56
> This project targets **Expo SDK 56**. The version of **Expo Go in the Play Store / App
> Store is not updated for SDK 56 yet** — it rejects the project with *"Project is
> incompatible with this version of Expo Go. This project requires a newer version."*
> (tracked in [expo/expo#46846](https://github.com/expo/expo/issues/46846)).
>
> **Fix:** install the SDK-56 build of Expo Go directly from Expo (not the store):
> **https://expo.dev/go?sdkVersion=56&platform=android&device=true**
> (pick your platform/device). Then scan the QR from `pnpm mobile` as usual.
>
> Alternatives: build a custom **dev client** (`eas build --profile development`), or run
> in the **browser** (`pnpm mobile` → press `w`; needs `react-native-web`, already included).

## Quality gate (run before committing)

```sh
pnpm format      # biome format --write .
pnpm lint        # turbo run lint
pnpm typecheck   # turbo run typecheck
```

## Conventions

The full conventions + workflow live in `.claude/skills/monorepo-conventions/SKILL.md`.
Highlights:

- **Latest versions, installed via CLI** (`expo install` / `pnpm add` / the RNR CLI) — don't
  hand-write version strings.
- **Money is integer minor units (×100)**, always via `@repo/api-client`'s money helper.
- **Screens call query hooks, never `fetch`**; the api-client owns auth/refresh/money/envelope.
- **Semantic tokens only** (`bg-primary`) — never literal colors.

## Theming

Theme lives in **one place**: each app's `apps/<app>/global.css`. There is no separate
theme file — components reference semantic tokens (`bg-primary`, `text-foreground`, …) and
those resolve to the CSS variables defined here. `global.css` has three parts:

1. **Token values** — `@layer base { :root { --primary: …; } .dark:root { … } }`.
   **Edit these values to re-brand the app.** This is the only thing you change.
2. **Utility registration** — `@theme inline { --color-primary: hsl(var(--primary)); … }`
   tells Tailwind v4 to generate `bg-primary` / `text-primary` etc. from the tokens.
3. **Content sources** — `@source "./app/**/*"` and `@source "../../packages/ui/src/**/*"`
   so Tailwind scans both the app and the shared UI package (omit the second and shared
   components render unstyled).

The token set is the canonical React Native Reusables (shadcn) neutral palette. The RNR CLI
seeds it once at setup; re-theming afterward is a manual edit here (same model as shadcn).
> Do **not** use `@config "./tailwind.config.js"` — a JS-preset `@config` crashes NativeWind
> v5's native bundler. `tailwind.config.js` stays empty.

## Adding UI components

Components come from the React Native Reusables CLI into `packages/ui`:

```sh
cd apps/mobile
npx @react-native-reusables/cli@latest add <name> -y --styling-library nativewind
# or all of them:
npx @react-native-reusables/cli@latest add --all -y --styling-library nativewind
```

`components.json` aliases + tsconfig `paths` route them into the shared `@repo/ui` package.
