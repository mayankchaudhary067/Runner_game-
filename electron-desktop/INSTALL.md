# Windows Desktop Application Build and Distribution

## 1. Install dependencies

```bash
cd electron-desktop
npm install
```

## 2. Run in development mode

```bash
npm start
```

## 3. Build portable Windows executable

```bash
npm run build
```

## 4. Create installer package

```bash
npm run dist
```

The generated installer will be placed in the `dist` folder.

## 5. Distribute to end users

- Share the `.exe` installer file from `dist/`
- Use a signed certificate if you want a trusted install experience
- For updates, publish new versions through your update service or a private distribution channel

## 6. Install requirements

- Windows 10 or Windows 11
- .NET-based installer support is handled by Electron Builder
- The app is packaged as a desktop native app and does not require a browser

## 7. Product notes

- Modern windowed interface
- Desktop shortcut during installation
- Local settings stored in the Windows user profile
- Startup with a splash screen and app icon
- Automatic update support via `electron-updater`
