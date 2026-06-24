use std::path::{Path, PathBuf};

const SYSTEM_PATHS: &[&str] = &[
    "/usr/local/bin/yt-dlp",
    "/usr/bin/yt-dlp",
    "/opt/homebrew/bin/yt-dlp",
    "/opt/local/bin/yt-dlp",
];

/// Returns `~/.local/bin/yt-dlp` — pip --user install location.
/// Preferred over system paths because the pip version supports curl-cffi (required for TikTok).
fn pip_user_bin() -> Option<PathBuf> {
    let home = std::env::var("HOME").ok()?;
    let p = PathBuf::from(home).join(".local").join("bin").join("yt-dlp");
    p.is_file().then_some(p)
}

pub struct YtDlpBinary {
    path: PathBuf,
}

impl YtDlpBinary {
    pub fn find() -> Result<Self, String> {
        // 1. Explicit env var override
        if let Ok(p) = std::env::var("YTDLP_PATH") {
            let path = PathBuf::from(&p);
            if path.is_file() {
                return Ok(Self { path });
            }
        }

        // 2. pip --user install (~/.local/bin) — supports curl-cffi for TikTok/Dailymotion
        if let Some(path) = pip_user_bin() {
            return Ok(Self { path });
        }

        // 3. Search $PATH (may be the apt/standalone binary without curl-cffi support)
        if let Ok(path_var) = std::env::var("PATH") {
            for dir in path_var.split(':') {
                let candidate = PathBuf::from(dir).join("yt-dlp");
                if candidate.is_file() {
                    return Ok(Self { path: candidate });
                }
            }
        }

        // 4. Hardcoded system fallbacks
        for p in SYSTEM_PATHS {
            let candidate = Path::new(p);
            if candidate.is_file() {
                return Ok(Self { path: candidate.to_path_buf() });
            }
        }

        Err("yt-dlp not found. Click \"Update yt-dlp\" in Settings to install it.".to_string())
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_via_env_var_invalid_path() {
        std::env::set_var("YTDLP_PATH", "/nonexistent/path/yt-dlp");
        let result = YtDlpBinary::find();
        if let Ok(binary) = &result {
            assert_ne!(binary.path().to_str().unwrap(), "/nonexistent/path/yt-dlp");
        }
    }

    #[test]
    fn test_find_via_env_var_valid_path() {
        let existing = std::process::Command::new("which")
            .arg("yt-dlp")
            .output()
            .ok()
            .and_then(|o| {
                if o.status.success() {
                    String::from_utf8(o.stdout).ok().map(|s| s.trim().to_string())
                } else {
                    None
                }
            });

        if let Some(path) = existing {
            std::env::set_var("YTDLP_PATH", &path);
            let result = YtDlpBinary::find();
            assert!(result.is_ok());
            assert_eq!(result.unwrap().path().to_str().unwrap(), path);
        }
    }
}
