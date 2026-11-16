# Tamagotchi companion — optional animation prototype

This is a separate prototype derived from V.16.12.14 TASK4C. The original uploaded ZIP is unchanged.

## Features
- Pet chip in bottom-right corner, optional to hide.
- Select egg, hatch, choose dragon / phoenix / dinosaur.
- Calm breathing, blinking, wing and tail animation.
- Color palette, accessory selection, 4 preview evolution stages.
- Interaction button triggers a happy jump.
- Honors prefers-reduced-motion.
- LocalStorage persistence scoped to iq_pet_companion_v1 only.
- No Firebase writes, no coin/XP rewards, no automatic gameplay answer hooks.
- This is a visual prototype; do not treat as production-ready game economy or account-synced pet system.

## Run
Serve directory with a local web server (for PWA/service-worker functionality), e.g. `python -m http.server 8000`; then open http://localhost:8000/.

## Integration
Added pet-companion.js and pet-companion.css to index.html and to the sw.js cache shell. Existing Task4C functions and security rules remain unchanged.
