use std::path::{Path, PathBuf};

const FALLBACK_PATHS: &[&str] = &[
    "/home/sikander/.local/bin/yt-dlp",
    "/usr/local/bin/yt-dlp",
    "/usr/bin/yt-dlp",
    "/opt/homebrew/bin/yt-dlp",
    "/opt/local/bin/yt-dlp",
];

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

        // 2. Search $PATH
        if let Ok(path_var) = std::env::var("PATH") {
            for dir in path_var.split(':') {
                let candidate = PathBuf::from(dir).join("yt-dlp");
                if candidate.is_file() {
                    return Ok(Self { path: candidate });
                }
            }
        }

        // 3. Hardcoded fallbacks
        for p in FALLBACK_PATHS {
            let candidate = Path::new(p);
            if candidate.is_file() {
                return Ok(Self { path: candidate.to_path_buf() });
            }
        }

        Err("yt-dlp not found. Please install it: https://github.com/yt-dlp/yt-dlp".to_string())
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
        // Should fall through to PATH/fallback search, not return the invalid path
        let result = YtDlpBinary::find();
        // We only assert it doesn't return the invalid path
        if let Ok(binary) = &result {
            assert_ne!(binary.path().to_str().unwrap(), "/nonexistent/path/yt-dlp");
        }
    }

    #[test]
    fn test_find_via_env_var_valid_path() {
        // Use an existing binary as a proxy
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
