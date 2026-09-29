![夜の学校 · Yoru no Gakkō](docs/images/title.jpg)

# 夜の学校 · Yoru no Gakkō

**English** · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md)

**A retro fixed-camera survival-horror game set in a Japanese high school at 2 a.m.**
Seven mysteries. One forgotten name. Free, open source, and it runs in your browser.

### ▶ [Play it now](https://kantlex.github.io/yoru-no-gakko/)

Follow [@aisongman on X](https://x.com/aisongman) for updates.

https://github.com/user-attachments/assets/328f2bfb-8d6e-4ca4-8f84-791624bd6b13

| | |
|---|---|
| ![2F corridor](docs/images/corridor.jpg) | ![Chōchin-obake](docs/images/lantern.jpg) |
| ![Hanako-san](docs/images/hanako.jpg) | ![Kagome kagome](docs/images/kagome.jpg) |
| ![Ōkubi-onna chase](docs/images/okubi.jpg) | ![Gashadokuro](docs/images/gashadokuro.jpg) |

## The story

> 放課後、剣道部の練習のあと、教室で眠ってしまった。
> *After kendo practice, I fell asleep at my desk.*
>
> 目が覚めると、午前二時だった。
> *When I woke up, it was two in the morning.*

Every Japanese school has its *nana fushigi*, its seven mysteries: the girl in the third stall, the
teacher with no face, the thing that crawls the corridor on its elbows. Seiran High's list is older
than anyone remembers, and it was written for a reason.

Survive until dawn, find out who wrote the seven mysteries, and why a name matters so much.
No further spoilers here.

## What's in it

- **Fixed camera angles and tank controls** in the style of the original *Alone in the Dark*, rendered at
  480×300 with flat shading, dithering, grain and vignette.
- **Sixteen rooms** across three floors, the gym and the roof: classrooms, the music room, the
  infirmary, the science lab, the library and its archive.
- **Japanese yōkai and school legends** in place of zombies: Chōchin-obake, Hanako-san, Noppera-bō,
  Rokurokubi, Teke-teke, Kokkuri-san, Gashadokuro, and a chase through the corridors with the Ōkubi-onna,
  a woman whose head fills the hallway.
- **Two acts and four chapters**, with notes, diaries and old class photographs that slowly rewrite what
  you thought the story was.
- A shinai, purifying salt and ofuda to fight back; onigiri, ramune and bandages to keep going.
- **Bilingual text** (Japanese with English beneath), procedural WebAudio sound, autosave in your browser,
  and on-screen touch controls on phones and tablets.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move / turn (tank controls) | Arrow keys or WASD | D-pad |
| Run | Shift | 走 (toggle) |
| Examine / interact | E or Enter | 調 |
| Attack with equipped item | Space | 撃 |
| Items | I or Tab | 持 |
| Cycle item | Q | 替 |
| Map | M | |
| Pause | Esc or P | |

## Running it locally

The game is one HTML page with no build tools and no dependencies to install. Three.js is loaded from
jsDelivr and the fonts from Google Fonts.

```sh
./build.sh                  # concatenates src/ into index.html
python3 -m http.server 8000 # then open http://localhost:8000
```

The source lives in `src/` as numbered parts that `build.sh` joins in order into a single
`<script type="module">`:

| File | What it holds |
|---|---|
| `00-head.html` | Page markup, CSS and UI overlays |
| `01-core.js` | Renderer, low-res target and post shader, input, fixed cameras |
| `02-audio.js` | Procedural WebAudio sound and ambience |
| `03-textures*.js` | Canvas-drawn textures |
| `04-models*.js` | The heroine and every obake, built from primitives |
| `05a-builder.js` | Room builder: walls, windows, doors, collision |
| `05b`–`05e-rooms*.js` | The sixteen rooms |
| `06a-state-ui.js` | Game state, items, inventory, saving |
| `06b-actors.js` | Enemy behaviour |
| `06c-flow.js` | Title, intro, room transitions, game over, ending |
| `06d-act2.js` | Act 2, the chase sequence and chapter cards |

## Credits and licences

- Code: [MIT](LICENSE) © 2026 KantLex.
- [three.js](https://threejs.org) (MIT), loaded from jsDelivr.
- Fonts from Google Fonts under the SIL Open Font License: Yuji Syuku, DotGothic16 and Klee One.
- All sound is synthesised procedurally in the browser.
- Yōkai and *nana fushigi* are Japanese folklore and school legend. The characters, story and school
  are fictional.
