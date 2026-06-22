#!/usr/bin/env bash
set -euo pipefail

REPO="sindus/light-scrap-vidz"
API="https://api.github.com/repos/$REPO/releases/latest"

err() { echo "Error: $*" >&2; exit 1; }

get_asset_url() {
  curl -fsSL "$API" \
    | grep "browser_download_url" \
    | grep "$1" \
    | cut -d '"' -f 4 \
    | head -1
}

install_macos() {
  [ "$(uname -m)" = "arm64" ] || err "Only Apple Silicon (arm64) is supported on macOS."

  URL=$(get_asset_url "aarch64.dmg")
  [ -n "$URL" ] || err "Could not find macOS release asset."

  TMP=$(mktemp /tmp/light-scrap-vidz.XXXXXX.dmg)
  echo "Downloading light-scrap-vidZ..."
  curl -fsSL "$URL" -o "$TMP"

  echo "Mounting disk image..."
  VOLUME=$(hdiutil attach "$TMP" -nobrowse -quiet | awk 'END { print $NF }')

  APP=$(find "$VOLUME" -maxdepth 1 -name "*.app" | head -1)
  [ -n "$APP" ] || { hdiutil detach "$VOLUME" -quiet; rm -f "$TMP"; err "No .app found in disk image."; }

  echo "Installing to /Applications..."
  cp -R "$APP" /Applications/ 2>/dev/null || sudo cp -R "$APP" /Applications/

  hdiutil detach "$VOLUME" -quiet
  rm -f "$TMP"

  echo ""
  echo "light-scrap-vidZ is installed. Launch it from your Applications folder."
}

install_linux_deb() {
  URL=$(get_asset_url "amd64.deb")
  [ -n "$URL" ] || err "Could not find Linux .deb release asset."

  TMP=$(mktemp /tmp/light-scrap-vidz.XXXXXX.deb)
  echo "Downloading light-scrap-vidZ..."
  curl -fsSL "$URL" -o "$TMP"

  echo "Installing (requires sudo)..."
  sudo apt install -y "$TMP"
  rm -f "$TMP"

  echo ""
  echo "Done! Run: light-scrap-vidz"
}

install_linux_appimage() {
  URL=$(get_asset_url "amd64.AppImage")
  [ -n "$URL" ] || err "Could not find Linux AppImage release asset."

  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"

  echo "Downloading light-scrap-vidZ AppImage..."
  curl -fsSL "$URL" -o "$INSTALL_DIR/light-scrap-vidz"
  chmod +x "$INSTALL_DIR/light-scrap-vidz"

  echo ""
  echo "Done! Run: light-scrap-vidz"
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "Note: add $INSTALL_DIR to your PATH if it is not already there."
  fi
}

case "$(uname -s)" in
  Darwin)
    install_macos
    ;;
  Linux)
    if command -v apt &>/dev/null; then
      install_linux_deb
    else
      install_linux_appimage
    fi
    ;;
  *)
    err "Unsupported OS: $(uname -s). Only macOS and Linux are supported."
    ;;
esac
