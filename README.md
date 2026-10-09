# さよなら絵梨 · Goodbye, Eri (fan blog)

Live: https://dans-vsa.github.io/goodbye-eri-fanblog/

Unofficial fan blog for Tatsuki Fujimoto's one-shot *Goodbye, Eri*, built like phone footage:
camera HUD (REC, timecode, battery), an editing-timeline progress bar, and manga-panel scenes.

- Vanilla HTML/CSS/JS, no build. Design spec: `DESIGN.md`.
- Sections: hero → Info → Tokoh (FILM/RAW cards) → Latar → Bahasa kamera → Galeri → spoiler gate →
  9 story cuts (`#a1`–`#a9`, ends with the explosion) → Tema → Fun fact → Penghargaan → Baca.
- Bilingual: Indonesian in the markup, English in `data-en` / `data-en-alt` / `data-en-cap` attributes.
- Images in `assets/`: JP cover (Fujimoto Archive), VIZ EN cover + promo banner (viz.com), title page (Comic Natalie), character portraits (Anime-Planet), Yuta's mother panel (Hate Sink Fandom wiki). All © Tatsuki Fujimoto / Shueisha.
- Sources: Wikipedia (EN), VIZ Media, Shōnen Jump+. Raw research/downloads live in `.research/` (not needed to deploy).
- After changing CSS/JS, bump the `?v=N` query in `index.html`. If you add Japanese text, rebuild the Dela Gothic One `text=` subset.
- Copy rule: no em/en dashes in visible text.

Run locally: `python -m http.server 5530`
