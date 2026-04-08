# JaRon Guess OBS Overlay

A red-and-black OBS browser overlay built to match the mockup style:
- animated falling question marks
- glowing red streak background
- top-left vertical camera slot
- left chat panel with CHAT header
- larger gameplay window on the right

## Files
- `index.html` - overlay markup and SVG frame art
- `style.css` - global styling and text effects
- `scripts.js` - animated question mark rain and transparent source cutouts

## OBS setup
1. Add your gameplay source.
2. Add your camera source and position it in the left rounded frame.
3. Add your chat browser source and position it in the left chat box.
4. Add this overlay as a Browser Source on top of those sources.
5. Set the Browser Source size to `1920 x 1080`.

## Preview mode
To preview the overlay in a normal browser without OBS sources behind it, open:

`rain-overlay/index.html?preview=1`

That darkens the source windows so you can see the layout clearly.

## GitHub Pages
If you want this live as a GitHub Pages overlay:
1. Open the repository settings.
2. Go to Pages.
3. Set the deploy source to the `main` branch and `/root`.
4. Wait for the site URL to generate.
