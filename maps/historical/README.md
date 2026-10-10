# MEP Historical Map System

This folder is the map catalog used by Noveria History / MEP Video Maker.

The editor renders real historical country-boundary GeoJSON snapshots rather than hand-drawn blob continents. The boundary source currently used is **aourednik/historical-basemaps**, licensed GPL-3.0. The browser can load those snapshots from the source repository; the Python desktop server can cache every snapshot locally under `desktop-server/cache/maps/` for offline use.

## Files

- `catalog.json` — every supported historical world snapshot and cache path.
- `regions.json` — camera/focus boxes used by the renderer.
- `short-map-plan.json` — before/during/after map plan for the bundled 10 Shorts.

## Snapshot years

1600, 1650, 1700, 1715, 1783, 1800, 1815, 1878, 1880, 1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000, 2010.

The renderer auto-selects the nearest/event-correct snapshot, gives countries distinct colors, highlights countries mentioned by the scene, and only draws a front line when that scene explicitly requests one.

## Offline map pack

Start `desktop-server/START_WINDOWS.bat`, open Server Setup, and press **Download Map Pack**. The server now caches all supported snapshots, not just the ones used by the starter Shorts.
