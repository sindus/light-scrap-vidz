use std::path::PathBuf;

fn deb_tmp_path(version: &str) -> PathBuf {
    std::env::temp_dir().join(format!("light-scrap-vidz_{version}.deb"))
}

/// Downloads the .deb for `version` to a temp file. Returns the temp path.
#[tauri::command]
pub async fn download_deb_update(version: String) -> Result<String, String> {
    let url = format!(
        "https://github.com/sindus/light-scrap-vidz/releases/download/v{version}/light-scrap-vidz_{version}_amd64.deb"
    );
    let dest = deb_tmp_path(&version);

    let out = tokio::process::Command::new("curl")
        .args([
            "-L",
            "-f",
            "--connect-timeout",
            "30",
            "-o",
            dest.to_str().unwrap_or("/tmp/light-scrap-vidz.deb"),
            &url,
        ])
        .output()
        .await
        .map_err(|e| format!("curl not found: {e}"))?;

    if !out.status.success() {
        return Err(format!(
            "Download failed: {}",
            String::from_utf8_lossy(&out.stderr).trim()
        ));
    }

    Ok(dest.to_string_lossy().into_owned())
}

/// Installs the previously downloaded .deb using pkexec (shows a system password dialog).
#[tauri::command]
pub async fn install_deb_update(version: String) -> Result<(), String> {
    let path = deb_tmp_path(&version);

    let out = tokio::process::Command::new("pkexec")
        .args(["dpkg", "-i", path.to_str().unwrap_or_default()])
        .output()
        .await
        .map_err(|e| format!("pkexec not found: {e}"))?;

    let _ = std::fs::remove_file(&path);

    if !out.status.success() {
        return Err(format!(
            "Install failed: {}",
            String::from_utf8_lossy(&out.stderr).trim()
        ));
    }

    Ok(())
}
