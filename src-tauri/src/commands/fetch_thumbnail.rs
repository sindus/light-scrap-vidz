use std::process::Stdio;

#[tauri::command]
pub async fn fetch_thumbnail(url: String) -> Result<String, String> {
    if url.is_empty() {
        return Err("No URL".to_string());
    }

    let output = tokio::process::Command::new("curl")
        .args([
            "-L", "-s", "-f",
            "--max-time", "10",
            "--max-filesize", "5242880", // 5 MB cap
            "-H", "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            "-H", "Referer: https://www.instagram.com/",
            "-o", "-",
            &url,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .await
        .map_err(|e| format!("curl error: {e}"))?;

    if !output.status.success() || output.stdout.is_empty() {
        return Err("Failed to fetch thumbnail".to_string());
    }

    use std::io::Write;
    let mut enc = std::process::Command::new("base64")
        .arg("--wrap=0")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("base64 error: {e}"))?;

    if let Some(stdin) = enc.stdin.as_mut() {
        stdin.write_all(&output.stdout).ok();
    }
    let b64 = enc.wait_with_output().map_err(|e| e.to_string())?;
    let b64_str = String::from_utf8_lossy(&b64.stdout);

    // Detect mime type from first bytes
    let mime = if output.stdout.starts_with(b"\x89PNG") {
        "image/png"
    } else if output.stdout.starts_with(b"GIF") {
        "image/gif"
    } else if output.stdout.starts_with(b"RIFF") {
        "image/webp"
    } else {
        "image/jpeg"
    };

    Ok(format!("data:{mime};base64,{b64_str}"))
}
