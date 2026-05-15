# Creative Constraint

Creative Constraint is a Social Network with a twist: Constraints ! Published projects must respect generated constraints.
This Hybrid App/Website can help Content Creator find inspiration, from Music to Books creation passing through Video Games, Board Games, and Video, Cooking...

The idea is simple, sometimes having constraint to respect can help bring creativity !
For example for Music if I give the following constraints :
- Instruments : Banjo
- Style : Hard Rock
- Sound Effect : Reverb
- Lyrics topics : "A weary soldier" + "finding a hidden map" + "in a city of glass"
- Lyrics Word : "Spear", "Tomato", "Invisible"

You might start imagining what you could do from there and start creating right away !

Constraint are of course different depending on the type of project you want to create.
All Generation Constraint are customizable, meaning if you only wants to have constraint on lyrics and have 10 words to put in your lyrics with word from your choice you can !

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Development build workflow

This project is configured for Expo development builds with `expo-dev-client` and EAS profiles.

### First build

Build and install a native development client once per platform:

```bash
npm run android
```

```bash
npm run ios
```

Or build with EAS:

```bash
npm run build:dev:android
```

```bash
npm run build:dev:ios
```

```bash
npm run build:dev:ios-sim
```

### Daily development

After the client is installed, start Metro for the development build with:

```bash
npm run start:dev
```

### When you need to rebuild

Rebuild the native app after changing native dependencies, Expo config in `app.json`, or the Expo SDK version.
For local native folders, regenerate them with:

```bash
npm run prebuild:clean
```
