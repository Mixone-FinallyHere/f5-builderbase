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
# ANDROID_HOME must point at the SDK; JAVA_HOME at a JDK 17
./gradlew assembleRelease
BT=$ANDROID_HOME/build-tools/36.1.0
$BT/zipalign -f -p 4 app/build/outputs/apk/release/app-release-unsigned.apk aligned.apk
$BT/apksigner sign --ks android.keystore --ks-key-alias android --out app-release-signed.apk aligned.apk
```

The Gradle wrapper is included. The signing key (`android.keystore`) is **not** in the repository; build with your own key (`keytool -genkeypair`) or ask the team for the demo key. If you change `twa-manifest.json`, regenerate the project with `npx @bubblewrap/cli update` before building.

To point the app at another server (for example a Vercel preview), change `host` and `webManifestUrl` in `twa-manifest.json` and rebuild.

## Why a TWA and not a WebView app

A TWA runs the site in Chrome's engine: the same speech recognition, camera and media recording as the browser, full screen, and no product code duplicated on the phone. `assetlinks.json` on the server (`/.well-known/assetlinks.json`) ties the app's signing certificate to the domain so Chrome hides its address bar.
