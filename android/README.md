# android/ — the phone app

A **Trusted Web Activity** wrapper: a real Android app (APK) that opens the server (`https://f5-builderbase.vercel.app`) full screen, with the camera and microphone available. It contains no product logic; everything the customer sees is computed in [`server/`](../server/).

The project is generated with Google's [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) from `twa-manifest.json`.

## Install the app on a phone

1. Download `app-release-signed.apk` from the repository's Releases (or build it below).
2. On the phone, open the file; allow installing from this source when asked.
3. Launch **KBC concept**. The first launch needs a network connection.

Chrome must be installed on the phone (it provides the web engine, as for any TWA).

## Build it

Requirements: JDK 17 and the Android SDK (build-tools 36.1.0, platform-tools). Bubblewrap can install both on first run.

```bash
cd android
npx @bubblewrap/cli build --skipPwaValidation
```

Bubblewrap asks for the signing-key passwords, then writes `app-release-signed.apk` and `app-release-bundle.aab` in this folder. The signing key (`android.keystore`) is **not** in the repository; build with your own key or ask the team for the demo key.

To point the app at another server (for example a Vercel preview), change `host` and `webManifestUrl` in `twa-manifest.json` and rebuild.

## Why a TWA and not a WebView app

A TWA runs the site in Chrome's engine: the same speech recognition, camera and media recording as the browser, full screen, and no product code duplicated on the phone. `assetlinks.json` on the server (`/.well-known/assetlinks.json`) ties the app's signing certificate to the domain so Chrome hides its address bar.
