// Tauri desktop application
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
fn optimize_prompt(prompt: String, mode: String, api_key: String) -> Result<String, String> {
    // This would call the actual optimization API
    // For now, return a placeholder
    Ok(format!(
        "Optimized ({}): {} ",
        mode,
        prompt.chars().take(100).collect::<String>()
    ))
}

#[tauri::command]
fn get_clipboard() -> Result<String, String> {
    // Read from system clipboard
    use std::process::Command;

    #[cfg(target_os = "windows")]
    {
        let output = Command::new("powershell")
            .args(["-Command", "Get-Clipboard"])
            .output()
            .map_err(|e| e.to_string())?;
        Ok(String::from_utf8(output.stdout).unwrap_or_default())
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("pbpaste")
            .output()
            .map_err(|e| e.to_string())?;
        Ok(String::from_utf8(output.stdout).unwrap_or_default())
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("xclip")
            .args(["-selection", "clipboard", "-o"])
            .output()
            .map_err(|e| e.to_string())?;
        Ok(String::from_utf8(output.stdout).unwrap_or_default())
    }
}

#[tauri::command]
fn set_clipboard(text: String) -> Result<(), String> {
    use std::process::Command;

    #[cfg(target_os = "windows")]
    {
        Command::new("powershell")
            .args(["-Command", &format!("'{}' | Set-Clipboard", text)])
            .output()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        let mut child = Command::new("pbcopy")
            .stdin(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;
        use std::io::Write;
        if let Some(mut stdin) = child.stdin.take() {
            stdin.write_all(text.as_bytes()).ok();
        }
        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        let mut child = Command::new("xclip")
            .args(["-selection", "clipboard"])
            .stdin(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;
        use std::io::Write;
        if let Some(mut stdin) = child.stdin.take() {
            stdin.write_all(text.as_bytes()).ok();
        }
        Ok(())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            optimize_prompt,
            get_clipboard,
            set_clipboard
        ])
        .setup(|app| {
            // Initialize app
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
