use std::path::{Path, PathBuf};
use tauri::Manager;

const SYSTEM_PATHS: &[&str] = &[
    "/usr/local/bin/yt-dlp",
    "/usr/bin/yt-dlp",
    "/opt/homebrew/bin/yt-dlp",
    "/opt/local/bin/yt-dlp",
];

pub struct YtDlpBinary {
    path: PathBuf,
}

impl YtDlpBinary {
    /// Primary resolver: bundled sidecar > user-updated binary > system.
    pub fn find_with_app(app: &tauri::AppHandle) -> Result<Self, String> {
        // 1. Env var override (dev/CI)
        if let Ok(p) = std::env::var("YTDLP_PATH") {
            let path = PathBuf::from(&p);
            if path.is_file() {
                return Ok(Self { path });
            }
        }

        // 2. User-updated binary in writable app data dir ("Update yt-dlp" saves here)
        if let Ok(data_dir) = app.path().app_data_dir() {
            let p = data_dir.join("yt-dlp");
            if p.is_file() {
                return Ok(Self { path: p });
            }
        }

        // 3. Bundled sidecar in resource dir (ships with the app)
        if let Ok(res_dir) = app.path().resource_dir() {
            let p = res_dir.join("yt-dlp");
            if p.is_file() {
                return Ok(Self { path: p });
            }
        }

        // 4. System fallback (dev builds without bundled binary)
        Self::find_system()
    }

    /// Dev/test fallback — no app handle required.
    pub fn find() -> Result<Self, String> {
        if let Ok(p) = std::env::var("YTDLP_PATH") {
            let path = PathBuf::from(&p);
            if path.is_file() {
                return Ok(Self { path });
            }
        }
        Self::find_system()
    }

    fn find_system() -> Result<Self, String> {
        if let Ok(path_var) = std::env::var("PATH") {
            for dir in path_var.split(':') {
                let candidate = PathBuf::from(dir).join("yt-dlp");
                if candidate.is_file() {
                    return Ok(Self { path: candidate });
                }
            }
        }
        for p in SYSTEM_PATHS {
            let candidate = Path::new(p);
            if candidate.is_file() {
                return Ok(Self { path: candidate.to_path_buf() });
            }
        }
        Err("yt-dlp not found. Please restart the app to trigger automatic setup.".to_string())
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
