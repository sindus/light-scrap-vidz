use serde::{Deserialize, Serialize};
use std::process::Stdio;

use crate::ytdlp::{builder::InfoCommand, finder::YtDlpBinary};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FormatInfo {
    pub format_id: String,
    #[serde(default)]
    pub ext: String,
    pub height: Option<i32>,
    pub filesize: Option<i64>,
    pub vcodec: Option<String>,
    pub acodec: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoInfoResponse {
    pub id: String,
    pub title: String,
    #[serde(default)]
    pub thumbnail: String,
    #[serde(default)]
    pub duration: f64,
    #[serde(default)]
    pub uploader: String,
    #[serde(default)]
    pub webpage_url: String,
    #[serde(default)]
    pub extractor: String,
    #[serde(default)]
    pub formats: Vec<FormatInfo>,
}

#[tauri::command]
pub async fn fetch_video_info(
    url: String,
    cookies_browser: Option<String>,
) -> Result<VideoInfoResponse, String> {
    let binary = YtDlpBinary::find()?;

    let cmd = InfoCommand { binary: binary.path().to_path_buf(), url, cookies_browser }.build();
    let output = tokio::process::Command::from(cmd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| format!("Failed to run yt-dlp: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp error: {}", stderr.trim()));
    }

    let json = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str::<VideoInfoResponse>(&json)
        .map_err(|e| format!("Failed to parse video info: {e}"))
}
