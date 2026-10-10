# Historical Map System

This folder is the map-system index for Noveria History / MEP Video Maker.

The editor does **not** use a fake blob map for historical Shorts when historical boundary data is available. It loads real historical country polygons, clips them to the scene focus, redraws them into the 9:16 canvas, gives major countries distinct colors, highlights countries being discussed, and overlays only the routes/fronts that the scene actually needs.

## Snapshot library

The system supports every world snapshot currently exposed by the configured Historical Basemaps source from **1000 through 2010**, including the important Shorts years around 1783, 1815, 1914, 1920, 1938, 1945, 1960, and 1994.

See `catalog.json` for the complete snapshot list.

## Offline laptop mode

The desktop server caches the GeoJSON under:

`desktop-server/cache/maps/`

Use **Download Map Pack** on the local server setup page. Once cached, the local editor serves the maps from `/api/maps/` and does not need the public source for those snapshots.

## Public GitHub Pages mode

The public site loads the same map polygons from the configured source/CDN and renders them in the browser.

## License / attribution

Historical boundary source: `aourednik/historical-basemaps` (GPL-3.0). This repository stores the map catalog and renderer configuration; the large geometry files are fetched/cached rather than duplicated into the Git repository.

## Scene behavior

- Countries get stable colors instead of every country looking identical.
- Soviet Union / Russia uses a red family.
- Germany / Prussia uses dark gray.
- France and Britain use distinct blue families.
- Countries mentioned by the scene can receive a gold outline.
- Front lines are opt-in; they are not drawn on every map.
- Routes, aircraft, ships, tanks, missiles, and other overlays are scene graphics, separate from the political borders.
