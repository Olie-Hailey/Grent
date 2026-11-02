$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Grent Rental Gadget.lnk"
$targetScript = Join-Path (Get-Location).Path "start-grent.bat"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/c `"$targetScript`""
$Shortcut.WorkingDirectory = (Get-Location).Path
$Shortcut.WindowStyle = 1
$Shortcut.Description = "Buka Web dan Server Grent Gadget Rental"

# Gunakan icon favicon jika ada
$iconPath = Join-Path (Get-Location).Path "public\favicon.ico"
if (Test-Path $iconPath) {
    $Shortcut.IconLocation = "$iconPath,0"
}
$Shortcut.Save()

Write-Output "Shortcut berhasil dibuat di: $shortcutPath"
