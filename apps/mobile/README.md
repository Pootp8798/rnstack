# `mobile` — rnstack reference app

The Expo app for the [**rnstack**](../../README.md) monorepo. Expo SDK 56 (New Architecture,
RN 0.85) · Expo Router · NativeWind v5 (Tailwind v4) · React Native Reusables (`@repo/ui`).

> This app is part of a **pnpm + Turborepo** monorepo and uses **Biome** (not npm/ESLint/Prettier).
> Run commands from the **repo root** unless noted. See the root [`README.md`](../../README.md)
> for the full stack, theming model, and setup rationale.

## Develop

From the repo root:

```sh
pnpm install
cp .env.example apps/mobile/.env     # set EXPO_PUBLIC_API_BASE_URL
pnpm start                           # turbo run start → expo start
```

Then press `a` (Android), `i` (iOS), or `w` (web). Useful per-app commands:

```sh
cd apps/mobile
npx expo start --clear               # clear the Metro cache (do this after babel/metro changes)
npx expo install --check             # sync Expo dependency versions
```

> ### ⚠️ Expo Go & SDK 56
> The Expo Go in the app stores may not support SDK 56 yet. Install the SDK-56 build from
> **https://expo.dev/go?sdkVersion=56&platform=android&device=true**, build a dev client
> (`eas build --profile development`), or run in the browser (`w`).

App code lives in [`src/app/`](src/app) (Expo Router file-based routing). Shared UI comes from
[`@repo/ui`](../../packages/ui); theming is defined once in [`src/global.css`](src/global.css).

## Quality gate

```sh
pnpm format      # biome format --write .
pnpm lint        # turbo run lint
pnpm typecheck   # turbo run typecheck
```

## Build

rnstack ships **build-tool agnostic** — no EAS / cloud account is baked in. Three paths:

**1. Local dev (no native toolchain):** `pnpm start` from the repo root → press `a` / `i` / `w`.

**2. Local native build (you have Android Studio / Xcode):**

```sh
cd apps/mobile
npx expo run:android          # debug APK on a device/emulator
npx expo run:ios              # macOS + Xcode
# release: npx expo prebuild  then  cd android && ./gradlew assembleRelease
```

**3. EAS cloud build (opt-in — no local Android Studio / Xcode):** compiles on Expo's servers.
You link **your own** Expo account (the template ships none):

```sh
eas login
cd apps/mobile                                   # always run eas from here, not the repo root
eas init                                         # writes owner + extra.eas.projectId into app.json
eas build:configure                              # generates eas.json with build profiles
eas build --platform android --profile preview   # answer "yes" to the cloud keystore; prints a QR/URL
```

See [Running & building](../../README.md#running--building) in the root README for the full guide.

## EAS config & git — what's safe to commit

The starter **intentionally omits** `owner` and `extra.eas.projectId` from `app.json`, plus
`eas.json`, because they're tied to an individual Expo account. `eas init` / `eas build:configure`
recreate them in *your* copy.

| File / field                         | In the starter? | Safe to commit in your own app repo?                                |
| ------------------------------------ | :-------------: | ------------------------------------------------------------------- |
| `eas.json`                           |       ❌        | ✅ — build profiles only, no secrets.                               |
| `app.json` `extra.eas.projectId`     |       ❌        | ✅ — public UUID; links source to your project, grants no access.   |
| `app.json` `owner`                   |       ❌        | ✅ — public account/org identifier, not a credential.               |
| Keystore (`*.jks`, `*.p12`, `*.key`) |       ❌        | ❌ — real signing secrets; live on Expo's servers, already ignored. |
| `.env`, API keys, service accounts   |       ❌        | ❌ — secrets (gitignored). Only `EXPO_PUBLIC_*` ships in the bundle. |

> `projectId`/`owner` aren't secrets, but they bind builds to **one specific Expo account**, so a
> shared template must not ship them — each developer runs `eas init` to generate their own.
