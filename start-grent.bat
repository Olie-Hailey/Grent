@echo off
title Grent Gadget Rental - Server & Web
cd /d "%~dp0"
echo ========================================================
echo        MEMULAI SERVER GRENT GADGET RENTAL
echo ========================================================
echo.
echo Sedang menyiapkan server Next.js di http://localhost:3000...
echo Jangan tutup jendela ini selama menggunakan web aplikasi.
echo.

:: Otomatis buka browser setelah server siap (jeda 3 detik)
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Jalankan server Next.js
npm run dev
pause
