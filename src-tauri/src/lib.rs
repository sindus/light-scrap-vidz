mod commands;
mod ytdlp;

use commands::download::{cancel_download, start_download, DownloadRegistry};
use commands::fetch_info::fetch_video_info;
use commands::open_folder::open_folder;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

pub fn run() {
    let download_registry: DownloadRegistry = Arc::new(Mutex::new(HashMap::new()));

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(download_registry)
        .invoke_handler(tauri::generate_handler![
            fetch_video_info,
            start_download,
            cancel_download,
            open_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
