use tauri::Manager;

#[tauri::command]
pub async fn update_ytdlp(app: tauri::AppHandle) -> Result<String, String> {
    let url = if cfg!(target_os = "macos") {
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
    } else {
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux"
    };

    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot find app data dir: {e}"))?;

    std::fs::create_dir_all(&data_dir).map_err(|e| format!("Cannot create data dir: {e}"))?;

    let dest = data_dir.join("yt-dlp");
    let dest_str = dest.to_string_lossy().into_owned();

    let out = tokio::process::Command::new("curl")
        .args(["-L", "-f", "--connect-timeout", "30", "-o", &dest_str, url])
        .output()
        .await
        .map_err(|e| format!("curl not available: {e}"))?;

    if !out.status.success() {
        return Err(format!(
            "Download failed: {}",
            String::from_utf8_lossy(&out.stderr).trim()
        ));
    }

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&dest, std::fs::Permissions::from_mode(0o755))
            .map_err(|e| format!("Cannot set permissions: {e}"))?;
    }

    Ok("yt-dlp updated successfully.".to_string())
}
