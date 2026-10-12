@echo off
title Aozora Nihongo Club - Server Lokal
cd /d "%~dp0"
echo ============================================
echo   AOZORA NIHONGO CLUB  -  Menyalakan website
echo ============================================
echo.
echo Website akan terbuka otomatis di browser.
echo JANGAN tutup jendela hitam ini selama memakai website.
echo Tekan CTRL + C lalu Y untuk mematikan.
echo.
start "" http://localhost:8000
python -m http.server 8000
pause
