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

## Installation

One command, works on **macOS** (Apple Silicon) and **Linux** (Debian/Ubuntu/other):

```bash
curl -fsSL https://sindus.github.io/light-scrap-vidz/install.sh | bash
```

- **macOS**: installs to `/Applications/` from the official `.dmg`
- **Linux (apt)**: installs the `.deb` via `apt` (pulls dependencies automatically)
- **Other Linux**: installs an AppImage to `~/.local/bin/`

---

## Uninstallation

**macOS**

```bash
rm -rf /Applications/light-scrap-vidZ.app
```

**Linux — Debian / Ubuntu**

```bash
sudo apt remove light-scrap-vidz
```

To also remove configuration files:

```bash
sudo apt purge light-scrap-vidz
```

**Linux — AppImage**

```bash
rm ~/.local/bin/light-scrap-vidz
```

---

## Requirements

- macOS: Apple Silicon (M1 or later)
- Linux: x86_64 — Debian 12+ / Ubuntu 22.04+ recommended; other distros via AppImage
- No manual yt-dlp installation needed — it is bundled in the package
