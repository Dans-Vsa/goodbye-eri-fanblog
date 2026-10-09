---
version: 1
name: Goodbye-Eri-tribute
basedOn: designs/x.ai (awesome-design-md): near-black canvas, white ink, uppercase tracked mono captions, one warm "sunset" accent
description: >
  A fan tribute to Tatsuki Fujimoto's "Goodbye, Eri" built as a smartphone recording.
  The viewport is a camera viewfinder (REC dot, timecode, battery, corner brackets) and the
  story plays out as black-and-white manga pages framed like film. Scrolling = playing the
  footage; the bottom bar is an editing timeline whose clips are the story arcs.
  Colour is withheld until the end: REC red is the only accent, and the explosion orange
  (x.ai accent-sunset) appears only when something blows up.

colors:
  canvas: "#0a0a0a"          # the dark around the frame (x.ai canvas)
  canvas-soft: "#141517"     # chapter cards, HUD plates
  hairline: "#26282c"
  paper: "#f4f2ec"           # manga page (never pure white)
  ink: "#0d0d0d"             # line art, panel borders, text on paper
  tone: "#8c8c8c"            # screentone dots (rendered as radial-gradient)
  on-dark: "#f4f2ec"
  on-dark-soft: "#8a8d92"    # x.ai mute
  rec: "#ff2b2b"             # REC dot, playhead, spoiler stamp. The only accent before the end.
  boom: "#ff7a17"            # x.ai accent-sunset. Explosions only.
  boom-soft: "#ffc285"

typography:
  display-jp: "Dela Gothic One: Japanese title + SFX only (Google Fonts text= subset)"
  narration: "Shippori Mincho 500: narration boxes and big lines, like manga captions"
  body: "Inter 400/500, 16-18px, line-height 1.6"
  hud: "JetBrains Mono 500: ALL camera HUD, timecodes, chapter labels; uppercase, 0.14em tracking"
  scale: { display: "clamp(56px, 12vw, 168px)", h2: "clamp(32px, 5vw, 60px)", narration: "clamp(18px, 2.2vw, 24px)", hud: 11-12px }

shape:
  panels: square corners, 3px ink border, 10px white gutter (manga gutter), no radius anywhere
  bubbles: the only rounded thing (speech balloons), 2px ink border
  buttons: square, 1px on-dark border, mono uppercase label; primary = REC style (red dot + label)

motion:
  - panel enter = "focus pull": blur(6px)+scale(1.04) to sharp in 600ms, staggered 90ms
  - handheld sway is optional (toggle) and off under prefers-reduced-motion
  - explosions: white flash 120ms, shake 500ms, burst 900ms; never on load, only on user/scroll trigger
  - only transform/opacity/filter are animated; one rAF scroll loop, IntersectionObserver for reveals

dos:
  - Keep pages black/white with screentone; let red and orange mean something.
  - HUD text is always mono, uppercase, small.
  - Use speed lines (repeating-conic-gradient) and halftone instead of images.
donts:
  - No em/en dashes in visible copy.
  - No reproduction of manga interior pages or dialogue; paraphrase only. Official covers, promo art and small character/panel crops (assets/) are allowed in hero, cast, gallery and story panels, always credited © Tatsuki Fujimoto / Shueisha.
  - No libraries, no canvas loops running when off-screen.
