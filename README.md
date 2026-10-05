# MEP Video Maker

Browser-first 2D animation editor for producing reusable illustrated history, biography, education and storytelling videos.

## Working MVP
- Articulated character skeleton (head, torso, upper/lower arms, upper/lower legs)
- Pose controls for every joint
- Character position, scale and facing controls
- Drag-to-position characters on the canvas
- Multiple characters and individual timeline tracks
- Timestamped animation keyframes
- Automatic interpolation between keyframes
- Timeline scrubbing and real-time playback
- Project name, category, duration and FPS
- Local browser autosave
- Portable JSON project import/export
- Static architecture suitable for GitHub Pages

## Animation format
MEP does **not** save every rendered video frame. Each keyframe stores a timestamp plus the character state: X/Y position, scale, facing direction and joint angles. During playback the renderer interpolates between neighboring keyframes and draws the resulting pose to the HTML5 Canvas.

That keeps project files small and gives the editor reusable motion data.

## Test it
Enable GitHub Pages for the repository using the `main` branch/root, or clone/download the repository and open `index.html`.

Try this:
1. Pose the default character and add a keyframe at 0 seconds.
2. Move the timeline to 2 seconds.
3. Move the character and change arm/leg pose controls.
4. Add another keyframe.
5. Press Play. MEP interpolates the movement and pose.

## Next milestones
Direct canvas joint dragging; reusable poses/actions (idle, walk, point, talk, run); scenes; backgrounds and props; text/captions; camera tracks; audio/narration timeline; richer character art/wardrobe/faces; undo/redo; Firebase authentication/cloud projects; and browser video export.
