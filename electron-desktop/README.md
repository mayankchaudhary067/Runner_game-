# Simple Runner Desktop

This directory contains the Windows desktop version of the browser app built with Electron.

## Development

```bash
npm install
npm start
```

## Build portable executable

```bash
npm run build
```

## Build installer

```bash
npm run dist
```

## Files

- `src/main.js` - Electron main process
- `src/preload.js` - secure context bridge
- `index.html` - shared frontend UI shell
- `styles.css` - common styling
- `game.js` - game logic
- `assets/icon.ico` - Windows application icon
