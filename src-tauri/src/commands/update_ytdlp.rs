use crate::ytdlp::finder::YtDlpBinary;

/// Tries to run `cmd args` and returns stdout on success.
async fn try_run(cmd: &str, args: &[&str]) -> Option<String> {
    let out = tokio::process::Command::new(cmd)
        .args(args)
        .output()
        .await
        .ok()?;
    if out.status.success() {
        Some(String::from_utf8_lossy(&out.stdout).trim().to_string())
    } else {
        None
    }
}

#[tauri::command]
pub async fn update_ytdlp() -> Result<String, String> {
    // Strategy 1: pip install --user (installs to ~/.local/bin, supports curl-cffi)
    for pip in &["pip3", "pip"] {
        if let Some(_) = try_run(pip, &["install", "--user", "-U", "yt-dlp", "curl-cffi"]).await {
            return Ok("yt-dlp and curl-cffi installed successfully (pip --user).".to_string());
        }
    }

    // Strategy 2: pip with --break-system-packages (Debian/Ubuntu externally-managed envs)
    for pip in &["pip3", "pip"] {
        if let Some(_) =
            try_run(pip, &["install", "-U", "yt-dlp", "curl-cffi", "--break-system-packages"])
                .await
        {
            return Ok(
                "yt-dlp and curl-cffi installed successfully (pip system).".to_string(),
            );
        }
    }

    // Strategy 3: pipx (installs yt-dlp + injects curl-cffi into its venv)
    let pipx_ok = try_run("pipx", &["install", "yt-dlp"]).await.is_some()
        || try_run("pipx", &["upgrade", "yt-dlp"]).await.is_some();
    if pipx_ok {
        // curl-cffi must be injected separately into the pipx venv
        let _ = try_run("pipx", &["inject", "yt-dlp", "curl-cffi"]).await;
        return Ok("yt-dlp updated via pipx (curl-cffi injected).".to_string());
    }

    // Strategy 4: yt-dlp self-update (no curl-cffi, but at least keeps yt-dlp current)
    if let Ok(binary) = YtDlpBinary::find() {
        let out = tokio::process::Command::new(binary.path())
            .arg("-U")
            .output()
            .await
            .map_err(|e| format!("Failed to run yt-dlp update: {e}"))?;

        let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
        let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
        let msg = if stdout.is_empty() { &stderr } else { &stdout };

        if out.status.success() || msg.contains("up-to-date") || msg.contains("up to date") {
            return Ok(format!(
                "{msg}\nNote: curl-cffi could not be installed — TikTok/Dailymotion may not work."
            ));
        }
        return Err(stderr);
    }

    Err("Could not install yt-dlp. Make sure pip or pipx is installed.".to_string())
}
