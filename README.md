# WRITING THE CITY — interaction study

Julia Qian / Core 3 Design Studio, 2026

This local desktop edition includes the opening, seven reading chapters (four essays and three poems), the interactive photo wall, and a colophon.

Open http://127.0.0.1:5173 while the local server is running. To restart, run `python3 -m http.server 5173 --bind 127.0.0.1` in this directory.

## Controls

- Hold the right mouse button and move to spray. Pausing builds density and drips.
- Left click to open reading content or a photo. Escape closes a photo.
- In the photo viewer, use the arrows or keyboard Left/Right to cycle photographs. Each enlarged photo retains its own spray mask during the session; the viewer's Undo/Clear operate on the current photo. These masks are separate from the 3D wall's paint mask.
- The can's moving soft shadow is a screen-space silhouette effect, not a physically simulated shadow on 3D surfaces.
- Undo removes one mouse-down stroke; Clear removes all paint.
- Reload clears all marks. Paint is not stored or sent anywhere.
- Sound starts muted and can be enabled in the toolbar.

## Fonts and assets

CSS uses locally installed DIN Condensed, Acumin Pro and Source Serif 4. No Adobe font files are redistributed. A public deployment needs the appropriate Adobe Fonts web project or another licensed webfont setup. The original display ornaments are not used in this focused prototype.

Photographs are Julia Qian's supplied files. Chapter text comes from the project's existing extracted content. Verify the extraction against the original before final publication.

Three.js 0.180.0 is bundled locally (MIT license). No network requests are needed once the local page is served.

## Remaining design work

The model is a procedural metal can, not a scanned product asset. The wall transition is a camera push with perspective; photo closeups currently open as a simple overlay. The desktop mouse interaction is the intended experience; mobile is only a reading fallback. Public hosting and a licensed webfont embed are not configured.
