use serde::{Deserialize, Serialize};
use std::process::Stdio;

use crate::ytdlp::{builder::PlaylistInfoCommand, finder::YtDlpBinary};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct PlaylistEntry {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaylistInfoResponse {
    #[serde(rename = "_type", default)]
    pub kind: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub uploader: String,
    pub playlist_count: Option<u32>,
    #[serde(default)]
    pub entries: Vec<PlaylistEntry>,
}

#[tauri::command]
pub async fn fetch_playlist_info(
    app: tauri::AppHandle,
    url: String,
    cookies_browser: Option<String>,
) -> Result<PlaylistInfoResponse, String> {
    let binary = YtDlpBinary::find_with_app(&app)?;

    let cmd = PlaylistInfoCommand {
        binary: binary.path().to_path_buf(),
        url,
        peek: 20,
        cookies_browser,
    }
    .build();

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
    let info = serde_json::from_str::<PlaylistInfoResponse>(&json)
        .map_err(|e| format!("Failed to parse playlist info: {e}"))?;

    Ok(info)
}
