# MEP AI Director backend contract

The editor never needs a model API key. It sends a provider-neutral Director request to your backend.

## Endpoint
Configure `window.MEP_AI_ENDPOINT` in `js/ai-config.js`.

MEP sends POST JSON containing:
- `protocol`: `mep-director-v1`
- `systemContext`: detailed animation-engine instructions
- `capabilities`: canvas, rigs, backgrounds, poses, joints and timing constraints
- `userPrompt`: the requested video
- `currentProjectSummary`: optional current editor context

Your server passes the relevant context to the model and returns the model's structured Director JSON. Keep provider credentials on the server.

## Director response
The response contains video title/era/tags and scenes. Scenes contain duration, supported background, narration, caption, characters and timed actions. Each action can specify a supported pose plus position/scale/facing.

The browser validates the plan before converting it into native MEP scenes, rigs and keyframes.

## Context strategy
Do not send the entire application source on every request. `MEPAIDirector.systemContext()` and `CAPABILITIES` are the stable machine-readable engine contract. Later, retrieval can add only relevant character templates, assets, historical research and animation clips for a request.

For historical generation, use a research/fact-check stage before the animation-planning stage when possible. The animation planner should not silently correct or invent historical facts.
