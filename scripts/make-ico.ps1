Add-Type -AssemblyName System.Drawing

$projectDir = (Get-Location).Path
$pngPath = Join-Path $projectDir "public\logo.png"
$icoPath = Join-Path $projectDir "public\logo.ico"

if (-not (Test-Path $pngPath)) {
    Write-Error "File $pngPath tidak ditemukan!"
    exit 1
}

$bmp = [System.Drawing.Bitmap]::FromFile($pngPath)
$thumb = New-Object System.Drawing.Bitmap(256, 256)
$g = [System.Drawing.Graphics]::FromImage($thumb)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$g.DrawImage($bmp, 0, 0, 256, 256)
$g.Dispose()

$hIcon = $thumb.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$icon.Dispose()
$thumb.Dispose()
$bmp.Dispose()

Write-Output "Berhasil membuat file icon: $icoPath"

# Sekarang update shortcut Desktop
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Grent Rental Gadget.lnk"

if (Test-Path $shortcutPath) {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.IconLocation = "$icoPath,0"
    $Shortcut.Save()
    Write-Output "Shortcut di Desktop berhasil diperbarui dengan icon Grent: $shortcutPath"
} else {
    Write-Output "Shortcut desktop belum ada, menjalankan create-desktop-shortcut..."
}
