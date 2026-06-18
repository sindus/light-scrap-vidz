#[tauri::command]
pub async fn detect_installed_browsers() -> Vec<String> {
    let mut found = vec![];

    let candidates: &[(&str, &[&str])] = &[
        ("firefox", &["firefox"]),
        ("chrome", &["google-chrome", "google-chrome-stable", "chrome"]),
        ("chromium", &["chromium", "chromium-browser"]),
    ];

    for (name, binaries) in candidates {
        for binary in *binaries {
            if in_path(binary) {
                found.push(name.to_string());
                break;
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        // Safari is always present on macOS
        if !found.contains(&"safari".to_string()) {
            found.push("safari".to_string());
        }
    }

    found
}

fn in_path(binary: &str) -> bool {
    std::process::Command::new("which")
        .arg(binary)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}
