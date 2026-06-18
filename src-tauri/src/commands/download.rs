use std::collections::HashMap;
use std::path::PathBuf;
use std::process::Stdio;
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Child;
use tokio::sync::Mutex;

use crate::ytdlp::{
    builder::{DownloadCommand, Quality},
    finder::YtDlpBinary,
    parser::{parse_destination_line, parse_progress_line},
};

pub type DownloadRegistry = Arc<Mutex<HashMap<String, Child>>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressPayload {
    pub download_id: String,
    pub percent: f32,
    pub speed: String,
    pub eta: String,
    pub filename: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletePayload {
    pub download_id: String,
    pub filepath: String,
}

#[tauri::command]
pub async fn start_download(
    app: tauri::AppHandle,
    state: tauri::State<'_, DownloadRegistry>,
    url: String,
    output_dir: String,
    quality: String,
    download_id: String,
) -> Result<(), String> {
    let binary = YtDlpBinary::find()?;
    let q = Quality::from_str(&quality);

    let cmd = DownloadCommand {
        binary: binary.path().to_path_buf(),
        url,
        output_dir: PathBuf::from(&output_dir),
        quality: q,
    };

    let mut process = tokio::process::Command::from(cmd.build())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true)
        .spawn()
        .map_err(|e| format!("Failed to spawn yt-dlp: {e}"))?;

    let stdout = process.stdout.take().unwrap();
    let stderr = process.stderr.take().unwrap();

    {
        let mut registry = state.lock().await;
        registry.insert(download_id.clone(), process);
    }

    let id = download_id.clone();
    let app_handle = app.clone();
    let registry = state.inner().clone();

    tokio::spawn(async move {
        let mut reader = BufReader::new(stdout).lines();
        let mut last_filename = String::new();

        while let Ok(Some(line)) = reader.next_line().await {
            if let Some(dest) = parse_destination_line(&line) {
                last_filename = dest;
            }
            if let Some(p) = parse_progress_line(&line) {
                let _ = app_handle.emit(
                    "download://progress",
                    ProgressPayload {
                        download_id: id.clone(),
                        percent: p.percent,
                        speed: p.speed,
                        eta: p.eta,
                        filename: last_filename
                            .split('/')
                            .next_back()
                            .unwrap_or("")
                            .to_string(),
                    },
                );
            }
        }

        // Drain stderr to prevent pipe blocking
        let mut err_reader = BufReader::new(stderr).lines();
        let mut stderr_last = String::new();
        while let Ok(Some(line)) = err_reader.next_line().await {
            stderr_last = line;
        }

        // Wait for process exit and check if not cancelled
        let was_cancelled = {
            let mut reg = registry.lock().await;
            if let Some(child) = reg.remove(&id) {
                drop(child);
                false
            } else {
                true
            }
        };

        if !was_cancelled {
            let filepath = if last_filename.is_empty() {
                stderr_last.to_string()
            } else {
                last_filename.clone()
            };
            let _ = app_handle.emit(
                "download://complete",
                CompletePayload { download_id: id.clone(), filepath },
            );
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn cancel_download(
    state: tauri::State<'_, DownloadRegistry>,
    download_id: String,
) -> Result<(), String> {
    let mut registry = state.lock().await;
    if let Some(mut child) = registry.remove(&download_id) {
        let _ = child.kill().await;
    }
    Ok(())
}
