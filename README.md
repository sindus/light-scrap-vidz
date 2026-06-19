# light-scrap-vidZ

Download videos from TikTok, Instagram, YouTube, Facebook — and any site supported by yt-dlp — directly as MP4 or MP3.

**Features**

- Single video or full playlist/profile download
- Audio-only extraction (MP3)
- Browser cookie auth for Instagram and private content (Firefox, Chrome, Chromium)
- Download queue for batch processing
- System notifications on completion
- Quality selector (best, 1080p, 720p, 480p)

---

## Installation (Linux, Debian/Ubuntu)

One command installs the app and all its dependencies:

```bash
curl -fsSL https://github.com/sindus/light-scrap-vidz/releases/latest/download/light-scrap-vidz_amd64.deb -o /tmp/light-scrap-vidz.deb && sudo apt install /tmp/light-scrap-vidz.deb
```

> `apt install` (instead of `dpkg -i`) automatically pulls in any missing system dependencies.

Once installed, launch **light-scrap-vidZ** from your application menu or run:

```bash
light-scrap-vidz
```

---

## Uninstallation

```bash
sudo apt remove light-scrap-vidz
```

To also remove configuration files:

```bash
sudo apt purge light-scrap-vidz
```

---

## macOS (Apple Silicon)

Download the `.dmg` from the [latest release](https://github.com/sindus/light-scrap-vidz/releases/latest), open it and drag the app to your Applications folder.

---

## Requirements

- Linux: Debian 12+ / Ubuntu 22.04+ (x86_64)
- macOS: Apple Silicon (M1 or later)
- No manual yt-dlp installation needed — it is bundled in the package.
