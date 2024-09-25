#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use always_on_top_windows::{disable_always_on_top, get_current_window_handle, set_always_on_top};
use tauri::State;

struct AlwaysOnTopState(Mutex<bool>);

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn toggle_always_on_top(state: State<AlwaysOnTopState>) -> Result<bool, String> {
    let window_handle = get_current_window_handle();
    let mut is_always_on_top = state.0.lock().map_err(|_| "Failed to acquire lock".to_string())?;
    
    if *is_always_on_top {
        if disable_always_on_top(window_handle) {
            *is_always_on_top = false;
            Ok(false)
        } else {
            Err("Failed to disable Always on Top".to_string())
        }
    } else {
        if set_always_on_top(window_handle, true) {
            *is_always_on_top = true;
            Ok(true)
        } else {
            Err("Failed to enable Always on Top".to_string())
        }
    }
}

#[tauri::command]
fn get_always_on_top_status(state: State<AlwaysOnTopState>) -> Result<bool, String> {
    let is_always_on_top = state.0.lock().map_err(|_| "Failed to acquire lock".to_string())?;
    Ok(*is_always_on_top)
}

fn main() {
    tauri::Builder::default()
        .manage(AlwaysOnTopState(Mutex::new(false)))
        .invoke_handler(tauri::generate_handler![greet, toggle_always_on_top, get_always_on_top_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}