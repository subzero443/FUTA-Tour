# FUTA Tour — Responsive Campus Navigation PWA
# Live - https://futa-tour.pages.dev/
This edition supports phone, foldable, iPad/tablet, laptop and large-screen layouts, while staying focused entirely on campus landmarks and user-controlled GPS. There is **no transport booking, rider tracking, pricing or dispatch functionality**.

## Start on Windows (PowerShell in VS Code)

## 💻 Run Locally

### 1. Open PowerShell

Navigate to the project directory:

```powershell
cd "C:\Users\INVESTOR\Desktop\FUTA Tour"
```


Install Node.js 20.19+ (or 22+), extract the ZIP, then run:


Website: http://localhost:5173. Landmark API: http://localhost:4000/api/health.

If PowerShell blocks npm, use `npm.cmd install` and `npm.cmd run dev`, or use Command Prompt.

## Responsive layout

The existing `client/src/style.css` has base styles and breakpoints. New overrides are in **`client/src/responsive.css`**, imported last from `client/src/main.jsx`.

- Phones up to 670px: stacked map and landmark directory, large controls, fixed bottom navigation and safe-area padding.
- iPad/tablet portrait 671–900px: stacked map first, landmarks below.
- Tablet landscape / compact laptop 671–1024px: sidebar + map, scaled typography.
- Wide desktop: two-column hero and explorer.
- Very narrow displays up to 359px: stacked hero actions.
- Landscape short screens: map height and splash shrink to fit.

Map uses `MapResize` (`ResizeObserver` + `invalidateSize`) so tile sizes recalculate after orientation changes or container resizing.

## Test screen sizes in Chrome or Edge

1. Start `npm run dev` and visit http://localhost:5173.
2. Press **F12** > Toggle Device Toolbar (**Ctrl+Shift+M**).
3. Test widths **320, 360, 375, 390, 430, 768, 820, 1024, 1280 and 1920 px**.
4. Rotate the virtual device. Check that map tiles, search, install dialog, bottom navigation and landmark cards stay usable.
5. Also test **real iPhone Safari and Android Chrome** after an HTTPS deployment; emulation cannot confirm actual browser installation, GPS or safe-area behavior.

For phone access to the development server, open `http://YOUR-LAPTOP-LAN-IP:5173` on the same Wi-Fi (and allow the port through Windows Firewall if necessary). Ordinary HTTP on a local IP address normally **cannot** support GPS, service workers, or PWA installation: use HTTPS for those tests.

## Features

- Animated white/purple FUTA Tour landing and PWA install guide
- Landmark search, filters and saved locations
- Interactive Leaflet / OpenStreetMap map, on-device opt-in GPS
- Approximate straight-line destination distance (NOT verified walking directions)
- Responsive navigation and modal dialogs
- Small Express API for reading and administrating landmark data

## Important notes

* Landmark positions are **reference coordinates only**; survey before relying on them for student navigation.
* Public OpenStreetMap tiles need internet and must respect provider usage limits.
* Progressive Web Apps cannot guarantee GPS tracking when suspended in the background.
* Browser install behavior varies: iPhone users generally use **Share > Add to Home Screen**; compatible Android browsers may show an installation prompt after meeting installability requirements.
* Sign-in is an on-device demo name, not real university authentication.
* To build: `npm run build`. Deploy HTTPS for full PWA install / location testing.

See `client/src/responsive.css` to change breakpoint rules; avoid adding fixed-width card or map pixels without a mobile override.
