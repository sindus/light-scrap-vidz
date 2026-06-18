use crate::ytdlp::finder::YtDlpBinary;

#[tauri::command]
pub async fn update_ytdlp() -> Result<String, String> {
    // Try pipx first (most reliable on modern Ubuntu)
    if let Ok(out) = tokio::process::Command::new("pipx")
        .args(["upgrade", "yt-dlp"])
        .output()
        .await
    {
        if out.status.success() {
            return Ok(String::from_utf8_lossy(&out.stdout).trim().to_string());
        }
    }

    // Fallback: pip with --break-system-packages
    if let Ok(out) = tokio::process::Command::new("pip")
        .args(["install", "-U", "yt-dlp", "--break-system-packages"])
        .output()
        .await
    {
        if out.status.success() {
            return Ok("yt-dlp updated successfully via pip".to_string());
        }
    }

    // Last resort: yt-dlp self-update
    let binary = YtDlpBinary::find()?;
    let out = tokio::process::Command::new(binary.path())
        .arg("-U")
        .output()
        .await
        .map_err(|e| format!("Failed to run update: {e}"))?;

    let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
    let combined = if stdout.is_empty() { stderr.clone() } else { stdout };

    if out.status.success() || combined.contains("up-to-date") || combined.contains("up to date") {
        Ok(combined)
    } else {
        Err(stderr)
    }
}
