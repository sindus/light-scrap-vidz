#[tauri::command]
pub fn install_kind() -> &'static str {
    if std::env::var("APPIMAGE").is_ok() {
        "appimage"
    } else {
        "deb"
    }
}
