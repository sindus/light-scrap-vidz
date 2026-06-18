use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, Clone, PartialEq)]
pub enum Quality {
    Best,
    P1080,
    P720,
    P480,
}

impl Quality {
    pub fn from_str(s: &str) -> Self {
        match s {
            "1080p" => Self::P1080,
            "720p" => Self::P720,
            "480p" => Self::P480,
            _ => Self::Best,
        }
    }

    pub fn format_spec(&self) -> &'static str {
        match self {
            Self::Best => "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            Self::P1080 => {
                "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]"
            }
            Self::P720 => {
                "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]"
            }
            Self::P480 => {
                "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]"
            }
        }
    }
}

pub struct InfoCommand {
    pub binary: PathBuf,
    pub url: String,
}

impl InfoCommand {
    pub fn build(&self) -> Command {
        let mut cmd = Command::new(&self.binary);
        cmd.args(["--dump-json", "--no-playlist", &self.url]);
        cmd
    }
}

pub struct DownloadCommand {
    pub binary: PathBuf,
    pub url: String,
    pub output_dir: PathBuf,
    pub quality: Quality,
}

impl DownloadCommand {
    pub fn build(&self) -> Command {
        let mut cmd = Command::new(&self.binary);
        cmd.args([
            "-f",
            self.quality.format_spec(),
            "--merge-output-format",
            "mp4",
            "--progress",
            "--newline",
            "-P",
            self.output_dir.to_str().unwrap_or("."),
            "-o",
            "%(title)s.%(ext)s",
            "--no-playlist",
            &self.url,
        ]);
        cmd
    }
}

/// Fetches playlist metadata without downloading videos.
pub struct PlaylistInfoCommand {
    pub binary: PathBuf,
    pub url: String,
    /// Number of entries to peek at (enough to retrieve playlist_count).
    pub peek: u32,
}

impl PlaylistInfoCommand {
    pub fn build(&self) -> Command {
        let mut cmd = Command::new(&self.binary);
        cmd.args([
            "--flat-playlist",
            "--dump-single-json",
            "--playlist-end",
            &self.peek.to_string(),
            "--no-warnings",
            &self.url,
        ]);
        cmd
    }
}

/// Downloads all or a limited set of items from a playlist / profile.
/// Items are ordered newest-first on most social platforms (Instagram, TikTok, YouTube).
/// `playlist_end = None` downloads all items; `Some(n)` limits to the first n (= latest n).
pub struct PlaylistDownloadCommand {
    pub binary: PathBuf,
    pub url: String,
    pub output_dir: PathBuf,
    pub quality: Quality,
    pub playlist_end: Option<u32>,
}

impl PlaylistDownloadCommand {
    pub fn build(&self) -> Command {
        let mut cmd = Command::new(&self.binary);
        cmd.args([
            "-f",
            self.quality.format_spec(),
            "--merge-output-format",
            "mp4",
            "--yes-playlist",
            "--progress",
            "--newline",
            "-P",
            self.output_dir.to_str().unwrap_or("."),
            "-o",
            "%(playlist_index)s - %(title)s.%(ext)s",
        ]);
        if let Some(n) = self.playlist_end {
            if n > 0 {
                cmd.args(["--playlist-end", &n.to_string()]);
            }
        }
        cmd.arg(&self.url);
        cmd
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quality_from_str() {
        assert_eq!(Quality::from_str("best"), Quality::Best);
        assert_eq!(Quality::from_str("1080p"), Quality::P1080);
        assert_eq!(Quality::from_str("720p"), Quality::P720);
        assert_eq!(Quality::from_str("480p"), Quality::P480);
        assert_eq!(Quality::from_str("unknown"), Quality::Best);
    }

    #[test]
    fn test_info_command_args() {
        let cmd = InfoCommand {
            binary: PathBuf::from("/usr/bin/yt-dlp"),
            url: "https://www.youtube.com/watch?v=test".to_string(),
        };
        let built = cmd.build();
        let args: Vec<String> = built.get_args().map(|a| a.to_string_lossy().into()).collect();
        assert!(args.iter().any(|a| a == "--dump-json"));
        assert!(args.iter().any(|a| a == "--no-playlist"));
        assert!(args.iter().any(|a| a == "https://www.youtube.com/watch?v=test"));
    }

    #[test]
    fn test_download_command_args() {
        let cmd = DownloadCommand {
            binary: PathBuf::from("/usr/bin/yt-dlp"),
            url: "https://www.youtube.com/watch?v=test".to_string(),
            output_dir: PathBuf::from("/tmp/downloads"),
            quality: Quality::P1080,
        };
        let built = cmd.build();
        let args: Vec<String> = built.get_args().map(|a| a.to_string_lossy().into()).collect();
        assert!(args.contains(&"--merge-output-format".to_string()));
        assert!(args.contains(&"mp4".to_string()));
        assert!(args.contains(&"--newline".to_string()));
        assert!(args.contains(&"/tmp/downloads".to_string()));
        let spec_idx = args.iter().position(|a| a == "-f").unwrap();
        assert!(args[spec_idx + 1].contains("1080"));
    }

    #[test]
    fn test_download_command_best_quality() {
        let cmd = DownloadCommand {
            binary: PathBuf::from("/usr/bin/yt-dlp"),
            url: "https://example.com".to_string(),
            output_dir: PathBuf::from("/tmp"),
            quality: Quality::Best,
        };
        let built = cmd.build();
        let args: Vec<String> = built.get_args().map(|a| a.to_string_lossy().into()).collect();
        let spec_idx = args.iter().position(|a| a == "-f").unwrap();
        assert!(!args[spec_idx + 1].contains("height"));
    }

    #[test]
    fn test_playlist_info_command_args() {
        let cmd = PlaylistInfoCommand {
            binary: PathBuf::from("/usr/bin/yt-dlp"),
            url: "https://youtube.com/@channel".to_string(),
            peek: 5,
        };
        let built = cmd.build();
        let args: Vec<String> = built.get_args().map(|a| a.to_string_lossy().into()).collect();
        assert!(args.contains(&"--flat-playlist".to_string()));
        assert!(args.contains(&"--dump-single-json".to_string()));
        assert!(args.contains(&"5".to_string()));
        assert!(!args.contains(&"--no-playlist".to_string()));
    }

    #[test]
    fn test_playlist_download_with_end() {
        let cmd = PlaylistDownloadCommand {
            binary: PathBuf::from("/usr/bin/yt-dlp"),
            url: "https://youtube.com/@channel".to_string(),
            output_dir: PathBuf::from("/tmp/downloads"),
            quality: Quality::Best,
            playlist_end: Some(10),
        };
        let built = cmd.build();
        let args: Vec<String> = built.get_args().map(|a| a.to_string_lossy().into()).collect();
        assert!(args.contains(&"--yes-playlist".to_string()));
        assert!(args.contains(&"--playlist-end".to_string()));
        assert!(args.contains(&"10".to_string()));
        assert!(!args.contains(&"--no-playlist".to_string()));
        assert!(args.iter().any(|a| a.contains("playlist_index")));
    }

    #[test]
    fn test_playlist_download_all() {
        let cmd = PlaylistDownloadCommand {
            binary: PathBuf::from("/usr/bin/yt-dlp"),
            url: "https://youtube.com/@channel".to_string(),
            output_dir: PathBuf::from("/tmp"),
            quality: Quality::Best,
            playlist_end: None,
        };
        let built = cmd.build();
        let args: Vec<String> = built.get_args().map(|a| a.to_string_lossy().into()).collect();
        assert!(args.contains(&"--yes-playlist".to_string()));
        assert!(!args.contains(&"--playlist-end".to_string()));
    }
}
